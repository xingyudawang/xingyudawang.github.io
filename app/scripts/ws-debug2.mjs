// Trace which pointer events actually reach the paint canvas during a touch
// stroke, with and without zoom.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9344;
const profile = 'D:\\wangzhan\\.chrome-wse';
fs.rmSync(profile, { recursive: true, force: true });
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--mute-audio', '--hide-scrollbars', '--window-size=420,900', 'about:blank',
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
const touch = async (events) => { for (const ev of events) await send('Input.dispatchTouchEvent', ev); };

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

await send('Page.navigate', { url: 'http://127.0.0.1:4173/#/workshop' });
await sleep(8000);

// instrument the paint canvas
await evaluate(`(() => {
  const c = [...document.querySelectorAll('canvas')].pop();
  window.__ev = { down: 0, move: 0, up: 0 };
  c.addEventListener('pointerdown', () => window.__ev.down++);
  c.addEventListener('pointermove', () => window.__ev.move++);
  c.addEventListener('pointerup', () => window.__ev.up++);
  const r = c.getBoundingClientRect();
  window.__box = { x: r.x, y: r.y, w: r.width, h: r.height };
  return 'ok';
})()`);

const box = await evaluate(`window.__box`);
console.log('box:', box);

// stroke at 100% first
let cx = box.x + box.w * 0.5, cy = box.y + box.h * 0.5;
await touch([{ type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] }]);
for (let i = 1; i <= 6; i++) await touch([{ type: 'touchMove', touchPoints: [{ x: cx + i * 10, y: cy, id: 1 }] }]);
await touch([{ type: 'touchEnd', touchPoints: [] }]);
await sleep(500);
console.log('events @100%:', await evaluate(`JSON.stringify(window.__ev)`));
const inkExpr = `(() => { const c = [...document.querySelectorAll('canvas')].pop(); const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height); let n = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > 8) n++; return n; })()`;
console.log('ink @100%:', await evaluate(inkExpr));

// pinch zoom, then stroke again
await touch([{ type: 'touchStart', touchPoints: [{ x: box.x + box.w * 0.4, y: box.y + box.h * 0.4, id: 1 }, { x: box.x + box.w * 0.6, y: box.y + box.h * 0.4, id: 2 }] }]);
for (let i = 1; i <= 8; i++) {
  await touch([{ type: 'touchMove', touchPoints: [
    { x: box.x + box.w * (0.4 - i * 0.03), y: box.y + box.h * 0.4, id: 1 },
    { x: box.x + box.w * (0.6 + i * 0.03), y: box.y + box.h * 0.4, id: 2 },
  ] }]);
  await sleep(20);
}
await touch([{ type: 'touchEnd', touchPoints: [] }]);
await sleep(700);
const box2 = await evaluate(`(() => { const c = [...document.querySelectorAll('canvas')].pop(); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
console.log('zoomed box:', box2);
await evaluate(`window.__ev = { down: 0, move: 0, up: 0 };`);

cx = box2.x + box2.w * 0.5; cy = box2.y + box2.h * 0.5;
await touch([{ type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] }]);
for (let i = 1; i <= 6; i++) await touch([{ type: 'touchMove', touchPoints: [{ x: cx + i * 10, y: cy, id: 1 }] }]);
await touch([{ type: 'touchEnd', touchPoints: [] }]);
await sleep(500);
console.log('events @zoom:', await evaluate(`JSON.stringify(window.__ev)`));
console.log('ink @zoom:', await evaluate(inkExpr));

ws.close();
chrome.kill();
