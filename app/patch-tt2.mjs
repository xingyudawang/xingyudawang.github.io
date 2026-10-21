import fs from "node:fs";
const p = "scripts/touch-test.mjs";
let s = fs.readFileSync(p, "utf8");
if (!s.includes("hide markers")) {
  s = s.replace(
    "await send('Page.navigate', { url: `${BASE}/#/vr?cave=cave-257` });\nawait sleep(5000);",
    "await send('Page.navigate', { url: `${BASE}/#/vr?cave=cave-257` });\nawait sleep(5000);\n// hide projected hotspot markers so a swipe can never land on a button\nawait evaluate(`[...document.querySelectorAll('.animate-hotspot')].forEach(b => b.style.display = 'none')`);"
  );
  fs.writeFileSync(p, s, "utf8");
  console.log("patched:", s.includes("hide markers"));
}
