import React, { useState } from 'react';
import { Brush, Download, Image as ImageIcon, Languages, Palette, Sun, Trash2, X } from 'lucide-react';
import { MURALS } from '../data/dunhuangData';
import { loc } from '../data/caveScenes';
import { media } from '../lib/media';
import { useApp, type Language, type ThemeMode } from '../context/AppContext';
import { confirmFeedback, tapFeedback } from '../lib/haptics';

interface Props {
  onOpenMural: (muralId: string) => void;
  onOpenTab: (tab: string) => void;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'zh', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'fr', label: 'Français' },
];

const THEMES: { code: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { code: 'candle', label: '莫高烛光', icon: <Palette className="h-3.5 w-3.5" /> },
  { code: 'daylight', label: '大漠曜金', icon: <Sun className="h-3.5 w-3.5" /> },
  { code: 'starry', label: '鸣沙星空', icon: <ImageIcon className="h-3.5 w-3.5" /> },
];

export const ProfileScreen: React.FC<Props> = ({ onOpenMural, onOpenTab }) => {
  const { language, setLanguage, theme, setTheme, user, removeArtwork, isFavorite } = useApp();
  const [viewing, setViewing] = useState<string | null>(null);

  const favorites = MURALS.filter((m) => isFavorite(m.id));

  return (
    <div className="h-full w-full overflow-y-auto overscroll-contain pb-8">
      {/* header */}
      <div
        className="relative overflow-hidden border-b border-ink-400/60 px-4 pb-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <img
          src={media('hero-mural-bg.webp')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 to-ink-800" />
        <div className="relative flex items-center gap-3">
          <img
            src={media(user.avatar)}
            alt=""
            className="h-16 w-16 rounded-full border-2 border-gold-400/50 object-cover shadow-lg"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-serif-sc text-base font-bold text-gold-100">{user.name}</h1>
            <p className="mt-0.5 text-[10.5px] text-gold-400/80">{user.title}</p>
            <div className="mt-1.5 flex gap-3 text-[10px] text-sand-400">
              <span>珍藏 {user.favorites.length}</span>
              <span>创作 {user.artworks.length}</span>
              <span>印记 {user.stamps.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* favorites */}
      <section className="mt-4">
        <h2 className="px-4 font-serif-sc text-[14px] font-bold text-gold-100">珍藏壁画</h2>
        {favorites.length ? (
          <div className="rail mt-2.5 gap-2.5 px-4">
            {favorites.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  tapFeedback();
                  onOpenMural(m.id);
                }}
                className="relative aspect-[3/4] w-[36vw] max-w-[160px] overflow-hidden rounded-xl border border-gold-600/30 active:scale-95"
              >
                <img src={m.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 to-transparent" />
                <p className="absolute inset-x-1.5 bottom-1.5 font-serif-sc text-[10.5px] font-bold text-gold-100">
                  {loc(m.title, language)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-4 pt-2 text-[11px] text-sand-500">
            还没有珍藏。在微距鉴赏里点书签图标即可收藏。
          </p>
        )}
      </section>

      {/* artworks */}
      <section className="mt-6">
        <div className="flex items-end justify-between px-4">
          <h2 className="font-serif-sc text-[14px] font-bold text-gold-100">我的作品</h2>
          <button
            onClick={() => onOpenTab('workshop')}
            className="flex items-center gap-1 rounded-lg border border-gold-400/30 px-2 py-1 text-[10.5px] text-gold-200 active:scale-95"
          >
            <Brush className="h-3 w-3" />
            去创作
          </button>
        </div>
        {user.artworks.length ? (
          <div className="mt-2.5 grid grid-cols-2 gap-2.5 px-4 sm:grid-cols-3">
            {user.artworks.map((art) => (
              <div
                key={art.id}
                className="group relative overflow-hidden rounded-xl border border-gold-600/30 bg-sand-100"
              >
                <button onClick={() => setViewing(art.dataUrl)} className="block w-full">
                  <img src={art.dataUrl} alt={art.title} className="block w-full object-cover" />
                </button>
                <div className="flex items-center justify-between gap-1 bg-ink-700/95 px-2 py-1.5">
                  <span className="truncate text-[10px] text-sand-200">{art.title}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    <a
                      href={art.dataUrl}
                      download={`莫高幻境-${art.title}.jpg`}
                      className="rounded p-1 text-gold-300 active:bg-ink-500"
                      aria-label="下载"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        removeArtwork(art.id);
                        tapFeedback();
                      }}
                      className="rounded p-1 text-sand-400 active:bg-ink-500"
                      aria-label="删除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 pt-2 text-[11px] text-sand-500">
            还没有作品。去「彩绘工坊」给千年线稿上一次矿物色。
          </p>
        )}
      </section>

      {/* notes */}
      {Object.keys(user.notes).length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="font-serif-sc text-[14px] font-bold text-gold-100">观展手记</h2>
          <div className="mt-2.5 space-y-2">
            {Object.entries(user.notes).map(([muralId, note]) => {
              const mural = MURALS.find((m) => m.id === muralId);
              if (!mural) return null;
              return (
                <div key={muralId} className="rounded-xl border border-ink-300 bg-ink-700/60 p-3">
                  <p className="text-[11px] font-bold text-gold-300">{loc(mural.title, language)}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-sand-300">{note}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* settings */}
      <section className="mt-6 px-4">
        <h2 className="font-serif-sc text-[14px] font-bold text-gold-100">偏好设置</h2>

        <div className="mt-2.5 rounded-xl border border-ink-300 bg-ink-700/60 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-sand-400">
            <Languages className="h-3.5 w-3.5" />
            语言
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  tapFeedback();
                }}
                className={`rounded-lg border px-2 py-2 text-[11px] ${
                  language === l.code
                    ? 'border-gold-300 bg-gold-500/25 font-bold text-gold-100'
                    : 'border-ink-300 bg-ink-600 text-sand-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2.5 rounded-xl border border-ink-300 bg-ink-700/60 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-sand-400">
            <Palette className="h-3.5 w-3.5" />
            展厅光环境
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {THEMES.map((th) => (
              <button
                key={th.code}
                onClick={() => {
                  setTheme(th.code);
                  confirmFeedback();
                }}
                className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] ${
                  theme === th.code
                    ? 'border-gold-300 bg-gold-500/25 font-bold text-gold-100'
                    : 'border-ink-300 bg-ink-600 text-sand-300'
                }`}
              >
                {th.icon}
                {th.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setViewing(null)}
        >
          <img src={viewing} alt="作品" className="max-h-full max-w-full rounded-lg object-contain" />
          <button
            className="absolute right-4 top-4 rounded-full bg-ink-800/80 p-2 text-gold-200"
            onClick={() => setViewing(null)}
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};
