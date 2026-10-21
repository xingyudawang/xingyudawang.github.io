// Build a proper colouring sheet from a real mural:
// desaturate → posterise into flat tonal regions → draw the region boundaries as
// black contours. Flat regions are what flood-fill needs; the contours are what
// the (genuine) painted edges actually are.
import sharp from 'sharp';
import fs from 'node:fs';

const PUB = 'public/media';
const SRC = (f) => `${PUB}/${f}`;

async function save(buf, dest, width, quality = 84) {
  const meta = await sharp(buf, { limitInputPixels: false }).metadata();
  const o = await sharp(buf, { limitInputPixels: false })
    .resize({ width: Math.min(width, meta.width), withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer();
  fs.writeFileSync(`${PUB}/${dest}`, o);
  console.log(`${dest.padEnd(28)} ${String(Math.round(o.length / 1024)).padStart(5)} KB`);
  return o.length;
}

async function colouringSheet(srcFile, destFile, opts = {}) {
  const { width = 1500, levels = 6, lineDark = 70 } = opts;
  const src = SRC(srcFile);
  if (!fs.existsSync(src)) {
    console.log('missing', srcFile);
    return 0;
  }

  // flatten pigment grain so posterisation produces clean regions
  const { data, info } = await sharp(src, { limitInputPixels: false })
    .greyscale()
    .resize({ width: 1700, withoutEnlargement: true })
    .blur(1.6)
    .normalise()
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const q = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    q[i] = Math.min(levels - 1, Math.round((data[i] / 255) * (levels - 1)));
  }

  // region boundaries: neighbour label differs, or a strong local gradient
  const isLine = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const right = x + 1 < w ? q[i + 1] : q[i];
      const down = y + 1 < h ? q[i + w] : q[i];
      if (Math.abs(q[i] - right) >= 1 || Math.abs(q[i] - down) >= 1) isLine[i] = 1;
    }
  }

  // dilate once so contours read as drawn lines rather than single pixels
  const dil = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!isLine[i]) continue;
      dil[i] = 1;
      if (x > 0) dil[i - 1] = 1;
      if (x + 1 < w) dil[i + 1] = 1;
      if (y > 0) dil[i - w] = 1;
      if (y + 1 < h) dil[i + w] = 1;
    }
  }

  const rgb = Buffer.alloc(w * h * 3);
  let ink = 0;
  for (let i = 0; i < w * h; i++) {
    if (dil[i]) {
      ink++;
      rgb[i * 3] = 42;
      rgb[i * 3 + 1] = 32;
      rgb[i * 3 + 2] = 26;
    } else {
      // light warm greys: darker tonal step = slightly darker paper tone
      const t = q[i] / (levels - 1); // 0 dark .. 1 light
      const base = 250 - (1 - t) * 46;
      rgb[i * 3] = Math.round(base);
      rgb[i * 3 + 1] = Math.round(base * 0.96);
      rgb[i * 3 + 2] = Math.round(base * 0.88);
    }
  }

  console.log(
    `  ${srcFile} -> ink ${((ink / (w * h)) * 100).toFixed(1)}% (${w}x${h})`
  );
  void lineDark;

  const png = await sharp(rgb, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
  return save(png, destFile, width, 86);
}

let total = 0;
const sheet = [
  ['mural-cave-257.webp', 'lineart-deer.webp', 6],
  ['mural-cave-254.webp', 'lineart-tigress.webp', 6],
  ['mural-cave-249.webp', 'lineart-xiwangmu.webp', 6],
  ['mural-cave-285.webp', 'lineart-bandits.webp', 6],
  ['ceiling-cave-420.webp', 'lineart-threehares.webp', 5],
  ['mural-cave-320.webp', 'lineart-apsara.webp', 6],
  ['mural-cave-57.webp', 'lineart-beauty.webp', 6],
  ['mural-cave-112.webp', 'lineart-pipa.webp', 6],
  ['mural-cave-17.webp', 'lineart-library.webp', 6],
];

for (const [src, dest, levels] of sheet) {
  total += await colouringSheet(src, dest, { levels });
}
console.log(`\n${(total / 1024 / 1024).toFixed(2)} MB`);
