import { getStroke } from 'perfect-freehand';

export type PaintTool = 'brush' | 'eraser' | 'fill' | 'seal';

export type PaintPoint = [number, number, number]; // x, y, pressure

export type Action =
  | { kind: 'stroke'; points: PaintPoint[]; color: string; size: number; erase: boolean }
  | { kind: 'fill'; x: number; y: number; color: string }
  | { kind: 'seal'; x: number; y: number; text: string }
  | { kind: 'clear' };

/** Turn a perfect-freehand outline into a Path2D we can fill. */
function outlineToPath(points: PaintPoint[], size: number): Path2D {
  const outline = getStroke(points, {
    size,
    thinning: 0.55,
    smoothing: 0.62,
    streamline: 0.5,
    simulatePressure: false,
    last: true,
  });
  const path = new Path2D();
  if (!outline.length) return path;
  path.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) {
    const [x0, y0] = outline[i - 1];
    const [x1, y1] = outline[i];
    // quadratic through midpoints keeps the silhouette smooth at any zoom
    path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  path.closePath();
  return path;
}

function strokeOnto(
  ctx: CanvasRenderingContext2D,
  points: PaintPoint[],
  size: number,
  color: string,
  erase: boolean
) {
  if (!points.length) return;
  ctx.save();
  ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
  ctx.fillStyle = color;
  if (points.length === 1) {
    // a tap should leave a dot, not nothing
    const [x, y, p] = points[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.6, (size * (0.35 + p * 0.65)) / 2), 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fill(outlineToPath(points, size));
  }
  ctx.restore();
}

/**
 * Flood fill that respects the line art *underneath* the paint layer.
 *
 * The original project had a `fill` option in its state but never implemented
 * it. Filling on a transparent overlay alone is meaningless, so we sample the
 * composite of line-art + paint, grow a mask from the tap point, and then paint
 * that mask onto the overlay. This is what makes "点击填色" actually work.
 */
function floodFillComposite(
  composite: ImageData,
  startX: number,
  startY: number,
  tolerance: number
): { mask: HTMLCanvasElement; w: number; h: number } | null {
  const { width: w, height: h, data } = composite;
  if (startX < 0 || startY < 0 || startX >= w || startY >= h) return null;

  const idx0 = (startY * w + startX) * 4;
  const r0 = data[idx0];
  const g0 = data[idx0 + 1];
  const b0 = data[idx0 + 2];
  const a0 = data[idx0 + 3];

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext('2d')!;
  const maskImg = maskCtx.createImageData(w, h);
  const mdata = maskImg.data;

  const tol = tolerance * tolerance * 3;
  const stack: number[] = [startX, startY];
  const seen = new Uint8Array(w * h);

  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const flat = y * w + x;
    if (seen[flat]) continue;
    seen[flat] = 1;

    const i = flat * 4;
    const dr = data[i] - r0;
    const dg = data[i + 1] - g0;
    const db = data[i + 2] - b0;
    const da = data[i + 3] - a0;
    if (dr * dr + dg * dg + db * db + da * da > tol) continue;

    mdata[i] = 255;
    mdata[i + 1] = 255;
    mdata[i + 2] = 255;
    mdata[i + 3] = 255;

    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  maskCtx.putImageData(maskImg, 0, 0);
  return { mask: maskCanvas, w, h };
}

export class PaintEngine {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private baseImage: HTMLImageElement | null = null;

  private actions: Action[] = [];
  private redoStack: Action[] = [];
  private livePoints: PaintPoint[] = [];
  private liveColor = '#c1382b';
  private liveSize = 10;
  private liveErase = false;

  /** Off-screen buffer used for flood-fill sampling (downscaled for speed). */
  private sample = document.createElement('canvas');
  private sampleCtx: CanvasRenderingContext2D;

  onChange: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.sampleCtx = this.sample.getContext('2d', { willReadFrequently: true })!;
  }

  setBaseImage(img: HTMLImageElement | null) {
    this.baseImage = img;
    this.render();
  }

  get canUndo() {
    return this.actions.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }

  /* ---------------- live strokes ---------------- */

  beginStroke(x: number, y: number, pressure: number, color: string, size: number, erase: boolean) {
    this.livePoints = [[x, y, pressure]];
    this.liveColor = color;
    this.liveSize = size;
    this.liveErase = erase;
    this.paintLiveSegment();
  }

  extendStroke(x: number, y: number, pressure: number) {
    if (!this.livePoints.length) return;
    const [lx, ly] = this.livePoints[this.livePoints.length - 1];
    // skip micro-movements; they only add noise and cost
    if (Math.abs(x - lx) < 0.6 && Math.abs(y - ly) < 0.6) return;
    this.livePoints.push([x, y, pressure]);
    this.paintLiveSegment();
  }

  /** Repaint the current stroke (cheap: strokes stay small while drawing). */
  private paintLiveSegment() {
    strokeOnto(this.ctx, this.livePoints, this.liveSize, this.liveColor, this.liveErase);
  }

  endStroke() {
    if (this.livePoints.length) {
      this.actions.push({
        kind: 'stroke',
        points: this.livePoints.map((p) => [...p] as PaintPoint),
        color: this.liveColor,
        size: this.liveSize,
        erase: this.liveErase,
      });
      this.redoStack = [];
      this.onChange?.();
    }
    this.livePoints = [];
  }

  cancelStroke() {
    if (this.livePoints.length) {
      this.livePoints = [];
      this.render();
    }
  }

  /* ---------------- discrete actions ---------------- */

  fill(x: number, y: number, color: string) {
    const action: Action = { kind: 'fill', x, y, color };
    this.actions.push(action);
    this.redoStack = [];
    this.replayOne(action);
    this.onChange?.();
  }

  seal(x: number, y: number, text: string) {
    const action: Action = { kind: 'seal', x, y, text };
    this.actions.push(action);
    this.redoStack = [];
    this.replayOne(action);
    this.onChange?.();
  }

  clear() {
    this.actions.push({ kind: 'clear' });
    this.redoStack = [];
    this.render();
    this.onChange?.();
  }

  undo() {
    const last = this.actions.pop();
    if (!last) return;
    this.redoStack.push(last);
    this.render();
    this.onChange?.();
  }

  redo() {
    const next = this.redoStack.pop();
    if (!next) return;
    this.actions.push(next);
    this.render();
    this.onChange?.();
  }

  /* ---------------- rendering ---------------- */

  render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    for (const action of this.actions) this.replayOne(action);
  }

  private replayOne(action: Action) {
    const { width, height } = this.canvas;
    switch (action.kind) {
      case 'stroke':
        strokeOnto(this.ctx, action.points, action.size, action.color, action.erase);
        break;
      case 'fill':
        this.applyFill(action.x, action.y, action.color);
        break;
      case 'seal':
        drawSeal(this.ctx, action.x, action.y, action.text, height);
        break;
      case 'clear':
        this.ctx.clearRect(0, 0, width, height);
        break;
    }
  }

  private applyFill(x: number, y: number, color: string) {
    const { width, height } = this.canvas;
    // sample at a reduced resolution — flood fill cost is quadratic in pixels
    const scale = Math.min(1, 720 / Math.max(width, height));
    const sw = Math.max(1, Math.round(width * scale));
    const sh = Math.max(1, Math.round(height * scale));
    this.sample.width = sw;
    this.sample.height = sh;

    this.sampleCtx.clearRect(0, 0, sw, sh);
    this.sampleCtx.fillStyle = '#ffffff';
    this.sampleCtx.fillRect(0, 0, sw, sh);
    if (this.baseImage) this.sampleCtx.drawImage(this.baseImage, 0, 0, sw, sh);
    this.sampleCtx.drawImage(this.canvas, 0, 0, sw, sh);

    const composite = this.sampleCtx.getImageData(0, 0, sw, sh);
    const result = floodFillComposite(
      composite,
      Math.round(x * scale),
      Math.round(y * scale),
      48
    );
    if (!result) return;

    // Paint the mask (upscaled) onto the overlay with the chosen colour.
    const tint = document.createElement('canvas');
    tint.width = sw;
    tint.height = sh;
    const tctx = tint.getContext('2d')!;
    tctx.drawImage(result.mask, 0, 0);
    tctx.globalCompositeOperation = 'source-in';
    tctx.fillStyle = color;
    tctx.fillRect(0, 0, sw, sh);

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(tint, 0, 0, sw, sh, 0, 0, width, height);
    this.ctx.restore();
  }

  /* ---------------- export ---------------- */

  /** Composite line art + paint into a fresh canvas at the requested width. */
  compose(outWidth = 1400): HTMLCanvasElement {
    const { width, height } = this.canvas;
    const ratio = height / width;
    const out = document.createElement('canvas');
    out.width = outWidth;
    out.height = Math.round(outWidth * ratio);
    const ctx = out.getContext('2d')!;

    // paper
    ctx.fillStyle = '#efe3ce';
    ctx.fillRect(0, 0, out.width, out.height);
    if (this.baseImage) ctx.drawImage(this.baseImage, 0, 0, out.width, out.height);
    ctx.drawImage(this.canvas, 0, 0, out.width, out.height);
    return out;
  }

  exportPNG(outWidth = 1400): string {
    return this.compose(outWidth).toDataURL('image/png');
  }

  exportJPEG(outWidth = 1000, quality = 0.82): string {
    const c = this.compose(outWidth);
    const ctx = c.getContext('2d')!;
    // flatten onto paper so JPEG has no transparent fringes
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#efe3ce';
    ctx.fillRect(0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', quality);
  }

  isEmpty() {
    return this.actions.length === 0;
  }

  actionCount() {
    return this.actions.length;
  }
}

function drawSeal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  canvasHeight: number
) {
  const size = Math.max(34, Math.round(canvasHeight * 0.075));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((Math.random() - 0.5) * 0.08);

  ctx.globalAlpha = 0.88;
  ctx.strokeStyle = '#b23a2a';
  ctx.fillStyle = 'rgba(178,58,42,0.1)';
  ctx.lineWidth = Math.max(2, size * 0.075);
  ctx.lineJoin = 'round';
  const r = size * 0.1;
  ctx.beginPath();
  ctx.roundRect(-size / 2, -size / 2, size, size, r);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#b23a2a';
  ctx.font = `700 ${Math.round(size * 0.34)}px "Noto Serif SC", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = text.length > 2 ? [text.slice(0, 2), text.slice(2)] : [text];
  words.forEach((w, i) => {
    ctx.fillText(w, 0, (i - (words.length - 1) / 2) * size * 0.36);
  });
  ctx.restore();
}
