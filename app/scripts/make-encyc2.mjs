// Crop the new encyclopedia stills from the authentic wall scans.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const PUB = '../media';

async function crop(srcFile, destFile, box, width = 1000, quality = 78) {
  const src = path.join(PUB, srcFile);
  if (!fs.existsSync(src)) {
    console.log('missing', srcFile);
    return 0;
  }
  const meta = await sharp(src, { limitInputPixels: false }).metadata();
  const left = Math.max(0, Math.min(meta.width - 4, Math.round(box.left * meta.width)));
  const top = Math.max(0, Math.min(meta.height - 4, Math.round(box.top * meta.height)));
  const w = Math.max(4, Math.min(meta.width - left, Math.round(box.width * meta.width)));
  const h = Math.max(4, Math.min(meta.height - top, Math.round(box.height * meta.height)));
  const buf = await sharp(src, { limitInputPixels: false })
    .extract({ left, top, width: w, height: h })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer();
  fs.writeFileSync(path.join(PUB, destFile), buf);
  console.log(`${destFile.padEnd(26)} ${String(Math.round(buf.length / 1024)).padStart(5)} KB`);
  return buf.length;
}

let total = 0;
total += await crop('mural-cave-217.webp', 'encyc2-malachite.webp', { left: 0.28, top: 0.32, width: 0.4, height: 0.4 });
total += await crop('mural-cave-57.webp', 'encyc2-gold.webp', { left: 0.32, top: 0.18, width: 0.3, height: 0.3 });
total += await crop('mural-cave-320.webp', 'encyc2-apsara.webp', { left: 0.3, top: 0.08, width: 0.4, height: 0.3 });
total += await crop('mural-cave-257.webp', 'encyc2-deer.webp', { left: 0.36, top: 0.42, width: 0.36, height: 0.36 });
total += await crop('mural-cave-323.webp', 'encyc2-zhangqian.webp', { left: 0.2, top: 0.3, width: 0.55, height: 0.4 });
total += await crop('ceiling-cave-257.webp', 'encyc2-cave.webp', { left: 0.1, top: 0.1, width: 0.8, height: 0.7 });
total += await crop('detail-cave-249.webp', 'encyc2-technique.webp', { left: 0.15, top: 0.15, width: 0.7, height: 0.7 });
total += await crop('mural-cave-61.webp', 'encyc2-digital.webp', { left: 0.32, top: 0.26, width: 0.4, height: 0.4 });
total += await crop('wall-cave-254-n.webp', 'encyc2-wei.webp', { left: 0.3, top: 0.26, width: 0.4, height: 0.4 });

console.log(`\n${(total / 1024 / 1024).toFixed(2)} MB`);
