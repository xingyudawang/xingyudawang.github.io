// Full inventory: crawl every cave listed on the Digital Dunhuang site and
// resolve which walls have published high-res pyramids.
import fs from 'node:fs';

const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
  Referer: 'https://www.e-dunhuang.com/',
};

const OUT = 'assets-src';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getText(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.ok) return await r.text();
      if (r.status === 404) return null;
    } catch { /* retry */ }
    await sleep(300 * (i + 1));
  }
  return null;
}

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let cur = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cur < items.length) {
        const i = cur++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

function strip(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function parseCave(html, caveNo) {
  const dynasty = strip(html.match(/<small>\s*([^<]+?)\s*<\/small>/)?.[1] ?? '');
  const titles = [...html.matchAll(/modal-title" id="titles">([\s\S]*?)<\/h1>/g)].map((m) => ({
    at: m.index ?? 0,
    text: strip(m[1]),
  }));
  const ids = [...html.matchAll(/var ss = '([^']+)'/g)].map((m) => ({ at: m.index ?? 0, id: m[1] }));
  const descs = [...html.matchAll(/<p style="text-indent:2em">([\s\S]*?)<\/p>/g)].map((m) => ({
    at: m.index ?? 0,
    text: strip(m[1]),
  }));
  const sections = ids.map((entry) => {
    const title = [...titles].filter((t) => t.at < entry.at).pop()?.text ?? '';
    const desc = [...descs].filter((d) => d.at > entry.at).shift()?.text ?? '';
    return { assetId: entry.id, title, description: desc };
  });
  const caveDesc = strip(
    html.match(/<span style="font-size:1\.1em;">([\s\S]*?)<!--/)?.[1] ??
      html.match(/<span style="font-size:1\.1em;">([\s\S]*?)<\/span>/)?.[1] ?? ''
  );
  return { caveNo, dynasty, caveDescription: caveDesc, sections: sections.filter((s) => s.title || s.description) };
}

function showmuralUrl(assetId, part) {
  const [host, rest] = assetId.split('/');
  return `https://www.e-dunhuang.com/showmural/${host}/${rest.split('.').join('/')}/${part}`;
}

async function resolveDzi(assetId) {
  for (const part of ['01']) {
    const page = await getText(showmuralUrl(assetId, part));
    if (!page) continue;
    const p = page.match(/var\s+path\s*=\s*"([^"]+)"/);
    if (!p) continue;
    const base = p[1].replace(/^\/\//, 'https://').replace(/index_files\/$/, '');
    const dzi = await getText(`${base}index.dzi`);
    if (!dzi) continue;
    const w = Number(dzi.match(/Width="(\d+)"/)?.[1] ?? 0);
    const h = Number(dzi.match(/Height="(\d+)"/)?.[1] ?? 0);
    const tile = Number(dzi.match(/TileSize="(\d+)"/)?.[1] ?? 1024);
    if (!w || !h) continue;
    return { base, width: w, height: h, tileSize: tile };
  }
  return null;
}

const section = await getText('https://www.e-dunhuang.com/section.htm');
const cavePaths = [...new Set([...section.matchAll(/\/cave\/([\d.]+\/[\d.]+)/g)].map((m) => m[1]))];
console.log('cave paths on site:', cavePaths.length);

const manifest = { generatedAt: new Date().toISOString(), source: 'https://www.e-dunhuang.com', caves: [] };

for (const cavePath of cavePaths) {
  const html = await getText(`https://www.e-dunhuang.com/cave/${cavePath}`);
  if (!html) {
    console.log(cavePath, 'unreachable');
    continue;
  }
  const caveNo = cavePath.split('.').pop();
  const meta = parseCave(html, caveNo);
  const resolved = await pool(meta.sections, 4, async (s) => {
    const dzi = await resolveDzi(s.assetId);
    return dzi ? { ...s, ...dzi } : null;
  });
  meta.sections = resolved.filter(Boolean);
  if (meta.sections.length) manifest.caves.push(meta);
  console.log(
    `cave ${caveNo.padStart(4)} (${meta.dynasty}) sections=${meta.sections.length}` +
      (meta.sections[0] ? `  e.g. ${meta.sections[0].title}:${meta.sections[0].width}x${meta.sections[0].height}` : '')
  );
}

fs.writeFileSync(`${OUT}/manifest-full.json`, JSON.stringify(manifest, null, 2));
console.log(`\n${manifest.caves.length} caves with usable imagery -> assets-src/manifest-full.json`);
