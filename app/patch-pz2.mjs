import fs from "node:fs";
let s = fs.readFileSync("src/components/PuzzleScreen.tsx", "utf8");
s = s.replace("backgroundImage: `url(${thumb(mural.imageUrl)})`", "backgroundImage: `url(${boardSrc})`");
if (!s.includes("import { thumb } from '../lib/media';")) {
  s = s.replace("import { tapFeedback, confirmFeedback } from '../lib/haptics';", "import { thumb } from '../lib/media';\nimport { tapFeedback, confirmFeedback } from '../lib/haptics';");
}
fs.writeFileSync("src/components/PuzzleScreen.tsx", s, "utf8");
console.log("boardSrc:", s.includes("url(${boardSrc})"), "| thumb import:", s.includes("thumb"));
