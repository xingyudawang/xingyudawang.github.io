import fs from "node:fs";
const p = "scripts/touch-test.mjs";
let s = fs.readFileSync(p, "utf8");
if (!s.includes("warm-up")) {
  s = s.replace(
    "/* ---------------- 1. 360° panorama: horizontal swipe rotates the view ------- */\nawait send('Page.navigate', { url: `${BASE}/#/vr?cave=cave-257` });",
    "/* ---------------- 1. 360° panorama: horizontal swipe rotates the view ------- */\n// warm-up: same-origin hop so the harness evaluates in the right context\nawait send('Page.navigate', { url: `${BASE}/` });\nawait sleep(2500);\nawait send('Page.navigate', { url: `${BASE}/#/vr?cave=cave-257` });"
  );
  fs.writeFileSync(p, s, "utf8");
  console.log("patched:", s.includes("warm-up"));
} else {
  console.log("already patched");
}
