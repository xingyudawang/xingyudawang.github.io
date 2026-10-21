import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Layers,
  Maximize2,
  Pause,
  Play,
  Plus,
  Minus,
  RotateCcw,
  X,
} from 'lucide-react';
import { MURALS, type Mural } from '../data/dunhuangData';
import { loc, type Lang } from '../data/caveScenes';
import { useGestures } from '../lib/useGestures';
import { thumb } from '../lib/media';
import { narration, type NarrationState } from '../lib/narration';
import { tapFeedback, confirmFeedback } from '../lib/haptics';
import { useApp } from '../context/AppContext';
import { GuideAvatar } from './GuideAvatar';

type ViewMode = 'original' | 'restored' | 'lineart';

interface Props {
  initialMuralId: string;
  onBack?: () => void;
  onSelectMural: (muralId: string) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 8;

export const DeepZoomGallery: React.FC<Props> = ({ initialMuralId, onBack, onSelectMural }) => {
  const { language, isFavorite, toggleFavorite } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [scaleLabel, setScaleLabel] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState<Mural['hotspots'][number] | null>(null);
  const [narrationState, setNarrationState] = useState<NarrationState>(() => narration.getState());
  const [loaded, setLoaded] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const transform = useRef({ scale: 1, x: 0, y: 0 });
  const gestureStart = useRef({ scale: 1, x: 0, y: 0 });
  const pinchStartScale = useRef(1);

  const mural = useMemo(
    () => MURALS.find((m) => m.id === initialMuralId) ?? MURALS[0],
    [initialMuralId]
  );

  useEffect(() => narration.subscribe(setNarrationState), []);

  const applyTransform = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const { scale, x, y } = transform.current;
    // The element is anchored at the stage centre with left-1/2 top-1/2, so the
    // -50% translate inside the transform is what actually centres it. Without
    // it the image sat offset down-right by half its size.
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
    el.style.setProperty('--s', String(scale));
    setScaleLabel(scale);
  }, []);

  /** Keep the image from being dragged off into empty space. */
  const clamp = useCallback(() => {
    const stage = stageRef.current;
    const el = contentRef.current;
    if (!stage || !el) return;
    const { scale } = transform.current;
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const cw = el.offsetWidth * scale;
    const ch = el.offsetHeight * scale;
    const maxX = Math.max(0, (cw - sw) / 2);
    const maxY = Math.max(0, (ch - sh) / 2);
    transform.current.x = Math.min(maxX, Math.max(-maxX, transform.current.x));
    transform.current.y = Math.min(maxY, Math.max(-maxY, transform.current.y));
  }, []);

  /** Zoom around a screen point so the pixel under the fingers stays put. */
  const zoomAt = useCallback(
    (nextScale: number, clientX?: number, clientY?: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      const prev = transform.current.scale;
      if (clamped === prev && clamped !== MIN_SCALE) return;

      const rect = stage.getBoundingClientRect();
      const cx = (clientX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
      const cy = (clientY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;

      const ratio = 1 - clamped / prev;
      transform.current.x += (cx - transform.current.x) * ratio;
      transform.current.y += (cy - transform.current.y) * ratio;
      transform.current.scale = clamped;

      if (clamped === MIN_SCALE) {
        transform.current.x = 0;
        transform.current.y = 0;
      }
      clamp();
      applyTransform();
    },
    [applyTransform, clamp]
  );

  const resetView = useCallback(() => {
    transform.current = { scale: 1, x: 0, y: 0 };
    applyTransform();
  }, [applyTransform]);

  // reset when the mural or image mode changes
  useEffect(() => {
    resetView();
    setActiveHotspot(null);
    setLoaded(false);
  }, [initialMuralId, viewMode, resetView]);

  useEffect(() => {
    narration.stop();
  }, [initialMuralId]);

  const gestures = useGestures<HTMLDivElement>({
    onDrag: (dx, dy) => {
      // at 1× there is nothing to pan: let the tap/swipe fall through
      if (transform.current.scale <= 1) return;
      transform.current.x += dx;
      transform.current.y += dy;
      clamp();
      applyTransform();
    },
    onPinch: (factor) => {
      zoomAt(pinchStartScale.current * factor);
    },
    onPinchEnd: () => {
      pinchStartScale.current = transform.current.scale;
    },
    onWheel: (deltaY) => {
      zoomAt(transform.current.scale * (deltaY > 0 ? 0.88 : 1.14));
    },
    onTap: (pt) => {
      const stage = stageRef.current;
      if (!stage) return;
      const hit = hitTestHotspot(pt.x, pt.y);
      if (hit) {
        setActiveHotspot(hit);
        tapFeedback(14);
      } else if (activeHotspot) {
        setActiveHotspot(null);
      }
    },
    onDoubleTap: (pt) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (transform.current.scale > 1.4) {
        zoomAt(MIN_SCALE);
      } else {
        zoomAt(3, pt.x + rect.left, pt.y + rect.top);
      }
      tapFeedback();
    },
  });

  // hotspot hit-testing in screen space (markers scale with the image)
  const hitTestHotspot = (sx: number, sy: number): Mural['hotspots'][number] | null => {
    const stage = stageRef.current;
    const el = contentRef.current;
    if (!stage || !el) return null;
    const sr = stage.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    for (const hs of mural.hotspots) {
      const hx = er.left + (hs.x / 100) * er.width - sr.left;
      const hy = er.top + (hs.y / 100) * er.height - sr.top;
      if ((hx - sx) ** 2 + (hy - sy) ** 2 < 38 * 38) return hs;
    }
    return null;
  };

  useEffect(() => {
    pinchStartScale.current = transform.current.scale;
  });

  /* ---------------- narration ---------------- */
  const nagivateMural = (dir: -1 | 1) => {
    const idx = MURALS.findIndex((m) => m.id === mural.id);
    const next = (idx + dir + MURALS.length) % MURALS.length;
    onSelectMural(MURALS[next].id);
    tapFeedback();
  };

  const speakMural = () => {
    const text = loc(mural.audioGuide.transcripts as Record<Lang, string>, language);
    narration.speak(mural.id, loc(mural.title, language), text, language);
    tapFeedback();
  };

  const toggleNarration = () => {
    const st = narration.getState();
    if (st.status === 'speaking') narration.pause();
    else if (st.status === 'paused') narration.resume();
    else speakMural();
  };

  const imageUrl =
    viewMode === 'restored'
      ? mural.detailUrl
      : viewMode === 'lineart'
        ? mural.lineArtUrl
        : mural.imageUrl;

  const favorited = isFavorite(mural.id);
  const isSpeaking = narrationState.sourceId === mural.id && narrationState.status === 'speaking';
  const isPaused = narrationState.sourceId === mural.id && narrationState.status === 'paused';

  const modes: { id: ViewMode; label: string; hint: string }[] = [
    { id: 'original', label: '原貌', hint: '历经千年的氧化与剥落' },
    { id: 'restored', label: '放大', hint: '局部超高清细节' },
    { id: 'lineart', label: '线稿', hint: '画师的笔法骨架' },
  ];

  return (
    <div className="relative flex h-full w-full flex-col bg-ink-900">
      {/* ---------------- stage ---------------- */}
      <div
        ref={(node) => {
          (stageRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (gestures as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {/* transformed content */}
        <div
          ref={contentRef}
          className="absolute left-1/2 top-1/2 origin-center will-change-transform"
          style={{ transform: 'translate3d(0px, 0px, 0) translate(-50%, -50%) scale(1)' }}
        >
          <div className="relative">
            {/* blurred 640px preview shows instantly; the full scan fades over it */}
            <img
              src={thumb(imageUrl)}
              alt=""
              aria-hidden="true"
              onError={(e) => (e.currentTarget.style.display = 'none')}
              draggable={false}
              className="block max-h-[calc(100svh-11rem)] max-w-[100vw] scale-105 select-none object-contain blur-md"
            />
            <img
              src={imageUrl}
              alt={loc(mural.title, language)}
              onLoad={(e) => {
                setLoaded(true);
                e.currentTarget.style.opacity = '1';
              }}
              draggable={false}
              className="absolute inset-0 block max-h-[calc(100svh-11rem)] max-w-[100vw] select-none object-contain opacity-0 transition-opacity duration-500"
            />
            {/* hotspot markers live inside the transformed layer so they track the painting */}
            {mural.hotspots.map((hs) => (
              <button
                key={hs.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(hs);
                  tapFeedback(14);
                }}
                className="absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold-300 bg-ink-800/80 text-gold-200 shadow-[0_0_14px_rgba(229,184,105,0.5)] backdrop-blur-sm animate-hotspot"
                style={{
                  left: `${hs.x}%`,
                  top: `${hs.y}%`,
                  transform: `translate(-50%,-50%) scale(calc(1 / var(--s, 1)))`,
                }}
                aria-label={loc(hs.title, language)}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-400/25 border-t-gold-300" />
          </div>
        )}

        {/* top bar */}
        <div
          className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <div className="flex min-w-0 items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-400/30 bg-ink-800/85 text-gold-300 backdrop-blur-md active:scale-95"
                aria-label="返回"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0 rounded-xl border border-gold-400/30 bg-ink-800/85 px-3 py-2 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gold-400">{mural.caveNumber}</span>
                <h2 className="truncate font-serif-sc text-sm font-bold text-gold-100">
                  {loc(mural.title, language)}
                </h2>
              </div>
              <p className="mt-0.5 text-[10px] text-sand-400">
                {loc(mural.dynasty, language)} · {mural.dimensions}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => {
                toggleFavorite(mural.id);
                confirmFeedback();
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md active:scale-95 ${
                favorited
                  ? 'border-gold-300 bg-gold-600/30 text-gold-200'
                  : 'border-gold-400/25 bg-ink-800/85 text-sand-300'
              }`}
              aria-label={favorited ? '取消收藏' : '收藏'}
            >
              {favorited ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
            <button
              onClick={resetView}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-400/25 bg-ink-800/85 text-sand-300 backdrop-blur-md active:scale-95"
              aria-label="复位"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* zoom readout + controls */}
        <div
          className="absolute right-3 z-20 flex flex-col gap-1.5"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 8.5rem)' }}
        >
          <button
            onClick={() => zoomAt(transform.current.scale * 1.5)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/25 bg-ink-800/85 text-gold-200 backdrop-blur-md active:scale-90"
            aria-label="放大"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="rounded-full border border-gold-400/25 bg-ink-800/85 px-2 py-1 text-center text-[10px] text-sand-300 backdrop-blur-md">
            {scaleLabel.toFixed(1)}×
          </div>
          <button
            onClick={() => zoomAt(transform.current.scale / 1.5)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/25 bg-ink-800/85 text-gold-200 backdrop-blur-md active:scale-90"
            aria-label="缩小"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* hint */}
        {scaleLabel <= 1.05 && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-full border border-gold-400/25 bg-ink-800/75 px-3.5 py-1.5 text-[11px] text-gold-200 backdrop-blur-md">
              双指缩放 · 拖动查看细节 · 双击放大
            </div>
          </div>
        )}
      </div>

      {/* ---------------- bottom panel ---------------- */}
      <div
        className="shrink-0 border-t border-ink-400/70 bg-ink-800/95 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* view mode rail */}
        <div className="rail px-3 pt-2.5 pb-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setViewMode(m.id);
                tapFeedback();
              }}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] transition-colors ${
                viewMode === m.id
                  ? 'border-gold-300 bg-gold-600/30 font-bold text-gold-100'
                  : 'border-ink-300 bg-ink-700 text-sand-300'
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>{m.label}</span>
            </button>
          ))}
          <span className="ml-1 self-center text-[10px] text-sand-500">
            {modes.find((m) => m.id === viewMode)?.hint}
          </span>
        </div>

        {/* title + narration */}
        <div className="px-3 pb-2.5">
          <p className="clamp-2 text-[11px] leading-relaxed text-sand-300">
            {loc(mural.description as Record<Lang, string>, language)}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <GuideAvatar lang={language} speaking={isSpeaking} size={38} />
            <button
              onClick={toggleNarration}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-gold-400 px-3.5 text-xs font-bold text-ink-900 active:scale-95"
            >
              {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isSpeaking ? '暂停讲解' : isPaused ? '继续讲解' : '听讲解'}</span>
            </button>
            <button
              onClick={() => {
                speakMural();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-400/35 text-gold-200 active:scale-95"
              aria-label="重听"
            >
              <Headphones className="h-4 w-4" />
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => nagivateMural(-1)}
                className="flex h-10 w-9 items-center justify-center rounded-xl border border-ink-300 bg-ink-600 text-sand-200 active:scale-95"
                aria-label="上一幅"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => nagivateMural(1)}
                className="flex h-10 w-9 items-center justify-center rounded-xl border border-ink-300 bg-ink-600 text-sand-200 active:scale-95"
                aria-label="下一幅"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* live transcript while speaking */}
          {narrationState.sourceId === mural.id && narrationState.status !== 'idle' && (
            <div className="mt-2 rounded-lg border border-gold-400/20 bg-ink-700/70 p-2.5">
              <p className="max-h-24 overflow-y-auto overscroll-contain text-[11px] leading-relaxed text-sand-200">
                {narrationState.chunks.map((c, i) => (
                  <span
                    key={i}
                    className={
                      i === narrationState.chunkIndex
                        ? 'rounded bg-gold-500/25 text-gold-100'
                        : i < narrationState.chunkIndex
                          ? 'text-sand-400'
                          : ''
                    }
                  >
                    {c}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- hotspot sheet ---------------- */}
      {activeHotspot && (
        <div
          className="absolute inset-0 z-40 flex items-end bg-black/50 md:items-center md:justify-center"
          onClick={() => setActiveHotspot(null)}
        >
          <div
            className="w-full animate-sheet-up rounded-t-2xl border border-gold-400/30 bg-ink-800 p-4 md:max-w-md md:rounded-2xl"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif-sc text-[15px] font-bold text-gold-100">
                {loc(activeHotspot.title, language)}
              </h3>
              <button
                onClick={() => setActiveHotspot(null)}
                className="rounded-md p-1 text-sand-400 active:bg-ink-600"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-sand-200">
              {loc(activeHotspot.description, language)}
            </p>
            {activeHotspot.detailHighlight && (
              <p className="mt-2 rounded-lg border border-gold-400/20 bg-ink-700/60 p-2 text-[11px] text-sand-300">
                细节：{activeHotspot.detailHighlight}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  narration.speak(
                    activeHotspot.id,
                    loc(activeHotspot.title, language),
                    loc(activeHotspot.description, language),
                    language
                  );
                }}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold-400 text-xs font-bold text-ink-900 active:scale-95"
              >
                <Play className="h-4 w-4" />
                朗读这一段
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
