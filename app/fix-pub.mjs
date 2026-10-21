import fs from "node:fs";
for (const f of ["scripts/fetch-assets.mjs", "scripts/derive-assets.mjs"]) {
  let s = fs.readFileSync(f, "utf8");
  s = s.replace("const PUB = path.join('public', 'media');", "const PUB = path.join('..', 'media'); // the repo's single media/ folder");
  fs.writeFileSync(f, s, "utf8");
  console.log(f, "PUB ->", s.match(/const PUB[^;]*;/)?.[0]);
}
