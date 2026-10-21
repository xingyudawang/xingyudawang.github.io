import fs from "node:fs";
const p = "tsconfig.json";
const t = JSON.parse(fs.readFileSync(p, "utf8"));
t.compilerOptions.types = ["vite/client"];
t.include = ["src"];
fs.writeFileSync(p, JSON.stringify(t, null, 2) + "\n", "utf8");
console.log(JSON.stringify(t.compilerOptions.types), JSON.stringify(t.include));
