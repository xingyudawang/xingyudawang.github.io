// Confirm the Nine-Colored Deer digital human appears in the narration card.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9346;
const profile = 'D:\\wangzhan\\.chrome-guide';
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

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: 'https://xingyudawang.github.io/#/vr?cave=cave-257' });
await sleep(7000);

let clicked = 'no-hotspot';
for (let i = 0; i < 14 && clicked === 'no-hotspot'; i++) {
  clicked = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.className.includes('animate-hotspot'));
  if (!btn) return 'no-hotspot';
  btn.click();
  return 'clicked';
})()`);
  if (clicked !== 'no-hotspot') break;
  await sleep(1000);
}
await sleep(1500);

const card = await evaluate(`(() => {
  const img = document.querySelector('img[src*="guide-deer-card"]');
  const name = [...document.querySelectorAll('div')].find(d => d.textContent === '九色鹿' && d.children.length === 0);
  return {
    cardImage: !!img,
    cardLoaded: img ? (img.complete && img.naturalWidth > 0) : false,
    nameSeen: !!name,
    bodyHasGuide: document.body.innerText.includes('敦煌数字讲解员'),
  };
})()`);

console.log(`hotspot click: ${clicked}`);
console.log(JSON.stringify(card, null, 1));

ws.close();
chrome.kill();
