// Debug the zoomed painting issue: synthetic pointer events + console capture.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9338;
const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const profile = 'D:\\wangzhan\\.chrome-wsd';
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
const events = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  } else if (m.method) events.push(m);
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
await send('Log.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

await send('Page.navigate', { url: `${BASE}/#/workshop` });
await sleep(6500);

const ink = `(() => { const c = [...document.querySelectorAll('canvas')].pop(); const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height); let n = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > 8) n++; return n; })()`;

console.log('ink baseline:', await evaluate(ink));

// synthetic pointer stroke via dispatched PointerEvents (bypasses CDP touch)
const strokeResult = await evaluate(`(async () => {
  const c = [...document.querySelectorAll('canvas')].pop();
  const r = c.getBoundingClientRect();
  const mk = (type, x, y) => new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, pressure: 0.5 });
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  c.dispatchEvent(mk('pointerdown', cx, cy));
  for (let i = 1; i <= 8; i++) c.dispatchEvent(mk('pointermove', cx + i * 8, cy));
  c.dispatchEvent(mk('pointerup', cx + 64, cy));
  await new Promise(res => setTimeout(res, 300));
  return 'done';
})()`);
console.log('stroke:', strokeResult);
console.log('ink after stroke:', await evaluate(ink));

const fillResult = await evaluate(`(async () => {
  const btn = [...document.querySelectorAll('button')].find(x => (x.title || '') === '填色');
  if (!btn) return 'no-fill-btn';
  btn.click();
  await new Promise(res => setTimeout(res, 200));
  const c = [...document.querySelectorAll('canvas')].pop();
  const r = c.getBoundingClientRect();
  const mk = (type, x, y) => new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 8, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, pressure: 0.5 });
  c.dispatchEvent(mk('pointerdown', r.left + r.width * 0.5, r.top + r.height * 0.35));
  c.dispatchEvent(mk('pointerup', r.left + r.width * 0.5, r.top + r.height * 0.35));
  await new Promise(res => setTimeout(res, 800));
  return 'done';
})()`);
console.log('fill:', fillResult);
console.log('ink after fill:', await evaluate(ink));

// console errors so far
for (const ev of events) {
  if (ev.method === 'Runtime.exceptionThrown') {
    console.log('EXCEPTION:', ev.params.exceptionDetails?.exception?.description ?? ev.params.exceptionDetails?.text);
  }
  if (ev.method === 'Log.entryAdded' && ev.params.entry.level === 'error') {
    console.log('LOG ERR:', ev.params.entry.text);
  }
  if (ev.method === 'Runtime.consoleAPICalled' && ev.params.type === 'error') {
    console.log('CONSOLE ERR:', ev.params.args?.map((a) => a.value ?? a.description).join(' '));
  }
}

ws.close();
chrome.kill();
