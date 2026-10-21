// Process the generated deer mascot into the floating corner character:
// analyse the render (brightness/colour), trim to a circle medallion so it
// blends with the site's dark background.
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = '../gen-mascot/deer-mascot.png';
const PUB = '../media';

const meta = await sharp(SRC, { limitInputPixels: false }).metadata();
console.log('generated:', meta.width + 'x' + meta.height);

const stats = await sharp(SRC, { limitInputPixels: false }).stats();
console.log(
  'channels:',
  stats.channels.map((c) => Math.round(c.mean)).join(',')
);

const S = 640;

// crop centre square, circular mask + warm vignette
const mask = Buffer.from(
  `<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="#fff"/></svg>`
);
const vignette = Buffer.from(
  `<svg width="${S}" height="${S}"><defs><radialGradient id="v" cx="50%" cy="50%" r="65%">
     <stop offset="60%" stop-color="#000" stop-opacity="0"/>
     <stop offset="100%" stop-color="#000" stop-opacity="0.45"/></radialGradient></defs>
   <rect width="${S}" height="${S}" fill="url(#v)"/></svg>`
);

const square = await sharp(SRC, { limitInputPixels: false })
  .resize(S, S, { fit: 'cover', position: 'centre' })
  .toBuffer();

const out = await sharp(square)
  .composite([{ input: vignette, blend: 'over' }])
  .composite([{ input: mask, blend: 'dest-in' }])
  .webp({ quality: 88, effort: 6 })
  .toBuffer();

fs.writeFileSync(`${PUB}/deer-mascot.webp`, out);
console.log('deer-mascot.webp', Math.round(out.length / 1024) + 'KB');
