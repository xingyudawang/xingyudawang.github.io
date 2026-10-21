// Work out the tile pyramid layout used by the Digital Dunhuang mural viewer.
const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
  Referer: 'https://www.e-dunhuang.com/',
};

const base = 'https://cdn.e-dunhuang.com/SOURCES/resources/10.0001/0001/0001/0257/0001/0004/01/9';
const patterns = [
  `${base}/index.dzi`,
  `${base}/index_files/index.dzi`,
  `${base}/index_files/9/0_0.jpg`,
  `${base}/index_files/8/0_0.jpg`,
  `${base}/index_files/0/0_0.jpg`,
  `${base}/index_files/TileGroup0/0-0-0.jpg`,
  `${base}/index_files/9/0_0.jpeg`,
  `${base}/index_files/index.xml`,
  `${base}/index_files/preview.jpg`,
  `${base}/index_files/9/1_1.jpg`,
  `${base}/9/0_0.jpg`,
  `${base}/0/0_0.jpg`,
];

for (const url of patterns) {
  try {
    const r = await fetch(url, { headers: UA });
    const ct = r.headers.get('content-type') || '';
    const len = r.headers.get('content-length');
    let extra = '';
    if (ct.includes('xml') || ct.includes('json') || ct.includes('text')) {
      const t = await r.text();
      extra = ' | ' + t.slice(0, 160).replace(/\s+/g, ' ');
    } else {
      await r.arrayBuffer();
    }
    console.log(String(r.status).padEnd(4), ct.padEnd(24), String(len).padStart(8), url.replace(base, '…'), extra);
  } catch (e) {
    console.log('ERR ', url.replace(base, '…'), e.message.slice(0, 50));
  }
}
