import fs from "node:fs";
const p = "src/components/CavePanorama.tsx";
let c = fs.readFileSync(p, "utf8");
c = c.replace(
  "import { GuideAvatar, GuideLine } from './GuideAvatar';",
  "import { GuideAvatar, guideCard, guideName, guideRole } from './GuideAvatar';"
);
fs.writeFileSync(p, c, "utf8");
console.log("import:", c.includes("guideCard"));
