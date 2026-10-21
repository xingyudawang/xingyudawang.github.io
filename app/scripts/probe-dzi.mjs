// Read the Deep Zoom descriptor and map the tile pyramid.
import sharp from 'sharp';

const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
  Referer: 'https://www.e-dunhuang.com/',
};

const base = 'https://cdn.e-dunhuang.com/SOURCES/resources/10.0001/0001/0001/0257/0001/0004/01/9';

const r = await fetch(`${base}/index.dzi`, { headers: UA });
const buf = Buffer.from(await r.arrayBuffer());
console.log('--- index.dzi ---');
console.log(buf.toString('utf8').trim());
console.log('bytes:', buf.length);

// inspect a few tiles for size
for (const p of ['0/0_0.jpg', '1/0_0.jpg', '4/0_0.jpg', '8/0_0.jpg', '9/0_0.jpg']) {
  const tr = await fetch(`${base}/index_files/${p}`, { headers: UA });
  const ct = tr.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) {
    console.log(p, '->', tr.status, ct);
    continue;
  }
  const b = Buffer.from(await tr.arrayBuffer());
  const meta = await sharp(b).metadata();
  console.log(p, '->', `${meta.width}x${meta.height}`, Math.round(b.length / 1024) + 'KB');
}

// how many tiles per level?
for (let level = 0; level <= 12; level++) {
  const found = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const tr = await fetch(`${base}/index_files/${level}/${col}_${row}.jpg`, {
        headers: UA,
        method: 'HEAD',
      });
      if ((tr.headers.get('content-type') || '').startsWith('image/')) found.push(`${col}_${row}`);
    }
  }
  console.log(`level ${level}: ${found.length} tiles`, found.length ? found.slice(0, 8).join(' ') : '');
  if (!found.length && level > 0) break;
}
