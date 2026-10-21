const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Referer": "https://www.e-dunhuang.com/" };
(async () => {
  for (const u of ["https://285.e-dunhuang.com/", "https://www.e-dunhuang.com/pano.htm", "https://www.e-dunhuang.com/panorama.htm", "https://www.e-dunhuang.com/720.htm"]) {
    try {
      const r = await fetch(u, { headers: UA });
      const t = await r.text();
      console.log(u, "->", r.status, t.length);
      if (r.ok && t.length > 1000) {
        const refs = [...new Set([...t.matchAll(/(?:cdn\.e-dunhuang\.com\/[^"'\s)]+|href="(\/[^"]+)")/g)].map(m => m[1] || m[0]))];
        console.log("   refs:", refs.slice(0, 15));
      }
    } catch (e) { console.log(u, "ERR", e.message.slice(0, 40)); }
  }
})();
