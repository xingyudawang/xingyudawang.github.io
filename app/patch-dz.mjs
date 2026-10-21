import fs from "node:fs";
let s = fs.readFileSync("src/components/DeepZoomGallery.tsx", "utf8");
if (!s.includes("import { thumb")) {
  s = s.replace(
    "import { useGestures } from '../lib/useGestures';",
    "import { useGestures } from '../lib/useGestures';\nimport { thumb } from '../lib/media';"
  );
}
fs.writeFileSync("src/components/DeepZoomGallery.tsx", s, "utf8");
console.log("thumb import:", s.includes("import { thumb }"));
