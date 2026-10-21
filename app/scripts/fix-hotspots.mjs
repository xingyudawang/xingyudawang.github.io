// Fix deep-zoom hotspot coordinates so the markers sit on the described content.
// The originals were rough guesses; these are derived from each wall's actual
// composition (registers, narrative direction) per the Digital Dunhuang
// descriptions.
import fs from 'node:fs';

const p = 'src/data/dunhuangData.ts';
let s = fs.readFileSync(p, 'utf8');

const setPos = (id, x, y) => {
  const re = new RegExp(`(id: '${id}',\\s*\\n\\s*x: )\\d+(\\.\\d+)?(,\\s*\\n\\s*y: )\\d+(\\.\\d+)?`);
  if (!re.test(s)) throw new Error('hotspot not found: ' + id);
  s = s.replace(re, `$1${x}$3${y}`);
};

// ---- mural-deer: west wall of 257; the jataka scroll runs in the lower band,
//      reading from both ends toward the centre (deer at the climax) ---------
setPos('hs-deer-1', 58, 66);
setPos('hs-deer-2', 76, 64);
setPos('hs-deer-3', 22, 66);

// ---- mural-tigress: south wall of 254; sacrifice upper-left, tigers centre,
//      mourning + stupa to the right ------------------------------------------
setPos('hs-tigress-1', 50, 60);
setPos('hs-tigress-2', 30, 32);
setPos('hs-tigress-3', 76, 58);

// ---- mural-xiwangmu: south wall of 249; top band = celestial musicians,
//      apsaras beside the central preaching assembly --------------------------
setPos('hs-xwm-1', 50, 16);
setPos('hs-xwm-2', 35, 34);

// ---- mural-bandits: south wall of 285; story runs left -> right -------------
setPos('hs-bandit-1', 18, 50);
setPos('hs-bandit-2', 45, 52);
setPos('hs-bandit-3', 82, 48);

// ---- mural-threehares: retarget the mural to the actual caisson scan -------
s = s.replace(
  "id: 'mural-threehares',\n    caveNumber: '第420窟',",
  "id: 'mural-threehares',\n    caveNumber: '第420窟',"
);
s = s.replace(
  "    imageUrl: media('mural-cave-420.webp'),\n    detailUrl: media('detail-cave-420.webp'),\n    lineArtUrl: media('wash-threehares.webp'),\n    scanSize: '22601 × 17467 px',",
  "    imageUrl: media('ceiling-cave-420.webp'),\n    detailUrl: media('encyc-caisson.webp'),\n    lineArtUrl: media('wash-threehares.webp'),\n    scanSize: '4108 × 3887 px',"
);
setPos('hs-hares-1', 50, 46);
setPos('hs-hares-2', 50, 82);

// ---- mural-apsara: south wall of 320; the four apsaras survive in the
//      UPPER part of the wall, paired left and right of centre ---------------
setPos('hs-apsara-1', 36, 17);
setPos('hs-apsara-2', 64, 19);

// ---- mural-beauty: south wall of 57; central assembly, donor row at bottom --
setPos('hs-beauty-1', 40, 40);
setPos('hs-beauty-2', 35, 86);
setPos('hs-beauty-3', 78, 55);

// ---- mural-pipa: south wall of 112; the music-dance scene is in the lower
//      part of the sutra illustration ----------------------------------------
setPos('hs-pipa-1', 50, 66);
setPos('hs-pipa-2', 20, 68);

// ---- mural-library: north wall of 17; west tree left, east tree right ------
setPos('hs-library-1', 28, 55);
setPos('hs-library-2', 72, 55);

// ---- mural-vimalakirti: east wall of 220; Vimalakirti left, Manjusri side
//      (with the emperor procession) right, around the doorway ----------------
setPos('hs-vk-1', 78, 58);
setPos('hs-vk-2', 20, 35);

// ---- mural-wutai: west wall of 61; map centred on the terraces -------------
setPos('hs-wt-1', 40, 30);
setPos('hs-wt-2', 60, 66);
setPos('hs-wt-3', 28, 52);

// ---- mural-amitayus: north wall of 217; Pure Land centre, 16 contemplations
//      EAST (right), unborn resentment WEST (left) + bottom -------------------
setPos('hs-am-1', 50, 42);
setPos('hs-am-2', 74, 56);
setPos('hs-am-3', 26, 66);

// ---- mural-zhangqian: north wall of 323; episodes run west -> east ----------
setPos('hs-zq-1', 20, 50);
setPos('hs-zq-2', 45, 52);
setPos('hs-zq-3', 75, 50);

// ---- mural-lotusapsara: caisson of 329; wheel at the centre, one apsara
//      directly above it ------------------------------------------------------
setPos('hs-la-1', 50, 50);
setPos('hs-la-2', 50, 20);

// ---- mural-sahasrabhuja: faces at the top of the figure --------------------
setPos('hs-sh-1', 50, 28);

fs.writeFileSync(p, s, 'utf8');
console.log('hotspot coordinates updated');
