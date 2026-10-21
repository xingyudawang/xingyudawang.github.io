import fs from "node:fs";
const p = "src/data/dunhuangData.ts";
let s = fs.readFileSync(p, "utf8");
s = s.replace(
  "  description: Record<string, string>;\n  wallType: 'square' | 'domed' | 'inverted-funnel' | 'central-pillar' | 'great-hall';",
  "  description: Record<string, string>;\n  wallType?: 'square' | 'domed' | 'inverted-funnel' | 'central-pillar' | 'great-hall';"
);
fs.writeFileSync(p, s, "utf8");

const q = "src/components/CavePanorama.tsx";
let c = fs.readFileSync(q, "utf8");
c = c.replace(/loc\(spot\.narration, language\)/g, "narrationFor(spot, language)");
c = c.replace(
  "import {\n  CAVE_SCENES,\n  getCaveScene,\n  loc,\n  type CaveScene,\n  type Spot,\n} from '../data/caveScenes';",
  "import {\n  CAVE_SCENES,\n  getCaveScene,\n  loc,\n  narrationFor,\n  type CaveScene,\n  type Spot,\n} from '../data/caveScenes';"
);
fs.writeFileSync(q, c, "utf8");
console.log("narrationFor uses:", (c.match(/narrationFor\(/g) || []).length);
console.log("import added:", c.includes("narrationFor,"));
