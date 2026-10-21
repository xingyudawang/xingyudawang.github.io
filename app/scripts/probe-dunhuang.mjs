// Probe the Digital Dunhuang (数字敦煌) CDN for usable stills.
import sharp from 'sharp';

const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  Referer: 'https://www.e-dunhuang.com/',
};

async function probe(path) {
  const url = `https://cdn.e-dunhuang.com/SOURCES/${path}`;
  try {
    const r = await fetch(url, { headers: UA });
    const ct = r.headers.get('content-type') || '';
    if (!ct.startsWith('image/')) return { path, status: r.status, ct };
    const buf = Buffer.from(await r.arrayBuffer());
    const meta = await sharp(buf).metadata();
    return { path, status: r.status, w: meta.width, h: meta.height, kb: Math.round(buf.length / 1024) };
  } catch (e) {
    return { path, err: e.message };
  }
}

const candidates = [];
for (const cave of ['0257', '0112', '0057', '0017', '0254', '0420', '0320', '0322', '0303', '0061']) {
  for (const sec of ['02', '03', '04', '05']) {
    candidates.push(`10.0001/0001/0001/${cave}/${sec}/1/1.jpg`);
  }
}

const results = [];
for (const c of candidates) {
  const r = await probe(c);
  results.push(r);
  if (r.w) console.log(`${c}  ${r.w}x${r.h}  ${r.kb}KB`);
}
console.log('\nOK count:', results.filter((r) => r.w).length, '/', results.length);
