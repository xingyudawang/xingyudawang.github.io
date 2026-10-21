// Headless verification of every route via the Chrome DevTools Protocol:
// console errors, uncaught exceptions, WebGL availability, and key DOM state.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';

const profile = 'D:\\wangzhan\\.chrome-cdp';
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--mute-audio',
    '--window-size=420,860',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path) {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`);
  return r.json();
}

async function waitForTarget(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const list = await getJson('/json/list');
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      /* not up yet */
    }
    await sleep(300);
  }
  throw new Error('chrome devtools did not come up');
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

const report = [];
function log(line) {
  console.log(line);
  report.push(line);
}

const page = await waitForTarget();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cdp = new Cdp(ws);

await cdp.send('Runtime.enable');
await cdp.send('Log.enable');
await cdp.send('Page.enable');
await cdp.send('Network.enable');

const ROUTES = [
  ['#/portal', '展厅', "document.querySelector('h1')?.textContent ?? ''"],
  ['#/vr?cave=cave-257', '洞窟 257', "!!document.querySelector('canvas')"],
  ['#/vr?cave=cave-420', '洞窟 420', "!!document.querySelector('canvas')"],
  ['#/vr?cave=cave-220', '洞窟 220', "!!document.querySelector('canvas')"],
  ['#/vr?cave=cave-61', '洞窟 61', "!!document.querySelector('canvas')"],
  ['#/vr?cave=cave-3', '洞窟 3', "!!document.querySelector('canvas')"],
  ['#/vr?cave=cave-329', '洞窟 329', "!!document.querySelector('canvas')"],
  ['#/zoom?mural=mural-deer', '微距鉴赏', "!!document.querySelector('img')"],
  ['#/zoom?mural=mural-wutai', '微距 五台山', "!!document.querySelector('img')"],
  ['#/zoom?mural=mural-lotusapsara', '微距 藻井', "!!document.querySelector('img')"],
  ['#/workshop', '彩绘工坊', "!!document.querySelector('canvas')"],
  ['#/encyclopedia', '百科', "document.body.innerText.includes('石青')"],
  ['#/game', '拼图', "document.body.innerText.includes('拼图') || document.body.innerText.includes('问答')"],
  ['#/profile', '图鉴', "document.body.innerText.includes('珍藏') || document.body.innerText.includes('我的作品')"],
];

for (const [hash, label, expr] of ROUTES) {
  cdp.events.length = 0;
  await cdp.send('Page.navigate', { url: `${BASE}/${hash}` });
  // lazy chunks (three.js et al.) need a little longer on a cold cache
  await sleep(5200);

  let value = null;
  try {
    const r = await cdp.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: false,
    });
    value = r.result?.value;
  } catch (e) {
    value = `eval-error: ${e.message}`;
  }

  const problems = cdp.events
    .filter(
      (e) =>
        (e.method === 'Runtime.exceptionThrown') ||
        (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') ||
        (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')
    )
    .map((e) => {
      if (e.method === 'Runtime.exceptionThrown') {
        return e.params.exceptionDetails?.exception?.description ?? e.params.exceptionDetails?.text;
      }
      if (e.method === 'Log.entryAdded') return `${e.params.entry.text} (${e.params.entry.url ?? ''})`;
      return e.params.args?.map((a) => a.value ?? a.description).join(' ');
    })
    .filter((t) => t && !/favicon/i.test(t));

  const failedRequests = cdp.events
    .filter((e) => e.method === 'Network.loadingFailed')
    .map((e) => e.params.errorText);

  log(
    `${label.padEnd(12)} check=${JSON.stringify(value)}  errors=${problems.length}  netFail=${failedRequests.length}`
  );
  for (const p of problems.slice(0, 4)) log('    ERR ' + String(p).slice(0, 220));
  for (const f of [...new Set(failedRequests)].slice(0, 3)) log('    NET ' + f);
}

// WebGL capability probe
try {
  const gl = await cdp.send('Runtime.evaluate', {
    expression: `(() => { const c = document.createElement('canvas'); const g = c.getContext('webgl2') || c.getContext('webgl'); return g ? g.getParameter(g.VERSION) + ' | ' + (g.getExtension('WEBGL_debug_renderer_info') ? g.getParameter(g.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL) : 'n/a') : 'no-webgl'; })()`,
    returnByValue: true,
  });
  log('webgl: ' + gl.result.value);
} catch (e) {
  log('webgl probe failed ' + e.message);
}

ws.close();
chrome.kill();
fs.writeFileSync('D:\\wangzhan\\verify-report.txt', report.join('\n'), 'utf8');
console.log('\nreport written to verify-report.txt');
