import React from 'react';
import { media } from '../lib/media';
import type { Lang } from '../data/caveScenes';

/**
 * The site's single digital-human guide — the Nine-Colored Deer.
 *
 * The portrait is cropped from the real Deer King Jātaka on the west wall of
 * Cave 257, the same authentic scan the rest of the site is built from. One
 * persona, one portrait, used everywhere narration speaks.
 */
export const GUIDE = {
  name: { zh: '九色鹿', en: 'Nine-Colored Deer' } as Record<string, string>,
  role: { zh: '敦煌数字讲解员', en: 'Digital guide of Dunhuang' } as Record<string, string>,
  avatar: 'guide-deer-avatar.webp',
  card: 'guide-deer-card.webp',
};

export const guideName = (lang: Lang) =>
  (lang === 'en' ? GUIDE.name.en : GUIDE.name.zh) as string;
export const guideRole = (lang: Lang) =>
  (lang === 'en' ? GUIDE.role.en : GUIDE.role.zh) as string;
export const guideAvatar = () => media(GUIDE.avatar);
export const guideCard = () => media(GUIDE.card);

interface Props {
  lang: Lang;
  /** shows the travelling pulse ring while speech is playing */
  speaking?: boolean;
  size?: number;
  className?: string;
}

/** Circular portrait with a gilded ring and an optional "speaking" halo. */
export const GuideAvatar: React.FC<Props> = ({ speaking = false, size = 40, className = '' }) => (
  <span
    className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    {speaking && (
      <span
        className="absolute inset-0 animate-ping rounded-full border border-gold-300/60"
        style={{ animationDuration: '1.8s' }}
      />
    )}
    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-200 via-gold-400 to-gold-600 opacity-90" />
    <img
      src={guideAvatar()}
      alt=""
      className="relative rounded-full border border-ink-900/60 object-cover"
      style={{ width: size - 4, height: size - 4 }}
      loading="lazy"
    />
  </span>
);

/** Name + role line, used under the narration card title. */
export const GuideLine: React.FC<{ lang: Lang; speaking?: boolean }> = ({ lang, speaking }) => (
  <span className="flex items-center gap-1 text-[10px] text-gold-400/90">
    <span className="font-bold text-gold-300">{guideName(lang)}</span>
    <span className="text-sand-500">·</span>
    <span>{guideRole(lang)}</span>
    {speaking && <span className="ml-1 text-gold-300">◉ 讲解中</span>}
  </span>
);
