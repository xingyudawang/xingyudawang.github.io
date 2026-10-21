import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Brush,
  Check,
  Download,
  Eraser,
  Eye,
  EyeOff,
  Image as ImageIcon,
  PaintBucket,
  Redo2,
  RotateCcw,
  Save,
  Sparkles,
  Stamp,
  Undo2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaintEngine, type PaintTool } from '../lib/paint';
import { media, preloadImage } from '../lib/media';
import { confirmFeedback, tapFeedback } from '../lib/haptics';
import { useApp } from '../context/AppContext';

interface Template {
  id: string;
  title: string;
  dynasty: string;
  /** line art used as the colouring base */
  lineArt: string;
  /** the finished mural, used as an optional colour reference */
  reference: string;
  aspect: number; // width / height
  hint: string;
  palette: string[];
}

const PIGMENTS = [
  { name: '朱砂', color: '#c1382b' },
  { name: '泥金', color: '#d4a359' },
  { name: '石青', color: '#244b7a' },
  { name: '石绿', color: '#2e6355' },
  { name: '赭石', color: '#a44322' },
  { name: '雌黄', color: '#e5b869' },
  { name: '铅白', color: '#f5edd6' },
  { name: '松烟', color: '#241c16' },
];

const TEMPLATES: Template[] = [
  {
    id: 'deer',
    title: '九色鹿本生',
    dynasty: '北魏 · 第257窟',
    lineArt: media('wash-deer.webp'),
    reference: media('mural-cave-257.webp'),
    aspect: 1.36,
    hint: '底稿是真实的西壁扫描。用铁线描的节奏上色：鹿身留白，背景压石绿与赭石。',
    palette: ['#f5edd6', '#e5b869', '#a44322', '#2e6355', '#244b7a', '#c1382b'],
  },
  {
    id: 'tigress',
    title: '萨埵太子饲虎',
    dynasty: '北魏 · 第254窟',
    lineArt: media('wash-tigress.webp'),
    reference: media('mural-cave-254.webp'),
    aspect: 1.97,
    hint: '墨色最深处是叙事重心。建议先铺赭石底，再用松烟压暗虎群。',
    palette: ['#a44322', '#241c16', '#2e6355', '#c1382b', '#f5edd6'],
  },
  {
    id: 'threehares',
    title: '三兔共耳藻井',
    dynasty: '隋 · 第420窟',
    lineArt: media('wash-threehares.webp'),
    reference: media('ceiling-cave-420.webp'),
    aspect: 1.06,
    hint: '藻井讲究对称：同心环逐层换色，石青与石绿交替，三兔共用一片底色。',
    palette: ['#244b7a', '#2e6355', '#c1382b', '#e5b869', '#f5edd6'],
  },
  {
    id: 'apsara',
    title: '散花飞天',
    dynasty: '盛唐 · 第320窟',
    lineArt: media('wash-apsara.webp'),
    reference: media('mural-cave-320.webp'),
    aspect: 1.26,
    hint: '飘带用石青与朱砂交替，皮肤以铅白加赭石薄薄晕染。',
    palette: ['#244b7a', '#c1382b', '#e5b869', '#f5edd6', '#2e6355'],
  },
  {
    id: 'pipa',
    title: '反弹琵琶',
    dynasty: '中唐 · 第112窟',
    lineArt: media('wash-pipa.webp'),
    reference: media('mural-cave-112.webp'),
    aspect: 0.94,
    hint: '朱砂压住舞伎的裙裾，石青留给飘带，让"三道弯"的轮廓跳出来。',
    palette: ['#c1382b', '#244b7a', '#d4a359', '#2e6355', '#f5edd6'],
  },
  {
    id: 'beauty',
    title: '美人菩萨',
    dynasty: '初唐 · 第57窟',
    lineArt: media('wash-beauty.webp'),
    reference: media('mural-cave-57.webp'),
    aspect: 1.14,
    hint: '妆面留白，头冠用泥金；裙裾的分层以石青与石绿深浅区分。',
    palette: ['#f5edd6', '#e5b869', '#c1382b', '#244b7a', '#2e6355'],
  },
];

const CANVAS_W = 1280;

export const DrawingStudio: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { saveArtwork } = useApp();

  const [templateIndex, setTemplateIndex] = useState(0);
  const [tool, setTool] = useState<PaintTool>('brush');
  const [color, setColor] = useState(PIGMENTS[0].color);
  const [brushSize, setBrushSize] = useState(14);
  const [showReference, setShowReference] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState({ undo: false, redo: false });
  const [ready, setReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PaintEngine | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const activePointer = useRef<number | null>(null);
  const drawingRef = useRef(false);

  const template = TEMPLATES[templateIndex];
  const canvasH = Math.round(CANVAS_W / template.aspect);

  const syncHistory = useCallback(() => {
    const e = engineRef.current;
    setHistory({ undo: !!e?.canUndo, redo: !!e?.canRedo });
  }, []);

  /* ---------------- build / rebuild the engine per template ---------------- */
  useEffect(() => {
    let cancelled = false;
    setReady(false);

    const build = async () => {
      const img = await preloadImage(template.lineArt);
      if (cancelled) return;

      baseImgRef.current = img;

      let engine = engineRef.current;
      if (!engine) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        engine = new PaintEngine(canvas, CANVAS_W, canvasH);
        engine.onChange = syncHistory;
        engineRef.current = engine;
      } else {
        engine.canvas.width = CANVAS_W;
        engine.canvas.height = canvasH;
      }
      engine.setBaseImage(img);
      engine.clear();
      syncHistory();
      setReady(true);
    };

    void build();
    return () => {
      cancelled = true;
    };
    // canvasH is derived from template.aspect, so templateIndex is the real dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateIndex]);

  useEffect(() => () => {
    engineRef.current = null;
  }, []);

  /* ---------------- pointer handling ---------------- */
  const toCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // the canvas is CSS-scaled; map into intrinsic pixel space
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine || !ready) return;
    // first pointer wins; extra fingers are treated as palm and ignored
    if (activePointer.current !== null) return;
    activePointer.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* synthetic pointers have no capture target */
    }

    const { x, y } = toCanvas(e.clientX, e.clientY);
    const pressure = e.pointerType === 'pen' ? Math.max(0.15, e.pressure || 0.5) : 0.55;

    if (tool === 'fill') {
      engine.fill(x, y, color);
      tapFeedback();
      activePointer.current = null;
      return;
    }
    if (tool === 'seal') {
      engine.seal(x, y, '莫高心印');
      confirmFeedback();
      activePointer.current = null;
      return;
    }

    drawingRef.current = true;
    engine.beginStroke(x, y, pressure, color, brushSize, tool === 'eraser');
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || e.pointerId !== activePointer.current) return;
    const engine = engineRef.current;
    if (!engine) return;
    // coalesced events give smooth curves even on 60 Hz touch sampling
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
    if (events.length > 1) {
      for (const ev of events) {
        const { x, y } = toCanvas(ev.clientX, ev.clientY);
        engine.extendStroke(x, y, ev.pointerType === 'pen' ? Math.max(0.15, ev.pressure || 0.5) : 0.55);
      }
    } else {
      const { x, y } = toCanvas(e.clientX, e.clientY);
      const pressure = e.pointerType === 'pen' ? Math.max(0.15, e.pressure || 0.5) : 0.55;
      engine.extendStroke(x, y, pressure);
    }
  };

  const endPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointer.current) return;
    const engine = engineRef.current;
    if (drawingRef.current) {
      engine?.endStroke();
      drawingRef.current = false;
    }
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* noop */
    }
    activePointer.current = null;
  };

  /* ---------------- actions ---------------- */
  const undo = () => {
    engineRef.current?.undo();
    tapFeedback();
  };
  const redo = () => {
    engineRef.current?.redo();
    tapFeedback();
  };
  const reset = () => {
    engineRef.current?.clear();
    confirmFeedback();
  };

  const download = () => {
    const engine = engineRef.current;
    if (!engine) return;
    const url = engine.exportPNG(1600);
    const a = document.createElement('a');
    a.download = `莫高幻境-${template.title}-${Date.now()}.png`;
    a.href = url;
    a.click();
    confirmFeedback();
  };

  const saveToPassport = () => {
    const engine = engineRef.current;
    if (!engine) return;
    // 900px JPEG keeps localStorage comfortably under quota
    const url = engine.exportJPEG(900, 0.85);
    saveArtwork({ title: template.title, dataUrl: url, templateId: template.id });
    setSaved(true);
    confirmFeedback();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.72 },
      colors: ['#d4a359', '#c1382b', '#244b7a', '#2e6355'],
    });
    setTimeout(() => setSaved(false), 2200);
  };

  const tools: { id: PaintTool; label: string; icon: React.ReactNode }[] = useMemo(
    () => [
      { id: 'brush', label: '矿彩笔', icon: <Brush className="h-5 w-5" /> },
      { id: 'eraser', label: '擦除', icon: <Eraser className="h-5 w-5" /> },
      { id: 'fill', label: '填色', icon: <PaintBucket className="h-5 w-5" /> },
      { id: 'seal', label: '印章', icon: <Stamp className="h-5 w-5" /> },
    ],
    []
  );

  return (
    <div className="flex h-full w-full flex-col bg-ink-800">
      {/* ---------- header ---------- */}
      <div
        className="shrink-0 px-3 pt-3"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-300 bg-ink-600 text-sand-200 active:scale-95"
                aria-label="返回展厅"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="font-serif-sc text-base font-bold text-gold-100">
                妙笔生花 · 矿物彩绘工坊
              </h1>
              <p className="mt-0.5 clamp-2 text-[11px] leading-snug text-sand-400">
                {template.hint}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => {
                setShowReference((v) => !v);
                tapFeedback();
              }}
              className={`flex h-9 items-center gap-1 rounded-lg border px-2.5 text-[11px] transition-colors ${
                showReference
                  ? 'border-gold-300 bg-gold-600/25 text-gold-200'
                  : 'border-ink-300 bg-ink-600 text-sand-300'
              }`}
              title="叠加原作配色参考"
            >
              {showReference ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>配色</span>
            </button>
            <button
              onClick={reset}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-300 bg-ink-600 text-sand-300 active:scale-95"
              title="重新开始"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* template rail */}
        <div className="rail -mx-1 mt-2.5 px-1 pb-1">
          {TEMPLATES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => {
                if (i === templateIndex) return;
                setTemplateIndex(i);
                tapFeedback();
              }}
              className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-colors ${
                i === templateIndex
                  ? 'border-gold-300 bg-gold-600/25 text-gold-100'
                  : 'border-ink-300 bg-ink-700 text-sand-300'
              }`}
            >
              <img
                src={t.lineArt}
                alt=""
                loading="lazy"
                className="h-8 w-8 rounded-md border border-ink-200 bg-sand-100 object-cover"
              />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[11px] font-bold">{t.title}</span>
                <span className="text-[9px] opacity-70">{t.dynasty}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- canvas stage ---------- */}
      <div className="relative min-h-0 flex-1 px-2 py-2">
        <div className="relative flex h-full w-full items-center justify-center">
          <div
            className="relative overflow-hidden rounded-xl border border-gold-600/40 bg-sand-100 shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
            style={{ aspectRatio: `${template.aspect}`, maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
          >
            {/* line art base */}
            <img
              src={template.lineArt}
              alt={`${template.title} 线稿`}
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
              draggable={false}
            />
            {/* optional colour reference */}
            {showReference && (
              <img
                src={template.reference}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-30 mix-blend-multiply"
              />
            )}
            {/* paint layer */}
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={canvasH}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endPointer}
              onPointerCancel={endPointer}
              className="relative block h-full w-full touch-none select-none"
              style={{ cursor: tool === 'fill' ? 'cell' : tool === 'seal' ? 'copy' : 'crosshair' }}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-sand-100">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-600/30 border-t-gold-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- tool dock ---------- */}
      <div
        className="shrink-0 border-t border-ink-400/70 bg-ink-700/95 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* colour swatches */}
        <div className="rail px-3 pt-2.5 pb-1">
          {PIGMENTS.map((p) => {
            const active = color === p.color;
            return (
              <button
                key={p.color}
                onClick={() => {
                  setColor(p.color);
                  if (tool === 'eraser' || tool === 'fill' || tool === 'seal') setTool('brush');
                  tapFeedback();
                }}
                className={`flex flex-col items-center gap-1 rounded-lg px-1.5 py-1 transition-colors ${
                  active ? 'bg-ink-500' : ''
                }`}
                aria-label={p.name}
              >
                <span
                  className={`block h-8 w-8 rounded-full border-2 transition-transform ${
                    active ? 'scale-110 border-gold-200 shadow-[0_0_12px_rgba(229,184,105,0.5)]' : 'border-white/25'
                  }`}
                  style={{ backgroundColor: p.color }}
                />
                <span className={`text-[9px] ${active ? 'text-gold-200' : 'text-sand-400'}`}>
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* tools + size + history */}
        <div className="flex items-center gap-1.5 px-3 pb-2.5">
          <div className="flex items-center gap-1">
            {tools.map((t) => {
              const active = tool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTool(t.id);
                    tapFeedback();
                  }}
                  className={`flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-xl border text-[9px] transition-colors active:scale-95 ${
                    active
                      ? 'border-gold-300 bg-gold-600/30 text-gold-100'
                      : 'border-ink-300 bg-ink-600 text-sand-300'
                  }`}
                  title={t.label}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mx-1 hidden h-9 w-px bg-ink-400 sm:block" />

          {/* brush size */}
          <div className="hidden min-w-0 flex-1 items-center gap-2 sm:flex">
            <span className="shrink-0 text-[10px] text-sand-400">笔触</span>
            <input
              type="range"
              min={3}
              max={56}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-ink-400 accent-gold-400"
            />
            <span className="w-8 shrink-0 text-right font-mono text-[10px] text-gold-300">
              {brushSize}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={!history.undo}
              className="flex h-11 w-10 items-center justify-center rounded-xl border border-ink-300 bg-ink-600 text-sand-200 active:scale-95 disabled:opacity-35"
              title="撤销"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!history.redo}
              className="flex h-11 w-10 items-center justify-center rounded-xl border border-ink-300 bg-ink-600 text-sand-200 active:scale-95 disabled:opacity-35"
              title="重做"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <button
              onClick={download}
              className="flex h-11 w-10 items-center justify-center rounded-xl border border-ink-300 bg-ink-600 text-sand-200 active:scale-95"
              title="下载作品"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={saveToPassport}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-300 to-gold-500 px-3 text-[11px] font-bold text-ink-900 active:scale-95"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span className="hidden xs:inline">{saved ? '已收录' : '存图鉴'}</span>
            </button>
          </div>
        </div>

        {/* mobile size slider on its own row */}
        <div className="flex items-center gap-2 px-3 pb-2.5 sm:hidden">
          <span className="shrink-0 text-[10px] text-sand-400">笔触</span>
          <input
            type="range"
            min={3}
            max={56}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-ink-400 accent-gold-400"
          />
          <span className="w-8 text-right font-mono text-[10px] text-gold-300">{brushSize}</span>
        </div>
      </div>
    </div>
  );
};
