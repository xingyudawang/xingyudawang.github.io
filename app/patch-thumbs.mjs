import fs from "node:fs";

// ProfileScreen: favourites cards use thumbs
let p = fs.readFileSync("src/components/ProfileScreen.tsx", "utf8");
p = p.replace(
  "import { media } from '../lib/media';",
  "import { media, thumb } from '../lib/media';"
);
p = p.replace(
  'src={m.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover"',
  'src={thumb(m.imageUrl)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover"'
);
fs.writeFileSync("src/components/ProfileScreen.tsx", p, "utf8");
console.log("profile:", p.includes("thumb(m.imageUrl)"));

// PuzzleScreen: board background uses the thumb (640px is plenty for 672px board)
let q = fs.readFileSync("src/components/PuzzleScreen.tsx", "utf8");
q = q.replace(
  "import { tapFeedback, confirmFeedback } from '../lib/haptics';",
  "import { thumb } from '../lib/media';\nimport { tapFeedback, confirmFeedback } from '../lib/haptics';"
);
q = q.replace(
  "backgroundImage: `url(${mural.imageUrl})`",
  "backgroundImage: `url(${thumb(mural.imageUrl)})`"
);
fs.writeFileSync("src/components/PuzzleScreen.tsx", q, "utf8");
console.log("puzzle:", q.includes("thumb(mural.imageUrl)"));
