import React from 'react';
import { media } from '../lib/media';
import type { Lang } from '../data/caveScenes';

/**
 * The site has exactly one digital-human guide.
 *
 * Her portrait is not an illustration: it is cropped from the Avalokitesvara on
 * the south wall of Cave 57 — the cave nicknamed 美人窟 ("Cave of Beauties")
 * precisely for this face. One persona, one portrait, used everywhere narration
 * speaks, so there is never a second "virtual presenter" competing for attention.
 */
export const GUIDE = {
  name: { zh: '妙音', en: 'Miaoyin' } as Record<string, string>,
  role: { zh: '数字讲解人 · 敦煌', en: 'Digital guide · Dunhuang' } as Record<string, string>,
  avatar: 'guide-avatar.webp',
};

export const guideName = (lang: Lang) =>
  (lang === 'en' ? GUIDE.name.en : GUIDE.name.zh) as string;
export const guideRole = (lang: Lang) =>
  (lang === 'en' ? GUIDE.role.en : GUIDE.role.zh) as string;
export const guideAvatar = () => media(GUIDE.avatar);

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
