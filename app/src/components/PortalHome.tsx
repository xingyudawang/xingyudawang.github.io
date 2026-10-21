import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Compass,
  Eye,
  Grid2x2,
  Palette,
  Play,
  Sparkles,
  Trophy,
  Volume2,
} from 'lucide-react';
import { CAVES, MURALS } from '../data/dunhuangData';
import { loc, type Lang } from '../data/caveScenes';
import { media } from '../lib/media';
import { useApp } from '../context/AppContext';
import { tapFeedback } from '../lib/haptics';

interface Props {
  onOpenCave: (caveId: string) => void;
  onOpenMural: (muralId: string) => void;
  onOpenTab: (tab: string) => void;
}

const ERAS = ['全部', '北魏', '西魏', '隋代', '初唐', '盛唐', '中唐', '五代', '元代'] as const;

export const PortalHome: React.FC<Props> = ({ onOpenCave, onOpenMural, onOpenTab }) => {
  const { language, t, user } = useApp();
  const [era, setEra] = useState<(typeof ERAS)[number]>('全部');

  const caves = useMemo(
    () =>
      era === '全部'
        ? CAVES
        : CAVES.filter((c) => loc(c.dynasty, language).includes(era)),
    [era, language]
  );

  const featured = MURALS[0];

  return (
    <div className="h-full w-full overflow-y-auto overscroll-contain pb-8">
      {/* ---------------- hero ---------------- */}
      <section className="relative h-[62svh] min-h-[380px] w-full overflow-hidden">
        <img
          src={media('mural-cave-320.webp')}
          alt="莫高窟第320窟 散花飞天"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/45 via-ink-900/35 to-ink-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,200,120,0.18),transparent_60%)]" />

        <div
          className="relative flex h-full flex-col justify-end px-5 pb-7"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold-400/40 bg-ink-900/50 px-2.5 py-1 text-[10px] tracking-[0.18em] text-gold-200 backdrop-blur">
            <Sparkles className="h-3 w-3" />
            <span>MOGAO · 数字化洞窟</span>
          </div>

          <h1 className="font-calligraphy text-[2.6rem] leading-none text-gold-100 drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)] sm:text-6xl">
            {t('appName')}
          </h1>
          <p className="mt-2 max-w-md font-serif-sc text-[13px] leading-relaxed text-sand-200/90">
            一千六百年的矿物之色，在指尖重新流动。走进洞窟、放大细节、听它讲述。
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                tapFeedback();
                onOpenCave('cave-257');
              }}
              className="flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-gold-200 to-gold-400 px-6 text-sm font-bold text-ink-900 shadow-[0_8px_28px_rgba(212,163,89,0.4)] active:scale-95"
            >
              <Play className="h-4 w-4" />
              <span>{t('exploreNow')}</span>
            </button>
            <button
              onClick={() => {
                tapFeedback();
                onOpenMural(featured.id);
              }}
              className="flex h-12 items-center gap-2 rounded-full border border-gold-200/40 bg-ink-900/45 px-5 text-sm text-gold-100 backdrop-blur active:scale-95"
            >
              <Eye className="h-4 w-4" />
              <span>微距鉴赏</span>
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3 text-[10px] text-sand-300/80">
            <span className="flex items-center gap-1">
              <Volume2 className="h-3 w-3 text-gold-300" /> 内置讲解
            </span>
            <span className="flex items-center gap-1">
              <Compass className="h-3 w-3 text-gold-300" /> 陀螺仪体感
            </span>
            <span className="flex items-center gap-1">
              <Grid2x2 className="h-3 w-3 text-gold-300" /> {CAVES.length} 座洞窟
            </span>
          </div>
        </div>
      </section>

      {/* ---------------- quick actions ---------------- */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'workshop', label: '彩绘工坊', icon: Palette, color: 'from-cinnabar/80 to-cinnabar/30' },
            { id: 'encyclopedia', label: '敦煌百科', icon: BookOpen, color: 'from-lapis/80 to-lapis/30' },
            { id: 'game', label: '壁画拼图', icon: Trophy, color: 'from-malachite/80 to-malachite/30' },
            { id: 'profile', label: '我的图鉴', icon: Grid2x2, color: 'from-gold-500/80 to-gold-600/30' },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => {
                  tapFeedback();
                  onOpenTab(a.id);
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-300 bg-ink-700/80 py-3 active:scale-95"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${a.color}`}>
                  <Icon className="h-4 w-4 text-gold-100" />
                </span>
                <span className="text-[10.5px] text-sand-200">{a.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------------- caves ---------------- */}
      <section className="mt-6">
        <SectionHeader
          title="洞窟漫游"
          subtitle="360° 全景 · 陀螺仪 · 即时讲解"
          action={
            <button
              onClick={() => onOpenTab('vr')}
              className="flex items-center gap-0.5 text-[11px] text-gold-300"
            >
              全部 <ChevronRight className="h-3 w-3" />
            </button>
          }
        />

        <div className="rail mt-3 px-4">
          {ERAS.map((e) => (
            <button
              key={e}
              onClick={() => setEra(e)}
              className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                era === e
                  ? 'border-gold-300 bg-gold-500/25 font-bold text-gold-100'
                  : 'border-ink-300 bg-ink-700 text-sand-300'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {caves.map((cave) => (
            <button
              key={cave.id}
              onClick={() => {
                tapFeedback();
                onOpenCave(cave.id);
              }}
              className="group relative overflow-hidden rounded-2xl border border-gold-600/25 bg-ink-700 text-left active:scale-[0.985]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={cave.coverImage}
                  alt={loc(cave.name, language)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/25 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-1.5">
                  <span className="rounded-md border border-gold-300/40 bg-ink-900/70 px-1.5 py-0.5 font-serif-sc text-[11px] font-bold text-gold-200 backdrop-blur">
                    {cave.number}
                  </span>
                  <span className="rounded-md bg-ink-900/60 px-1.5 py-0.5 text-[10px] text-sand-300 backdrop-blur">
                    {loc(cave.dynasty, language)}
                  </span>
                </div>
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-gold-300/50 bg-ink-900/60 text-gold-200 backdrop-blur">
                  <Play className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-serif-sc text-sm font-bold text-gold-100">
                  {loc(cave.name, language)}
                </h3>
                <p className="mt-1 clamp-2 text-[11px] leading-relaxed text-sand-400">
                  {loc(cave.description, language)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {cave.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gold-600/30 px-1.5 py-0.5 text-[9.5px] text-gold-300/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ---------------- murals ---------------- */}
      <section className="mt-7">
        <SectionHeader title="微距壁画" subtitle="双指放大 · 亿级像素细节" />
        <div className="rail mt-3 gap-3 px-4">
          {MURALS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                tapFeedback();
                onOpenMural(m.id);
              }}
              className="relative aspect-[3/4] w-[42vw] max-w-[190px] overflow-hidden rounded-xl border border-gold-600/25 active:scale-95"
            >
              <img
                src={m.imageUrl}
                alt={loc(m.title, language)}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-transparent to-transparent" />
              <div className="absolute inset-x-2 bottom-2">
                <p className="font-serif-sc text-[11.5px] leading-tight font-bold text-gold-100">
                  {loc(m.title, language)}
                </p>
                <p className="text-[9.5px] text-sand-400">{m.caveNumber}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ---------------- workshop teaser ---------------- */}
      <section className="mt-7 px-4">
        <button
          onClick={() => {
            tapFeedback();
            onOpenTab('workshop');
          }}
          className="relative w-full overflow-hidden rounded-2xl border border-gold-600/30 text-left active:scale-[0.99]"
        >
          <img
            src={media('hero-mural-bg.webp')}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/70 to-ink-900/30" />
          <div className="relative flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold-300/40 bg-ink-900/50 text-gold-200 backdrop-blur">
              <Palette className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif-sc text-sm font-bold text-gold-100">矿物彩绘工坊</h3>
              <p className="mt-0.5 text-[11px] text-sand-300">
                用朱砂、石青、泥金给千年线稿上色
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-gold-300" />
          </div>
        </button>
      </section>

      {/* ---------------- passport strip ---------------- */}
      <section className="mt-6 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-ink-300 bg-ink-700/70 p-3">
          <img
            src={media(user.avatar)}
            alt=""
            className="h-11 w-11 rounded-full border border-gold-400/40 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-bold text-gold-100">{user.name}</p>
            <p className="text-[10px] text-sand-400">
              已珍藏 {user.favorites.length} 幅壁画 · 创作 {user.artworks.length} 幅作品
            </p>
          </div>
          <button
            onClick={() => onOpenTab('profile')}
            className="shrink-0 rounded-lg border border-gold-400/30 px-2.5 py-1.5 text-[11px] text-gold-200 active:scale-95"
          >
            查看
          </button>
        </div>
      </section>

      <footer className="mt-8 px-5 pb-6 text-center">
        <p className="font-serif-sc text-[11px] text-gold-400/80">
          莫高幻境 · 敦煌莫高窟数字化体验馆
        </p>
        <p className="mt-1 text-[9.5px] text-sand-500">
          数字壁画为艺术再现，原作藏于敦煌莫高窟
        </p>
      </footer>
    </div>
  );
};

const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex items-end justify-between px-4">
    <div>
      <h2 className="font-serif-sc text-[15px] font-bold text-gold-100">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[10.5px] text-sand-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);
