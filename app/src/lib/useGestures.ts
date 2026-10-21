import { useEffect, useRef } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface GestureHandlers {
  /** Single-pointer drag delta since the last frame. */
  onDrag?: (dx: number, dy: number, ev: PointerEvent) => void;
  /** Fired when the last pointer lifts, with approximate release velocity (px/ms). */
  onDragEnd?: (vx: number, vy: number) => void;
  /** Two-pointer pinch. `scale` is a multiplier relative to the gesture start (1 = unchanged). */
  onPinch?: (scale: number, center: Point) => void;
  onPinchEnd?: () => void;
  /** Wheel / trackpad scroll. Call preventDefault yourself if needed. */
  onWheel?: (deltaY: number, ev: WheelEvent) => void;
  /** Single tap without meaningful movement. */
  onTap?: (at: Point, ev: PointerEvent) => void;
  onDoubleTap?: (at: Point, ev: PointerEvent) => void;
  /** Continuous press-move reported alongside drag (for live read-outs). */
  onLongPress?: (at: Point) => void;
  enabled?: boolean;
}

interface Options {
  /** Disable native scrolling/zooming on the element. Defaults to true. */
  blockBrowserGestures?: boolean;
}

/**
 * Unified pointer-gesture engine.
 *
 * Written to replace the ad-hoc `onMouseDown/onMouseMove` handlers that made the
 * original project unusable on touch devices:
 *  - pointer events only (works for mouse, touch, and pen in one code path)
 *  - real pointer capture, so a fast swipe that leaves the element keeps tracking
 *  - `touch-action: none`, so iOS/Android never steal the gesture for page scroll
 *  - two-finger pinch and wheel zoom
 *  - tap vs. drag disambiguation by distance *and* time
 *  - velocity tracking for inertia
 */
export function useGestures<T extends HTMLElement>(
  handlers: GestureHandlers,
  { blockBrowserGestures = true }: Options = {}
) {
  const ref = useRef<T | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const pointers = new Map<number, Point>();
    let dragging = false;
    let lastMoveAt = 0;
    let last: Point = { x: 0, y: 0 };
    let startAt = 0;
    let start: Point = { x: 0, y: 0 };
    let moved = 0; // accumulated absolute movement
    let pinchStartDist = 0;
    let pinching = false;
    let lastTapAt = 0;
    let lastTapAtPoint: Point = { x: 0, y: 0 };
    let velX = 0;
    let velY = 0;
    let longPressTimer: ReturnType<typeof setTimeout> | undefined;

    if (blockBrowserGestures) {
      // The single most important line: tells the browser this surface owns the gesture.
      el.style.touchAction = 'none';
      el.style.webkitUserSelect = 'none';
      (el.style as CSSStyleDeclaration & { webkitTouchCallout?: string }).webkitTouchCallout =
        'none';
    }

    const localPoint = (ev: PointerEvent | WheelEvent): Point => {
      const r = el.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    };

    const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

    const clearLongPress = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = undefined;
      }
    };

    const onPointerDown = (ev: PointerEvent) => {
      if (handlersRef.current.enabled === false) return;
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;

      pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      // capture can throw for synthetic pointer ids or detached nodes
      try {
        el.setPointerCapture?.(ev.pointerId);
      } catch {
        /* noop */
      }

      if (pointers.size === 1) {
        dragging = true;
        last = { x: ev.clientX, y: ev.clientY };
        start = last;
        startAt = performance.now();
        lastMoveAt = startAt;
        moved = 0;
        velX = 0;
        velY = 0;
        clearLongPress();
        longPressTimer = setTimeout(() => {
          if (moved < 8 && pointers.size === 1) {
            handlersRef.current.onLongPress?.(localPoint(ev));
          }
        }, 550);
      } else if (pointers.size === 2) {
        clearLongPress();
        const [a, b] = [...pointers.values()];
        pinchStartDist = distance(a, b) || 1;
        pinching = true;
      }
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (handlersRef.current.enabled === false) return;
      if (!pointers.has(ev.pointerId)) return;
      pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });

      if (pinching && pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const dist = distance(a, b) || 1;
        const centerScreen = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const r = el.getBoundingClientRect();
        handlersRef.current.onPinch?.(dist / pinchStartDist, {
          x: centerScreen.x - r.left,
          y: centerScreen.y - r.top,
        });
        return;
      }

      if (!dragging) return;

      const now = performance.now();
      const dt = Math.max(now - lastMoveAt, 1);
      const dx = ev.clientX - last.x;
      const dy = ev.clientY - last.y;
      last = { x: ev.clientX, y: ev.clientY };
      lastMoveAt = now;

      moved += Math.hypot(dx, dy);
      if (moved > 8) clearLongPress();

      // exponential smoothing keeps flick velocities sane
      velX = velX * 0.6 + (dx / dt) * 0.4;
      velY = velY * 0.6 + (dy / dt) * 0.4;

      handlersRef.current.onDrag?.(dx, dy, ev);
    };

    const settle = (ev: PointerEvent) => {
      if (!pointers.has(ev.pointerId)) return;
      pointers.delete(ev.pointerId);
      el.releasePointerCapture?.(ev.pointerId);
      clearLongPress();

      if (pinching && pointers.size < 2) {
        pinching = false;
        handlersRef.current.onPinchEnd?.();
      }

      if (pointers.size > 0) return;

      const wasDragging = dragging;
      dragging = false;

      const duration = performance.now() - startAt;
      const isTap = moved < 10 && duration < 500;

      if (wasDragging && !isTap) {
        handlersRef.current.onDragEnd?.(velX, velY);
      }

      if (isTap) {
        const pt = localPoint(ev);
        const now = performance.now();
        const near = distance(pt, lastTapAtPoint) < 40;
        if (now - lastTapAt < 320 && near) {
          lastTapAt = 0;
          handlersRef.current.onDoubleTap?.(pt, ev);
        } else {
          lastTapAt = now;
          lastTapAtPoint = pt;
          handlersRef.current.onTap?.(pt, ev);
        }
      }
    };

    const onWheel = (ev: WheelEvent) => {
      if (handlersRef.current.enabled === false) return;
      if (!handlersRef.current.onWheel) return;
      ev.preventDefault();
      const scale = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? el.clientHeight : 1;
      handlersRef.current.onWheel(ev.deltaY * scale, ev);
    };

    const onContextMenu = (ev: Event) => {
      if (blockBrowserGestures) ev.preventDefault();
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', settle);
    el.addEventListener('pointercancel', settle);
    el.addEventListener('lostpointercapture', settle);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('contextmenu', onContextMenu);

    return () => {
      clearLongPress();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', settle);
      el.removeEventListener('pointercancel', settle);
      el.removeEventListener('lostpointercapture', settle);
      el.removeEventListener('wheel', onWheel as EventListener);
      el.removeEventListener('contextmenu', onContextMenu);
    };
  }, [blockBrowserGestures]);

  return ref;
}
