// One-pass media optimisation:
//  1. re-encode the big files to tighter WebP (smaller width + quality)
//  2. emit a 640px `thumb-` preview for every image
// The thumbs power the progressive cave walls and the portal cards.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const PUB = '../media';
const files = fs.readdirSync(PUB).filter((f) => f.endsWith('.webp') && !f.startsWith('thumb-'));

const RULES = [
  [/^mural-/, { width: 2400, q: 76 }],
  [/^detail-/, { width: 1600, q: 78 }],
  [/^wall-/, { width: 1400, q: 74 }],
  [/^ceiling-/, { width: 1280, q: 76 }],
  [/^wash-/, { width: 1500, q: 82 }],
  [/^easy-/, { width: 1400, q: 84 }],
  [/^encyc-/, { width: 1000, q: 78 }],
  [/^hero-mural-bg$/, { width: 1400, q: 74 }],
  [/^cave-floor$/, { width: 1600, q: 80 }],
];

function ruleFor(name) {
  for (const [re, cfg] of RULES) if (re.test(name)) return cfg;
  return null;
}

let before = 0;
let after = 0;
let thumbTotal = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Windows file locks (servers, AV) occasionally block writes briefly. */
async function writeWithRetry(file, buf, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      fs.writeFileSync(file, buf);
      return;
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(350 * (i + 1));
    }
  }
}

for (const file of files) {
  const src = path.join(PUB, file);
  const meta = await sharp(src, { limitInputPixels: false }).metadata();
  before += meta.size ?? fs.statSync(src).size;

  try {
    const cfg = ruleFor(file);
    if (cfg && meta.width > cfg.width * 1.05) {
      const out = await sharp(src, { limitInputPixels: false })
        .resize({ width: cfg.width, withoutEnlargement: true })
        .webp({ quality: cfg.q, effort: 6 })
        .toBuffer();
      await writeWithRetry(src, out);
      console.log(
        `${file.padEnd(28)} ${Math.round((meta.size ?? 0) / 1024)}KB -> ${Math.round(out.length / 1024)}KB`
      );
    }

    // 640px thumb (unless the source is already tiny)
    if (meta.width > 700) {
      const thumb = await sharp(src, { limitInputPixels: false })
        .resize({ width: 640, withoutEnlargement: true })
        .webp({ quality: 70, effort: 6 })
        .toBuffer();
      await writeWithRetry(path.join(PUB, `thumb-${file}`), thumb);
      thumbTotal += thumb.length;
    }
  } catch (e) {
    console.log(`SKIP ${file}: ${String(e.message).slice(0, 60)}`);
  }
}

for (const f of fs.readdirSync(PUB)) {
  if (f.endsWith('.webp') && !f.startsWith('thumb-')) after += fs.statSync(path.join(PUB, f)).size;
}

console.log(`\nmedia: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB  (+${(thumbTotal / 1024 / 1024).toFixed(1)} MB thumbs)`);
