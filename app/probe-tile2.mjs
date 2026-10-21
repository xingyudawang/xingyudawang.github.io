const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Referer": "https://www.e-dunhuang.com/" };
(async () => {
  const base = "https://cdn.e-dunhuang.com/SOURCES/resources/10.0001/0001/0001/0257/0001/0002/01/9";
  const t0 = Date.now();
  const r = await fetch(`${base}/index_files/12/0_0.jpg`, { headers: UA, signal: AbortSignal.timeout(20000) });
  const b = await r.arrayBuffer();
  console.log("tile12/0_0", r.status, r.headers.get("content-type"), (b.byteLength/1024).toFixed(0)+"KB", (Date.now()-t0)+"ms");
  const t1 = Date.now();
  const r2 = await fetch(`${base}/index_files/12/1_0.jpg`, { headers: UA, signal: AbortSignal.timeout(20000) });
  const b2 = await r2.arrayBuffer();
  console.log("tile12/1_0", r2.status, (b2.byteLength/1024).toFixed(0)+"KB", (Date.now()-t1)+"ms");
})();
