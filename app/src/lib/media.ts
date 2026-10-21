/** Resolve a bundled media file (lives in /public/media) with the deploy base path. */
export function media(name: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/media/${name}`;
}

/** Preload an image and resolve when it is decoded (never rejects). */
export function preloadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
