import React, { useCallback, useEffect, useState } from 'react';
import {
  Brush,
  Compass,
  Eye,
  Grid2x2,
  Home,
  Info,
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { PortalHome } from './components/PortalHome';
import { CavePanorama } from './components/CavePanorama';
import { DeepZoomGallery } from './components/DeepZoomGallery';
import { DrawingStudio } from './components/DrawingStudio';
import { EncyclopediaScreen } from './components/EncyclopediaScreen';
import { PuzzleScreen } from './components/PuzzleScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { narration } from './lib/narration';
import { tapFeedback } from './lib/haptics';

type Tab = 'portal' | 'vr' | 'zoom' | 'workshop' | 'encyclopedia' | 'game' | 'profile';

const VALID_TABS: Tab[] = ['portal', 'vr', 'zoom', 'workshop', 'encyclopedia', 'game', 'profile'];

/** Tabs that own the whole screen: no bottom navigation, their own exit affordance. */
const IMMERSIVE: Tab[] = ['vr', 'zoom'];

function readHash(): { tab: Tab; caveId?: string; muralId?: string } {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const segs = path.split('/').filter(Boolean);
  const tab = (VALID_TABS.includes(segs[0] as Tab) ? segs[0] : 'portal') as Tab;
  const params = new URLSearchParams(query ?? '');
  return {
    tab,
    caveId: params.get('cave') ?? undefined,
    muralId: params.get('mural') ?? undefined,
  };
}

const Shell: React.FC = () => {
  const { language, theme, t } = useApp();

  const initial = readHash();
  const [tab, setTab] = useState<Tab>(initial.tab);
  const [caveId, setCaveId] = useState(initial.caveId ?? 'cave-257');
  const [muralId, setMuralId] = useState(initial.muralId ?? 'mural-deer');

  /** Keep the URL in sync for deep links; used for in-place swaps (no history entry). */
  const syncHash = useCallback((next: Tab, nextCave?: string, nextMural?: string) => {
    const params = new URLSearchParams();
    if (next === 'vr') params.set('cave', nextCave ?? caveId);
    if (next === 'zoom') params.set('mural', nextMural ?? muralId);
    const q = params.toString();
    const hash = `#/${next}${q ? `?${q}` : ''}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }, [caveId, muralId]);

  const go = useCallback(
    (next: Tab, opts?: { caveId?: string; muralId?: string }) => {
      narration.stop();
      if (opts?.caveId) setCaveId(opts.caveId);
      if (opts?.muralId) setMuralId(opts.muralId);
      setTab(next);

      // pushState (not replaceState) so the browser / system back gesture also
      // walks back through the app instead of kicking the user out of it.
      const params = new URLSearchParams();
      if (next === 'vr') params.set('cave', opts?.caveId ?? caveId);
      if (next === 'zoom') params.set('mural', opts?.muralId ?? muralId);
      const q = params.toString();
      const hash = `#/${next}${q ? `?${q}` : ''}`;
      if (window.location.hash !== hash) {
        window.history.pushState(null, '', hash);
      }
      window.scrollTo({ top: 0 });
    },
    [caveId, muralId]
  );

  // browser back / forward
  useEffect(() => {
    const onHash = () => {
      const parsed = readHash();
      setTab(parsed.tab);
      if (parsed.caveId) setCaveId(parsed.caveId);
      if (parsed.muralId) setMuralId(parsed.muralId);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const shellTone =
    theme === 'starry'
      ? 'bg-[#0b0e16] text-[#e2e9f6]'
      : theme === 'daylight'
        ? 'bg-[#1b120c] text-[#f6eedb]'
        : 'bg-ink-800 text-sand-100';

  const immersive = IMMERSIVE.includes(tab);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'portal', label: t('navHome'), icon: <Home className="h-5 w-5" /> },
    { id: 'vr', label: t('navVR'), icon: <Compass className="h-5 w-5" /> },
    { id: 'zoom', label: t('navGallery'), icon: <Eye className="h-5 w-5" /> },
    { id: 'workshop', label: t('navWorkshop'), icon: <Brush className="h-5 w-5" /> },
    { id: 'profile', label: t('navProfile'), icon: <Grid2x2 className="h-5 w-5" /> },
  ];

  const activeTab: Tab = tab === 'encyclopedia' || tab === 'game' ? 'portal' : tab;

  return (
    <div className={`flex h-[100svh] w-full flex-col overflow-hidden ${shellTone}`}>
      <main className="relative min-h-0 flex-1 overflow-hidden">
        {tab === 'portal' && (
          <PortalHome
            onOpenCave={(id) => go('vr', { caveId: id })}
            onOpenMural={(id) => go('zoom', { muralId: id })}
            onOpenTab={(next) => go(next as Tab)}
          />
        )}

        {tab === 'vr' && (
          <CavePanorama
            caveId={caveId}
            language={language}
            onBack={() => go('portal')}
            onSelectCave={(id) => go('vr', { caveId: id })}
            onOpenMural={(id) => go('zoom', { muralId: id })}
          />
        )}

        {tab === 'zoom' && (
          <DeepZoomGallery
            initialMuralId={muralId}
            onBack={() => go('portal')}
            onSelectMural={(id) => {
              setMuralId(id);
              syncHash('zoom', caveId, id);
            }}
          />
        )}

        {tab === 'workshop' && <DrawingStudio onBack={() => go('portal')} />}

        {tab === 'encyclopedia' && <EncyclopediaScreen onBack={() => go('portal')} />}

        {tab === 'game' && <PuzzleScreen onBack={() => go('portal')} />}

        {tab === 'profile' && (
          <ProfileScreen
            onOpenMural={(id) => go('zoom', { muralId: id })}
            onOpenTab={(next) => go(next as Tab)}
          />
        )}
      </main>

      {/* bottom navigation (mobile-first) */}
      {!immersive && (
        <nav
          className="relative z-30 shrink-0 border-t border-gold-600/25 bg-ink-900/95 backdrop-blur-xl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          aria-label="主导航"
        >
          <div className="mx-auto flex max-w-xl items-stretch">
            {tabs.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    tapFeedback();
                    go(item.id);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                    active ? 'text-gold-200' : 'text-sand-500'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
                  )}
                  <span className={active ? 'drop-shadow-[0_0_8px_rgba(229,184,105,0.6)]' : ''}>
                    {item.icon}
                  </span>
                  <span className="text-[10px] leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* desktop-only helper: the same shortcuts as a hint strip */}
      <div className="pointer-events-none fixed bottom-2 right-3 z-40 hidden items-center gap-1 rounded-full border border-gold-600/25 bg-ink-900/70 px-2 py-1 text-[9.5px] text-sand-500 backdrop-blur md:flex">
        <Info className="h-2.5 w-2.5" />
        <span>拖动环视 · 滚轮缩放 · 点亮点听讲解</span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
