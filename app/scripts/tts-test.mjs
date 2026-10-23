// Verify the pre-rendered narration actually plays in the built site.
// Usage: node scripts/tts-test.mjs [base]
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9336;
const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const profile = 'D:\\wangzhan\\.chrome-tts';
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
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
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find((t) => t.type === 'page');
      if (p?.webSocketDebuggerUrl) return p;
    } catch { /* not up */ }
    await sleep(300);
  }
  throw new Error('devtools unavailable');
}

const target = await waitTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let id = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  } else if (m.method === 'Runtime.exceptionThrown') {
    errors.push(m.params.exceptionDetails?.exception?.description ?? 'exception');
  } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params }));
  });

await send('Page.enable');
await send('Runtime.enable');
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.__playedSrc = [];
    const p = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      try { window.__playedSrc.push(this.currentSrc || this.src); } catch { /* noop */ }
      return p.apply(this, arguments);
    };`,
});

async function goto(url) {
  await send('Page.navigate', { url });
  await sleep(2500);
}
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result?.value;
}

const results = {};
await goto(`${BASE}/`);
// warm up the app, then tap the Nine-Coloured Deer welcome button
await evaluate(`document.querySelector('[aria-label="九色鹿 · 数字讲解员"]')?.click()`);
await sleep(2500);
results.portalPlayed = await evaluate('window.__playedSrc.filter(Boolean)');

// cave intro
await goto(`${BASE}/#/vr?cave=cave-257`);
await sleep(2000);
await evaluate(`document.querySelector('[title="听本窟总讲解"]')?.click()`);
await sleep(3000);
results.cavePlayed = await evaluate('window.__playedSrc.filter(Boolean)');
results.status = await evaluate(`(() => {
  const el = document.querySelector('[title="听本窟总讲解"]');
  return el ? 'intro button found' : 'no intro button';
})()`);

// mural guide
await goto(`${BASE}/#/zoom?mural=mural-deer`);
await sleep(2500);
// the play button on the gallery bottom bar
await evaluate(`(() => {
  const btns = [...document.querySelectorAll('button')];
  const b = btns.find((x) => /讲解|听/.test(x.textContent || '')) || btns.find((x) => x.querySelector('svg') && (x.getAttribute('aria-label') || '').includes('讲解'));
  b?.click();
  return !!b;
})()`);
await sleep(3000);
results.zoomPlayed = await evaluate('window.__playedSrc.filter(Boolean)');

console.log('portal:', results.portalPlayed);
console.log('cave:', results.cavePlayed);
console.log('zoom:', results.zoomPlayed);
console.log('errors:', errors.slice(0, 5));
const ok =
  results.portalPlayed.some((u) => u.includes('/tts/welcome.zh.mp3')) &&
  results.cavePlayed.some((u) => u.includes('/tts/cave-257/intro.zh.mp3')) &&
  results.zoomPlayed.some((u) => u.includes('/tts/mural-deer/guide.zh.mp3'));
console.log(ok ? 'RESULT: PASS' : 'RESULT: CHECK ABOVE');

try { ws.close(); } catch { /* noop */ }
chrome.kill();
await sleep(800);
try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* chrome may still hold it */ }
process.exit(ok ? 0 : 1);
