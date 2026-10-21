// Probe Bing image search for real, large photos of the artworks we need.
import sharp from 'sharp';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36';

const HEADERS = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

async function searchImages(query, count = 35) {
  const url = `https://cn.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=${count}&qft=+filterui:imagesize-large&form=IRFLTR`;
  const r = await fetch(url, { headers: HEADERS });
  const html = await r.text();
  // each result carries an escaped JSON blob in the `m` attribute
  const out = [];
  for (const m of html.matchAll(/m="(\{[^"]*?\})"/g)) {
    const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    try {
      const j = JSON.parse(raw);
      if (j.murl) out.push({ murl: j.murl, t: j.t || '', w: j.mw, h: j.mh });
    } catch {
      /* ignore malformed */
    }
  }
  return out;
}

async function measure(url) {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12000);
    const r = await fetch(url, { headers: { ...HEADERS, Referer: new URL(url).origin + '/' }, signal: ctl.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    const ct = r.headers.get('content-type') || '';
    if (!ct.startsWith('image/')) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 20000) return null;
    const meta = await sharp(buf).metadata();
    return { w: meta.width, h: meta.height, kb: Math.round(buf.length / 1024), buf };
  } catch {
    return null;
  }
}

const queries = process.argv.slice(2);
for (const q of queries.length ? queries : ['莫高窟 九色鹿 壁画']) {
  console.log('\n=== ' + q + ' ===');
  const results = await searchImages(q);
  console.log('found', results.length, 'candidates');
  for (const r of results.slice(0, 12)) {
    console.log(`  ${String(r.w).padStart(5)}x${String(r.h).padEnd(5)} ${r.murl.slice(0, 110)}`);
  }
}

// measure the first few of the last query as a sanity check
if (process.env.MEASURE) {
  const results = await searchImages(queries[0] ?? '莫高窟 九色鹿 壁画');
  let ok = 0;
  for (const r of results.slice(0, 10)) {
    const m = await measure(r.murl);
    if (m) {
      ok++;
      console.log(`  measured ${m.w}x${m.h} ${m.kb}KB  ${r.murl.slice(0, 90)}`);
    } else {
      console.log(`  unreachable       ${r.murl.slice(0, 90)}`);
    }
  }
  console.log('reachable', ok, '/ 10');
}
