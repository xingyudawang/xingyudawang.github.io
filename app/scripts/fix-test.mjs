// Verify: mascot on portal, drag starting on a marker pans the image,
// and the marker-correction mode moves + persists positions.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9354;
const profile = 'D:\\wangzhan\\.chrome-fix';
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

const tapAt = (x, y, pid = 1) =>
  send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: pid }] });
const moveTo = (x, y, pid = 1) =>
  send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: pid }] });
const lift = () => send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

const results = [];
const record = (name, pass, detail) => {
  results.push([name, pass]);
  console.log(`${pass ? '✓' : '✗'} ${name.padEnd(30)} ${detail}`);
};

/* 1. mascot on portal */
await send('Page.navigate', { url: 'http://127.0.0.1:4173/' });
await sleep(4000);
const mascot = await evaluate(`(() => {
  const img = document.querySelector('img[src*="deer-mascot"]');
  if (!img) return null;
  const r = img.getBoundingClientRect();
  return { right: Math.round(window.innerWidth - (r.x + r.width)), bottom: Math.round(window.innerHeight - (r.y + r.height)) };
})()`);
record('mascot at bottom-right', !!mascot && mascot.right < 30 && mascot.bottom > 60, JSON.stringify(mascot));

/* 2. zoom page: drag starting on a marker pans */
await send('Page.navigate', { url: 'http://127.0.0.1:4173/#/zoom?mural=mural-deer' });
for (let i = 0; i < 14; i++) {
  const ready = await evaluate(`!!document.querySelector('main .relative.min-h-0.flex-1 img[class*="opacity-0"]')`);
  if (ready) break;
  await sleep(800);
}
await sleep(2500);

const centre = await evaluate(`(() => { const img = [...document.querySelectorAll('main .relative.min-h-0.flex-1 img')].find(i => i.className.includes('opacity-0')); const r = img.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
for (let n = 0; n < 2; n++) {
  await tapAt(centre.x, centre.y);
  await lift();
  await sleep(120);
}
await sleep(800);

const marker = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.className.includes('animate-hotspot') && b.getBoundingClientRect().width > 0);
  if (!btn) return null;
  const r = btn.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
})()`);
console.log('marker at:', JSON.stringify(marker));

const yBefore = await evaluate(`(() => { const img = [...document.querySelectorAll('main .relative.min-h-0.flex-1 img')].find(i => i.className.includes('opacity-0')); return img.getBoundingClientRect().y; })()`);
if (marker) {
  await tapAt(marker.x, marker.y);
  for (let j = 1; j <= 8; j++) {
    await moveTo(marker.x, marker.y - j * 10);
    await sleep(16);
  }
  await lift();
  await sleep(600);
}
const yAfter = await evaluate(`(() => { const img = [...document.querySelectorAll('main .relative.min-h-0.flex-1 img')].find(i => i.className.includes('opacity-0')); return img.getBoundingClientRect().y; })()`);
record('drag from marker pans', marker ? Math.abs(yAfter - yBefore) > 40 : false, `y ${Math.round(yBefore)} -> ${Math.round(yAfter)}`);

/* 3. correction mode: enable, drag a marker, check persisted */
const toggled = await evaluate(`(() => {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('校正点位'));
  if (!b) return 'no-button';
  b.click();
  return 'clicked';
})()`);
await sleep(600);
const marker2 = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.className.includes('animate-hotspot') && b.getBoundingClientRect().width > 0);
  if (!btn) return null;
  const r = btn.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
})()`);
if (marker2) {
  await tapAt(marker2.x, marker2.y);
  for (let j = 1; j <= 6; j++) {
    await moveTo(marker2.x + j * 8, marker2.y);
    await sleep(16);
  }
  await lift();
  await sleep(600);
}
const saved = await evaluate(`localStorage.getItem('dh_hotspot_overrides')`);
record('marker correction persists', toggled === 'clicked' && !!saved && saved.length > 10, `toggle=${toggled} saved=${saved ? saved.slice(0, 60) : 'none'}`);

ws.close();
chrome.kill();
fs.writeFileSync('D:\\wangzhan\\fix-report.txt', results.map((r) => r.join('\t')).join('\n'), 'utf8');
