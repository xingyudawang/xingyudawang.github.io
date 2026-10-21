// Measure cave brightness after the per-cave boost, and confirm the deer
// digital human is on the portal.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import sharp from 'sharp';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9350;
const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const profile = 'D:\\wangzhan\\.chrome-bright';
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--mute-audio', '--hide-scrollbars', '--window-size=400,820', 'about:blank',
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
await send('Emulation.setDeviceMetricsOverride', { width: 400, height: 820, deviceScaleFactor: 2, mobile: true });

await send('Page.navigate', { url: `${BASE}/` });
await sleep(3000);

/* portal deer */
const portal = await evaluate(`JSON.stringify({
  deerBtn: !!document.querySelector('button img[src*="guide-deer-avatar"]'),
  deerText: document.body.innerText.includes('让九色鹿带您开启敦煌之旅') || document.body.innerText.includes('数字讲解员')
})`);
console.log('portal deer:', portal);

/* cave brightness */
for (const [cave, label] of [['cave-254', '254'], ['cave-257', '257'], ['cave-420', '420']]) {
  await send('Page.navigate', { url: `${BASE}/#/vr?cave=${cave}` });
  await sleep(6000);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(shot.data, 'base64');
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  // measure the centre 60% only (skip UI chrome and heavy vignette edges)
  const cw = Math.round(info.width * 0.6);
  const ch = Math.round(info.height * 0.6);
  const left = Math.round((info.width - cw) / 2);
  const top = Math.round((info.height - ch) / 2);
  let sum = 0;
  let n = 0;
  for (let y = top; y < top + ch; y++) {
    for (let x = left; x < left + cw; x++) {
      sum += data[y * info.width + x];
      n++;
    }
  }
  console.log(`cave ${label}: centre mean brightness ${(sum / n).toFixed(1)}`);
}

ws.close();
chrome.kill();
