import React, { useEffect, useMemo, useState } from 'react';
import { Brush, Download, Image as ImageIcon, Languages, Palette, Sun, Trash2, Volume2, X } from 'lucide-react';
import { MURALS } from '../data/dunhuangData';
import { loc } from '../data/caveScenes';
import { media, thumb } from '../lib/media';
import { narration } from '../lib/narration';
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

  // narration voice settings
  const [voices, setVoices] = useState(() => narration.listVoices());
  const [voiceValue, setVoiceValue] = useState(() => narration.getPreferredVoice() ?? '__auto');
  const [rate, setRate] = useState(() => narration.getRate());

  useEffect(() => narration.onVoicesChanged(() => setVoices(narration.listVoices())), []);

  const zhVoices = useMemo(
    () =>
      voices
        .filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('zh'))
        .sort((a, b) => Number(a.local) - Number(b.local)),
    [voices]
  );

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
                <img src={thumb(m.imageUrl)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = m.imageUrl)} />
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

        {/* 讲解声音：默认自动选最自然的音色，也可以手动挑选与调速 */}
        <div className="mt-2.5 rounded-xl border border-ink-300 bg-ink-700/60 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-sand-400">
            <Volume2 className="h-3.5 w-3.5" />
            讲解声音 · 九色鹿
          </div>

          <label className="mt-2 block text-[10px] text-sand-500">
            音色 {voices.length > 0 ? `（共 ${zhVoices.length} 个中文音色，自动已选最自然的一个）` : '（正在读取系统音色…）'}
          </label>
          <select
            value={voiceValue}
            onChange={(e) => {
              const v = e.target.value;
              narration.setPreferredVoice(v === '__auto' ? null : v);
              setVoiceValue(v);
              tapFeedback();
            }}
            className="mt-1.5 w-full appearance-none rounded-lg border border-ink-300 bg-ink-600 px-2.5 py-2 text-[12px] text-sand-100"
          >
            <option value="__auto">自动（推荐最自然的音色）</option>
            {zhVoices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
                {v.local ? '' : ' · 在线'}
              </option>
            ))}
          </select>

          <div className="mt-3 flex items-center gap-2">
            <span className="shrink-0 text-[10px] text-sand-500">语速</span>
            <input
              type="range"
              min={0.75}
              max={1.25}
              step={0.05}
              value={rate}
              onChange={(e) => {
                const v = Number(e.target.value);
                setRate(v);
                narration.setRate(v);
              }}
              className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-ink-400 accent-gold-400"
            />
            <span className="w-10 shrink-0 text-right font-mono text-[10px] text-gold-300">
              {rate.toFixed(2)}×
            </span>
          </div>

          <button
            onClick={() => {
              narration.preview(
                '您好，我是九色鹿，敦煌的数字讲解员。请听，这就是我的声音。',
                'zh'
              );
              confirmFeedback();
            }}
            className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-gold-400/35 text-[11px] text-gold-200 active:scale-[0.99]"
          >
            <Volume2 className="h-3.5 w-3.5" />
            试听当前音色
          </button>
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
