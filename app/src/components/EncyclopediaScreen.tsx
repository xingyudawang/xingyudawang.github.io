import React, { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, FlaskConical, Music4, ShieldCheck, Users } from 'lucide-react';
import { ENCYCLOPEDIA_ENTRIES, type EncyclopediaEntry } from '../data/dunhuangData';
import { loc, type Lang } from '../data/caveScenes';
import { tapFeedback } from '../lib/haptics';
import { useApp } from '../context/AppContext';

const CATEGORIES: { id: EncyclopediaEntry['category'] | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: '全部', icon: <FlaskConical className="h-3.5 w-3.5" /> },
  { id: 'pigment', label: '颜料', icon: <FlaskConical className="h-3.5 w-3.5" /> },
  { id: 'instrument', label: '乐器', icon: <Music4 className="h-3.5 w-3.5" /> },
  { id: 'figure', label: '人物', icon: <Users className="h-3.5 w-3.5" /> },
  { id: 'preservation', label: '保护', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
];

export const EncyclopediaScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { language } = useApp();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all');
  const [openId, setOpenId] = useState<string | null>(ENCYCLOPEDIA_ENTRIES[0]?.id ?? null);

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
            <p className="text-[10px] text-sand-500">颜料 · 乐器 · 人物 · 保护</p>
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
              <button
                onClick={() => {
                  setOpenId(open ? null : entry.id);
                  tapFeedback();
                }}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <img
                  src={entry.image}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-xl border border-gold-600/25 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif-sc text-[13.5px] leading-snug font-bold text-gold-100">
                    {loc(entry.title as Record<Lang, string>, language)}
                  </h2>
                  <p className="mt-0.5 text-[10.5px] text-gold-400/80">
                    {loc(entry.subtitle as Record<Lang, string>, language)}
                  </p>
                  <p className={`mt-1 text-[11px] leading-relaxed text-sand-400 ${open ? '' : 'clamp-2'}`}>
                    {loc(entry.summary as Record<Lang, string>, language)}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-sand-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>

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
    </div>
  );
};
