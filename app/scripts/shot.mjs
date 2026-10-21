// Screenshot the key routes and measure what is actually on screen, so an empty
// or black WebGL canvas cannot pass verification silently.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import sharp from 'sharp';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9334;
const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const profile = 'D:\\wangzhan\\.chrome-shot';
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

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 400,
  height: 820,
  deviceScaleFactor: 2,
  mobile: true,
});

const ROUTES = [
  ['portal', '#/portal'],
  ['cave-257', '#/vr?cave=cave-257'],
  ['cave-420', '#/vr?cave=cave-420'],
  ['cave-57', '#/vr?cave=cave-57'],
  ['zoom-deer', '#/zoom?mural=mural-deer'],
  ['workshop', '#/workshop'],
  ['encyclopedia', '#/encyclopedia'],
  ['puzzle', '#/game'],
  ['profile', '#/profile'],
];

fs.mkdirSync('D:\\wangzhan\\shots', { recursive: true });

for (const [name, hash] of ROUTES) {
  await send('Page.navigate', { url: `${BASE}/${hash}` });
  await sleep(4200);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(shot.data, 'base64');
  const file = `D:\\wangzhan\\shots\\${name}.png`;
  fs.writeFileSync(file, buf);

  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  let sum = 0;
  let sumSq = 0;
  let dark = 0;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    sum += v;
    sumSq += v * v;
    if (v < 12) dark++;
  }
  const n = data.length;
  const mean = sum / n;
  const std = Math.sqrt(sumSq / n - mean * mean);
  console.log(
    `${name.padEnd(13)} ${info.width}x${info.height}  mean=${mean.toFixed(1).padStart(6)}  std=${std.toFixed(1).padStart(6)}  black=${((dark / n) * 100).toFixed(1)}%  ${Math.round(buf.length / 1024)}KB`
  );
}

ws.close();
chrome.kill();
