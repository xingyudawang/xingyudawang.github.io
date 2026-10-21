// Crawl the Digital Dunhuang site and build a manifest of ultra-high-res mural
// sources (official Deep Zoom pyramids) for the caves we showcase.
import fs from 'node:fs';
import path from 'node:path';

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
    await sleep(400 * (i + 1));
  }
  return null;
}

async function getBuf(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      const ct = r.headers.get('content-type') || '';
      if (r.ok && ct.startsWith('image/')) return Buffer.from(await r.arrayBuffer());
      if (r.status === 404) return null;
    } catch {
      /* retry */
    }
    await sleep(400 * (i + 1));
  }
  return null;
}

/** Run tasks with limited concurrency. */
async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const section = await getText('https://www.e-dunhuang.com/section.htm');
  if (!section) throw new Error('section.htm unreachable');

  const cavePaths = [...new Set(
    [...section.matchAll(/\/cave\/([\d.]+\/[\d.]+)/g)].map((m) => m[1])
  )];
  console.log('caves found:', cavePaths.length);

  const manifest = { generatedAt: new Date().toISOString(), caves: [] };

  for (const cavePath of cavePaths) {
    const caveNo = cavePath.split('.').pop();
    const html = await getText(`https://www.e-dunhuang.com/cave/${cavePath}`);
    if (!html) continue;

    const titleMatch = html.match(/第\s*(\d+)\s*窟/);
    const dynastyMatch = html.match(/<small>\s*([^<]+?)\s*<\/small>/);
    const muralLinks = [...new Set(
      [...html.matchAll(/\/showmural\/([\w./]+)/g)].map((m) => m[1])
    )];
    const panoLinks = [...new Set(
      [...html.matchAll(/\/panorama\/([\w./]+)/g)].map((m) => m[1])
    )];

    // authentic description paragraph(s)
    const descMatch = html.match(/<span style="font-size:1\.1em;">([\s\S]*?)<\/span>/);
    const description = descMatch
      ? descMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : '';

    const entry = {
      cavePath,
      caveNo: titleMatch?.[1] ?? caveNo,
      dynasty: dynastyMatch?.[1]?.trim() ?? '',
      description,
      murals: [],
      panoramas: panoLinks,
    };

    // resolve each mural viewer page -> dzi path + dimensions
    const resolved = await pool(muralLinks.slice(0, 40), 4, async (link) => {
      const page = await getText(`https://www.e-dunhuang.com/showmural/${link}`);
      if (!page) return null;
      const p = page.match(/var\s+path\s*=\s*"([^"]+)"/);
      if (!p) return null;
      const dziBase = p[1].replace(/^\/\//, 'https://');
      const dziBuf = await getBuf(`${dziBase}index.dzi`);
      if (!dziBuf) return null;
      const xml = dziBuf.toString('utf8');
      const w = Number(xml.match(/Width="(\d+)"/)?.[1] ?? 0);
      const h = Number(xml.match(/Height="(\d+)"/)?.[1] ?? 0);
      const titleMatch2 = page.match(/<title>([^<]*)<\/title>/);
      return {
        link,
        dziBase,
        width: w,
        height: h,
        title: titleMatch2?.[1]?.trim() ?? '',
      };
    });

    entry.murals = resolved.filter(Boolean).sort((a, b) => b.width - a.width);
    manifest.caves.push(entry);
    console.log(
      `cave ${entry.caveNo.padStart(4)} (${entry.dynasty}) murals=${entry.murals.length} pano=${entry.panoramas.length}` +
        (entry.murals[0] ? `  best=${entry.murals[0].width}x${entry.murals[0].height}` : '')
    );
  }

  fs.writeFileSync(path.join(OUT, 'dunhuang-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\nwrote assets-src/dunhuang-manifest.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
