import fs from "node:fs";
let c = fs.readFileSync("src/components/DeepZoomGallery.tsx", "utf8");
if (!c.includes("./GuideAvatar")) {
  c = c.replace(
    "import { useApp } from '../context/AppContext';",
    "import { useApp } from '../context/AppContext';\nimport { GuideAvatar } from './GuideAvatar';"
  );
}
fs.writeFileSync("src/components/DeepZoomGallery.tsx", c, "utf8");
console.log("import ok:", c.includes("./GuideAvatar"));
