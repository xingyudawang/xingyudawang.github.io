const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Referer": "https://www.e-dunhuang.com/" };
(async () => {
  const r = await fetch("https://www.e-dunhuang.com/cave/10.0001/0001.0001.0257", { headers: UA });
  const html = await r.text();
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  console.log("--- showmural/section/mural hrefs ---");
  console.log([...new Set(hrefs.filter(h => /showmural|mural|section|panorama|720/i.test(h)))]);
  console.log("--- all internal hrefs (unique, 40) ---");
  console.log([...new Set(hrefs.filter(h => h.startsWith("/")))].slice(0, 40));
})();
