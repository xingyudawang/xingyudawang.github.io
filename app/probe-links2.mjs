const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Referer": "https://www.e-dunhuang.com/" };
(async () => {
  const r = await fetch("https://www.e-dunhuang.com/index.htm", { headers: UA });
  const html = await r.text();
  const hrefs = [...new Set([...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]))];
  console.log("--- index hrefs with showmural/panorama ---");
  console.log(hrefs.filter(h => /showmural|panorama|720|pano/i.test(h)));
  console.log("--- nav ---");
  console.log(hrefs.filter(h => h.startsWith("/") && h.length < 30));
})();
