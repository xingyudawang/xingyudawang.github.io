const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Referer": "https://www.e-dunhuang.com/" };
async function tryShow(cave, b) {
  const url = `https://www.e-dunhuang.com/showmural/10.0001/0001/0001/${cave}/0001/${b}/01`;
  const r = await fetch(url, { headers: UA });
  if (!r.ok) return null;
  const t = await r.text();
  const p = t.match(/var\s+path\s*=\s*"([^"]+)"/);
  if (!p) return null;
  const base = p[1].replace(/^\/\//, "https://").replace(/index_files\/$/, "");
  const dr = await fetch(base + "index.dzi", { headers: UA });
  const xml = await dr.text();
  const w = xml.match(/Width="(\d+)"/)?.[1];
  const h = xml.match(/Height="(\d+)"/)?.[1];
  return w ? { w: Number(w), h: Number(h), base, b } : null;
}
(async () => {
  for (const cave of ["0407","0096","0158","0254","0320","0420","0112","0057","0017","0257","0249","0285"]) {
    const out = [];
    for (const b of ["0002","0003","0004","0005","0006","0007","0008"]) {
      const r = await tryShow(cave, b).catch(() => null);
      if (r) out.push(`${b}:${r.w}x${r.h}`);
    }
    console.log(cave, out.length ? out.join("  ") : "none");
  }
})();
