const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Referer": "https://www.e-dunhuang.com/" };
async function tryShow(cave, b) {
  const url = `https://www.e-dunhuang.com/showmural/10.0001/0001/0001/${cave}/0001/${b}/01`;
  const r = await fetch(url, { headers: UA });
  if (!r.ok) return { url, status: r.status };
  const t = await r.text();
  const p = t.match(/var\s+path\s*=\s*"([^"]+)"/);
  if (!p) return { url, status: r.status, path: null };
  const dzi = p[1].replace(/^\/\//, "https://") + "index.dzi";
  const dr = await fetch(dzi, { headers: UA });
  const xml = await dr.text();
  const w = xml.match(/Width="(\d+)"/)?.[1];
  const h = xml.match(/Height="(\d+)"/)?.[1];
  return { url, status: r.status, w, h };
}
(async () => {
  for (const cave of ["0407","0096","0158","0254","0320","0420","0112","0057","0017","0257"]) {
    const out = [];
    for (const b of ["0002","0003","0004","0008"]) {
      const r = await tryShow(cave, b);
      if (r.w) out.push(`${b}:${r.w}x${r.h}`);
    }
    console.log(cave, out.length ? out.join("  ") : "NO DZI");
  }
})();
