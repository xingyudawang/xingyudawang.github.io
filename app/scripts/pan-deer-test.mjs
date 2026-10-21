// Check whether a zoomed mural can be dragged all the way to its bottom edge,
// and where the bright deer blob actually sits in the 257 scan.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import sharp from 'sharp';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9353;
const profile = 'D:\\wangzhan\\.chrome-pan';
fs.rmSync(profile, { recursive: true, force: true });
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--mute-audio', '--window-size=420,900', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find((t) => t.type === 'page');
      if (p?.webSocketDebuggerUrl) return p;
    } catch { /* not ready */ }
    await sleep(300);
  }
  throw new Error('devtools unavailable');
}

const target = await waitTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

await send('Page.navigate', { url: 'http://127.0.0.1:4173/' });
await sleep(2500);
await send('Page.navigate', { url: 'http://127.0.0.1:4173/#/zoom?mural=mural-deer' });
// wait for the full image to load (the one without blur class)
for (let i = 0; i < 14; i++) {
  const ready = await evaluate(`!!document.querySelector('main .relative.min-h-0.flex-1 img[class*="opacity-0"]')`);
  if (ready) break;
  await sleep(800);
}
await sleep(2500);

const geo1 = await evaluate(`(() => {
  const img = [...document.querySelectorAll('main .relative.min-h-0.flex-1 img')].find(i => i.className.includes('opacity-0'));
  const stage = document.querySelector('main .relative.min-h-0.flex-1');
  if (!img || !stage) return null;
  const r = img.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  const cs = getComputedStyle(img);
  return { img: { x: r.x, y: r.y, w: r.width, h: r.height }, stage: { x: s.x, y: s.y, w: s.width, h: s.height }, tr: cs.transform };
})()`);
console.log('fit geometry:', JSON.stringify(geo1));

// double-tap to zoom (3x) at the centre of the image
const cx = geo1.img.x + geo1.img.w / 2;
const cy = geo1.img.y + geo1.img.h / 2;
for (let n = 0; n < 2; n++) {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(120);
}
await sleep(800);

const geo2 = await evaluate(`(() => {
  const img = [...document.querySelectorAll('main .relative.min-h-0.flex-1 img')].find(i => i.className.includes('opacity-0'));
  const stage = document.querySelector('main .relative.min-h-0.flex-1');
  const r = img.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  return { img: { x: r.x, y: r.y, w: r.width, h: r.height }, stage: { x: s.x, y: s.y, w: s.width, h: s.height }, tr: getComputedStyle(img).transform };
})()`);
console.log('zoomed geometry:', JSON.stringify(geo2));

// drag UP hard (to try to reach the bottom of the painting)
for (let i = 1; i <= 14; i++) {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 210, y: 400, id: 1 }] });
  for (let j = 1; j <= 6; j++) {
    await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 210, y: 400 - j * 8, id: 1 }] });
    await sleep(16);
  }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(60);
}
await sleep(700);

const geo3 = await evaluate(`(() => {
  const img = [...document.querySelectorAll('main .relative.min-h-0.flex-1 img')].find(i => i.className.includes('opacity-0'));
  const stage = document.querySelector('main .relative.min-h-0.flex-1');
  const r = img.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  return { img: { x: r.x, y: r.y, w: r.width, h: r.height }, stage: { x: s.x, y: s.y, w: s.width, h: s.height } };
})()`);
console.log('after drag-up:', JSON.stringify(geo3));

const reachableBottom = Math.abs(geo3.img.y + geo3.img.h - (geo3.stage.y + geo3.stage.h)) < 6;
console.log('bottom reachable:', reachableBottom);

ws.close();
chrome.kill();

/* ---------- bright-blob analysis of the 257 mural (where the deer is) ---- */
const { data, info } = await sharp('../media/mural-cave-257.webp', { limitInputPixels: false })
  .resize({ width: 1200 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const bright = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  bright[i] = r > 150 && g > 140 && b > 110 ? 1 : 0; // whitish
}
// find blobs in the lower 55% of the image
const seen = new Uint8Array(w * h);
const blobs = [];
for (let y0 = Math.floor(h * 0.45); y0 < h; y0++) {
  for (let x0 = 0; x0 < w; x0++) {
    const idx = y0 * w + x0;
    if (!bright[idx] || seen[idx]) continue;
    // BFS
    const stack = [idx];
    seen[idx] = 1;
    let size = 0, minX = w, maxX = 0, minY = h, maxY = 0;
    while (stack.length) {
      const p = stack.pop();
      const x = p % w, y = (p / w) | 0;
      size++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (x > 0 && bright[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; stack.push(p - 1); }
      if (x + 1 < w && bright[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; stack.push(p + 1); }
      if (y > 0 && bright[p - w] && !seen[p - w]) { seen[p - w] = 1; stack.push(p - w); }
      if (y + 1 < h && bright[p + w] && !seen[p + w]) { seen[p + w] = 1; stack.push(p + w); }
    }
    if (size > 300) blobs.push({ size, cx: ((minX + maxX) / 2 / w) * 100, cy: ((minY + maxY) / 2 / h) * 100, wPct: ((maxX - minX) / w) * 100, hPct: ((maxY - minY) / h) * 100 });
  }
}
blobs.sort((a, b) => b.size - a.size);
console.log('bright blobs (lower band):', JSON.stringify(blobs.slice(0, 8)));
