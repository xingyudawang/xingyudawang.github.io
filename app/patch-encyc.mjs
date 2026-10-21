import fs from "node:fs";
let s = fs.readFileSync("src/data/dunhuangData.ts", "utf8");
const map = [
  ["image: media('encyc-lapis.webp'),", "image: media('encyc-lapis.webp'),\n    zoomImage: media('wall-cave-420-n.webp'),"],
  ["image: media('encyc-cinnabar.webp'),", "image: media('encyc-cinnabar.webp'),\n    zoomImage: media('wall-cave-320-s.webp'),"],
  ["image: media('encyc-pipa.webp'),", "image: media('encyc-pipa.webp'),\n    zoomImage: media('mural-cave-112.webp'),"],
  ["image: media('encyc-guardian.webp'),", "image: media('encyc-guardian.webp'),\n    zoomImage: media('wall-cave-285-e.webp'),"],
];
for (const [a, b] of map) { if (!s.includes(b)) s = s.replace(a, b); }

const videos = `
/* =========================================================================
   Videos
   Educational videos from Bilibili (click-to-play embeds; verified live via
   the Bilibili API at build time).
   ========================================================================= */

export interface VideoItem {
  id: string;
  bvid: string;
  title: Record<string, string>;
  duration: string;
  up: string;
  cover: string;
}

export const VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    bvid: 'BV1WfnL66E8w',
    title: {
      zh: '从张骞凿空到数字敦煌：10分钟看懂莫高窟与藏经洞的命运',
      en: 'From Zhang Qian to Digital Dunhuang: Mogao and the Library Cave in 10 Minutes',
    },
    duration: '11分钟',
    up: '武舅姥爷',
    cover: 'https://i0.hdslb.com/bfs/archive/f14024b47a54330458fea0726f50c408967ff1f2.jpg',
  },
  {
    id: 'v2',
    bvid: 'BV1vgjyzGEqW',
    title: {
      zh: '观敦煌 · 见自在：一把钥匙通天下佛门',
      en: 'Reading Dunhuang: One Key to All Buddhist Art',
    },
    duration: '22分钟',
    up: '三希雪堂',
    cover: 'https://i0.hdslb.com/bfs/archive/a040d6a44fa45071fcecda9b595a52257a51b1a4.jpg',
  },
  {
    id: 'v3',
    bvid: 'BV1HE421P7ur',
    title: {
      zh: '敦煌研究院 · 带你云游敦煌',
      en: 'Dunhuang Academy: A Virtual Tour of Dunhuang',
    },
    duration: '186分钟',
    up: '青鬓醉朝阳',
    cover: 'https://i2.hdslb.com/bfs/archive/ce20c91a9de03c65b479545c17ad66b761d240cc.jpg',
  },
  {
    id: 'v4',
    bvid: 'BV1V14y117qy',
    title: {
      zh: '央视纪录片《敦煌》全10集',
      en: 'CCTV Documentary: Dunhuang (All 10 Episodes)',
    },
    duration: '408分钟',
    up: '壹贰叁Kiki',
    cover: 'https://i2.hdslb.com/bfs/archive/8f0ba84b71792e346bcff76a906c9a9a0e524d9d.png',
  },
];
`;
s = s.trimEnd() + "\n" + videos;
fs.writeFileSync("src/data/dunhuangData.ts", s, "utf8");
console.log("zoomImage count:", (s.match(/zoomImage:/g) || []).length, "| VIDEOS:", s.includes("export const VIDEOS"));
