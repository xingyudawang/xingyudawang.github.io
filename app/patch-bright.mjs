import fs from "node:fs";
let s = fs.readFileSync("src/data/caveScenes.ts", "utf8");
// add brightness to the naturally dark caves (北魏 murals are soot-darkened)
const patches = [
  ["    caveId: 'cave-254',", "    caveId: 'cave-254',\n    brightness: 1.32,"],
  ["    caveId: 'cave-257',", "    caveId: 'cave-257',\n    brightness: 1.14,"],
  ["    caveId: 'cave-17',", "    caveId: 'cave-17',\n    brightness: 1.12,"],
];
for (const [from, to] of patches) {
  if (!s.includes(to)) s = s.replace(from, to);
}
fs.writeFileSync("src/data/caveScenes.ts", s, "utf8");
console.log("brightness entries:", (s.match(/brightness:/g) || []).length);
