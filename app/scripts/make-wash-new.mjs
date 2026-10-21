// Generate the "prepared wall" colouring bases for the six new murals, and
// repair detail-cave-329 (a 0-byte file caused by cropping a small square scan).
import sharp from 'sharp';
import fs from 'node:fs';

const PUB = '../media';

async function wash(srcFile, destFile, width = 1500) {
  const src = `${PUB}/${srcFile}`;
  if (!fs.existsSync(src)) {
    console.log('missing', srcFile);
    return 0;
  }
  const buf = await sharp(src, { limitInputPixels: false })
    .resize({ width, withoutEnlargement: true })
    .modulate({ saturation: 0.12, brightness: 1.06 })
    .linear(0.72, 62)
    .tint({ r: 246, g: 236, b: 216 })
    .webp({ quality: 84, effort: 5 })
    .toBuffer();
  fs.writeFileSync(`${PUB}/${destFile}`, buf);
  console.log(`${destFile.padEnd(26)} ${String(Math.round(buf.length / 1024)).padStart(5)} KB`);
  return buf.length;
}

let total = 0;
total += await wash('mural-cave-220.webp', 'wash-vimalakirti.webp');
total += await wash('mural-cave-61.webp', 'wash-wutai.webp');
total += await wash('mural-cave-217.webp', 'wash-amitayus.webp');
total += await wash('mural-cave-323.webp', 'wash-zhangqian.webp');
total += await wash('mural-cave-3.webp', 'wash-sahasrabhuja.webp');
total += await wash('mural-cave-329.webp', 'wash-lotusapsara.webp');

// ---- repair detail-cave-329 -------------------------------------------
{
  const src = `${PUB}/mural-cave-329.webp`;
  const meta = await sharp(src, { limitInputPixels: false }).metadata();
  // the caisson scan is only 3610px wide; take a large central square at native size
  const size = Math.round(Math.min(meta.width, meta.height) * 0.8);
  const left = Math.round((meta.width - size) / 2);
  const top = Math.round((meta.height - size) / 2);
  const crop = await sharp(src, { limitInputPixels: false })
    .extract({ left, top, width: size, height: size })
    .resize({ width: 2000 })
    .webp({ quality: 84, effort: 5 })
    .toBuffer();
  fs.writeFileSync(`${PUB}/detail-cave-329.webp`, crop);
  console.log(`detail-cave-329.webp${''.padEnd(7)} ${String(Math.round(crop.length / 1024)).padStart(5)} KB (regenerated)`);
  total += crop.length;
}

console.log(`\n${(total / 1024 / 1024).toFixed(2)} MB`);
