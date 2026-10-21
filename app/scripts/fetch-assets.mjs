// Download authentic Digital Dunhuang assets by stitching official Deep Zoom
// tile pyramids, and derive web-ready WebP files for the site.
//
// Produces, per cave:
//   wall-<cave>-e|s|w|n.webp   the four painted walls (for the 360° room)
//   ceiling-<cave>.webp        the painted caisson / coffered ceiling
//   mural-<cave>.webp          the signature wall, high resolution (gallery)
//   detail-<cave>.webp         a native-resolution crop (macro detail)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
  Referer: 'https://www.e-dunhuang.com/',
};

const OUT = path.join('assets-src', 'stitched');
const PUB = path.join('public', 'media');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PUB, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchTile(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, {
        headers: UA,
        signal: AbortSignal.timeout(25000),
      });
      if (r.ok) {
        const ct = r.headers.get('content-type') || '';
        if (ct.startsWith('image/')) return Buffer.from(await r.arrayBuffer());
      }
      if (r.status === 404 || r.status === 415) return null;
    } catch {
      /* retry */
    }
    await sleep(400 * (attempt + 1));
  }
  return null;
}

function levelsFor(width, height) {
  const maxLevel = Math.ceil(Math.log2(Math.max(width, height)));
  return { maxLevel, levelWidth: (l) => Math.ceil(width / 2 ** (maxLevel - l)) };
}

/** Choose the smallest pyramid level whose width is still >= targetWidth. */
function pickLevel(width, height, targetWidth) {
  const { maxLevel, levelWidth } = levelsFor(width, height);
  for (let l = 0; l <= maxLevel; l++) {
    const w = levelWidth(l);
    if (w >= targetWidth) return { level: l, w, maxLevel };
  }
  return { level: maxLevel, w: levelWidth(maxLevel), maxLevel };
}

/** Stitch a rectangle of tiles [c0..c1] x [r0..r1] at a given level. */
async function stitchRegion(src, level, c0, c1, r0, r1) {
  const tileSize = src.tileSize || 1024;
  const { levelWidth } = levelsFor(src.width, src.height);
  const { maxLevel } = levelsFor(src.width, src.height);
  const wL = levelWidth(level);
  const hL = Math.ceil(src.height / 2 ** (maxLevel - level));

  const cols = c1 - c0 + 1;
  const rows = r1 - r0 + 1;
  const tiles = [];
  let done = 0;

  const jobs = [];
  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      jobs.push({ row, col });
    }
  }

  const CONCURRENCY = 6;
  let cursor = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      const { row, col } = jobs[cursor++];
      const url = `${src.base}index_files/${level}/${col}_${row}.jpg`;
      const buf = await fetchTile(url);
      done++;
      if (done % 8 === 0) process.stdout.write('.');
      if (buf) tiles.push({ row, col, buf });
    }
  });
  await Promise.all(workers);
  process.stdout.write(` ${tiles.length}/${jobs.length} `);

  if (!tiles.length) throw new Error(`no tiles at level ${level}`);

  // width/height of the stitched region (edge tiles may be partial)
  const regionW = Math.min(wL, (c1 + 1) * tileSize) - c0 * tileSize;
  const regionH = Math.min(hL, (r1 + 1) * tileSize) - r0 * tileSize;

  const composites = [];
  for (const t of tiles) {
    const meta = await sharp(t.buf, { limitInputPixels: false }).metadata();
    composites.push({
      input: t.buf,
      left: t.col * tileSize - c0 * tileSize,
      top: t.row * tileSize - r0 * tileSize,
      width: meta.width,
      height: meta.height,
    });
  }

  const canvas = sharp({
    create: {
      width: regionW,
      height: regionH,
      channels: 3,
      background: { r: 18, g: 14, b: 11 },
    },
    limitInputPixels: false,
  });
  return canvas.composite(composites).png().toBuffer();
}

function tileGridFor(wL, hL, tileSize) {
  return { cols: Math.ceil(wL / tileSize), rows: Math.ceil(hL / tileSize) };
}

async function buildWhole(src, targetWidth) {
  const { level, w } = pickLevel(src.width, src.height, targetWidth);
  const { maxLevel } = levelsFor(src.width, src.height);
  const h = Math.ceil(src.height / 2 ** (maxLevel - level));
  const tileSize = src.tileSize || 1024;
  const { cols, rows } = tileGridFor(w, h, tileSize);
  return stitchRegion(src, level, 0, cols - 1, 0, rows - 1);
}

/** Native-resolution crop around a normalised centre (0..1). */
async function buildCrop(src, cx, cy, frac, targetWidth) {
  const { maxLevel } = levelsFor(src.width, src.height);
  const tileSize = src.tileSize || 1024;

  // find the deepest level where the crop still spans enough pixels
  let chosen = null;
  for (let l = maxLevel; l >= 0; l--) {
    const wL = Math.ceil(src.width / 2 ** (maxLevel - l));
    const cropPx = wL * frac;
    if (cropPx >= targetWidth) {
      chosen = { level: l, wL, cropPx };
      break;
    }
  }
  if (!chosen) chosen = { level: 0, wL: Math.ceil(src.width / 2 ** maxLevel), cropPx: 0 };

  const { level, wL } = chosen;
  const hL = Math.ceil(src.height / 2 ** (maxLevel - level));
  const halfW = (wL * frac) / 2;
  const halfH = (hL * frac) / 2;
  const x0 = Math.max(0, Math.round(cx * wL - halfW));
  const x1 = Math.min(wL, Math.round(cx * wL + halfW));
  const y0 = Math.max(0, Math.round(cy * hL - halfH));
  const y1 = Math.min(hL, Math.round(cy * hL + halfH));

  const c0 = Math.floor(x0 / tileSize);
  const c1 = Math.min(Math.ceil(wL / tileSize) - 1, Math.floor((x1 - 1) / tileSize));
  const r0 = Math.floor(y0 / tileSize);
  const r1 = Math.min(Math.ceil(hL / tileSize) - 1, Math.floor((y1 - 1) / tileSize));

  const stitched = await stitchRegion(src, level, c0, c1, r0, r1);
  const offsetX = x0 - c0 * tileSize;
  const offsetY = y0 - r0 * tileSize;
  return sharp(stitched)
    .extract({
      left: offsetX,
      top: offsetY,
      width: Math.max(1, x1 - x0),
      height: Math.max(1, y1 - y0),
    })
    .png()
    .toBuffer();
}

async function toWebp(buf, dest, width, quality = 80) {
  const meta = await sharp(buf, { limitInputPixels: false }).metadata();
  const out = await sharp(buf, { limitInputPixels: false })
    .resize({ width: Math.min(width, meta.width), withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer();
  fs.writeFileSync(path.join(PUB, dest), out);
  return { file: dest, w: Math.min(width, meta.width), kb: Math.round(out.length / 1024) };
}

/* ----------------------------------------------------------------------- */
/* plan                                                                    */
/* ----------------------------------------------------------------------- */

const manifest = JSON.parse(fs.readFileSync(path.join('assets-src', 'manifest.json'), 'utf8'));

/** per-cave: which section title provides each wall / ceiling / signature */
const PLAN = {
  '0257': { cave: 'cave-257', walls: { 南壁: 's', 西壁: 'w', 北壁: 'n', 东壁: 'e' }, ceiling: '平棋顶 南面', signature: '西壁' },
  '0254': { cave: 'cave-254', walls: { 南壁: 's', 西壁: 'w', 北壁: 'n', 东壁: 'e' }, ceiling: '平棋顶 平棋顶', signature: '北壁' },
  '0249': { cave: 'cave-249', walls: { 南壁: 's', 西壁: 'w', 北壁: 'n', 东披: 'e' }, ceiling: '南披', signature: '南壁' },
  '0285': { cave: 'cave-285', walls: { 南壁: 's', 西壁: 'w', 北壁: 'n', 东壁: 'e' }, ceiling: '藻井', signature: '南壁' },
  '0420': { cave: 'cave-420', walls: { 南壁: 's', 西壁: 'w', 北壁: 'n', 东壁: 'e' }, ceiling: '藻井', signature: '南壁' },
  '0320': { cave: 'cave-320', walls: { 南壁: 's', 西壁: 'w', 北壁: 'n', 东壁: 'e' }, ceiling: '藻井', signature: '南壁' },
  '0057': { cave: 'cave-57', walls: { 南壁: 's', 西壁: 'w', 北壁: 'n', 东壁: 'e' }, ceiling: '藻井', signature: '南壁' },
  '0112': { cave: 'cave-112', walls: { 南壁: 's', 西壁: 'w', 北壁: 'n', 东壁: 'e' }, ceiling: '藻井', signature: '南壁' },
  '0017': { cave: 'cave-17', walls: { 北壁: 'n', 西壁: 'w' }, ceiling: '北壁', signature: '北壁' },
};

function findSection(cave, needle) {
  if (!cave) return null;
  const hit = cave.sections.find((s) => s.title.includes(needle) && !s.title.includes('甬道') && !s.title.includes('前室'));
  return hit ?? cave.sections.find((s) => s.title.includes(needle)) ?? null;
}

const only = process.argv[2] ? process.argv[2].split(',') : null;
const report = [];

for (const [caveNo, plan] of Object.entries(PLAN)) {
  if (only && !only.includes(caveNo)) continue;
  const caveData = manifest.caves.find((c) => c.caveNo === caveNo);
  if (!caveData) {
    console.log(`! cave ${caveNo} missing from manifest`);
    continue;
  }
  console.log(`\n=== cave ${caveNo} (${plan.cave}) ===`);

  const usedTitles = new Set();

  for (const [needle, suffix] of Object.entries(plan.walls)) {
    let section = findSection(caveData, needle);
    if (!section) {
      // The named wall may not exist (e.g. Cave 257's east wall collapsed).
      // Fall back to the largest unused main-chamber wall so the room is still closed.
      const fallback = caveData.sections
        .filter(
          (s) =>
            s.title.includes('主室') &&
            !s.title.includes('甬道') &&
            !s.title.includes('前室') &&
            !s.title.includes('中心柱') &&
            !usedTitles.has(s.title) &&
            (s.title.includes('壁') || s.title.includes('披'))
        )
        .sort((a, b) => b.width * b.height - a.width * a.height)[0];
      if (fallback) {
        console.log(`  wall ${suffix}: "${needle}" missing -> reusing ${fallback.title}`);
        section = fallback;
      }
    }
    if (!section) {
      console.log(`  wall ${suffix}: no usable section`);
      continue;
    }
    usedTitles.add(section.title);
    process.stdout.write(`  wall ${suffix} <- ${section.title} (${section.width}x${section.height}) `);
    try {
      const buf = await buildWhole(section, 1700);
      const r = await toWebp(buf, `wall-${plan.cave}-${suffix}.webp`, 1700, 78);
      console.log(`=> ${r.kb}KB`);
      report.push(r);
    } catch (e) {
      console.log('FAIL', e.message);
    }
  }

  const ceilSection = findSection(caveData, plan.ceiling);
  if (ceilSection) {
    process.stdout.write(`  ceiling <- ${ceilSection.title} `);
    try {
      const buf = await buildWhole(ceilSection, 1280);
      const r = await toWebp(buf, `ceiling-${plan.cave}.webp`, 1280, 78);
      console.log(`=> ${r.kb}KB`);
      report.push(r);
    } catch (e) {
      console.log('FAIL', e.message);
    }
  }

  const sig = findSection(caveData, plan.signature);
  if (sig) {
    process.stdout.write(`  mural <- ${sig.title} `);
    try {
      const buf = await buildWhole(sig, 3400);
      const r = await toWebp(buf, `mural-${plan.cave}.webp`, 3400, 80);
      console.log(`=> ${r.kb}KB`);
      report.push(r);
    } catch (e) {
      console.log('FAIL', e.message);
    }
    process.stdout.write(`  detail <- ${sig.title} `);
    try {
      const crop = await buildCrop(sig, 0.5, 0.47, 0.26, 2000);
      const r2 = await toWebp(crop, `detail-${plan.cave}.webp`, 2000, 82);
      console.log(`=> ${r2.kb}KB`);
      report.push(r2);
    } catch (e) {
      console.log('FAIL', e.message);
    }
  }
}

fs.writeFileSync(path.join('assets-src', 'build-report.json'), JSON.stringify(report, null, 2));
const total = report.reduce((a, r) => a + r.kb, 0);
console.log(`\n${report.length} files, ${(total / 1024).toFixed(1)} MB`);
