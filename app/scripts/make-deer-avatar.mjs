// Rebuild the digital-human avatar as the Nine-Colored Deer, cropped from the
// real Deer King Jataka on the west wall of Cave 257 (same source as all other
// imagery — no generated art). Attention-based framing picks the busiest part
// of the band, which is where the deer and its branching antlers are.
import sharp from 'sharp';
import fs from 'node:fs';

const PUB = '../media';
const SRC = `${PUB}/mural-cave-257.webp`;

const meta = await sharp(SRC, { limitInputPixels: false }).metadata();
console.log('source:', meta.width + 'x' + meta.height);

// the narrative band sits in the lower-middle of the wall scan
const box = {
  left: Math.round(meta.width * 0.28),
  top: Math.round(meta.height * 0.38),
  width: Math.round(meta.width * 0.44),
  height: Math.round(meta.height * 0.5),
};

const S = 512;

// warm vignette + circular mask, same treatment as the previous medallion
const vignette = Buffer.from(
  `<svg width="${S}" height="${S}"><defs><radialGradient id="v" cx="50%" cy="46%" r="62%">
     <stop offset="55%" stop-color="#000" stop-opacity="0"/>
     <stop offset="100%" stop-color="#000" stop-opacity="0.55"/></radialGradient></defs>
   <rect width="${S}" height="${S}" fill="url(#v)"/></svg>`
);
const mask = Buffer.from(
  `<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="#fff"/></svg>`
);

const cropped = await sharp(SRC, { limitInputPixels: false })
  .extract(box)
  .resize(S, S, { fit: 'cover', position: 'attention' })
  .modulate({ saturation: 1.05, brightness: 1.05 })
  .toBuffer();

const out = await sharp(cropped)
  .composite([{ input: vignette, blend: 'over' }])
  .composite([{ input: mask, blend: 'dest-in' }])
  .webp({ quality: 90, effort: 6 })
  .toBuffer();

fs.writeFileSync(`${PUB}/guide-deer-avatar.webp`, out);
console.log('guide-deer-avatar.webp', Math.round(out.length / 1024) + 'KB');

// a wider, rectangular "portrait" for the narration card (keeps the whole deer)
const wide = await sharp(SRC, { limitInputPixels: false })
  .extract(box)
  .resize(720, 480, { fit: 'cover', position: 'attention' })
  .modulate({ saturation: 1.05, brightness: 1.05 })
  .webp({ quality: 88, effort: 6 })
  .toBuffer();
fs.writeFileSync(`${PUB}/guide-deer-card.webp`, wide);
console.log('guide-deer-card.webp', Math.round(wide.length / 1024) + 'KB');
