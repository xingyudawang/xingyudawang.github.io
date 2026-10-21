import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eye, HelpCircle, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MURALS, CULTURAL_QUIZ } from '../data/dunhuangData';
import { loc, type Lang } from '../data/caveScenes';
import { thumb } from '../lib/media';
import { tapFeedback, confirmFeedback } from '../lib/haptics';
import { useApp } from '../context/AppContext';

type Mode = 'puzzle' | 'quiz';

/** Tap two tiles to swap — reliable on touch, unlike drag-and-drop sliding puzzles. */
export const PuzzleScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { language } = useApp();
  const [mode, setMode] = useState<Mode>('puzzle');

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto overscroll-contain pb-8">
      <div
        className="sticky top-0 z-20 border-b border-ink-400/60 bg-ink-800/95 px-4 pb-2.5 backdrop-blur-md"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.625rem)' }}
      >
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-300 bg-ink-600 text-sand-200 active:scale-95"
              aria-label="返回"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="font-serif-sc text-base font-bold text-gold-100">壁画复原挑战</h1>
            <p className="text-[10px] text-sand-500">拼回壁画 · 答对考点</p>
          </div>
          <div className="flex rounded-lg border border-ink-300 bg-ink-700 p-0.5">
            {(['puzzle', 'quiz'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  tapFeedback();
                }}
                className={`rounded-md px-2.5 py-1.5 text-[11px] ${
                  mode === m ? 'bg-gold-500/30 font-bold text-gold-100' : 'text-sand-300'
                }`}
              >
                {m === 'puzzle' ? '拼图' : '问答'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === 'puzzle' ? <PuzzleBoard language={language} /> : <QuizBoard language={language} />}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* puzzle                                                                      */
/* -------------------------------------------------------------------------- */

const GRID = 3;

const PuzzleBoard: React.FC<{ language: Lang }> = ({ language }) => {
  const [muralIndex, setMuralIndex] = useState(0);
  const [tiles, setTiles] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const mural = MURALS[muralIndex];
  const solved = useMemo(() => tiles.every((t, i) => t === i), [tiles]);

  // board texture: use the 640px thumb when it exists, fall back to the full scan
  const [boardSrc, setBoardSrc] = useState(() => thumb(mural.imageUrl));
  useEffect(() => {
    setBoardSrc(thumb(mural.imageUrl));
    const probe = new Image();
    probe.onerror = () => setBoardSrc(mural.imageUrl);
    probe.src = thumb(mural.imageUrl);
  }, [mural.imageUrl]);

  // the board matches each painting's own proportions, parsed from its scan size
  const muralAspect = useMemo(() => {
    const m = mural.scanSize?.match(/(\d+)\s*[×x]\s*(\d+)/);
    if (m) {
      const w = Number(m[1]);
      const h = Number(m[2]);
      if (w > 0 && h > 0) return w / h;
    }
    return 3 / 2;
  }, [mural.scanSize]);

  const shuffle = useCallback(() => {
    const base = Array.from({ length: GRID * GRID }, (_, i) => i);
    // guaranteed-solvable: random swaps from the solved state
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    setTiles(base);
    setSelected(null);
    setMoves(0);
    setShowHint(false);
  }, []);

  useEffect(() => {
    shuffle();
  }, [muralIndex, shuffle]);

  useEffect(() => {
    if (solved && tiles.length) {
      confirmFeedback();
      confetti({
        particleCount: 80,
        spread: 75,
        colors: ['#d4a359', '#c1382b', '#244b7a', '#2e6355'],
      });
    }
  }, [solved, tiles.length]);

  const tapTile = (idx: number) => {
    if (solved) return;
    tapFeedback();
    if (selected === null) {
      setSelected(idx);
      return;
    }
    if (selected === idx) {
      setSelected(null);
      return;
    }
    setTiles((prev) => {
      const next = [...prev];
      [next[selected], next[idx]] = [next[idx], next[selected]];
      return next;
    });
    setSelected(null);
    setMoves((m) => m + 1);
  };

  return (
    <div className="p-4">
      <div className="rail mb-3">
        {MURALS.map((m, i) => (
          <button
            key={m.id}
            onClick={() => {
              setMuralIndex(i);
              tapFeedback();
            }}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${
              i === muralIndex
                ? 'border-gold-300 bg-gold-500/25 font-bold text-gold-100'
                : 'border-ink-300 bg-ink-700 text-sand-300'
            }`}
          >
            {loc(m.title, language).slice(0, 8)}
          </button>
        ))}
      </div>

      <div
        className="relative mx-auto w-full max-w-2xl"
        style={{ width: `min(100%, calc(70svh * ${muralAspect.toFixed(4)}))` }}
      >
        <div
          className="grid overflow-hidden rounded-xl border-2 border-gold-600/40 bg-ink-700"
          style={{
            gridTemplateColumns: `repeat(${GRID}, 1fr)`,
            aspectRatio: String(muralAspect),
          }}
        >
          {tiles.map((tile, idx) => {
            const col = tile % GRID;
            const row = Math.floor(tile / GRID);
            return (
              <button
                key={idx}
                onClick={() => tapTile(idx)}
                className={`relative transition-all ${
                  selected === idx ? 'z-10 scale-[0.94] ring-2 ring-gold-200' : ''
                } ${solved ? '' : 'active:scale-95'}`}
                style={{
                  backgroundImage: `url(${boardSrc})`,
                  backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
                  backgroundPosition: `${(col / (GRID - 1)) * 100}% ${(row / (GRID - 1)) * 100}%`,
                }}
                aria-label={`第 ${idx + 1} 格`}
              >
                {showHint && !solved && (
                  <span className="absolute inset-0 flex items-center justify-center bg-ink-900/70 font-mono text-sm text-gold-200">
                    {tile + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {solved && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-ink-900/75 backdrop-blur-sm">
            <Trophy className="h-9 w-9 text-gold-300" />
            <p className="font-serif-sc text-sm font-bold text-gold-100">壁画已复原！</p>
            <p className="text-[11px] text-sand-300">共 {moves} 步</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={shuffle}
          className="flex h-10 items-center gap-1.5 rounded-xl border border-ink-300 bg-ink-600 px-3 text-[11px] text-sand-200 active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          重新打乱
        </button>
        <button
          onClick={() => setShowHint((v) => !v)}
          className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-[11px] active:scale-95 ${
            showHint
              ? 'border-gold-300 bg-gold-500/25 text-gold-100'
              : 'border-ink-300 bg-ink-600 text-sand-200'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          显示序号
        </button>
        <span className="rounded-lg border border-ink-300 bg-ink-700 px-2.5 py-2 font-mono text-[11px] text-gold-300">
          {moves} 步
        </span>
      </div>

      <p className="mt-3 text-center text-[10.5px] text-sand-500">
        点两块砖即可交换位置 · {GRID}×{GRID} 拼图
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* quiz                                                                        */
/* -------------------------------------------------------------------------- */

const QuizBoard: React.FC<{ language: Lang }> = ({ language }) => {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = CULTURAL_QUIZ[index];
  const options = (q.options as Record<Lang, string[]>)[language] ?? (q.options as Record<Lang, string[]>).zh;
  const question = loc(q.question as Record<Lang, string>, language);
  const explanation = loc(q.explanation as Record<Lang, string>, language);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.correctAnswer;
    if (correct) {
      setScore((s) => s + 1);
      confirmFeedback();
    } else {
      tapFeedback(30);
    }
  };

  const next = () => {
    if (index + 1 >= CULTURAL_QUIZ.length) {
      setDone(true);
      confetti({ particleCount: 90, spread: 80, colors: ['#d4a359', '#c1382b', '#244b7a'] });
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    tapFeedback();
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
        <Trophy className="h-12 w-12 text-gold-300" />
        <p className="font-serif-sc text-lg font-bold text-gold-100">
          答对 {score} / {CULTURAL_QUIZ.length}
        </p>
        <p className="text-center text-[12px] text-sand-400">
          {score === CULTURAL_QUIZ.length
            ? '满分！你已经是一位合格的敦煌讲解员了。'
            : '再走一趟洞窟，答案就藏在壁画里。'}
        </p>
        <button
          onClick={restart}
          className="mt-2 flex h-11 items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-200 to-gold-400 px-5 text-sm font-bold text-ink-900 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          再来一次
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between text-[10.5px] text-sand-400">
        <span>
          第 {index + 1} / {CULTURAL_QUIZ.length} 题
        </span>
        <span className="text-gold-300">已答对 {score} 题</span>
      </div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-ink-500">
        <div
          className="h-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all"
          style={{ width: `${((index + (picked !== null ? 1 : 0)) / CULTURAL_QUIZ.length) * 100}%` }}
        />
      </div>

      <h2 className="font-serif-sc text-[15px] leading-relaxed font-bold text-gold-100">{question}</h2>

      <div className="mt-4 space-y-2">
        {options.map((opt, i) => {
          const isCorrect = i === q.correctAnswer;
          const isPicked = picked === i;
          let cls = 'border-ink-300 bg-ink-700 text-sand-200';
          if (picked !== null) {
            if (isCorrect) cls = 'border-emerald-500/70 bg-emerald-900/40 text-emerald-100';
            else if (isPicked) cls = 'border-cinnabar/70 bg-cinnabar/20 text-red-200';
            else cls = 'border-ink-300 bg-ink-700/50 text-sand-500';
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-left text-[12.5px] leading-relaxed active:scale-[0.99] ${cls}`}
            >
              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0">{opt}</span>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-3 animate-fade-up rounded-xl border border-gold-400/30 bg-ink-700/80 p-3">
          <div className="flex items-start gap-2">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-300" />
            <p className="text-[11.5px] leading-relaxed text-sand-200">{explanation}</p>
          </div>
          <button
            onClick={next}
            className="mt-2.5 flex h-10 w-full items-center justify-center rounded-xl bg-gold-400 text-xs font-bold text-ink-900 active:scale-95"
          >
            {index + 1 >= CULTURAL_QUIZ.length ? '查看结果' : '下一题'}
          </button>
        </div>
      )}
    </div>
  );
};
