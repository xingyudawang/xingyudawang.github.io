const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Referer": "https://www.e-dunhuang.com/" };
(async () => {
  const r = await fetch("https://www.e-dunhuang.com/cave/10.0001/0001.0001.0257", { headers: UA });
  const html = await r.text();
  const i = html.indexOf("ssss");
  console.log(html.slice(Math.max(0, i - 3000), i + 1200));
})();
