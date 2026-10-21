// Build the site's single digital-human portrait (妙音) and the personal seal
// emblem, both cropped from authentic Dunhuang scans.
import sharp from 'sharp';
import fs from 'node:fs';

const PUB = '../media';

async function portrait(srcFile, destFile, box, size) {
  const src = `${PUB}/${srcFile}`;
  const meta = await sharp(src, { limitInputPixels: false }).metadata();
  const left = Math.round(box.left * meta.width);
  const top = Math.round(box.top * meta.height);
  const w = Math.round(box.width * meta.width);
  const h = Math.round(box.height * meta.height);

  const cropped = await sharp(src, { limitInputPixels: false })
    .extract({ left, top, width: w, height: h })
    .resize({ width: size, height: size, fit: 'cover', position: 'attention' })
    .modulate({ saturation: 1.05, brightness: 1.03 })
    .webp({ quality: 88, effort: 5 })
    .toBuffer();

  fs.writeFileSync(`${PUB}/${destFile}`, cropped);
  console.log(`${destFile.padEnd(20)} ${size}x${size}  ${Math.round(cropped.length / 1024)} KB  (from ${srcFile} ${w}x${h})`);
  return cropped.length;
}

// 妙音 — cropped from the Avalokitesvara figure on the south wall of Cave 57,
// the cave nicknamed 美人窟 for exactly this face.
let total = 0;
total += await portrait(
  'mural-cave-57.webp',
  'guide-avatar.webp',
  { left: 0.30, top: 0.13, width: 0.24, height: 0.24 },
  512
);

// A second, tighter take in case the first crop lands on drapery rather than the face.
total += await portrait(
  'detail-cave-57.webp',
  'guide-avatar-alt.webp',
  { left: 0.24, top: 0.20, width: 0.52, height: 0.52 },
  512
);

// Personal seal: the centre of the three-hares caisson — abstract, not a person.
total += await portrait(
  'ceiling-cave-420.webp',
  'seal-emblem.webp',
  { left: 0.16, top: 0.16, width: 0.68, height: 0.68 },
  320
);

console.log(`\n${(total / 1024).toFixed(0)} KB total`);
