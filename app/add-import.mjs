import fs from "node:fs";
let c = fs.readFileSync("src/components/CavePanorama.tsx", "utf8");
if (!c.includes("GuideAvatar")) { throw new Error("expected usage"); }
if (!c.includes("./GuideAvatar")) {
  c = c.replace(
    "import { CaveEngine, type SpotProjection } from '../three/CaveEngine';",
    "import { CaveEngine, type SpotProjection } from '../three/CaveEngine';\nimport { GuideAvatar, GuideLine } from './GuideAvatar';"
  );
}
fs.writeFileSync("src/components/CavePanorama.tsx", c, "utf8");
console.log("import ok:", c.includes("./GuideAvatar"));
