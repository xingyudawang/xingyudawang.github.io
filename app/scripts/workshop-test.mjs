// Workshop feature tests: pinch-zoom the painting, pan mode, drawing while
// zoomed, and the easier posterised base (fill should cover huge areas).
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9337;
const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const profile = 'D:\\wangzhan\\.chrome-ws';
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
  '--window-size=420,900',
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
await send('Emulation.setDeviceMetricsOverride', {
  width: 420, height: 900, deviceScaleFactor: 2, mobile: true,
});
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

const results = [];
const record = (name, pass, detail) => {
  results.push([name, pass ? 'PASS' : 'FAIL', detail]);
  console.log(`${pass ? '✓' : '✗'} ${name.padEnd(30)} ${detail}`);
};

async function touch(events) {
  for (const ev of events) await send('Input.dispatchTouchEvent', ev);
}

// warm-up: same-origin hop so the harness evaluates in the right context
await send('Page.navigate', { url: `${BASE}/` });
await sleep(2500);
await send('Page.navigate', { url: `${BASE}/#/workshop` });
await sleep(6000);

let canvasBox = null;
for (let attempt = 0; attempt < 8 && !canvasBox; attempt++) {
  canvasBox = await evaluate(`(() => {
    const cs = [...document.querySelectorAll('canvas')];
    const c = cs[cs.length - 1];
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  })()`);
  if (!canvasBox) await sleep(1200);
}
if (!canvasBox) throw new Error('no canvas');

const zoomBadge = () => evaluate(`[...document.querySelectorAll('span')].find(s => /%$/.test(s.textContent) && s.className.includes('tabular'))?.textContent ?? ''`);

/* 1. pinch zoom */
await touch([
  { type: 'touchStart', touchPoints: [{ x: canvasBox.x + canvasBox.w * 0.4, y: canvasBox.y + canvasBox.h * 0.4, id: 1 }, { x: canvasBox.x + canvasBox.w * 0.6, y: canvasBox.y + canvasBox.h * 0.4, id: 2 }] },
]);
for (let i = 1; i <= 8; i++) {
  await touch([{ type: 'touchMove', touchPoints: [
    { x: canvasBox.x + canvasBox.w * (0.4 - i * 0.03), y: canvasBox.y + canvasBox.h * 0.4, id: 1 },
    { x: canvasBox.x + canvasBox.w * (0.6 + i * 0.03), y: canvasBox.y + canvasBox.h * 0.4, id: 2 },
  ] }]);
  await sleep(20);
}
await touch([{ type: 'touchEnd', touchPoints: [] }]);
await sleep(700);
const badge1 = await zoomBadge();
const scale1 = await evaluate(`parseInt(${JSON.stringify(badge1)})`);
record('pinch zoom enlarges canvas', scale1 >= 150, `badge=${badge1}`);

/* 2. drawing while zoomed paints pixels */
// after a pinch the visible window is anchored at the pinch point, so stroke at
// the centre of the *viewport* (guaranteed visible) rather than the canvas centre
await touch([
  { type: 'touchStart', touchPoints: [{ x: 210, y: 430, id: 1 }] },
]);
for (let i = 1; i <= 6; i++) {
  await touch([{ type: 'touchMove', touchPoints: [{ x: 210 + i * 6, y: 430, id: 1 }] }]);
  await sleep(16);
}
await touch([{ type: 'touchEnd', touchPoints: [] }]);
await sleep(700);
const ink = await evaluate(`(() => { const c = [...document.querySelectorAll('canvas')].pop(); const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height); let n = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > 8) n++; return n; })()`);
record('brush paints while zoomed', ink > 100, `painted px ${ink}`);

/* 3. fill covers a large flat region (easy base) */
const fillClicked = await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(x => (x.title || '') === '填色'); if (!b) return 'no-btn'; b.click(); return 'ok'; })()`);
await sleep(300);
await touch([
  { type: 'touchStart', touchPoints: [{ x: 160, y: 400, id: 1 }] },
  { type: 'touchEnd', touchPoints: [] },
]);
await sleep(1200);
const fillInk = await evaluate(`(() => { const c = [...document.querySelectorAll('canvas')].pop(); const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height); let n = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > 8) n++; return n; })()`);
record('fill covers large region (easy base)', fillInk > 30000, `fill=${fillClicked} painted px ${fillInk}`);

/* 4. reset view returns to 100% */
const resetClicked = await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label') || '') === '复位视图'); if (!b) return 'no-btn'; b.click(); return 'ok'; })()`);
await sleep(500);
const badge2 = await zoomBadge();
record('reset view returns to 100%', badge2 === '100%', `reset=${resetClicked} badge=${badge2}`);

/* 5. pan mode drags the view */
const panClicked = await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(x => (x.title || '') === '移动'); if (!b) return 'no-btn'; b.click(); return 'ok'; })()`);
await sleep(300);
const before = await evaluate(`(() => { const c = [...document.querySelectorAll('canvas')].pop(); const r = c.getBoundingClientRect(); return r.x; })()`);
// zoom in first so there is room to pan
await touch([
  { type: 'touchStart', touchPoints: [{ x: canvasBox.x + canvasBox.w * 0.4, y: canvasBox.y + canvasBox.h * 0.4, id: 1 }, { x: canvasBox.x + canvasBox.w * 0.6, y: canvasBox.y + canvasBox.h * 0.4, id: 2 }] },
]);
for (let i = 1; i <= 6; i++) {
  await touch([{ type: 'touchMove', touchPoints: [
    { x: canvasBox.x + canvasBox.w * (0.4 - i * 0.03), y: canvasBox.y + canvasBox.h * 0.4, id: 1 },
    { x: canvasBox.x + canvasBox.w * (0.6 + i * 0.03), y: canvasBox.y + canvasBox.h * 0.4, id: 2 },
  ] }]);
  await sleep(20);
}
await touch([{ type: 'touchEnd', touchPoints: [] }]);
await sleep(500);
const panFrom = canvasBox.x + canvasBox.w * 0.5;
await touch([{ type: 'touchStart', touchPoints: [{ x: panFrom, y: canvasBox.y + canvasBox.h * 0.5, id: 1 }] }]);
for (let i = 1; i <= 6; i++) {
  await touch([{ type: 'touchMove', touchPoints: [{ x: panFrom + i * 10, y: canvasBox.y + canvasBox.h * 0.5, id: 1 }] }]);
  await sleep(16);
}
await touch([{ type: 'touchEnd', touchPoints: [] }]);
await sleep(500);
const after = await evaluate(`(() => { const c = [...document.querySelectorAll('canvas')].pop(); const r = c.getBoundingClientRect(); return r.x; })()`);
record('pan mode drags the view', Math.abs(after - before) > 5, `pan=${panClicked} x ${Math.round(before)} -> ${Math.round(after)}`);

ws.close();
chrome.kill();
fs.writeFileSync('D:\\wangzhan\\workshop-report.txt', results.map((r) => r.join('\t')).join('\n'), 'utf8');
