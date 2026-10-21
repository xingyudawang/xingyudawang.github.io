import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadJSON, saveJSON } from '../lib/hooks';

export type Language = 'zh' | 'en' | 'ja' | 'fr';
export type ThemeMode = 'candle' | 'daylight' | 'starry';

export interface SavedArtwork {
  id: string;
  title: string;
  /** data URL; kept small (≤ 900px) so localStorage never overflows */
  dataUrl: string;
  date: string;
  templateId: string;
}

export interface UserProfile {
  name: string;
  title: string;
  avatar: string;
  favorites: string[];
  stamps: string[];
  artworks: SavedArtwork[];
  notes: Record<string, string>;
}

const DEFAULT_USER: UserProfile = {
  name: '敦煌行者 · 乐音',
  title: '莫高窟数字化特约守护人',
  avatar: 'seal-emblem.webp',
  favorites: ['mural-deer', 'mural-pipa', 'mural-threehares'],
  stamps: ['stamp-wei', 'stamp-tang', 'stamp-sui'],
  artworks: [],
  notes: {
    'mural-deer': '北魏的凹凸晕染与连环叙事极其前卫，神鹿昂首无惧的眼神震颤人心。',
  },
};

const UI_STRINGS: Record<string, Record<Language, string>> = {
  appName: { zh: '莫高幻境', en: 'Mogao Mirage', ja: '莫高幻境', fr: 'Mirage de Mogao' },
  appSubtitle: {
    zh: '敦煌壁画数字漫游',
    en: 'Dunhuang Murals Digital Tour',
    ja: '敦煌壁画デジタル回遊',
    fr: 'Visite numérique des fresques',
  },
  navHome: { zh: '展厅', en: 'Hall', ja: '展示室', fr: 'Salle' },
  navVR: { zh: '洞窟', en: 'Caves', ja: '洞窟', fr: 'Grottes' },
  navGallery: { zh: '鉴赏', en: 'Gallery', ja: '鑑賞', fr: 'Galerie' },
  navWorkshop: { zh: '绘制', en: 'Paint', ja: '描画', fr: 'Peindre' },
  navGuide: { zh: '导览', en: 'Guide', ja: '案内', fr: 'Guide' },
  navEncyclopedia: { zh: '百科', en: 'Learn', ja: '百科', fr: 'Savoir' },
  navGame: { zh: '拼图', en: 'Puzzle', ja: 'パズル', fr: 'Puzzle' },
  navProfile: { zh: '图鉴', en: 'Passport', ja: '図鑑', fr: 'Passeport' },
  exploreNow: {
    zh: '开启沉浸漫游',
    en: 'Enter the Caves',
    ja: '洞窟の旅へ',
    fr: 'Entrer dans les Grottes',
  },
};

interface AppContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  user: UserProfile;
  toggleFavorite: (muralId: string) => void;
  isFavorite: (muralId: string) => boolean;
  saveArtwork: (art: Omit<SavedArtwork, 'id' | 'date'>) => void;
  removeArtwork: (id: string) => void;
  saveNote: (muralId: string, note: string) => void;
  isOffline: boolean;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => loadJSON<Language>('dh_lang', 'zh'));
  const [theme, setTheme] = useState<ThemeMode>(() => loadJSON<ThemeMode>('dh_theme', 'candle'));
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = loadJSON<UserProfile | null>('dh_user', null);
    // merge so new fields appear for returning visitors
    return saved ? { ...DEFAULT_USER, ...saved } : DEFAULT_USER;
  });
  const [isOffline, setIsOffline] = useState(
    typeof navigator === 'undefined' ? false : !navigator.onLine
  );

  useEffect(() => {
    saveJSON('dh_lang', language);
  }, [language]);
  useEffect(() => {
    saveJSON('dh_theme', theme);
  }, [theme]);

  // artwork data URLs are big: if the quota blows up, drop the oldest pieces
  useEffect(() => {
    if (!saveJSON('dh_user', user)) {
      setUser((prev) => ({ ...prev, artworks: prev.artworks.slice(0, 3) }));
    }
  }, [user]);

  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const toggleFavorite = useCallback((muralId: string) => {
    setUser((prev) => {
      const exists = prev.favorites.includes(muralId);
      return {
        ...prev,
        favorites: exists
          ? prev.favorites.filter((id) => id !== muralId)
          : [...prev.favorites, muralId],
      };
    });
  }, []);

  const isFavorite = useCallback(
    (muralId: string) => user.favorites.includes(muralId),
    [user.favorites]
  );

  const saveArtwork = useCallback((art: Omit<SavedArtwork, 'id' | 'date'>) => {
    setUser((prev) => ({
      ...prev,
      artworks: [
        {
          ...art,
          id: `art-${Date.now()}`,
          date: new Date().toLocaleDateString('zh-CN'),
        },
        ...prev.artworks,
      ].slice(0, 12),
    }));
  }, []);

  const removeArtwork = useCallback((id: string) => {
    setUser((prev) => ({ ...prev, artworks: prev.artworks.filter((a) => a.id !== id) }));
  }, []);

  const saveNote = useCallback((muralId: string, note: string) => {
    setUser((prev) => ({ ...prev, notes: { ...prev.notes, [muralId]: note } }));
  }, []);

  const t = useCallback(
    (key: string) => UI_STRINGS[key]?.[language] ?? UI_STRINGS[key]?.zh ?? key,
    [language]
  );

  const value = useMemo<AppContextType>(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      user,
      toggleFavorite,
      isFavorite,
      saveArtwork,
      removeArtwork,
      saveNote,
      isOffline,
      t,
    }),
    [
      language,
      theme,
      user,
      toggleFavorite,
      isFavorite,
      saveArtwork,
      removeArtwork,
      saveNote,
      isOffline,
      t,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
