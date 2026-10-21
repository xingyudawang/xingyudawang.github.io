// Derive extra web assets from the authentic wall scans (edge-extracted line art,
// portrait and detail crops). No generative models are used here.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUB = path.join('public', 'media');
const SRC = (f) => path.join(PUB, f);

async function save(buf, dest, width, quality = 82) {
  const meta = await sharp(buf, { limitInputPixels: false }).metadata();
  const o = await sharp(buf, { limitInputPixels: false })
    .resize({ width: Math.min(width, meta.width), withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer();
  fs.writeFileSync(path.join(PUB, dest), o);
  console.log(`${dest.padEnd(30)} ${String(Math.round(o.length / 1024)).padStart(5)} KB`);
  return o.length;
}

/**
 * Isolate the painter's contour lines from a painted wall.
 *
 * Classical image processing, not generation: flatten the pigment grain with a
 * light blur, run a Laplacian kernel (which responds only where tone changes
 * abruptly — i.e. at drawn contours), invert, threshold, and clean up speckle.
 * Because the lines come from the original brushwork, the result reads like the
 * painter's own underdrawing.
 */
async function lineArt(srcFile, destFile, width = 1500) {
  const src = SRC(srcFile);
  if (!fs.existsSync(src)) {
    console.log('missing', srcFile);
    return 0;
  }

  const flat = await sharp(src, { limitInputPixels: false })
    .greyscale()
    .resize({ width: 2200, withoutEnlargement: true })
    .blur(1.0)
    .linear(1.4, -34)
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = flat;
  const raw = { width: info.width, height: info.height, channels: 1 };

  const edge = await sharp(data, { raw, limitInputPixels: false })
    .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
    .raw()
    .toBuffer();

  const lines = await sharp(edge, { raw, limitInputPixels: false })
    .negate()
    .threshold(200)
    .median(1)
    .blur(0.5)
    .linear(1.3, -26)
    .toColourspace('srgb')
    .png()
    .toBuffer();

  // composite black lines over warm paper
  const composed = await sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 3,
      background: { r: 239, g: 227, b: 206 },
    },
    limitInputPixels: false,
  })
    .composite([{ input: lines, blend: 'multiply' }])
    .png()
    .toBuffer();

  return save(composed, destFile, width, 86);
}

async function crop(srcFile, destFile, box, width, quality = 84) {
  const src = SRC(srcFile);
  if (!fs.existsSync(src)) {
    console.log('missing', srcFile);
    return 0;
  }
  const meta = await sharp(src, { limitInputPixels: false }).metadata();
  const left = Math.max(0, Math.min(meta.width - 2, Math.round(box.left * meta.width)));
  const top = Math.max(0, Math.min(meta.height - 2, Math.round(box.top * meta.height)));
  const w = Math.max(2, Math.min(meta.width - left, Math.round(box.width * meta.width)));
  const h = Math.max(2, Math.min(meta.height - top, Math.round(box.height * meta.height)));
  const buf = await sharp(src, { limitInputPixels: false })
    .extract({ left, top, width: w, height: h })
    .toBuffer();
  return save(buf, destFile, width, quality);
}

let total = 0;

console.log('--- colouring templates ---');
total += await lineArt('mural-cave-257.webp', 'lineart-deer.webp');
total += await lineArt('mural-cave-254.webp', 'lineart-tigress.webp');
total += await lineArt('mural-cave-249.webp', 'lineart-xiwangmu.webp');
total += await lineArt('mural-cave-285.webp', 'lineart-bandits.webp');
total += await lineArt('ceiling-cave-420.webp', 'lineart-threehares.webp');
total += await lineArt('mural-cave-320.webp', 'lineart-apsara.webp');
total += await lineArt('mural-cave-57.webp', 'lineart-beauty.webp');
total += await lineArt('mural-cave-112.webp', 'lineart-pipa.webp');
total += await lineArt('mural-cave-17.webp', 'lineart-library.webp');

console.log('--- portrait ---');
total += await crop('mural-cave-57.webp', 'avatar-guide.webp',
  { left: 0.30, top: 0.14, width: 0.26, height: 0.26 }, 480);

console.log('--- encyclopedia stills ---');
total += await crop('ceiling-cave-420.webp', 'encyc-caisson.webp',
  { left: 0.1, top: 0.1, width: 0.8, height: 0.8 }, 1200);
total += await crop('wall-cave-420-n.webp', 'encyc-lapis.webp',
  { left: 0.05, top: 0.3, width: 0.32, height: 0.32 }, 1200);
total += await crop('wall-cave-320-s.webp', 'encyc-cinnabar.webp',
  { left: 0.55, top: 0.25, width: 0.32, height: 0.32 }, 1200);
total += await crop('mural-cave-112.webp', 'encyc-pipa.webp',
  { left: 0.34, top: 0.3, width: 0.32, height: 0.36 }, 1200);
total += await crop('wall-cave-285-e.webp', 'encyc-guardian.webp',
  { left: 0.28, top: 0.26, width: 0.36, height: 0.4 }, 1200);

console.log('--- hero band ---');
{
  const meta = await sharp(SRC('mural-cave-320.webp'), { limitInputPixels: false }).metadata();
  const h = Math.round(meta.height * 0.55);
  const buf = await sharp(SRC('mural-cave-320.webp'), { limitInputPixels: false })
    .extract({ left: 0, top: Math.round(meta.height * 0.1), width: meta.width, height: h })
    .toBuffer();
  total += await save(buf, 'hero-mural-bg.webp', 1800, 78);
}

console.log(`\nderived ${(total / 1024 / 1024).toFixed(2)} MB`);
