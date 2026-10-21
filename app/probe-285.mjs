const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Referer": "https://www.e-dunhuang.com/" };
(async () => {
  const r = await fetch("https://285.e-dunhuang.com/", { headers: UA });
  const t = await r.text();
  console.log(t.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/\s+/g, " ").slice(0, 1500));
  console.log("\n--- asset refs ---");
  const refs = [...new Set([...t.matchAll(/(?:src|href|url)\s*[=:]\s*["']([^"']+)["']/g)].map(m => m[1]))];
  console.log(refs.slice(0, 40));
})();
