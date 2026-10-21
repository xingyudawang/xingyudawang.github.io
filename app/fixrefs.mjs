import fs from "node:fs";
const p = "src/data/dunhuangData.ts";
let s = fs.readFileSync(p, "utf8");
const before = (s.match(/lineart-/g) || []).length;
s = s.replace(/media\('lineart-([a-z]+)\.webp'\)/g, "media('wash-$1.webp')");
fs.writeFileSync(p, s, "utf8");
const after = (s.match(/lineart-/g) || []).length;
console.log("replaced", before, "-> remaining", after);

const p2 = "src/data/caveScenes.ts";
let c = fs.readFileSync(p2, "utf8");
c = c.replace("media('wall-cave-17-e.webp'),", "media('wall-cave-17-n.webp'),");
c = c.replace("media('wall-cave-17-s.webp'),", "media('wall-cave-17-w.webp'),");
fs.writeFileSync(p2, c, "utf8");
console.log("cave-17 walls fixed:", !c.includes("wall-cave-17-e"), !c.includes("wall-cave-17-s"));
