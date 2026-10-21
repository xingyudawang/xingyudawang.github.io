// Collect an inventory of authentic Digital Dunhuang assets:
// cave metadata, per-wall section titles/descriptions, and Deep Zoom sources.
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
    } catch {
      /* retry */
    }
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

/** caves worth harvesting (the ones with a published high-res pyramid) */
const CAVES = ['0257', '0112', '0057', '0017', '0254', '0320', '0420', '0249', '0285', '0303', '0322', '0061'];

function strip(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parse a cave page: metadata, then every section modal (title + description + asset id). */
function parseCave(html, caveNo) {
  const dynasty = strip(html.match(/<small>\s*([^<]+?)\s*<\/small>/)?.[1] ?? '');
  const nameMatch = html.match(/<h1 class="wow">[\s\S]*?<\/h1>/);
  const mainTitle = nameMatch ? strip(nameMatch[0]) : '';

  // modal titles appear before their `var ss = '<asset id>'`
  const titles = [...html.matchAll(/modal-title" id="titles">([\s\S]*?)<\/h1>/g)].map((m) => ({
    at: m.index ?? 0,
    text: strip(m[1]),
  }));
  const ids = [...html.matchAll(/var ss = '([^']+)'/g)].map((m) => ({ at: m.index ?? 0, id: m[1] }));

  // descriptions live inside the modal markup, right after the preview <img>
  const descs = [...html.matchAll(/<p style="text-indent:2em">([\s\S]*?)<\/p>/g)].map((m) => ({
    at: m.index ?? 0,
    text: strip(m[1]),
  }));

  const sections = ids.map((entry) => {
    const title = [...titles].filter((t) => t.at < entry.at).pop()?.text ?? '';
    const desc = [...descs].filter((d) => d.at > entry.at).shift()?.text ?? '';
    return { assetId: entry.id, title, description: desc };
  });

  // whole-cave description
  const caveDesc = strip(
    html.match(/<span style="font-size:1\.1em;">([\s\S]*?)<!--/)?.[1] ??
      html.match(/<span style="font-size:1\.1em;">([\s\S]*?)<\/span>/)?.[1] ??
      ''
  );

  return {
    caveNo,
    dynasty,
    mainTitle,
    caveDescription: caveDesc,
    sections: sections.filter((s) => s.title || s.description),
  };
}

function showmuralUrl(assetId, part) {
  // 10.0001/0001.0001.0257.0001.0002 -> showmural/10.0001/0001/0001/0257/0001/0002/01
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
    return { base, width: w, height: h, tileSize: tile, viewer: showmuralUrl(assetId, part) };
  }
  return null;
}

const manifest = { generatedAt: new Date().toISOString(), source: 'https://www.e-dunhuang.com', caves: [] };

for (const caveNo of CAVES) {
  const cavePath = `10.0001/0001.0001.${caveNo}`;
  const html = await getText(`https://www.e-dunhuang.com/cave/${cavePath}`);
  if (!html) {
    console.log(caveNo, 'unreachable');
    continue;
  }
  const meta = parseCave(html, caveNo);

  const resolved = await pool(meta.sections, 4, async (s) => {
    const dzi = await resolveDzi(s.assetId);
    return dzi ? { ...s, ...dzi } : null;
  });

  meta.sections = resolved.filter(Boolean);
  manifest.caves.push(meta);
  console.log(
    `cave ${caveNo} (${meta.dynasty}) sections=${meta.sections.length}`,
    meta.sections
      .map((s) => `${s.title || '—'}:${s.width}x${s.height}`)
      .slice(0, 4)
      .join('  ')
  );
}

fs.writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log('\n-> assets-src/manifest.json');
