// Regenerate the workshop colouring bases in a MUCH simpler form:
//  - each template is a crop focused on ONE classic subject (not a whole wall)
//  - heavy blur + rank filter + only 2-3 tonal levels -> a handful of big flat
//    shapes, so one tap of 填色 covers a huge area
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const PUB = '../media';

async function easyBase(srcFile, destFile, opts = {}) {
  const { width = 1200, levels = 3, blur = 14, median = 15, box } = opts;
  const src = path.join(PUB, srcFile);
  if (!fs.existsSync(src)) {
    console.log('missing', srcFile);
    return;
  }

  let pipe = sharp(src, { limitInputPixels: false });
  if (box) {
    const meta = await sharp(src, { limitInputPixels: false }).metadata();
    const left = Math.max(0, Math.round(box.left * meta.width));
    const top = Math.max(0, Math.round(box.top * meta.height));
    const w = Math.round(box.width * meta.width);
    const h = Math.round(box.height * meta.height);
    pipe = pipe.extract({ left, top, width: Math.min(w, meta.width - left), height: Math.min(h, meta.height - top) });
  }

  const { data, info } = await pipe
    .greyscale()
    .resize({ width, withoutEnlargement: true })
    .blur(blur)
    .median(median)
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

  // count regions for a sanity check
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
  const top3 = compSizes.slice(0, 3).reduce((a, b) => a + b, 0) / total;

  const tones = [
    [244, 238, 222],
    [226, 214, 192],
    [204, 188, 162],
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
  console.log(
    `${destFile.padEnd(26)} ${String(Math.round(out.length / 1024)).padStart(5)} KB  regions=${compSizes.length} largest=${(largest * 100).toFixed(0)}% top3=${(top3 * 100).toFixed(0)}%`
  );
}

// one classic subject per template, cropped from the real scan
await easyBase('mural-cave-257.webp', 'easy-deer.webp', {
  box: { left: 0.30, top: 0.42, width: 0.42, height: 0.44 },
});
await easyBase('ceiling-cave-420.webp', 'easy-threehares.webp', { levels: 3 });
await easyBase('mural-cave-112.webp', 'easy-pipa.webp', {
  box: { left: 0.28, top: 0.34, width: 0.46, height: 0.5 },
});
await easyBase('mural-cave-320.webp', 'easy-apsara.webp', {
  box: { left: 0.26, top: 0.04, width: 0.5, height: 0.34 },
});
await easyBase('mural-cave-57.webp', 'easy-beauty.webp', {
  box: { left: 0.24, top: 0.16, width: 0.5, height: 0.56 },
});
await easyBase('mural-cave-3.webp', 'easy-sahasrabhuja.webp', {
  box: { left: 0.14, top: 0.1, width: 0.72, height: 0.76 },
  levels: 3,
});
await easyBase('mural-cave-254.webp', 'easy-tigress.webp', {
  box: { left: 0.2, top: 0.1, width: 0.6, height: 0.55 },
  levels: 2,
});
