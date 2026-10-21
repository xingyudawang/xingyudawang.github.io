// Inspect the Digital Dunhuang mural viewer for high-resolution asset paths.
import sharp from 'sharp';

const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
  Referer: 'https://www.e-dunhuang.com/',
};

async function getText(url) {
  const r = await fetch(url, { headers: UA });
  return { status: r.status, text: await r.text(), headers: r.headers };
}

const pages = [
  'https://www.e-dunhuang.com/showmural/10.0001/0001/0001/0023/0001/0004/01',
  'https://www.e-dunhuang.com/showmural/10.0001/0001/0001/0257/0001/0004/01',
];

for (const p of pages) {
  console.log('\n=====', p);
  const { status, text } = await getText(p);
  console.log('status', status, 'len', text.length);
  const sources = [...text.matchAll(/cdn\.e-dunhuang\.com\/([^"'\s)]+)/g)].map((m) => m[1]);
  console.log('cdn refs:', [...new Set(sources)].slice(0, 20));
  const vars = [...text.matchAll(/var\s+(\w+)\s*=\s*([^\n;]{0,200})/g)].slice(0, 40);
  for (const v of vars) {
    if (/basic|ssss|SOURCES|path|url|tile|image|img/i.test(v[1] + v[2])) {
      console.log('  VAR', v[1], '=', v[2].trim().slice(0, 150));
    }
  }
}
