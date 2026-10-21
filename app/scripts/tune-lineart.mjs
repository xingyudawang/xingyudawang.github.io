// Tune line-art extraction with a hand-rolled Sobel gradient (sharp's convolve
// clips negative values, which destroys a Laplacian).
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = process.argv[2] ?? 'public/media/mural-cave-112.webp';

function sobel(gray, w, h) {
  const g = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const tl = gray[i - w - 1], t = gray[i - w], tr = gray[i - w + 1];
      const l = gray[i - 1], r = gray[i + 1];
      const bl = gray[i + w - 1], b = gray[i + w], br = gray[i + w + 1];
      const gx = -tl - 2 * l - bl + tr + 2 * r + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      g[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return g;
}

function percentile(arr, p) {
  const step = Math.max(1, Math.floor(arr.length / 400000));
  const sample = [];
  for (let i = 0; i < arr.length; i += step) sample.push(arr[i]);
  sample.sort((a, b) => a - b);
  return sample[Math.floor(sample.length * p)] ?? 0;
}

async function run({ width = 1600, blur = 1.4, k = 2.2, darkness = 92, label, out }) {
  const { data, info } = await sharp(SRC, { limitInputPixels: false })
    .greyscale()
    .resize({ width, withoutEnlargement: true })
    .blur(blur)
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const gray = data;
  const grad = sobel(gray, w, h);
  const p85 = percentile(grad, 0.85);
  // reference scale: strong edges sit well above this
  const cut = Math.max(6, p85 * k);

  const out3 = Buffer.alloc(w * h * 3);
  let ink = 0;
  for (let i = 0; i < w * h; i++) {
    const isEdge = grad[i] > cut;
    const isDark = gray[i] < darkness;
    const on = isEdge || isDark;
    if (on) ink++;
    // black line on warm paper
    const v = on ? 30 : 239;
    out3[i * 3] = on ? 26 : 239;
    out3[i * 3 + 1] = on ? 20 : 227;
    out3[i * 3 + 2] = on ? 16 : 206;
    if (v < 0) break;
  }

  const buf = await sharp(out3, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
  console.log(
    `${label.padEnd(34)} ${w}x${h} p85=${p85.toFixed(1)} cut=${cut.toFixed(1)} ink=${((ink / (w * h)) * 100).toFixed(2)}%  ${Math.round(buf.length / 1024)}KB`
  );
  if (out) fs.writeFileSync(out, buf);
  return ink / (w * h);
}

for (const [k, dark] of [[1.6, 90], [2.0, 90], [2.4, 90], [1.2, 80], [1.6, 70], [1.0, 60], [0.8, 60]]) {
  await run({ k, darkness: dark, label: `k=${k} dark=${dark}` });
}
await run({ k: 1.2, darkness: 80, label: 'chosen', out: 'assets-src/lineart-try.png' });
