import fs from "node:fs";
let s = fs.readFileSync("scripts/guide-check.mjs", "utf8");
s = s.replaceAll("http://127.0.0.1:4173", "https://xingyudawang.github.io");
fs.writeFileSync("scripts/guide-check-live.mjs", s, "utf8");
console.log("written");
