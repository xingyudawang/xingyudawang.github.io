// Restore the previous-generation colouring bases (v2): whole-wall images,
// posterised to 4 tonal levels. These are the versions the workshop used before
// the "single-subject crop" simplification.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const PUB = '../media';

async function easyBase(srcFile, destFile, width = 1400, levels = 4) {
  const src = path.join(PUB, srcFile);
  if (!fs.existsSync(src)) {
    console.log('missing', srcFile);
    return;
  }

  const { data, info } = await sharp(src, { limitInputPixels: false })
    .greyscale()
    .resize({ width, withoutEnlargement: true })
    .blur(7)
    .median(9)
    .normalise()
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const total = w * h;
  const labels = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    labels[i] = Math.min(levels - 1, Math.floor((data[i] / 255) * levels));
  }

  const tones = [
    [244, 238, 222],
    [228, 218, 198],
    [208, 194, 170],
    [186, 170, 144],
  ];

  const rgb = Buffer.alloc(total * 3);
  for (let i = 0; i < total; i++) {
    const t = tones[labels[i]];
    rgb[i * 3] = t[0];
    rgb[i * 3 + 1] = t[1];
    rgb[i * 3 + 2] = t[2];
  }

  const png = await sharp(rgb, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
  const out = await sharp(png, { limitInputPixels: false }).webp({ quality: 86, effort: 5 }).toBuffer();
  fs.writeFileSync(path.join(PUB, destFile), out);
  console.log(`${destFile.padEnd(26)} ${String(Math.round(out.length / 1024)).padStart(5)} KB`);
}

const list = [
  ['mural-cave-257.webp', 'easy-deer.webp'],
  ['mural-cave-254.webp', 'easy-tigress.webp'],
  ['ceiling-cave-420.webp', 'easy-threehares.webp'],
  ['mural-cave-320.webp', 'easy-apsara.webp'],
  ['mural-cave-112.webp', 'easy-pipa.webp'],
  ['mural-cave-57.webp', 'easy-beauty.webp'],
  ['mural-cave-220.webp', 'easy-vimalakirti.webp'],
  ['mural-cave-61.webp', 'easy-wutai.webp'],
  ['mural-cave-3.webp', 'easy-sahasrabhuja.webp'],
  ['mural-cave-329.webp', 'easy-lotusapsara.webp'],
];

for (const [src, dest] of list) await easyBase(src, dest);
console.log('v2 bases restored');
