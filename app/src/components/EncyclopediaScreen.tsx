import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  FlaskConical,
  Hammer,
  Maximize2,
  Music4,
  Play,
  PlayCircle,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { ENCYCLOPEDIA_ENTRIES, VIDEOS, type EncyclopediaEntry } from '../data/dunhuangData';
import { loc, type Lang } from '../data/caveScenes';
import { tapFeedback } from '../lib/haptics';
import { useGestures } from '../lib/useGestures';
import { useScrollLock } from '../lib/hooks';
import { useApp } from '../context/AppContext';

const CATEGORIES: { id: EncyclopediaEntry['category'] | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: '全部', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: 'pigment', label: '颜料', icon: <FlaskConical className="h-3.5 w-3.5" /> },
  { id: 'figure', label: '人物', icon: <Users className="h-3.5 w-3.5" /> },
  { id: 'instrument', label: '乐器', icon: <Music4 className="h-3.5 w-3.5" /> },
  { id: 'craft', label: '形制工艺', icon: <Hammer className="h-3.5 w-3.5" /> },
  { id: 'dynasty', label: '风格年代', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: 'preservation', label: '保护', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
];

export const EncyclopediaScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { language } = useApp();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all');
  const [openId, setOpenId] = useState<string | null>(ENCYCLOPEDIA_ENTRIES[0]?.id ?? null);
  const [zooming, setZooming] = useState<EncyclopediaEntry | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const entries = useMemo(
    () =>
      category === 'all'
        ? ENCYCLOPEDIA_ENTRIES
        : ENCYCLOPEDIA_ENTRIES.filter((e) => e.category === category),
    [category]
  );

  return (
    <div className="h-full w-full overflow-y-auto overscroll-contain pb-8">
      <div
        className="sticky top-0 z-20 border-b border-ink-400/60 bg-ink-800/95 backdrop-blur-md"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-300 bg-ink-600 text-sand-200 active:scale-95"
              aria-label="返回"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h1 className="font-serif-sc text-base font-bold text-gold-100">敦煌交互百科</h1>
            <p className="text-[10px] text-sand-500">
              {ENCYCLOPEDIA_ENTRIES.length} 个词条 · 图片可放大观察 · 附科普视频
            </p>
          </div>
        </div>
        <div className="rail px-4 pb-2.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                tapFeedback();
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                category === c.id
                  ? 'border-gold-300 bg-gold-500/25 font-bold text-gold-100'
                  : 'border-ink-300 bg-ink-700 text-sand-300'
              }`}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {entries.map((entry) => {
          const open = openId === entry.id;
          const paragraphs = (entry.content as Record<Lang, string[]>)[language] ??
            (entry.content as Record<Lang, string[]>).zh ?? [];
          return (
            <article
              key={entry.id}
              className={`overflow-hidden rounded-2xl border transition-colors ${
                open ? 'border-gold-400/50 bg-ink-700' : 'border-ink-300 bg-ink-700/60'
              }`}
            >
              <div className="flex w-full items-center gap-3 p-3 text-left">
                {/* the image opens the zoomable lightbox */}
                <button
                  onClick={() => {
                    setZooming(entry);
                    tapFeedback();
                  }}
                  className="group relative shrink-0"
                  aria-label="放大观察"
                  title="放大观察"
                >
                  <img
                    src={entry.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-16 rounded-xl border border-gold-600/25 object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-ink-900/0 transition-colors group-hover:bg-ink-900/40">
                    <Maximize2 className="h-4 w-4 text-gold-200 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </button>
                <button
                  onClick={() => {
                    setOpenId(open ? null : entry.id);
                    tapFeedback();
                  }}
                  className="min-w-0 flex-1"
                >
                  <h2 className="font-serif-sc text-[13.5px] leading-snug font-bold text-gold-100">
                    {loc(entry.title as Record<Lang, string>, language)}
                  </h2>
                  <p className="mt-0.5 text-[10.5px] text-gold-400/80">
                    {loc(entry.subtitle as Record<Lang, string>, language)}
                  </p>
                  <p className={`mt-1 text-[11px] leading-relaxed text-sand-400 ${open ? '' : 'clamp-2'}`}>
                    {loc(entry.summary as Record<Lang, string>, language)}
                  </p>
                </button>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-sand-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </div>

              {open && (
                <div className="animate-fade-up px-3 pb-3">
                  <div className="space-y-2 border-t border-ink-400/60 pt-2.5">
                    {paragraphs.map((p, i) => (
                      <p key={i} className="text-[12px] leading-relaxed text-sand-200">
                        {p}
                      </p>
                    ))}
                  </div>
                  {entry.attributes && (
                    <dl className="mt-2.5 grid grid-cols-1 gap-1.5 rounded-xl border border-ink-300 bg-ink-800/60 p-2.5 xs:grid-cols-2">
                      {Object.entries(entry.attributes).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-[10.5px]">
                          <dt className="shrink-0 text-sand-500">{k}</dt>
                          <dd className="min-w-0 text-sand-200">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* ---------------- 科普视频 ---------------- */}
      <section className="mt-6 px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif-sc text-[15px] font-bold text-gold-100">科普视频</h2>
            <p className="mt-0.5 text-[10.5px] text-sand-500">来自哔哩哔哩 · 点击卡片即在本页播放</p>
          </div>
          <a
            href="https://search.bilibili.com/all?keyword=敦煌"
            target="_blank"
            rel="noreferrer"
            className="text-[10.5px] text-gold-300"
          >
            更多视频 ↗
          </a>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {VIDEOS.map((v) => {
            const active = playingVideo === v.id;
            return (
              <div
                key={v.id}
                className={`overflow-hidden rounded-2xl border bg-ink-700 ${
                  active ? 'border-gold-300' : 'border-ink-300'
                }`}
              >
                {active ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://player.bilibili.com/player.html?bvid=${v.bvid}&page=1&autoplay=1&danmaku=0&high_quality=1`}
                      title={loc(v.title as Record<Lang, string>, language)}
                      className="h-full w-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setPlayingVideo(v.id);
                      tapFeedback();
                    }}
                    className="group relative block aspect-video w-full text-left"
                  >
                    <img
                      src={v.cover}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent" />
                    <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/70 text-gold-200 backdrop-blur transition-transform group-hover:scale-110">
                      <Play className="ml-0.5 h-5 w-5" />
                    </span>
                    <span className="absolute inset-x-3 bottom-2.5">
                      <span className="block clamp-2 text-[12px] font-bold leading-snug text-gold-100">
                        {loc(v.title as Record<Lang, string>, language)}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[10px] text-sand-400">
                        <PlayCircle className="h-3 w-3" />
                        {v.duration} · {v.up}
                      </span>
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[10px] text-sand-500">
          视频内容版权归原作者与哔哩哔哩平台所有，本站仅作嵌入播放
        </p>
      </section>

      {zooming && <ZoomableImage entry={zooming} language={language} onClose={() => setZooming(null)} />}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Zoomable lightbox: pinch / wheel / double-tap to inspect details           */
/* -------------------------------------------------------------------------- */

const MIN_SCALE = 1;
const MAX_SCALE = 10;

const ZoomableImage: React.FC<{
  entry: EncyclopediaEntry;
  language: Lang;
  onClose: () => void;
}> = ({ entry, language, onClose }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const transform = useRef({ scale: 1, x: 0, y: 0 });
  const pinchStart = useRef(1);
  const [label, setLabel] = useState(1);

  useScrollLock(true);

  const apply = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const { scale, x, y } = transform.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
    setLabel(scale);
  }, []);

  const clamp = useCallback(() => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return;
    const { scale } = transform.current;
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const iw = img.offsetWidth * scale;
    const ih = img.offsetHeight * scale;
    transform.current.x = Math.min(Math.max(transform.current.x, (sw - iw) / 2), (iw - sw) / 2);
    transform.current.y = Math.min(Math.max(transform.current.y, (sh - ih) / 2), (ih - sh) / 2);
  }, []);

  const zoomAt = useCallback(
    (next: number, clientX?: number, clientY?: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      const prev = transform.current.scale;
      const rect = stage.getBoundingClientRect();
      const px = (clientX ?? rect.left + rect.width / 2) - rect.left;
      const py = (clientY ?? rect.top + rect.height / 2) - rect.top;
      const ax = (px - transform.current.x) / prev;
      const ay = (py - transform.current.y) / prev;
      transform.current.scale = s;
      transform.current.x = px - ax * s;
      transform.current.y = py - ay * s;
      if (s === MIN_SCALE) {
        transform.current.x = 0;
        transform.current.y = 0;
      }
      clamp();
      apply();
    },
    [apply, clamp]
  );

  const reset = useCallback(() => {
    transform.current = { scale: 1, x: 0, y: 0 };
    apply();
  }, [apply]);

  const gestures = useGestures<HTMLDivElement>({
    onDrag: (dx, dy) => {
      if (transform.current.scale <= 1) return;
      transform.current.x += dx;
      transform.current.y += dy;
      clamp();
      apply();
    },
    onPinch: (factor) => {
      zoomAt(pinchStart.current * factor);
    },
    onPinchEnd: () => {
      pinchStart.current = transform.current.scale;
    },
    onWheel: (deltaY) => {
      zoomAt(transform.current.scale * (deltaY > 0 ? 0.88 : 1.14));
    },
    onDoubleTap: (at, ev) => {
      const stage = stageRef.current;
      if (!stage) return;
      if (transform.current.scale > 1.4) reset();
      else {
        const r = stage.getBoundingClientRect();
        zoomAt(3, at.x + r.left, at.y + r.top);
      }
    },
  });

  useEffect(() => {
    pinchStart.current = transform.current.scale;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const src = entry.zoomImage ?? entry.image;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90" onClick={onClose}>
      <div
        ref={(node) => {
          (stageRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (gestures as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ touchAction: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0">
          <img
            ref={imgRef}
            src={src}
            alt={loc(entry.title as Record<Lang, string>, language)}
            className="absolute left-1/2 top-1/2 max-h-full max-w-full select-none will-change-transform"
            style={{ transform: 'translate3d(0,0,0) translate(-50%,-50%) scale(1)' }}
            draggable={false}
          />
        </div>

        {/* hint */}
        {label <= 1.05 && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-gold-400/25 bg-ink-800/75 px-3 py-1 text-[11px] text-gold-200 backdrop-blur-md">
            双指缩放 · 拖动观察 · 双击放大
          </div>
        )}
      </div>

      {/* caption bar */}
      <div
        className="shrink-0 border-t border-ink-400/60 bg-ink-800/95 px-4 py-3 backdrop-blur-md"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-serif-sc text-[13.5px] font-bold text-gold-100">
              {loc(entry.title as Record<Lang, string>, language)}
            </h3>
            <p className="truncate text-[10px] text-sand-400">
              {label.toFixed(1)}× · 真实壁画扫描
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => zoomAt(transform.current.scale * 1.5)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-400/25 bg-ink-700 text-gold-200 active:scale-90"
              aria-label="放大"
            >
              ＋
            </button>
            <button
              onClick={() => zoomAt(transform.current.scale / 1.5)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-400/25 bg-ink-700 text-gold-200 active:scale-90"
              aria-label="缩小"
            >
              －
            </button>
            <button
              onClick={reset}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-400/25 bg-ink-700 text-gold-200 active:scale-90"
              aria-label="复位"
            >
              ⟲
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-300 bg-gold-600/30 text-gold-100 active:scale-90"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
