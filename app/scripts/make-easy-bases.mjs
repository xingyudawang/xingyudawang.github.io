// Build "easy" colouring bases for the workshop.
//
// The previous base was the raw desaturated mural — every brushstroke of the
// original texture still there, so painting it felt like restoring a photo.
// These bases keep the mural's true composition but posterise it into a handful
// of large flat regions (heavy blur + rank filter + 4-level quantisation, no
// boundary lines). Flood-fill then covers whole areas in one tap, which is what
// makes the workshop feel easy instead of intimidating.
import sharp from 'sharp';
import fs from 'node:fs';

const PUB = '../media';

async function easyBase(srcFile, destFile, width = 1400, levels = 4) {
  const src = `${PUB}/${srcFile}`;
  if (!fs.existsSync(src)) {
    console.log('missing', srcFile);
    return 0;
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

  // label grid for component statistics
  const labels = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    labels[i] = Math.min(levels - 1, Math.floor((data[i] / 255) * levels));
  }

  // connected components per label (4-connectivity), just to report region size
  const seen = new Uint8Array(total);
  const compSizes = [];
  const stack = new Int32Array(total);
  for (let start = 0; start < total; start++) {
    if (seen[start]) continue;
    const label = labels[start];
    seen[start] = 1;
    let sp = 0;
    let size = 0;
    stack[sp++] = start;
    while (sp > 0) {
      const idx = stack[--sp];
      size++;
      const x = idx % w;
      const y = (idx / w) | 0;
      if (x > 0 && !seen[idx - 1] && labels[idx - 1] === label) { seen[idx - 1] = 1; stack[sp++] = idx - 1; }
      if (x + 1 < w && !seen[idx + 1] && labels[idx + 1] === label) { seen[idx + 1] = 1; stack[sp++] = idx + 1; }
      if (y > 0 && !seen[idx - w] && labels[idx - w] === label) { seen[idx - w] = 1; stack[sp++] = idx - w; }
      if (y + 1 < h && !seen[idx + w] && labels[idx + w] === label) { seen[idx + w] = 1; stack[sp++] = idx + w; }
    }
    compSizes.push(size);
  }

  compSizes.sort((a, b) => b - a);
  const largest = compSizes[0] / total;
  const top5 = compSizes.slice(0, 5).reduce((a, b) => a + b, 0) / total;

  // warm, clearly-differentiable but still pale "plaster" tones
  const tones = [
    [244, 238, 222], // lightest
    [228, 218, 198],
    [208, 194, 170],
    [186, 170, 144], // darkest paper tone
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
  fs.writeFileSync(`${PUB}/${destFile}`, out);
  console.log(
    `${destFile.padEnd(26)} ${String(Math.round(out.length / 1024)).padStart(5)} KB  regions=${compSizes.length} largest=${(largest * 100).toFixed(0)}% top5=${(top5 * 100).toFixed(0)}%`
  );
  return out.length;
}

let total = 0;
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
for (const [src, dest] of list) total += await easyBase(src, dest);
console.log(`\n${(total / 1024 / 1024).toFixed(2)} MB`);
