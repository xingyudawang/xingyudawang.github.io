import { useEffect, useState } from 'react';

export interface Viewport {
  width: number;
  height: number;
  /** true for phone-sized screens */
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** a real mouse / trackpad is present */
  hasFinePointer: boolean;
  /** device can report orientation events (gyroscope) */
  isTouch: boolean;
}

function read(): Viewport {
  const width = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const height = typeof window === 'undefined' ? 800 : window.innerHeight;
  const hasFinePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
  const isTouch =
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
  return {
    width,
    height,
    hasFinePointer,
    isTouch,
    isPhone: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
  };
}

/** Reactive viewport info. Debounced on resize so heavy scenes don't thrash. */
export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(read);

  useEffect(() => {
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      raf = 0;
      setVp(read());
    };

    const onResize = () => {
      if (raf) return;
      // debounce: mobile browsers fire resize constantly while the URL bar collapses
      clearTimeout(timer);
      timer = setTimeout(() => {
        raf = requestAnimationFrame(measure);
      }, 120);
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return vp;
}
