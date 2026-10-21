// Verify the encyclopedia lightbox opens and zooms.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9351;
const profile = 'D:\\wangzhan\\.chrome-ency';
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
await send('Page.navigate', { url: 'http://127.0.0.1:4173/#/encyclopedia' });
await sleep(5000);

// click the first entry's zoom button
const opened = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '') === '放大观察');
  if (!btn) return 'no-button';
  btn.click();
  return 'clicked';
})()`);
await sleep(1500);
const state = await evaluate(`JSON.stringify({
  lightbox: !!document.querySelector('img[src*="wall-cave-420-n"]') || !!document.querySelector('.fixed.inset-0 img'),
  caption: document.body.innerText.includes('真实壁画扫描'),
  zoomLabel: (document.body.innerText.match(/([\d.]+)×/) || [])[0] ?? null
})`);
console.log('opened:', opened);
console.log('state:', state);

// double-tap zoom via two quick taps
const box = await evaluate(`(() => { const img = document.querySelector('.fixed.inset-0 img'); if (!img) return null; const r = img.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
if (box) {
  for (let n = 0; n < 2; n++) {
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x, y: box.y, id: 1 }] });
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(120);
  }
  await sleep(800);
  const zoomed = await evaluate(`(document.body.innerText.match(/([\d.]+)×/) || [])[0]`);
  console.log('zoom after double-tap:', zoomed);
}

ws.close();
chrome.kill();
