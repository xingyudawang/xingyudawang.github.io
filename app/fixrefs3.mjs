import fs from "node:fs";
const q = "src/components/CavePanorama.tsx";
let c = fs.readFileSync(q, "utf8");
c = c.replace(/loc\(activeSpot\.narration, language\)/g, "narrationFor(activeSpot, language)");
c = c.replace(/loc\(spot\.narration, language\)/g, "narrationFor(spot, language)");
fs.writeFileSync(q, c, "utf8");
console.log("remaining bad refs:", (c.match(/loc\([a-zA-Z.]*\.narration/g) || []).length);
