import fs from "node:fs";
let s = fs.readFileSync("scripts/optimize-media.mjs", "utf8");
s = s.replace("    fs.writeFileSync(src, out);", "    await writeWithRetry(src, out);");
s = s.replace("    fs.writeFileSync(path.join(PUB, `thumb-${file}`), thumb);", "    await writeWithRetry(path.join(PUB, `thumb-${file}`), thumb);");
fs.writeFileSync("scripts/optimize-media.mjs", s, "utf8");
console.log("patched");
