import fs from "node:fs";
const p = "tsconfig.json";
let t = JSON.parse(fs.readFileSync(p, "utf8"));
t.compilerOptions.types = ["vite/client", "node"];
fs.writeFileSync(p, JSON.stringify(t, null, 2) + "\n", "utf8");
console.log("types:", t.compilerOptions.types);
