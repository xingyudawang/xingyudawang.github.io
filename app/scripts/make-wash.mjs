// Build the "prepared wall" base used by the colouring workshop: the real mural,
// desaturated and lifted so it reads as uncoloured plaster waiting for pigment.
// This is what flood-fill samples against, so it uses the painting's own tonal
// regions rather than invented lines.
import sharp from 'sharp';
import fs from 'node:fs';

const PUB = 'public/media';

async function wash(srcFile, destFile, width = 1500) {
  const src = `${PUB}/${srcFile}`;
  if (!fs.existsSync(src)) {
    console.log('missing', srcFile);
    return 0;
  }
  const buf = await sharp(src, { limitInputPixels: false })
    .resize({ width, withoutEnlargement: true })
    .modulate({ saturation: 0.12, brightness: 1.06 })
    .linear(0.72, 62) // compress contrast toward paper
    .tint({ r: 246, g: 236, b: 216 })
    .webp({ quality: 84, effort: 5 })
    .toBuffer();
  fs.writeFileSync(`${PUB}/${destFile}`, buf);
  console.log(`${destFile.padEnd(28)} ${String(Math.round(buf.length / 1024)).padStart(5)} KB`);
  return buf.length;
}

let total = 0;
const list = [
  ['mural-cave-257.webp', 'wash-deer.webp'],
  ['mural-cave-254.webp', 'wash-tigress.webp'],
  ['mural-cave-249.webp', 'wash-xiwangmu.webp'],
  ['mural-cave-285.webp', 'wash-bandits.webp'],
  ['ceiling-cave-420.webp', 'wash-threehares.webp'],
  ['mural-cave-320.webp', 'wash-apsara.webp'],
  ['mural-cave-57.webp', 'wash-beauty.webp'],
  ['mural-cave-112.webp', 'wash-pipa.webp'],
  ['mural-cave-17.webp', 'wash-library.webp'],
];

for (const [src, dest] of list) total += await wash(src, dest);

// remove the abandoned edge-based templates
for (const f of fs.readdirSync(PUB)) {
  if (f.startsWith('lineart-')) {
    fs.unlinkSync(`${PUB}/${f}`);
    console.log('removed', f);
  }
}

console.log(`\n${(total / 1024 / 1024).toFixed(2)} MB`);
