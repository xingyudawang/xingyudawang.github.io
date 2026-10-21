import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Compass,
  Maximize2,
  Minimize2,
  Minus,
  Move3d,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CAVES, MURALS } from '../data/dunhuangData';
import {
  CAVE_SCENES,
  getCaveScene,
  loc,
  narrationFor,
  type CaveScene,
  type Spot,
} from '../data/caveScenes';
import { CaveEngine, type SpotProjection } from '../three/CaveEngine';
import { GuideAvatar, GuideLine } from './GuideAvatar';
import { useGestures } from '../lib/useGestures';
import { narration, type NarrationState } from '../lib/narration';
import { confirmFeedback, tapFeedback } from '../lib/haptics';
import type { Language } from '../context/AppContext';

interface Props {
  caveId: string;
  language: Language;
  onBack: () => void;
  onSelectCave: (caveId: string) => void;
  onOpenMural: (muralId: string) => void;
}

type GyroStatus = 'off' | 'asking' | 'on' | 'denied' | 'unsupported';

export const CavePanorama: React.FC<Props> = ({
  caveId,
  language,
  onBack,
  onSelectCave,
  onOpenMural,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CaveEngine | null>(null);
  const markerRefs = useRef(new Map<string, HTMLDivElement>());
  const stageWrapRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [candle, setCandle] = useState(true);
  const [gyro, setGyro] = useState<GyroStatus>('off');
  const [immersive, setImmersive] = useState(false);
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [zoomLabel, setZoomLabel] = useState(1);
  const [narrationState, setNarrationState] = useState<NarrationState>(() => narration.getState());

  const sceneData = useMemo<CaveScene>(() => getCaveScene(caveId), [caveId]);
  const cave = useMemo(() => CAVES.find((c) => c.id === caveId) ?? CAVES[0], [caveId]);

  /* ------------------------------------------------------------------ */
  /* narration store                                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => narration.subscribe(setNarrationState), []);

  /* ------------------------------------------------------------------ */
  /* engine lifecycle                                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const engine = new CaveEngine({
      scene: sceneData,
      canvasHost: host,
      onReady: () => setReady(true),
    });
    engineRef.current = engine;

    engine.onSpots = (spots: SpotProjection[]) => {
      for (const s of spots) {
        const el = markerRefs.current.get(s.id);
        if (!el) continue;
        if (!s.visible) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }
        el.style.opacity = String(0.35 + s.centrality * 0.65);
        el.style.pointerEvents = 'auto';
        el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%) scale(${s.scale.toFixed(3)})`;
      }
    };

    // textures may already be cached; fall back to "ready" shortly anyway
    const readyTimer = setTimeout(() => setReady(true), 2600);

    return () => {
      clearTimeout(readyTimer);
      engine.onSpots = null;
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // switch caves without tearing down WebGL
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.loadScene(sceneData);
    setActiveSpot(null);
    narration.stop();
  }, [sceneData]);

  // fade the drag hint out after a while / after first interaction
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 7000);
    return () => clearTimeout(t);
  }, []);

  /* ------------------------------------------------------------------ */
  /* gestures                                                            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!activeSpot && !immersive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveSpot(null);
        setImmersive(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeSpot, immersive]);

  const dragStartFov = useRef(78);

  const gestureRef = useGestures<HTMLDivElement>({
    onDrag: (dx, dy) => {
      engineRef.current?.rotateBy(dx, dy);
      if (showHint) setShowHint(false);
    },
    onDragEnd: (vx, vy) => {
      engineRef.current?.fling(vx, vy);
      setZoomLabel(Number(((78 / (engineRef.current?.getFov() ?? 78)) || 1).toFixed(2)));
    },
    onPinch: (scale) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.setFov(dragStartFov.current / Math.max(0.2, scale));
      setZoomLabel(Number((78 / (78 / Math.max(0.2, scale))).toFixed(2)));
    },
    onPinchEnd: () => {
      dragStartFov.current = engineRef.current?.getFov() ?? 78;
      setZoomLabel(Number((78 / dragStartFov.current).toFixed(2)));
    },
    onWheel: (deltaY) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.setFov(engine.getFov() * (deltaY > 0 ? 1.09 : 0.92));
      setZoomLabel(Number((78 / engine.getFov()).toFixed(2)));
    },
    onTap: (pt) => {
      const engine = engineRef.current;
      if (!engine) return;
      const hit = engine.hitTest(pt.x, pt.y, 52);
      if (hit) {
        const spot = sceneData.spots.find((s) => s.id === hit) ?? null;
        setActiveSpot(spot);
        if (spot) {
          tapFeedback(14);
          narration.speak(
            spot.id,
            loc(spot.title, language),
            narrationFor(spot, language),
            language
          );
        }
      } else if (activeSpot) {
        setActiveSpot(null);
        narration.stop();
      }
    },
    onDoubleTap: () => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.setFov(engine.getFov() > 50 ? 34 : 78);
      setZoomLabel(Number((78 / engine.getFov()).toFixed(2)));
      tapFeedback();
    },
  });

  // reset the pinch baseline whenever a new pan starts
  const onPointerDownCapture = () => {
    dragStartFov.current = engineRef.current?.getFov() ?? 78;
  };

  /* ------------------------------------------------------------------ */
  /* gyroscope                                                           */
  /* ------------------------------------------------------------------ */
  const orientationHandler = useCallback(
    (e: DeviceOrientationEvent) => {
      engineRef.current?.handleOrientation(e.alpha, e.beta, e.gamma);
    },
    []
  );

  const disableGyro = useCallback(() => {
    window.removeEventListener('deviceorientation', orientationHandler);
    engineRef.current?.setGyroEnabled(false);
    setGyro('off');
  }, [orientationHandler]);

  const enableGyro = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    if (typeof DeviceOrientationEvent === 'undefined') {
      setGyro('unsupported');
      return;
    }

    setGyro('asking');
    const anyDOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    try {
      if (typeof anyDOE.requestPermission === 'function') {
        // iOS 13+ requires a user gesture and returns a promise
        const result = await anyDOE.requestPermission();
        if (result !== 'granted') {
          setGyro('denied');
          return;
        }
      }
    } catch {
      setGyro('denied');
      return;
    }

    // Some browsers expose the API but never send events (desktop Chrome).
    let received = false;
    const probe = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) received = true;
    };
    window.addEventListener('deviceorientation', probe);
    await new Promise((r) => setTimeout(r, 450));
    window.removeEventListener('deviceorientation', probe);

    if (!received) {
      setGyro('unsupported');
      return;
    }

    window.addEventListener('deviceorientation', orientationHandler);
    engine.setGyroEnabled(true);
    setGyro('on');
    confirmFeedback();
  }, [orientationHandler]);

  useEffect(() => () => window.removeEventListener('deviceorientation', orientationHandler), [orientationHandler]);

  /* ------------------------------------------------------------------ */
  /* narration controls                                                  */
  /* ------------------------------------------------------------------ */
  const speakIntro = () => {
    narrativeIntro();
  };

  const narrativeIntro = () => {
    narration.speak(`${caveId}-intro`, loc(cave.name, language), loc(sceneData.intro, language), language);
    tapFeedback();
  };

  const toggleNarration = () => {
    const state = narration.getState();
    if (state.status === 'speaking') narration.pause();
    else if (state.status === 'paused') narration.resume();
    else if (activeSpot) {
      narration.speak(activeSpot.id, loc(activeSpot.title, language), narrationFor(activeSpot, language), language);
    }
  };

  const stopNarration = () => {
    narration.stop();
    setActiveSpot(null);
  };

  /* ------------------------------------------------------------------ */
  /* zoom helpers                                                        */
  /* ------------------------------------------------------------------ */
  const zoom = (dir: 1 | -1) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setFov(dir > 0 ? engine.getFov() * 0.78 : engine.getFov() * 1.28);
    setZoomLabel(Number((78 / engine.getFov()).toFixed(2)));
    tapFeedback();
  };

  const resetView = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setFov(78);
    engine.lookAtBearing(sceneData.startYaw, 0);
    setZoomLabel(1);
    tapFeedback();
  };

  const zoomPercent = Math.round(zoomLabel * 100);
  const activeMural = activeSpot?.muralId
    ? MURALS.find((m) => m.id === activeSpot.muralId)
    : undefined;

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="relative w-full h-full bg-ink-900 overflow-hidden">
      {/* ---------- 3D stage ---------- */}
      <div
        ref={(node) => {
          (hostRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (gestureRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (stageWrapRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onPointerDownCapture={onPointerDownCapture}
        className="absolute inset-0 z-0"
        aria-label={loc(cave.name, language)}
      />

      {/* candlelight / daylight grade + vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700"
        style={{
          background: candle
            ? 'radial-gradient(ellipse at 50% 46%, rgba(255,190,110,0.10) 0%, rgba(0,0,0,0) 46%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.62) 100%)'
            : 'radial-gradient(ellipse at 50% 40%, rgba(255,225,180,0.07) 0%, rgba(0,0,0,0) 42%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.42) 100%)',
        }}
      />

      {/* ---------- hotspot markers ---------- */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {sceneData.spots.map((spot) => (
          <div
            key={spot.id}
            ref={(el) => {
              if (el) markerRefs.current.set(spot.id, el);
              else markerRefs.current.delete(spot.id);
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ opacity: 0, transition: 'opacity 180ms linear', pointerEvents: 'none' }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSpot(spot);
                tapFeedback(14);
                narration.speak(
                  spot.id,
                  loc(spot.title, language),
                  narrationFor(spot, language),
                  language
                );
              }}
              className={`group relative flex items-center justify-center rounded-full border-2 border-gold-300 bg-ink-800/85 text-gold-300 shadow-[0_0_18px_rgba(229,184,105,0.55)] animate-hotspot backdrop-blur-sm ${
                spot.kind === 'ceiling' ? 'h-9 w-9' : 'h-10 w-10'
              } ${activeSpot?.id === spot.id ? 'ring-2 ring-gold-200 ring-offset-2 ring-offset-black/60' : ''}`}
              aria-label={loc(spot.title, language)}
            >
              <span className="text-[15px] leading-none">
                {spot.kind === 'ceiling' ? '✦' : spot.kind === 'sculpture' ? '☸' : '❋'}
              </span>
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-gold-400/40 bg-ink-800/95 px-2 py-1 text-[11px] text-gold-100 shadow-xl group-hover:block md:block md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                {loc(spot.title, language)}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* ---------- loading veil ---------- */}
      {!ready && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-ink-900">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-gold-400/25 border-t-gold-300" />
          <p className="text-xs tracking-[0.3em] text-sand-300">正在开启洞窟 · 加载壁画</p>
        </div>
      )}

      {/* ---------- top bar ---------- */}
      <div
        className={`absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-3 transition-opacity duration-300 ${
          immersive ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={onBack}
            className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-gold-400/30 bg-ink-800/85 px-3 text-xs text-gold-300 backdrop-blur-md active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">展厅</span>
          </button>

          <div className="min-w-0 rounded-xl border border-gold-400/30 bg-ink-800/85 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="font-serif-sc text-sm font-bold text-gold-100">{cave.number}</span>
              <span className="truncate text-xs text-gold-300">{loc(cave.name, language)}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-sand-400">
              <span className="rounded bg-ink-600 px-1.5 py-px">{loc(cave.dynasty, language)}</span>
              <span className="hidden sm:inline">{cave.cliffLevel}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <IconBtn
            active={candle}
            title={candle ? '烛光幽境' : '白昼照明'}
            onClick={() => {
              setCandle((v) => !v);
              tapFeedback();
            }}
          >
            <Sparkles className="h-4 w-4" />
          </IconBtn>

          <IconBtn
            active={gyro === 'on'}
            title={
              gyro === 'on'
                ? '关闭陀螺仪'
                : gyro === 'denied'
                  ? '陀螺仪权限被拒绝'
                  : gyro === 'unsupported'
                    ? '此设备不支持陀螺仪'
                    : '开启陀螺仪体感'
            }
            onClick={() => (gyro === 'on' ? disableGyro() : enableGyro())}
            disabled={gyro === 'asking'}
            tone={gyro === 'on' ? 'blue' : gyro === 'denied' || gyro === 'unsupported' ? 'warn' : 'default'}
          >
            <Smartphone className={`h-4 w-4 ${gyro === 'asking' ? 'animate-pulse' : ''}`} />
          </IconBtn>

          <IconBtn
            active={immersive}
            title={immersive ? '退出沉浸' : '全屏沉浸'}
            onClick={() => {
              setImmersive((v) => !v);
              tapFeedback();
            }}
          >
            {immersive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </IconBtn>
        </div>
      </div>

      {/* ---------- compass + zoom readout ---------- */}
      <div
        className={`absolute right-3 z-30 flex flex-col items-end gap-2 transition-opacity duration-300 ${
          immersive ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={{ top: 'calc(max(0.75rem, env(safe-area-inset-top)) + 4.2rem)' }}
      >
        <div className="flex items-center gap-1 rounded-full border border-gold-400/25 bg-ink-800/80 px-2.5 py-1 text-[10px] text-sand-300 backdrop-blur-md">
          <Compass className="h-3 w-3 text-gold-300" />
          <span className="tabular-nums">{zoomPercent}%</span>
        </div>
      </div>

      {/* ---------- zoom controls ---------- */}
      <div
        className={`absolute right-3 z-30 flex flex-col gap-1.5 transition-opacity duration-300 ${
          immersive ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={{ top: 'calc(max(0.75rem, env(safe-area-inset-top)) + 6.5rem)' }}
      >
        <RoundBtn onClick={() => zoom(1)} label="放大">
          <Plus className="h-4 w-4" />
        </RoundBtn>
        <RoundBtn onClick={() => zoom(-1)} label="缩小">
          <Minus className="h-4 w-4" />
        </RoundBtn>
        <RoundBtn onClick={resetView} label="复位视角">
          <RotateCcw className="h-3.5 w-3.5" />
        </RoundBtn>
      </div>

      {/* ---------- drag hint ---------- */}
      {showHint && ready && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 animate-fade-up">
          <div className="flex items-center gap-2 rounded-full border border-gold-400/30 bg-ink-800/80 px-4 py-2 text-[11px] text-gold-200 backdrop-blur-md">
            <Move3d className="h-3.5 w-3.5 text-gold-300" />
            <span>拖动环视 · 双指缩放 · 点亮点听讲解</span>
          </div>
        </div>
      )}

      {/* ---------- narration card ---------- */}
      {activeSpot && (
        <NarrationCard
          spot={activeSpot}
          language={language}
          state={narrationState}
          onClose={stopNarration}
          onToggle={toggleNarration}
          onReplay={() =>
            narration.speak(
              activeSpot.id,
              loc(activeSpot.title, language),
              narrationFor(activeSpot, language),
              language
            )
          }
          onOpenMural={activeMural ? () => onOpenMural(activeMural.id) : undefined}
        />
      )}

      {/* ---------- bottom rail ---------- */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 transition-transform duration-300 ${
          immersive ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-end gap-2 px-3 pb-3">
          <button
            onClick={speakIntro}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-gold-400/40 bg-ink-800/90 px-3 text-xs text-gold-200 backdrop-blur-md active:scale-95"
            title="听本窟总讲解"
          >
            {narrationState.status === 'speaking' ? (
              <Volume2 className="h-4 w-4 text-gold-300" />
            ) : (
              <VolumeX className="h-4 w-4 text-sand-400" />
            )}
            <span className="hidden xs:inline">本窟讲解</span>
          </button>

          <div className="rail min-w-0 flex-1 gap-1.5 rounded-xl border border-gold-400/25 bg-ink-800/80 p-1.5 backdrop-blur-md">
            {CAVE_SCENES.map((s) => {
              const c = CAVES.find((x) => x.id === s.caveId);
              if (!c) return null;
              const isActive = s.caveId === caveId;
              return (
                <button
                  key={s.caveId}
                  onClick={() => {
                    if (s.caveId === caveId) return;
                    tapFeedback();
                    onSelectCave(s.caveId);
                  }}
                  className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[11px] whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-300 to-gold-500 font-bold text-ink-900'
                      : 'text-sand-300 active:bg-ink-500'
                  }`}
                >
                  <span>{c.number.replace('窟', '')}</span>
                  <span className={isActive ? '' : 'text-sand-400'}>{loc(c.name, language)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------- immersive exit affordance ---------- */}
      {immersive && (
        <button
          onClick={() => setImmersive(false)}
          className="absolute right-3 top-3 z-40 rounded-full border border-gold-400/30 bg-ink-800/60 p-2 text-gold-300/70 backdrop-blur-md"
          aria-label="退出沉浸模式"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* small presentational helpers                                            */
/* ---------------------------------------------------------------------- */

const IconBtn: React.FC<{
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tone?: 'default' | 'blue' | 'warn';
}> = ({ children, title, onClick, active, disabled, tone = 'default' }) => {
  const toneClass =
    tone === 'blue'
      ? 'border-sky-400/60 bg-sky-950/70 text-sky-300'
      : tone === 'warn'
        ? 'border-amber-500/50 bg-ink-800/80 text-amber-400'
        : active
          ? 'border-gold-300 bg-gold-600/25 text-gold-200 shadow-[0_0_14px_rgba(229,184,105,0.35)]'
          : 'border-gold-400/25 bg-ink-800/80 text-sand-300';
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md transition-colors active:scale-95 disabled:opacity-60 ${toneClass}`}
    >
      {children}
    </button>
  );
};

const RoundBtn: React.FC<{ children: React.ReactNode; onClick: () => void; label: string }> = ({
  children,
  onClick,
  label,
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/25 bg-ink-800/80 text-gold-200 backdrop-blur-md active:scale-90"
  >
    {children}
  </button>
);

/* ---------------------------------------------------------------------- */
/* narration card with live transcript                                    */
/* ---------------------------------------------------------------------- */

const NarrationCard: React.FC<{
  spot: Spot;
  language: Language;
  state: NarrationState;
  onClose: () => void;
  onToggle: () => void;
  onReplay: () => void;
  onOpenMural?: () => void;
}> = ({ spot, language, state, onClose, onToggle, onReplay, onOpenMural }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const fullText = narrationFor(spot, language);
  const activeChunk = state.sourceId === spot.id ? state.chunkIndex : -1;
  const isSpeaking = state.sourceId === spot.id && state.status === 'speaking';
  const isPaused = state.sourceId === spot.id && state.status === 'paused';
  const progress =
    state.sourceId === spot.id && state.totalChars > 0
      ? Math.min(1, state.spokenChars / state.totalChars)
      : 0;

  // keep the sentence being spoken in view
  useEffect(() => {
    if (activeChunk < 0 || !bodyRef.current) return;
    const el = bodyRef.current.querySelector<HTMLElement>(`[data-chunk="${activeChunk}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeChunk]);

  const chunks = state.sourceId === spot.id && state.chunks.length ? state.chunks : null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 animate-sheet-up md:inset-x-auto md:right-4 md:bottom-20 md:w-[26rem] md:px-0"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4.5rem)' }}
    >
      <div className="pointer-events-auto w-full overflow-hidden rounded-2xl border border-gold-400/35 bg-ink-800/95 shadow-[0_-10px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        {/* progress line */}
        <div className="h-0.5 w-full bg-ink-500">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-300 transition-[width] duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="flex items-start gap-3 p-3.5">
          <div className="relative shrink-0">
            <GuideAvatar lang={language} speaking={isSpeaking} size={52} />
            <span className="absolute -bottom-1 -right-1 rounded-full border border-ink-800 bg-ink-700 px-1 text-[8px] text-gold-300">
              妙音
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-serif-sc text-[15px] leading-snug font-bold text-gold-100">
                  {loc(spot.title, language)}
                </h3>
                <GuideLine lang={language} speaking={isSpeaking} />
              </div>
              <button
                onClick={onClose}
                className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-sand-400 active:bg-ink-500"
                aria-label="关闭讲解"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 max-h-[26vh] overflow-y-auto overscroll-contain pr-1 md:max-h-56" ref={bodyRef}>
              {chunks ? (
                <p className="text-[13px] leading-relaxed text-sand-200">
                  {chunks.map((c, i) => (
                    <span
                      key={i}
                      data-chunk={i}
                      className={
                        i === activeChunk
                          ? 'rounded bg-gold-500/25 text-gold-100 transition-colors'
                          : i < activeChunk
                            ? 'text-sand-400'
                            : ''
                      }
                    >
                      {c}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="text-[13px] leading-relaxed text-sand-200">{fullText}</p>
              )}
            </div>
          </div>
        </div>

        {spot.facts && spot.facts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3.5 pb-3">
            {spot.facts.map((f, i) => (
              <span
                key={i}
                className="rounded-full border border-gold-400/25 bg-ink-600/70 px-2 py-0.5 text-[10px] text-sand-300"
              >
                {loc(f, language)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-ink-400/70 px-3.5 py-2.5">
          <button
            onClick={onToggle}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-gold-400 px-3.5 text-xs font-bold text-ink-900 active:scale-95"
          >
            {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isSpeaking ? '暂停' : isPaused ? '继续' : '播放讲解'}</span>
          </button>
          <button
            onClick={onReplay}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-gold-400/35 px-3 text-xs text-gold-200 active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>重听</span>
          </button>
          {onOpenMural && (
            <button
              onClick={onOpenMural}
              className="ml-auto flex h-10 items-center gap-1.5 rounded-xl border border-gold-400/25 bg-ink-600 px-3 text-xs text-gold-200 active:scale-95"
            >
              超高清
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
