// Interaction tests at the browser level: real touch events into the 360 viewer
// and the drawing canvas. These are the two features the original build got
// wrong, so they get measured rather than assumed.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import sharp from 'sharp';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9335;
const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const profile = 'D:\\wangzhan\\.chrome-touch';
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--mute-audio',
  '--hide-scrollbars',
  '--window-size=400,820',
  'about:blank',
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
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description ?? ''));
  return r.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 390, height: 800, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: 'portraitPrimary', angle: 0 },
});
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

async function shot() {
  const s = await send('Page.captureScreenshot', { format: 'png' });
  return Buffer.from(s.data, 'base64');
}

async function meanAbsDiff(a, b) {
  const A = await sharp(a).greyscale().resize(200, 410).raw().toBuffer();
  const B = await sharp(b).greyscale().resize(200, 410).raw().toBuffer();
  let sum = 0;
  for (let i = 0; i < A.length; i++) sum += Math.abs(A[i] - B[i]);
  return sum / A.length;
}

async function swipe(from, to, steps = 12) {
  await send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: from.x, y: from.y, id: 1 }],
  });
  for (let i = 1; i <= steps; i++) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] });
    await sleep(16);
  }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

const results = [];

/* ---------------- 1. 360° panorama: horizontal swipe rotates the view ------- */
await send('Page.navigate', { url: `${BASE}/#/vr?cave=cave-257` });
await sleep(5000);
const panoBefore = await shot();
await swipe({ x: 90, y: 430 }, { x: 320, y: 430 });
await sleep(1200);
const panoAfter = await shot();
const panoDiff = await meanAbsDiff(panoBefore, panoAfter);
fs.writeFileSync('D:\\wangzhan\\shots\\pano-before.png', panoBefore);
fs.writeFileSync('D:\\wangzhan\\shots\\pano-after.png', panoAfter);
results.push(['360° 触摸拖动旋转', panoDiff > 6 ? 'PASS' : 'FAIL', `frame diff ${panoDiff.toFixed(2)}`]);

/* ---------------- 2. 360° panorama: vertical swipe looks to the ceiling ---- */
const beforeUp = await shot();
await swipe({ x: 200, y: 250 }, { x: 200, y: 600 });
await sleep(1100);
const afterUp = await shot();
const upDiff = await meanAbsDiff(beforeUp, afterUp);
results.push(['360° 上下俯仰', upDiff > 5 ? 'PASS' : 'FAIL', `frame diff ${upDiff.toFixed(2)}`]);

/* ---------------- 3. pinch zoom changes the field of view ----------------- */
const beforePinch = await shot();
await send('Input.dispatchTouchEvent', {
  type: 'touchStart',
  touchPoints: [{ x: 150, y: 400, id: 1 }, { x: 250, y: 400, id: 2 }],
});
for (let i = 1; i <= 10; i++) {
  await send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: 150 - i * 6, y: 400, id: 1 }, { x: 250 + i * 6, y: 400, id: 2 }],
  });
  await sleep(20);
}
await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await sleep(1100);
const afterPinch = await shot();
const pinchDiff = await meanAbsDiff(beforePinch, afterPinch);
results.push(['360° 双指缩放', pinchDiff > 4 ? 'PASS' : 'FAIL', `frame diff ${pinchDiff.toFixed(2)}`]);

/* ---------------- 4. drawing: a touch stroke marks the paint layer -------- */
await send('Page.navigate', { url: `${BASE}/#/workshop` });
await sleep(3800);

const canvasBox = await evaluate(`(() => {
  const cs = [...document.querySelectorAll('canvas')];
  const c = cs[cs.length - 1];
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height, count: cs.length };
})()`);

if (!canvasBox) {
  results.push(['画布定位', 'FAIL', 'no canvas found']);
} else {
  const cx = canvasBox.x + canvasBox.w * 0.5;
  const cy = canvasBox.y + canvasBox.h * 0.5;
  await swipe({ x: cx - canvasBox.w * 0.25, y: cy }, { x: cx + canvasBox.w * 0.25, y: cy + 40 }, 16);
  await sleep(600);
}

/* ---------------- 5. undo removes the stroke ------------------------------ */
await sleep(600);
const inkPainted = await evaluate(`(() => {
  const cs = [...document.querySelectorAll('canvas')];
  const c = cs[cs.length - 1];
  if (!c) return -1;
  const ctx = c.getContext('2d');
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  let n = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 8) n++;
  return n;
})()`);
results.push(['彩绘工坊 · 触摸绘制', inkPainted > 500 ? 'PASS' : 'FAIL', `painted px ${inkPainted}`]);

const undoClicked = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.title || '') === '撤销');
  if (!btn) return 'no-button';
  btn.click();
  return 'clicked';
})()`);
await sleep(700);
const inkAfterUndo = await evaluate(`(() => {
  const cs = [...document.querySelectorAll('canvas')];
  const c = cs[cs.length - 1];
  const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height);
  let n = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 8) n++;
  return n;
})()`);
results.push([
  '彩绘工坊 · 撤销',
  inkAfterUndo < inkPainted ? 'PASS' : 'FAIL',
  `undo=${undoClicked} px ${inkPainted} -> ${inkAfterUndo}`,
]);

/* ---------------- 6. flood fill paints a region --------------------------- */
const fillResult = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.title || '') === '填色');
  if (!btn) return 'no-button';
  btn.click();
  return 'clicked';
})()`);
await sleep(400);
if (fillResult === 'clicked' && canvasBox) {
  await send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: canvasBox.x + canvasBox.w * 0.30, y: canvasBox.y + canvasBox.h * 0.35, id: 1 }],
  });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(1200);
  const inkFilled = await evaluate(`(() => {
    const cs = [...document.querySelectorAll('canvas')];
    const c = cs[cs.length - 1];
    const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height);
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 8) n++;
    return n;
  })()`);
  results.push(['彩绘工坊 · 区域填色', inkFilled > 2000 ? 'PASS' : 'FAIL', `painted px ${inkFilled}`]);
} else {
  results.push(['彩绘工坊 · 区域填色', 'SKIP', fillResult]);
}

console.log('');
for (const [name, verdict, detail] of results) {
  console.log(`${verdict === 'PASS' ? '✓' : verdict === 'SKIP' ? '–' : '✗'} ${name.padEnd(22)} ${verdict.padEnd(5)} ${detail}`);
}
fs.writeFileSync('D:\\wangzhan\\touch-report.txt', results.map((r) => r.join('\t')).join('\n'), 'utf8');

ws.close();
chrome.kill();
