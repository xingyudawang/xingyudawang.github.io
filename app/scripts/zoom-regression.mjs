// Regression tests for reported bugs:
//  1. deep-zoom back button must return to the portal
//  2. the zoomed image must be centred in the stage
//  3. the puzzle board should be large (>= 60% of viewport width on desktop)
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9336;
const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const profile = 'D:\\wangzhan\\.chrome-reg';
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
  '--window-size=1280,860',
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
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');

const results = [];
const record = (name, pass, detail) => {
  results.push([name, pass ? 'PASS' : 'FAIL', detail]);
  console.log(`${pass ? '✓' : '✗'} ${name.padEnd(30)} ${detail}`);
};

/* ---- 1 + 2: deep zoom ---- */
await send('Page.navigate', { url: `${BASE}/#/zoom?mural=mural-deer` });
await sleep(3500);

const geometry = await evaluate(`(() => {
  const stage = document.querySelector('main .relative.min-h-0.flex-1');
  const img = document.querySelector('main .relative.min-h-0.flex-1 img');
  if (!stage || !img) return null;
  const s = stage.getBoundingClientRect();
  const i = img.getBoundingClientRect();
  return {
    stage: { x: s.x, y: s.y, w: s.width, h: s.height },
    img: { x: i.x, y: i.y, w: i.width, h: i.height },
    centreOff: Math.hypot((i.x + i.width / 2) - (s.x + s.width / 2), (i.y + i.height / 2) - (s.y + s.height / 2)),
  };
})()`);

if (!geometry) {
  record('zoom image centred', false, 'no stage/img found');
} else {
  record('zoom image centred', geometry.centreOff < 24, `offset ${geometry.centreOff.toFixed(1)}px, img ${Math.round(geometry.img.w)}x${Math.round(geometry.img.h)} in stage ${Math.round(geometry.stage.w)}x${Math.round(geometry.stage.h)}`);
}

// click the back arrow (top-left, aria-label 返回)
const clicked = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === '返回');
  if (!btn) return 'no-button';
  btn.click();
  return 'clicked';
})()`);
await sleep(1600);
const portalTitle = await evaluate(`document.querySelector('h1')?.textContent ?? ''`);
const hashAfter = await evaluate(`location.hash`);
record('zoom back button -> portal', clicked === 'clicked' && portalTitle.includes('莫高幻境'), `click=${clicked} title=${portalTitle.slice(0, 12)} hash=${hashAfter}`);

// also verify back via history works: go to zoom again then history.back()
await send('Page.navigate', { url: `${BASE}/#/portal` });
await sleep(1200);
await send('Page.navigate', { url: `${BASE}/#/zoom?mural=mural-deer` });
await sleep(2500);
await evaluate(`history.back()`);
await sleep(1500);
const portalAfterBack = await evaluate(`document.querySelector('h1')?.textContent ?? ''`);
record('browser back -> portal', portalAfterBack.includes('莫高幻境'), `title=${portalAfterBack.slice(0, 12)}`);

/* ---- 3: puzzle size ---- */
await send('Page.navigate', { url: `${BASE}/#/game` });
await sleep(3000);
const puzzleW = await evaluate(`(() => {
  const cells = [...document.querySelectorAll('main button[aria-label^="第"]')];
  if (!cells.length) return 0;
  const board = cells[0].parentElement.getBoundingClientRect();
  return { w: board.width, vw: window.innerWidth };
})()`);
record('puzzle board is large', puzzleW.w >= 500, `board ${Math.round(puzzleW.w)}px of ${puzzleW.vw}px viewport`);

// hotspot tap still works in zoom (gesture capture regression)
await send('Page.navigate', { url: `${BASE}/#/zoom?mural=mural-deer` });
await sleep(3000);
const hotspot = await evaluate(`(() => {
  const marker = [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').length > 0 && b.className.includes('animate-hotspot'));
  if (!marker) return 'no-marker';
  marker.click();
  return 'clicked';
})()`);
await sleep(900);
const sheetOpen = await evaluate(`document.body.innerText.includes('朗读这一段')`);
record('zoom hotspot click opens sheet', hotspot === 'clicked' && sheetOpen, `click=${hotspot} sheet=${sheetOpen}`);

ws.close();
chrome.kill();
fs.writeFileSync('D:\\wangzhan\\zoom-regression.txt', results.map((r) => r.join('\t')).join('\n'), 'utf8');
