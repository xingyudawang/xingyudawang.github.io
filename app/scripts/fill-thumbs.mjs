// Generate ONLY the missing 640px thumbs (idempotent, skip-on-lock).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const PUB = '../media';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function writeWithRetry(file, buf, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      fs.writeFileSync(file, buf);
      return true;
    } catch {
      await sleep(300 * (i + 1));
    }
  }
  return false;
}

let made = 0;
let skipped = 0;
for (const f of fs.readdirSync(PUB).filter((x) => x.endsWith('.webp') && !x.startsWith('thumb-'))) {
  const thumbPath = path.join(PUB, `thumb-${f}`);
  if (fs.existsSync(thumbPath)) continue;
  const meta = await sharp(path.join(PUB, f), { limitInputPixels: false }).metadata();
  if (meta.width <= 700) continue;
  const buf = await sharp(path.join(PUB, f), { limitInputPixels: false })
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 70, effort: 6 })
    .toBuffer();
  if (await writeWithRetry(thumbPath, buf)) {
    made++;
    console.log(`thumb-${f}  ${Math.round(buf.length / 1024)}KB`);
  } else {
    skipped++;
    console.log(`LOCKED thumb-${f}`);
  }
}
console.log(`\nmade ${made}, skipped ${skipped}`);
