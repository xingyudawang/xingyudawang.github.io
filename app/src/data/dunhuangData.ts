import { media } from '../lib/media';

/* =========================================================================
   Content model
   ========================================================================= */

export interface Hotspot {
  id: string;
  /** position inside the mural image, 0-100 (%) */
  x: number;
  y: number;
  title: Record<string, string>;
  description: Record<string, string>;
  detailHighlight?: string;
}

export interface Mural {
  id: string;
  caveNumber: string;
  title: Record<string, string>;
  dynasty: Record<string, string>;
  eraPeriod: string;
  category: 'jataka' | 'apsara' | 'bodhisattva' | 'caisson' | 'buddha' | 'music' | 'sutra';
  /** physical size of the painted surface where known */
  dimensions: string;
  imageUrl: string;
  detailUrl: string;
  lineArtUrl: string;
  description: Record<string, string>;
  story: Record<string, string>;
  artisticValue: Record<string, string>;
  pigments: string[];
  hotspots: Hotspot[];
  audioGuide: {
    duration: string;
    transcripts: Record<string, string>;
  };
  /** original scan size from the Digital Dunhuang archive */
  scanSize?: string;
}

export interface Cave {
  id: string;
  number: string;
  name: Record<string, string>;
  dynasty: Record<string, string>;
  era: string;
  coverImage: string;
  cliffLevel: string;
  tags: string[];
  highlightMuralId: string;
  description: Record<string, string>;
  wallType?: 'square' | 'domed' | 'inverted-funnel' | 'central-pillar' | 'great-hall';
  /** one-line hook shown on cards */
  hook: Record<string, string>;
}

export interface EncyclopediaEntry {
  id: string;
  category: 'pigment' | 'dynasty' | 'instrument' | 'preservation' | 'figure' | 'craft';
  title: Record<string, string>;
  subtitle: Record<string, string>;
  summary: Record<string, string>;
  content: Record<string, string[]>;
  image: string;
  attributes?: Record<string, string>;
}

/* =========================================================================
   Caves
   All imagery is stitched from the official Digital Dunhuang (数字敦煌)
   Deep Zoom archive published by the Dunhuang Academy.
   ========================================================================= */

export const CAVES: Cave[] = [
  {
    id: 'cave-257',
    number: '第257窟',
    name: { zh: '九色鹿本生窟', en: 'Deer King Jātaka Cave' },
    dynasty: { zh: '北魏', en: 'Northern Wei' },
    era: '公元5世纪',
    coverImage: media('mural-cave-257.webp'),
    cliffLevel: '中层崖壁 · 中心塔柱窟',
    tags: ['九色鹿', '连环画祖型', '中心塔柱', '人字披顶'],
    highlightMuralId: 'mural-deer',
    hook: { zh: '一条横卷，把一部经讲成了电影', en: 'One scroll that turns a sutra into cinema' },
    description: {
      zh: '莫高窟北魏经典。西壁中层以横卷式连环画绘《九色鹿王本生》，故事自两端向中央推进；南壁并存《沙弥守戒自杀因缘》。窟顶前部为人字披，后部平棋顶，中央立方形中心塔柱，四面开龛。',
      en: 'A canonical Northern Wei cave. The west wall carries the Deer King Jātaka as a continuous scroll unfolding from both ends toward the centre, while the south wall holds the story of the monk who died to keep his vow. A gabled ceiling fronts a coffered rear, with a square central pillar opening into niches on four sides.',
    },
  },
  {
    id: 'cave-254',
    number: '第254窟',
    name: { zh: '萨埵太子舍身饲虎窟', en: 'Cave of the Prince Who Fed the Tigress' },
    dynasty: { zh: '北魏', en: 'Northern Wei' },
    era: '公元5世纪',
    coverImage: media('mural-cave-254.webp'),
    cliffLevel: '中层崖壁 · 中心塔柱窟',
    tags: ['舍身饲虎', '尸毗王', '降魔变', '白衣佛'],
    highlightMuralId: 'mural-tigress',
    hook: { zh: '北魏最惨烈的一次慈悲', en: 'The most brutal act of compassion in Northern Wei art' },
    description: {
      zh: '北魏中心塔柱窟的代表。南壁绘《萨埵太子舍身饲虎》，把刺颈、投崖、饲虎、起塔等多个瞬间压进同一幅画面；北壁绘《尸毗王割肉贸鸽》；西壁千佛中央有保存完好的白衣佛一铺。',
      en: 'A masterpiece of the central-pillar form. The south wall compresses several moments of the prince\'s self-sacrifice — the cut throat, the leap, the tigress feeding, the raising of the stupa — into a single image. The north wall shows King Sibi trading his own flesh for a dove, and a well-preserved White-Robed Buddha sits among the thousand Buddhas of the west wall.',
    },
  },
  {
    id: 'cave-249',
    number: '第249窟',
    name: { zh: '西王母东王公窟', en: 'Cave of the Queen Mother of the West' },
    dynasty: { zh: '西魏', en: 'Western Wei' },
    era: '公元6世纪',
    coverImage: media('mural-cave-249.webp'),
    cliffLevel: '上层崖壁 · 覆斗顶窟',
    tags: ['西王母', '东王公', '阿修罗王', '天宫伎乐'],
    highlightMuralId: 'mural-xiwangmu',
    hook: { zh: '汉地神仙，飞进了佛窟的穹顶', en: 'Chinese immortals take flight on a Buddhist ceiling' },
    description: {
      zh: '西魏覆斗顶窟。窟顶四披不是佛国而是中国上古神话的天空：南披西王母乘凤车，北披东王公乘龙车，西披阿修罗王四目四臂手托日月，还有雷神、飞廉、羽人、朱雀往来其间。这是佛教东传途中与汉文化最深的一次握手。',
      en: 'A Western Wei cave whose ceiling has been given over not to Buddhist heavens but to ancient Chinese cosmology: the Queen Mother of the West riding a phoenix, the King Father of the East in a dragon chariot, the four-eyed four-armed Asura holding sun and moon, with thunder gods, winged feilían and vermilion birds crossing between them.',
    },
  },
  {
    id: 'cave-285',
    number: '第285窟',
    name: { zh: '五百强盗成佛窟', en: 'Cave of the Five Hundred Bandits' },
    dynasty: { zh: '西魏', en: 'Western Wei' },
    era: '公元538–539年',
    coverImage: media('mural-cave-285.webp'),
    cliffLevel: '上层崖壁 · 禅窟群主室',
    tags: ['五百强盗', '伏羲女娲', '禅窟', '有纪年'],
    highlightMuralId: 'mural-bandits',
    hook: { zh: '莫高窟唯一有确切纪年的西魏洞窟', en: 'The only securely dated Western Wei cave at Mogao' },
    description: {
      zh: '莫高窟少数有明确纪年的洞窟之一。南壁通壁画《五百强盗成佛因缘》：五百人造反、被剜眼、流放山林、闻佛说法而复明出家。窟顶四披绘伏羲女娲、雷神、飞廉与山居禅僧，佛与汉地神祇同处一顶。',
      en: 'One of the few Mogao caves with a firm date. The south wall runs the full length of the story of five hundred bandits: their revolt, the blinding, exile in the mountains, and the recovery of sight and ordination after hearing the Buddha teach. On the ceiling slopes Fuxi and Nüwa, the thunder god and winged spirits share the vault with meditating monks.',
    },
  },
  {
    id: 'cave-420',
    number: '第420窟',
    name: { zh: '三兔藻井 · 法华经变窟', en: 'Three Hares Caisson Cave' },
    dynasty: { zh: '隋', en: 'Sui' },
    era: '公元6世纪末',
    coverImage: media('mural-cave-420.webp'),
    cliffLevel: '中层崖壁 · 覆斗顶窟',
    tags: ['三兔共耳', '法华经变', '观音普门品', '隋代重彩'],
    highlightMuralId: 'mural-threehares',
    hook: { zh: '三只兔子，三只耳朵，一个千年的谜', en: 'Three hares, three ears, one millennium-old riddle' },
    description: {
      zh: '隋代覆斗顶窟的巅峰。藻井井心以三兔共耳为饰：三只奔兔首尾相接，仅绘三只耳朵而每兔皆似双耳。四披满绘《法华经》经变——观音普门品的诸难救济、譬喻品的火宅与化城，以及大幅涅槃场景，是隋代重彩人物画的顶峰。',
      en: 'The summit of Sui cave design. Its caisson centre carries the three-hares motif — three running hares sharing three ears while each appears to have two. The surrounding slopes are covered with Lotus Sutra illustrations: deliverance from every peril in the Guanyin chapter, the burning house and phantom city of the parable chapter, and a vast parinirvana scene.',
    },
  },
  {
    id: 'cave-320',
    number: '第320窟',
    name: { zh: '散花飞天窟', en: 'Cave of the Scattering Apsaras' },
    dynasty: { zh: '盛唐', en: 'High Tang' },
    era: '公元8世纪上半叶',
    coverImage: media('mural-cave-320.webp'),
    cliffLevel: '中层崖壁 · 覆斗顶窟',
    tags: ['散花飞天', '观无量寿经变', '云头牡丹藻井', '盛唐气象'],
    highlightMuralId: 'mural-apsara',
    hook: { zh: '四身飞天，被公认为盛唐最美的一屏', en: 'Four apsaras widely held to be the finest of the High Tang' },
    description: {
      zh: '盛唐覆斗顶窟。南壁《观无量寿经变》上部残存四身散花供养飞天，两两相对而又各自顾盼，飘带翻卷如在风中；窟顶云头牡丹井心配以方胜、团花、鳞纹边饰，朱青绿叠韵，色彩浓艳而保存极佳。',
      en: 'A High Tang cave with an inverted-funnel ceiling. Above the Contemplation Sutra illustration on the south wall survive four scattering apsaras, paired yet each turning away, their ribbons lifted as if in real wind. The caisson carries a cloud-scroll peony medallion banded with lozenge, rosette and scale patterns in cinnabar, azurite and malachite.',
    },
  },
  {
    id: 'cave-57',
    number: '第57窟',
    name: { zh: '美人窟 · 观音菩萨', en: 'The "Cave of Beauties"' },
    dynasty: { zh: '初唐', en: 'Early Tang' },
    era: '公元7世纪',
    coverImage: media('mural-cave-57.webp'),
    cliffLevel: '南侧中层 · 方形平顶窟',
    tags: ['美人菩萨', '沥粉贴金', '初唐贵妇', '阿弥陀说法图'],
    highlightMuralId: 'mural-beauty',
    hook: { zh: '一顶金冠，一千四百年后仍在发光', en: 'A gold crown still catching light after 1400 years' },
    description: {
      zh: '因南壁《阿弥陀说法图》中华贵端严的观世音菩萨而被称为"美人窟"。菩萨头冠以泥塑堆出立体纹样再贴纯金箔，肌肤如凝脂，眉眼细长；下方一列都督夫人太原王氏供养像，把初唐最时髦的妆容与衣裙完整留在了墙上。',
      en: 'Named for the exquisite Avalokitesvara in the Amitābha assembly on the south wall. Her crown is built up in relief and gilded with real gold leaf; the face is cream-smooth with long fine brows. Below, the donor procession of the Lady of Taiyuan Wang preserves Early Tang make-up and dress in precise detail.',
    },
  },
  {
    id: 'cave-112',
    number: '第112窟',
    name: { zh: '反弹琵琶乐舞窟', en: 'Cave of the Reverse-Piped Pipa' },
    dynasty: { zh: '中唐', en: 'Middle Tang' },
    era: '公元8–9世纪',
    coverImage: media('mural-cave-112.webp'),
    cliffLevel: '下层崖壁 · 覆斗顶窟',
    tags: ['反弹琵琶', '乐舞经变', '兰叶描', '盛唐遗韵'],
    highlightMuralId: 'mural-pipa',
    hook: { zh: '把琵琶举到背后，弹成了中国的舞姿图腾', en: 'The pose that became China\'s emblem of dance' },
    description: {
      zh: '中唐覆斗顶窟。南壁《观无量寿经变》中的乐舞场面，中央舞伎反手于背后弹拨琵琶，一足踢起，衣带翻卷，两侧乐队十余种乐器齐奏。这一舞姿后来成为敦煌乃至中国乐舞艺术的象征。',
      en: 'A Middle Tang cave. In the music-and-dance assembly of the south wall, a single dancer plucks a pipa behind her back, one foot raised, ribbons whirling, while an orchestra of more than a dozen instruments plays at either side. The pose became the emblem of Dunhuang, and of Chinese dance itself.',
    },
  },
  {
    id: 'cave-17',
    number: '第17窟',
    name: { zh: '藏经洞', en: 'The Library Cave' },
    dynasty: { zh: '晚唐', en: 'Late Tang' },
    era: '公元851年封存, 11世纪封闭',
    coverImage: media('mural-cave-17.webp'),
    cliffLevel: '北区低层 · 第16窟甬道北侧',
    tags: ['六万卷文书', '洪辩影堂', '敦煌学诞生地', '1900年发现'],
    highlightMuralId: 'mural-library',
    hook: { zh: '不到十平方米，装下了整个中古中国', en: 'Under ten square metres that held medieval China' },
    description: {
      zh: '世界上最小的著名洞窟之一。原为晚唐河西都僧统洪辩的影堂，后封存了四至十一世纪的经卷、绢画、契约、账本与书信六万余件。1900年道士王圆箓清理积沙时偶然发现，由此诞生了国际性的"敦煌学"。',
      en: 'One of the smallest famous rooms in the world. Originally the memorial hall of Hongbian, head of the Hexi monastic order, it was later sealed with more than sixty thousand scrolls, silk paintings, contracts, ledgers and letters spanning the fourth to eleventh centuries. Its rediscovery in 1900 gave birth to Dunhuang studies.',
    },
  },
];

/* =========================================================================
   Signature murals (one per cave)
   ========================================================================= */

export const MURALS: Mural[] = [
  {
    id: 'mural-deer',
    caveNumber: '第257窟',
    title: { zh: '九色鹿王本生图', en: 'Jātaka of the Nine-Coloured Deer King' },
    dynasty: { zh: '北魏', en: 'Northern Wei' },
    eraPeriod: '公元5世纪',
    category: 'jataka',
    dimensions: '西壁中层 · 横卷式连环画',
    imageUrl: media('mural-cave-257.webp'),
    detailUrl: media('detail-cave-257.webp'),
    lineArtUrl: media('wash-deer.webp'),
    scanSize: '21515 × 15796 px',
    description: {
      zh: '莫高窟最著名的故事画。画面以横卷形式自两端向中央推进：左侧九色鹿救起溺水者调达，右侧王后梦鹿求皮、国王悬赏，中央是神鹿与国王对峙的高潮。赭红底壁之上，人物与鹿皆以铁线描勾形，再施凹凸晕染。',
      en: 'The most celebrated narrative painting at Mogao. The scroll advances from both ends toward the middle: on the left the deer rescues the drowning Tiaoda, on the right the queen dreams of its pelt and the king posts a bounty, and at the centre beast confronts king. On a red-ochre ground the figures are drawn with taut iron-wire contours and modelled with Western-Region shading.',
    },
    story: {
      zh: '九色鹿于恒河救起溺水者调达，调达发誓永不泄露神鹿行踪。后王后贪求鹿皮华服，国王重金悬赏。调达背信告密，引兵围猎。神鹿临危不惧，走到国王面前陈情始末。国王深受震动，下令举国保护神鹿，调达则浑身生疮、口臭而死。',
      en: 'The deer saves the drowning merchant Tiaoda, who swears never to reveal where it lives. When the queen demands robes of its pelt, Tiaoda breaks his oath for a reward and leads the royal hunt. Facing the arrows without fear, the deer tells the king everything. Moved, the king decrees the deer protected forever, and the betrayer is struck with disease.',
    },
    artisticValue: {
      zh: '以两端向中心的"向心式"构图组织连续叙事，是莫高窟开窟以来全新的连环画形式，把时间压缩进一幅静态画面。土红打底、石青石绿敷彩，历经氧化转为沉静的青褐；人物"秀骨清像"、躯体修长，是北魏晚期中原风格与西域画法融合的标本。',
      en: 'Its centripetal composition arranges a continuous narrative around a central climax — a wholly new comic-strip form at Mogao that compresses time into one still image. Earth-red ground with azurite and malachite, oxidised over centuries into quiet blue-greens; elongated "elegant-boned" figures mark the fusion of Central Plains style with Western Region technique.',
    },
    pigments: ['赭石', '朱砂', '石青', '石绿', '铅白'],
    hotspots: [
      {
        id: 'hs-deer-1',
        x: 46,
        y: 44,
        title: { zh: '神鹿昂首 · 无惧箭雨', en: 'The Deer Stands Unafraid' },
        description: {
          zh: '鹿身修长，鹿角如珊瑚枝杈，四足稳踏于浪头。画师用一根根匀细的墨线勾出形体，再以白色铺底，使神鹿在赭红壁面上如发光一般。',
          en: 'The body is slender, the antlers branch like coral, four hooves planted on the crest of a wave. Fine even ink contours over a white ground make the deer seem to glow against the red-ochre wall.',
        },
        detailHighlight: '铁线描与"秀骨清像"造型',
      },
      {
        id: 'hs-deer-2',
        x: 78,
        y: 50,
        title: { zh: '王后梦鹿 · 宫室作分镜', en: 'The Queen\'s Dream' },
        description: {
          zh: '王后斜倚于宫中，头顶是建筑的屋顶。画师以屋顶轮廓充当"分镜线"，在同一幅画面里并置宫室与山林两个空间，比电影的蒙太奇早了近一千年。',
          en: 'The queen reclines inside a palace, roof above her head. The roofline itself acts as a cut between scenes, letting palace and wilderness occupy one image — a device nearly a millennium older than cinematic montage.',
        },
      },
      {
        id: 'hs-deer-3',
        x: 16,
        y: 52,
        title: { zh: '国王闻法 · 举国护鹿', en: 'The King\'s Decree' },
        description: {
          zh: '国王与随从列于左侧，听完神鹿陈述后合掌致意。这一段把"慈悲"从情节变成了看得见的姿态：不是神迹，而是一次被说服的让步。',
          en: 'The king and his retinue stand at the left; having heard the deer out, he brings his palms together. Compassion here becomes a visible gesture — not a miracle, but a persuasion that succeeds.',
        },
      },
    ],
    audioGuide: {
      duration: '1分20秒',
      transcripts: {
        zh: '请看这面西壁。它用一条横卷，讲完了整部《九色鹿经》。故事从两端同时开始：左边，九色鹿跃入恒河救起溺水者调达；右边，王后梦见九色神鹿，想要它的皮做褥、角做饰，国王于是以半壁江山悬赏。两条线在画面中央相撞——神鹿被围，却昂首走到国王面前，从容陈情。国王最终下令：举国保护此鹿。请您留意画面的骨架：赭红色的底壁，铁线描的轮廓，石青与石绿在氧化之后变成了沉静的青褐。而画师把宫殿屋顶当作"分镜线"，让宫室与山林同处一幅——这种手法比电影蒙太奇早了将近一千年。',
        en: 'This west wall tells the whole Deer King sutra in a single horizontal scroll. The story starts at both ends at once: on the left the nine-coloured deer leaps into the Ganges to rescue the drowning Tiaoda; on the right the queen dreams of the deer and wants its pelt for a cushion and its antlers for ornaments, so the king offers half his kingdom as a reward. The two lines collide at the centre, where the deer is surrounded — yet walks head-high to the king and calmly states its case. In the end the king decrees that the deer be protected throughout the land. Notice the structure: a red-ochre ground, taut iron-wire contours, azurite and malachite oxidised into quiet blue-green. And the painter used palace rooflines as cuts between scenes, letting court and wilderness share one image — a device nearly a thousand years ahead of cinematic montage.',
      },
    },
  },
  {
    id: 'mural-tigress',
    caveNumber: '第254窟',
    title: { zh: '萨埵太子舍身饲虎', en: 'Prince Mahāsattva Feeds the Tigress' },
    dynasty: { zh: '北魏', en: 'Northern Wei' },
    eraPeriod: '公元5世纪',
    category: 'jataka',
    dimensions: '南壁 · 独幅异时同图',
    imageUrl: media('mural-cave-254.webp'),
    detailUrl: media('detail-cave-254.webp'),
    lineArtUrl: media('wash-tigress.webp'),
    scanSize: '32845 × 16680 px',
    description: {
      zh: '北魏壁画中最震撼的一幅。画师用"异时同图"手法，把刺颈、投崖、饲虎、父母哭尸、起塔供养等多个时间点组织进同一个画面，视线被一次次拉回中央的虎群。深褐与青灰的色调，与故事的惨烈互为呼应。',
      en: 'The most shocking image in Northern Wei painting. Using simultaneous narration, the artist folds several moments — the cut throat, the leap from the cliff, the tigress feeding, the parents weeping over the bones, the raising of the stupa — into one composition, the eye pulled back each time to the tigers at its centre. Deep browns and blue-greys answer the brutality of the tale.',
    },
    story: {
      zh: '摩诃萨埵太子与两位兄长出游山中，见母虎产子七日、饥饿将食其子。太子支开兄长，刺颈投崖以身饲虎。兄长归来只见遗骨，悲痛欲绝，归报父母。父母筑塔供养，天上落下花雨。',
      en: 'Prince Mahāsattva, walking in the mountains with his two brothers, finds a tigress who has given birth seven days before and is starving to the point of eating her own cubs. He sends his brothers away, cuts his throat and throws himself from the cliff. Returning to find only bones, the brothers carry the news home; the parents raise a stupa, and flowers fall from the sky.',
    },
    artisticValue: {
      zh: '"异时同图"是北魏画师最了不起的发明：不为每个情节另开一格，而是让不同时间发生在同一空间里，靠人物的姿态与视线的走向引导读者自行完成叙事。这种"共时"的画面逻辑，与今天影像中的多视点剪辑异曲同工。',
      en: 'Simultaneous narration is the great Northern Wei invention: rather than giving each episode its own frame, several moments share one space, and pose and eye-direction carry the reader through the sequence. It is a logic of coexistence that anticipates multi-perspective editing in modern film.',
    },
    pigments: ['赭石', '朱砂', '石绿', '铅白', '松烟墨'],
    hotspots: [
      {
        id: 'hs-tigress-1',
        x: 50,
        y: 52,
        title: { zh: '母虎与七子', en: 'The Tigress and Her Cubs' },
        description: {
          zh: '画面中心是饿极的母虎与七只幼虎，线条瘦硬如刻。画师把最暗的墨色集中于此，让整个故事的重心在视觉上"沉"下去。',
          en: 'At the centre lie the starving tigress and her seven cubs, drawn with lines hard and thin as engraving. The darkest ink is gathered here, so that the weight of the story visibly sinks into the image.',
        },
        detailHighlight: '以墨色明度组织叙事重心',
      },
      {
        id: 'hs-tigress-2',
        x: 26,
        y: 34,
        title: { zh: '刺颈投崖', en: 'The Cut and the Leap' },
        description: {
          zh: '太子立于崖上，举手刺颈。请注意他的身体被拉成一条近乎笔直的斜线——不是写实的人体，而是一个"决定"的形状。',
          en: 'The prince stands at the cliff edge, arm raised to his throat. His body is drawn as a near-straight diagonal — not a realistic anatomy, but the shape of a decision.',
        },
      },
      {
        id: 'hs-tigress-3',
        x: 72,
        y: 70,
        title: { zh: '父母哭尸 · 起塔供养', en: 'Mourning and the Stupa' },
        description: {
          zh: '右下角是父母抚尸痛哭的场景，随后在左侧转为起塔供养。北魏画师处理悲伤时并不夸张面部，而是让人物的整个身体塌陷下去。',
          en: 'At lower right the parents weep over the remains; to the left the scene turns to the raising of a stupa. Northern Wei painters rarely exaggerate a face in grief — instead the whole body collapses.',
        },
      },
    ],
    audioGuide: {
      duration: '1分15秒',
      transcripts: {
        zh: '这是北魏壁画里最震撼的一幅，也是最难直视的一幅。摩诃萨埵太子在山中见到一只饿了七天的母虎，它已经要吃掉自己的幼崽。太子支开两位兄长，割开自己的喉咙，从崖上跳了下去。请您注意画师的构图：他没有把故事切成七格，而是把刺颈、投崖、饲虎、父母哭尸、起塔供养全部压进同一个画面——这叫"异时同图"。您的视线每一次移开，都会被中央那团最深的墨色拉回虎群。这就是北魏画师最了不起的地方：他们用构图代替了时间。',
        en: 'This is the most shocking image in Northern Wei painting — and the hardest to look at. Prince Mahāsattva finds a tigress who has gone seven days without food and is about to eat her own cubs. He sends his brothers away, cuts his own throat, and throws himself from the cliff. Notice the composition: the painter did not divide the story into panels, but pressed the cut, the leap, the feeding, the parents\' grief and the raising of the stupa into a single image — simultaneous narration. Every time your eye drifts away, that darkest knot of ink at the centre pulls it back to the tigers. That is what makes these painters extraordinary: they used composition in place of time.',
      },
    },
  },
  {
    id: 'mural-xiwangmu',
    caveNumber: '第249窟',
    title: { zh: '天宫伎乐与西王母东王公', en: 'Celestial Musicians, Queen Mother and King Father' },
    dynasty: { zh: '西魏', en: 'Western Wei' },
    eraPeriod: '公元6世纪',
    category: 'apsara',
    dimensions: '南北壁上层 · 窟顶四披',
    imageUrl: media('mural-cave-249.webp'),
    detailUrl: media('detail-cave-249.webp'),
    lineArtUrl: media('wash-apsara.webp'),
    scanSize: '19856 × 14616 px',
    description: {
      zh: '西魏洞窟最动人的一处。壁上缘画天宫伎乐，乐伎自栏墙后探身奏乐，衣带与云气一同流动；窟顶四披则是汉地神话的天空——西王母乘凤车、东王公乘龙车、阿修罗王四目四臂托举日月，雷公击鼓、飞廉奔驰、羽人朱雀往来其间。',
      en: 'The most captivating passage in a Western Wei cave. Along the upper walls celestial musicians lean out from a balustrade to play, ribbons and clouds moving together; the ceiling slopes open onto a Chinese mythological sky — the Queen Mother of the West in a phoenix chariot, the King Father of the East in a dragon carriage, the four-eyed Asura lifting sun and moon, the thunder god beating drums, feilían racing and vermilion birds crossing.',
    },
    story: {
      zh: '这里讲的不是一部经，而是一整个世界。佛教自西而来，落在这片土地上时，并没有把原有的天空抹去：印度来的飞天与汉地的西王母、东王公、伏羲女娲同住一个穹顶。画师用云气把这些原本互不相干的神祇缝在了一起。',
      en: 'This is not the illustration of a sutra but a whole cosmos. When Buddhism arrived from the west it did not erase the sky that was already here: Indian apsaras keep company on one vault with the Queen Mother of the West, the King Father of the East, and Fuxi and Nüwa. Cloud scrolls are the thread that stitches these unrelated deities into one heaven.',
    },
    artisticValue: {
      zh: '西魏壁画以"秀骨清像"与"天衣飞扬"著称：人物身形清瘦、衣带如春蚕吐丝，线条柔长连绵而不见起止。窟顶四披则把汉画像石式的神兽、云气与佛教的飞天组织成连续的横向云带，是中西图像体系融合的珍贵样本。',
      en: 'Western Wei painting is known for slender "elegant-boned" figures and flying garments — lines drawn long and continuous, with no visible beginning or end, like silk unspooling. The ceiling bands weave Han-style mythological beasts and cloud scrolls together with Buddhist apsaras into continuous horizontal registers: a rare record of two image systems merging.',
    },
    pigments: ['石青', '石绿', '朱砂', '赭石', '铅白', '松烟墨'],
    hotspots: [
      {
        id: 'hs-xwm-1',
        x: 50,
        y: 22,
        title: { zh: '天宫伎乐 · 栏墙之上', en: 'Musicians Above the Balustrade' },
        description: {
          zh: '乐伎半身探出栏墙，手持排箫、琵琶、腰鼓。栏墙与垂幔被画成一条连续的水平线，把整壁上方切成一条"天界的阳台"。',
          en: 'Half-length musicians lean over a balustrade with panpipes, pipa and waist drums. Wall and valance form one continuous horizontal line, turning the top of the wall into a balcony in heaven.',
        },
        detailHighlight: '栏墙 + 垂幔构成的连续水平带',
      },
      {
        id: 'hs-xwm-2',
        x: 32,
        y: 62,
        title: { zh: '飞天 · 天衣飞扬', en: 'Apsaras in Flying Silk' },
        description: {
          zh: '飞天的身体并不靠翅膀，而靠飘带的形状飞起来。请看她身后拖出的几条长线——方向一致、弧度渐收，画师用一条带子就造出了风。',
          en: 'These apsaras fly without wings; the ribbons do the work. Follow the long lines trailing behind her — same direction, gradually tightening arc. One scarf is all it takes to invent wind.',
        },
      },
    ],
    audioGuide: {
      duration: '1分05秒',
      transcripts: {
        zh: '第249窟讲的不是一部经，而是一整个天空。壁面上缘，乐伎从栏墙后探出半身，吹排箫、弹琵琶、击腰鼓——栏墙与垂幔连成一条水平线，把整面墙变成天界的阳台。抬头看窟顶四披，那里是汉地神话的世界：西王母乘凤车，东王公乘龙车，阿修罗王四目四臂托着日月，雷公击鼓，飞廉奔驰，羽人朱雀往来其间。请注意一件事：佛教从印度来，却没有把这片土地原有的天空抹掉。印度来的飞天，和汉地的西王母、伏羲女娲，同住在一个穹顶之下。画师用云气把她们缝在了一起。这就是敦煌最动人的地方——它不是某一种文明的独白，而是一场持续千年的对话。',
        en: 'Cave 249 is not the illustration of one sutra but an entire sky. Along the top of the wall, musicians lean half out of a balustrade playing panpipes, pipa and waist drums — wall and valance joining into a single horizontal line that turns the whole surface into a balcony in heaven. Look up to the ceiling slopes and you are in Chinese mythology: the Queen Mother of the West in a phoenix chariot, the King Father of the East in a dragon carriage, the four-eyed four-armed Asura holding up sun and moon, the thunder god at his drums, feilían racing past, vermilion birds crossing. And notice this: Buddhism came from India but did not erase the sky that was already here. Indian apsaras keep company on one vault with Chinese deities. Cloud scrolls are the thread that sews them together. That is what moves people most about Dunhuang — not the monologue of one civilisation, but a conversation that lasted a thousand years.',
      },
    },
  },
  {
    id: 'mural-bandits',
    caveNumber: '第285窟',
    title: { zh: '五百强盗成佛因缘', en: 'The Five Hundred Bandits Attain Buddhahood' },
    dynasty: { zh: '西魏', en: 'Western Wei' },
    eraPeriod: '公元538–539年',
    category: 'sutra',
    dimensions: '南壁 · 通壁横卷',
    imageUrl: media('mural-cave-285.webp'),
    detailUrl: media('detail-cave-285.webp'),
    lineArtUrl: media('wash-bandits.webp'),
    scanSize: '20038 × 10404 px',
    description: {
      zh: '一幅横向展开的独立叙事长卷。五百人造反、与官军交战被俘、被剜去双眼放逐山林、在山中哀号、佛陀现身说法、双眼复明、剃度出家——情节一字排开，像一条被放平的时间线。人物穿着西魏的现实服饰，山石树木以青绿勾勒，是第一等的"故事画＋山水背景"样本。',
      en: 'A single horizontal narrative scroll. Five hundred bandits revolt, are captured in battle, blinded and exiled to the mountains, wail there, are met by the Buddha preaching, recover their sight and are ordained — episode after episode laid out flat like a timeline on its side. Figures wear the real dress of the Western Wei; hills and trees are outlined in blue-green: a first-rate example of narrative painting set inside landscape.',
    },
    story: {
      zh: '古印度有五百人造反，国王派兵镇压，全部俘获。国王命剜去他们的双眼，放逐深山。盲人在山林中悲号，声音传到佛所。佛陀以慈悲力吹香山药，令其双目复明，随后现身说法。五百人顿悟，剃度为僧，终成正果。',
      en: 'In ancient India five hundred men rose in revolt. The king sent troops, captured them all, had their eyes put out and drove them into the mountains. Their wailing carried to where the Buddha was staying. Out of compassion he blew upon a mountain herb, restoring their sight, and then appeared to teach them. The five hundred understood, took ordination, and in time attained enlightenment.',
    },
    artisticValue: {
      zh: '此窟是莫高窟少数有确切纪年的洞窟之一（西魏大统四年至五年）。画师把长卷式构图与青绿山水背景结合，山峦、树木、房舍不仅是衬景，而是情节转换的"节拍器"——人物走过一片山，故事就往前走一步。',
      en: 'This is one of the few securely dated caves at Mogao (fourth to fifth year of the Datong era, Western Wei). The painter weds the horizontal narrative scroll to a blue-green landscape where hills, trees and buildings are not mere backdrop but the metronome of the plot: each time the figures cross a ridge, the story takes another step.',
    },
    pigments: ['石绿', '石青', '朱砂', '赭石', '铅白'],
    hotspots: [
      {
        id: 'hs-bandit-1',
        x: 24,
        y: 50,
        title: { zh: '交战与被俘', en: 'Battle and Capture' },
        description: {
          zh: '左侧是官军与强盗交战的场面，人物密集而姿态激烈，甲胄、马匹、长矛都刻画具体，可直接用来复原西魏的军备。',
          en: 'At the left, troops and bandits fight in a dense knot of violent poses. Armour, horses and spears are observed in detail — evidence enough to reconstruct Western Wei military equipment.',
        },
        detailHighlight: '西魏服饰与军备的实物依据',
      },
      {
        id: 'hs-bandit-2',
        x: 56,
        y: 46,
        title: { zh: '剜眼与山中哀号', en: 'Blinding and Lamentation' },
        description: {
          zh: '中段是盲人被逐入山林后的场景。画师用青绿山峦把他们一圈圈围住——山在这里不是风景，而是"囚禁"。',
          en: 'At the centre, the blinded men are driven into the mountains. Blue-green ridges coil around them in rings: the landscape here is not scenery but confinement.',
        },
      },
      {
        id: 'hs-bandit-3',
        x: 80,
        y: 44,
        title: { zh: '佛陀说法 · 复明出家', en: 'The Sermon and the Restored Sight' },
        description: {
          zh: '右侧佛陀现身，五百人合掌跪坐。请注意画师的处理：他没有画出"奇迹"的瞬间，只画了听闻之后的安静——眼睛的复明被留在了画外。',
          en: 'At the right the Buddha appears and the five hundred kneel with joined palms. Note the choice: the moment of miracle is withheld. The painter shows only the quiet after listening, leaving the restoration of sight outside the frame.',
        },
      },
    ],
    audioGuide: {
      duration: '1分20秒',
      transcripts: {
        zh: '请把目光沿着这面南壁从左向右走一遍。这是一条被放平的时间线。左边，五百人造反，与官军激战被俘；接着，国王下令剜去他们的双眼，把他们赶进深山；中段，盲人在山峦之间哀号——请留意这些青绿的山，它们把人物一圈一圈围住，在这里山不是风景，而是囚禁。最右边，佛陀现身说法，五百人合掌跪坐。有趣的是，画师没有画出眼睛复明的那一瞬间，他只画了听完之后的安静。奇迹被留在了画外。这个洞窟还有一个特别之处：它是莫高窟少数有确切纪年的洞窟之一，西魏大统四到五年，也就是公元538到539年。您看到的这些山峦、树木、房舍，构成了一套完整的叙事节奏：人物走过一片山，故事就往前走一步。',
        en: 'Walk your eye along this south wall from left to right — it is a timeline laid on its side. On the left five hundred men revolt and are captured in battle; then the king has them blinded and driven into the mountains. At the centre the blind wail among the ridges — notice how the blue-green hills coil around the figures ring after ring, so that landscape here is not scenery but a prison. At the far right the Buddha appears and teaches, and the five hundred kneel with joined palms. Curiously, the painter never shows the instant their sight returns; he shows only the quiet afterwards. The miracle is left outside the frame. This cave has another distinction: it is one of the few at Mogao with a firm date — the fourth to fifth year of the Datong era, 538 to 539 CE. And those hills, trees and buildings set the pace: each time the figures cross a ridge, the story advances one step.',
      },
    },
  },
  {
    id: 'mural-threehares',
    caveNumber: '第420窟',
    title: { zh: '三兔共耳藻井与法华经变', en: 'Three Hares Caisson & Lotus Sutra' },
    dynasty: { zh: '隋', en: 'Sui' },
    eraPeriod: '公元6世纪末',
    category: 'caisson',
    dimensions: '主室窟顶 · 藻井与四披',
    imageUrl: media('mural-cave-420.webp'),
    detailUrl: media('detail-cave-420.webp'),
    lineArtUrl: media('wash-threehares.webp'),
    scanSize: '22601 × 17467 px',
    description: {
      zh: '隋代覆斗顶窟的顶点。藻井井心画三兔共耳：三只奔兔首尾相接，只绘三只耳朵，两两共用，而每只兔子看上去都有双耳。方井四角绘童子形飞天，外岔绘有翼瑞兽，边框饰忍冬、狮子与联珠纹。四披则满绘《法华经》经变。',
      en: 'The summit of Sui cave design. At the centre of the caisson, three hares chase one another sharing three ears between them, yet each appears to have two. Child-like apsaras occupy the corners of the square well, winged auspicious beasts the outer spandrels, and honeysuckle, lions and beaded strings the borders. The four slopes are filled with Lotus Sutra illustrations.',
    },
    story: {
      zh: '三兔共耳的图像在同一时期经丝绸之路向东西两端扩散：中亚的金属器、伊朗的瓷砖、欧洲中世纪教堂的彩窗上，都能找到几乎相同的图形。它究竟意味着三世轮回、日月运行，还是单纯的"无穷"？一千五百年来始终没有一个定论——而这也许正是它最好的地方。',
      en: 'Within the same period the three-hares figure travelled the Silk Road in both directions: it appears on Central Asian metalwork, on Iranian tiles, and in the stained glass of medieval European churches. Does it mean the cycle of three lives, the motion of sun and moon, or simply infinity? Fifteen centuries on, nobody has settled it — which may be the best thing about it.',
    },
    artisticValue: {
      zh: '藻井是木构建筑里最华丽的一个部位：方井层层向中心收拢，莲花或三兔居于正中。隋代画师在这里展示的是"共用形"的图形智慧——用三条轮廓线解决六只耳朵的问题，同时保持了旋转的动势与完美的对称。四披的《法华经》经变则以青绿山水与建筑组织出纵深，是隋代重彩人物画的顶峰。',
      en: 'The caisson is the most elaborate part of any timber interior: square frame within square frame converging on a lotus or, here, three hares. What the Sui painter demonstrates is the intelligence of shared form — three outlines solving the problem of six ears while keeping both rotational motion and perfect symmetry. The slopes around it use blue-green landscape and architecture to build real depth: the high point of Sui polychrome figure painting.',
    },
    pigments: ['石青', '石绿', '朱砂', '雌黄', '铅白'],
    hotspots: [
      {
        id: 'hs-hares-1',
        x: 50,
        y: 18,
        title: { zh: '三兔共耳 · 三耳六耳的魔术', en: 'Three Hares, Three Ears' },
        description: {
          zh: '三只兔子首尾相接奔跑，耳朵两两重叠——每只都"借用"了邻居的一只，却让每一只看起来都完整。这是一种极高级的共用形构图。',
          en: 'Three hares run nose to tail, ears overlapping in pairs — each borrows one from its neighbour yet each still looks complete. This is shared form at its most sophisticated.',
        },
        detailHighlight: '共用形：三只轮廓线解决六只耳朵',
      },
      {
        id: 'hs-hares-2',
        x: 50,
        y: 58,
        title: { zh: '观音普门品 · 诸难救济', en: 'Deliverance from Every Peril' },
        description: {
          zh: '藻井以下的披面画《观音普门品》：火难、水难、罗刹难、刀杖难、牢狱难……一格一难，观世音在每一格中现身相救，是一份用图绘成的"应急清单"。',
          en: 'Below the caisson the slopes illustrate the Guanyin chapter: fire, flood, demons, blades, prison — one peril per scene, with Avalokitesvara appearing in each to rescue. It is effectively an illustrated emergency list.',
        },
      },
    ],
    audioGuide: {
      duration: '1分10秒',
      transcripts: {
        zh: '请抬头看窟顶正中的藻井。三只兔子正在互相追逐，首尾相接，围成一个环。奇怪的是：每只兔子看起来都有两只耳朵，可整幅画上一共只画了三只耳朵——它们两两共用。这在一千五百年前是一个极高级的图形智慧，叫做"共用形"。更奇妙的是，同样的图案也出现在中亚的金属器、伊朗的瓷砖、欧洲中世纪教堂的彩窗上。一条丝绸之路，把这个图形从敦煌带向了整个世界。它究竟代表什么？三世轮回？日月运行？还是单纯的"无穷"？至今没有定论。藻井以下的披面上，画满了《法华经·观音普门品》的诸难救济：火难、水难、罗刹难、刀杖难、牢狱难，一格一难，观音在每一格中现身相救。换句话说，这是一份用图画写成的"应急清单"。',
        en: 'Look up at the caisson at the centre of the ceiling. Three hares are chasing one another nose to tail in a ring. Strangely, each hare appears to have two ears, yet the whole design contains only three — they share them in pairs. Fifteen centuries ago that was an extraordinary piece of visual intelligence, which designers call shared form. More remarkable still, the same figure turns up on Central Asian metalwork, on Iranian tiles, and in the stained glass of medieval European churches. The Silk Road carried it from Dunhuang out across the world. What does it mean? The cycle of three lives, the motion of sun and moon, or simply infinity? Nobody has settled it. And on the slopes below, the ceiling is packed with the Guanyin chapter of the Lotus Sutra: fire, flood, demons, blades, prison — one peril per scene, Avalokitesvara appearing in each to save. In other words, an illustrated emergency list.',
      },
    },
  },
  {
    id: 'mural-apsara',
    caveNumber: '第320窟',
    title: { zh: '散花供养飞天', en: 'The Scattering Apsaras' },
    dynasty: { zh: '盛唐', en: 'High Tang' },
    eraPeriod: '公元8世纪上半叶',
    category: 'apsara',
    dimensions: '南壁上部 · 观无量寿经变之上',
    imageUrl: media('mural-cave-320.webp'),
    detailUrl: media('detail-cave-320.webp'),
    lineArtUrl: media('wash-apsara.webp'),
    scanSize: '17406 × 13828 px',
    description: {
      zh: '盛唐飞天最负盛名的一组。四身飞天两两成对，相对而舞，一手散花一手托花盘，飘带与云气一同翻卷。她们的"飞"不靠翅膀，而靠身体的反转与飘带的走向；线条用盛唐的兰叶描，一根线粗细起伏，把丝绸的柔软与风的流动一次画出。',
      en: 'The most celebrated group of High Tang apsaras. Four figures in two pairs dance toward one another, one hand scattering blossoms, the other holding a flower tray, ribbons and clouds curling together. They fly without wings: the turning of the body and the direction of the scarves do all the work. The lines are High Tang "orchid-leaf" strokes, swelling and thinning in a single pass, drawing both the softness of silk and the movement of air.',
    },
    story: {
      zh: '她们属于《观无量寿经变》的上部：在极乐世界的天空中，飞天散花供养佛陀。这里没有故事，只有一个动作——散花。但正是这个动作，让整铺经变从"图解"变成了"空气"。',
      en: 'They belong to the upper register of the Contemplation Sutra illustration: in the sky above the Pure Land, apsaras scatter flowers as an offering. There is no story here, only an action — the scattering of flowers. And that action is what turns a doctrinal diagram into air.',
    },
    artisticValue: {
      zh: '这组飞天的构图极见功力：两两相对而又各自外顾，对称之中藏着不对称的视线；身体呈"S"形反转，一足上踢、一足后伸，重心被刻意悬置。盛唐画师已经不再满足于"画出神"，他们要画出"速度"与"风"。',
      en: 'The composition is masterful: paired but each looking outward, symmetry containing asymmetry of gaze; each body twists into an S, one foot kicked up, the other trailing, its centre of gravity deliberately suspended. High Tang painters were no longer content to depict deities — they wanted to paint speed, and wind.',
    },
    pigments: ['石青', '石绿', '朱砂', '雌黄', '泥金'],
    hotspots: [
      {
        id: 'hs-apsara-1',
        x: 38,
        y: 30,
        title: { zh: '散花的手 · 一个动作的重量', en: 'The Scattering Hand' },
        description: {
          zh: '飞天的右手向前舒开，指尖微扬，花瓣正从掌中落下。请注意这只手并没有真的"用力"，画师让动作停在将散未散的一刻。',
          en: 'Her right hand opens forward, fingertips lifted, petals just leaving the palm. Note that no force is applied — the painter stopped the gesture at the instant before release.',
        },
        detailHighlight: '兰叶描：一根线里同时有丝绸与风',
      },
      {
        id: 'hs-apsara-2',
        x: 62,
        y: 34,
        title: { zh: '飘带的方向 · 画师造风的方法', en: 'Ribbons: How a Painter Invents Wind' },
        description: {
          zh: '四身飞天的飘带方向几乎一致，弧度彼此呼应。画师没有画风，他只画了被风吹动的东西——而观众自动补上了风。',
          en: 'The four sets of ribbons run in nearly the same direction, their arcs answering one another. The painter never draws wind; he draws only what wind has touched, and the viewer supplies the rest.',
        },
      },
    ],
    audioGuide: {
      duration: '1分',
      transcripts: {
        zh: '这四身飞天，被公认为盛唐最美的一屏。她们两两成对，相对而舞，一手散花，一手托着花盘。请您注意两件事。第一，她们的飞不靠翅膀——靠的是身体的反转和飘带的走向。第二，四身飞天的飘带方向几乎一致，弧度彼此呼应。画师从来没有画过风，他只画了被风吹动的东西，而您的大脑自动补上了风。这就是盛唐画师的本事：他们不满足于画出神，他们要画出速度和空气。线条用的是"兰叶描"，一根线有粗有细、有起有伏，像兰叶在风中翻转，丝绸的柔软和风的流动被一次画尽。',
        en: 'These four apsaras are widely held to be the most beautiful single panel of the High Tang. They come in pairs, dancing toward one another, one hand scattering blossoms, the other holding a flower tray. Notice two things. First, they fly without wings — the turning of the body and the direction of the ribbons do all the work. Second, all four sets of ribbons run in almost the same direction, their arcs answering each other. The painter never painted wind; he painted only what the wind had touched, and your brain fills in the rest. That is the High Tang gift: not content to depict deities, they set out to paint speed and air. The lines are orchid-leaf strokes, swelling and thinning in one pass like a leaf turning in the breeze — the softness of silk and the movement of wind drawn in a single gesture.',
      },
    },
  },
  {
    id: 'mural-beauty',
    caveNumber: '第57窟',
    title: { zh: '阿弥陀说法图与美人菩萨', en: 'Amitābha Assembly and the "Beauty" Bodhisattva' },
    dynasty: { zh: '初唐', en: 'Early Tang' },
    eraPeriod: '公元7世纪',
    category: 'bodhisattva',
    dimensions: '南壁 · 说法图与供养人列',
    imageUrl: media('mural-cave-57.webp'),
    detailUrl: media('detail-cave-57.webp'),
    lineArtUrl: media('wash-beauty.webp'),
    scanSize: '14899 × 13082 px',
    description: {
      zh: '南壁中央一铺《阿弥陀说法图》，四周千佛环列，下方一列都督夫人太原王氏及眷属供养像。图中观世音菩萨面容丰润、眉眼细长、朱唇微启，头冠以泥塑堆出立体纹样再贴纯金箔，一千四百年后仍在烛光下闪烁，因此这一窟被称为"美人窟"。',
      en: 'At the centre of the south wall is an Amitābha assembly, ringed by a thousand Buddhas, with the donor procession of the Lady of Taiyuan Wang and her household beneath. The Avalokitesvara here has a full, luminous face, long fine brows and slightly parted red lips; her crown is built up in relief and gilded with real gold leaf, still catching candlelight fourteen centuries later — hence the cave\'s nickname.',
    },
    story: {
      zh: '这幅壁画其实是一份"时尚档案"。供养人一列从都督夫人起，依次是女儿与侍女，十余身人物，妆容与衣裙层层不同：厚厚的白粉底、两颊胭脂、细长的桂叶眉、只点中央一点的朱唇；衣裙宽袖拖地、颜色一层压一层。文字记载说不清的唐代日常，画师一笔一笔留在了墙上。',
      en: 'This wall is in effect a fashion archive. The donor procession begins with the commandant\'s wife and continues through her daughters and maids — more than ten figures, each with different make-up and dress: thick white lead foundation, rouge on the cheeks, long "cassia-leaf" brows, lips touched with vermilion only at the centre; wide sleeves, floor-length skirts, colour laid over colour. What written records cannot convey about Tang daily life, the painter preserved stroke by stroke.',
    },
    artisticValue: {
      zh: '"沥粉贴金"是这里最值得看的技术：工匠先用调胶的泥浆在壁上堆出花瓣与珠串的立体纹样，干透后刷胶、贴金箔。因此金色不是颜料，而是一层真的金属，从墙面上微微凸起；无论从哪个角度看，只要有一点光，珠串就会闪。',
      en: 'The technique to look for is raised gold leaf: the artisan first builds petals and bead strings up in adhesive-bound clay paste, then once dry brushes on size and lays down wafer-thin gold. The gold is therefore not paint but real metal standing proud of the wall — from any angle, with any glimmer of light, the beads flash.',
    },
    pigments: ['铅白', '朱砂', '石青', '石绿', '泥金'],
    hotspots: [
      {
        id: 'hs-beauty-1',
        x: 50,
        y: 34,
        title: { zh: '观世音 · 一顶会发光的金冠', en: 'The Gilded Crown' },
        description: {
          zh: '菩萨头冠先以泥浆堆出立体的花瓣与珠串，再贴纯金箔。请试着左右移动视角，注意冠上的珠串如何随光线变化而闪烁。',
          en: 'Petals and beads were built up in relief paste before gold leaf was laid on. Move your viewpoint left and right and watch the beads flash as the light changes.',
        },
        detailHighlight: '沥粉堆出立体纹样 → 贴真金箔',
      },
      {
        id: 'hs-beauty-2',
        x: 26,
        y: 76,
        title: { zh: '都督夫人太原王氏供养像', en: 'The Lady of Taiyuan Wang' },
        description: {
          zh: '领头的是都督夫人，身后依次是女儿与侍女。桂叶眉、点唇、宽袖长裙——这是一份用画笔保存下来的初唐时尚档案。',
          en: 'The commandant\'s wife leads, followed by daughters and maids. Cassia-leaf brows, dot lips, wide sleeves and long skirts: an Early Tang fashion archive saved in paint.',
        },
      },
      {
        id: 'hs-beauty-3',
        x: 74,
        y: 78,
        title: { zh: '千佛环列 · 一片青绿色块', en: 'The Thousand Buddhas' },
        description: {
          zh: '说法图四周是排列整齐的千佛，一格一格如织物经纬。石青与石绿交替出现，形成很有节奏感的色块矩阵。',
          en: 'Around the assembly the thousand Buddhas are gridded like warp and weft, azurite and malachite alternating into a rhythmic matrix of colour blocks.',
        },
      },
    ],
    audioGuide: {
      duration: '1分05秒',
      transcripts: {
        zh: '这个洞窟被称为"美人窟"，全部原因就在这面南壁上。请您先看中央的观世音菩萨：面容丰润，眉线细长，朱唇微微开启，仿佛下一秒就要开口说话。再看她的头冠——那不是画上去的金色，而是真的金属。工匠先用调了胶的泥浆在壁上一点点堆出花瓣和珠串的立体纹样，干透以后刷胶，再贴上捶打得极薄的金箔，这叫"沥粉贴金"。所以无论您从哪个角度看，只要有一点光，冠上的珠串就会闪。一千四百年过去了，它还在闪。往下看，是一列供养人：都督夫人太原王氏，后面跟着女儿和侍女，十几个人。脸上厚厚的白粉，两颊胭脂，细长的桂叶眉，嘴唇只点中间一点朱红。这幅画其实是一份用画笔保存下来的初唐时尚档案。',
        en: 'This cave is called the Cave of Beauties, and the reason is entirely on this south wall. Look first at the Avalokitesvara at the centre: a full and luminous face, long fine brows, red lips slightly parted as though she might speak in the next moment. Then look at her crown — that gold is not paint but real metal. The artisan built petals and bead strings up in relief with adhesive clay paste, then sized it and laid on wafer-thin hammered gold: a technique called raised gold leaf. So from any angle, with any glimmer of light, the beads on that crown flash. Fourteen hundred years later, they still flash. Below her runs a donor procession: the commandant\'s wife of the Taiyuan Wang clan, her daughters and her maids, a dozen figures. Thick white lead foundation, rouge on the cheeks, long cassia-leaf brows, lips touched with vermilion only at the centre. The painting is in effect an Early Tang fashion archive preserved in brushwork.',
      },
    },
  },
  {
    id: 'mural-pipa',
    caveNumber: '第112窟',
    title: { zh: '反弹琵琶乐舞图', en: 'The Reverse-Played Pipa Dancer' },
    dynasty: { zh: '中唐', en: 'Middle Tang' },
    eraPeriod: '公元8–9世纪',
    category: 'music',
    dimensions: '南壁 · 观无量寿经变乐舞场面',
    imageUrl: media('mural-cave-112.webp'),
    detailUrl: media('detail-cave-112.webp'),
    lineArtUrl: media('wash-pipa.webp'),
    scanSize: '8371 × 8926 px',
    description: {
      zh: '中国美术史上最著名的一个舞姿。舞伎将琵琶甩到背后，反腕拨弦，一足蹬地、一足踢起，身体拧成优美的"三道弯"；左右两侧是编制完整的乐队——排箫、笙、阮、鼓、拍板，十余种乐器同时发声。线条用盛唐一路传下来的兰叶描，勾勒丝绸的飘动与身体的柔软。',
      en: 'The most famous dance pose in Chinese art. The performer swings the pipa behind her back and plucks it with a reversed wrist, one foot braced and the other kicked up, her body twisting into an elegant triple curve. To either side sits a fully scored orchestra — panpipes, mouth organ, ruan lute, drums, clappers, more than a dozen instruments at once. The lines inherit the High Tang orchid-leaf stroke, catching both the drift of silk and the softness of flesh.',
    },
    story: {
      zh: '这是《观无量寿经变》中的乐舞场面：极乐世界的众生以音乐与舞蹈供养佛陀。舞伎居于中央，乐队分列两侧，整个场面像一座正在演出的舞台。至于"反弹琵琶"是否真的被人跳过——有人说它是真实存在过的绝技，也有人说它是画师心中最极致的想象。',
      en: 'This is the music-and-dance passage of the Contemplation Sutra illustration: beings in the Pure Land honour the Buddha with music and dance. The dancer takes the centre, the orchestra flanks her, and the whole scene reads as a stage mid-performance. Whether the reverse-played pipa was ever really danced, nobody knows — some call it a genuine lost technique, others the painter\'s ultimate fantasy.',
    },
    artisticValue: {
      zh: '这两点最值得看：一是"兰叶描"的线条，一根线有粗有细、有起有伏，像兰叶在风中翻转；二是乐队图像的文献价值——许多唐代乐器今天已无实物留存，而这些壁画保存了它们的持奏姿势、持琴角度与手指位置。有人说，敦煌壁画是一座"会发声的博物馆"。',
      en: 'Two things to look for. First, the orchid-leaf line: a single stroke that swells and thins and turns like a leaf in wind. Second, the documentary value of the orchestra — many Tang instruments survive nowhere as objects, yet these walls preserve exactly how they were held, the angle of the neck, the placement of the fingers. Dunhuang, people say, is a museum that can still make sound.',
    },
    pigments: ['朱砂', '石青', '石绿', '雌黄', '泥金'],
    hotspots: [
      {
        id: 'hs-pipa-1',
        x: 50,
        y: 48,
        title: { zh: '反弹琵琶 · 三道弯', en: 'The Triple Curve' },
        description: {
          zh: '舞伎的身体被拧成三道弯：头、腰、腿各向不同方向。一足蹬地、一足踢起，重心在将倒未倒之间——这是整幅画最紧张也最优美的地方。',
          en: 'Her body twists into three curves — head, waist and leg each turning a different way. One foot braced, one kicked up, her balance held at the point of falling: the most tense and most beautiful passage in the whole painting.',
        },
        detailHighlight: '兰叶描：一根线画出丝绸与柔软',
      },
      {
        id: 'hs-pipa-2',
        x: 22,
        y: 52,
        title: { zh: '乐队 · 一支完整的唐代乐团', en: 'A Complete Tang Orchestra' },
        description: {
          zh: '左侧乐伎演奏排箫、笙、阮等，右侧有鼓与拍板。十余种乐器各有其位，持奏姿势精确，是研究唐代音乐最直接的图像材料。',
          en: 'Musicians at left play panpipes, mouth organ and ruan; drums and clappers answer from the right. More than a dozen instruments, each in its place, each held with precision — the most direct visual evidence we have for Tang music.',
        },
      },
    ],
    audioGuide: {
      duration: '1分10秒',
      transcripts: {
        zh: '请看画面中央这位舞伎。她把琵琶甩到背后，反腕去拨，同时一足蹬地、一足踢起，身体拧成一个优美的"三道弯"。请特别注意她的线条：这是盛唐一路传下来的"兰叶描"，一根线有粗有细、有起有伏，像兰叶在风中翻转，把丝绸的飘动和身体的柔软一次画尽。再看颜色：朱砂的红、石青的蓝、石绿的绿，再加一层薄薄的金箔。一千二百年过去了，红还在烧，蓝还在亮。左右两侧不是点缀，而是一支编制完整的乐队：排箫、笙、阮、鼓、拍板，十几种乐器同时发声。这些图像是研究唐代音乐最直接的材料——很多乐器在实物上早已失传，却在这些壁画里保存了演奏的姿势、持琴的角度、手指的位置。所以有人说，敦煌壁画是一座"会发声的博物馆"。',
        en: 'Look at the dancer at the centre. She swings the pipa behind her back and plucks it with a reversed wrist, one foot braced and the other lifted, her body twisting into an elegant triple curve. Study the line: this is the orchid-leaf stroke handed down from the High Tang, one stroke that swells and thins and turns like a leaf in the wind, drawing the drift of silk and the softness of flesh in a single pass. Then the colour: cinnabar red, azurite blue, malachite green and a whisper of gold leaf. Twelve hundred years on, the red still burns and the blue still glows. And on either side is not decoration but a fully scored orchestra — panpipes, mouth organ, ruan, drums, clappers, a dozen instruments sounding at once. These images are the most direct evidence we have for Tang music: many of these instruments survive nowhere as objects, yet the walls preserve how they were held, the angle of the neck, the placement of the fingers. Dunhuang, people say, is a museum that can still make sound.',
      },
    },
  },
  {
    id: 'mural-library',
    caveNumber: '第17窟',
    title: { zh: '洪辩影堂与双树侍女', en: 'The Memorial Hall of Hongbian' },
    dynasty: { zh: '晚唐', en: 'Late Tang' },
    eraPeriod: '公元851年',
    category: 'buddha',
    dimensions: '北壁 · 双树与近侍女',
    imageUrl: media('mural-cave-17.webp'),
    detailUrl: media('detail-cave-17.webp'),
    lineArtUrl: media('wash-library.webp'),
    scanSize: '10648 × 9327 px',
    description: {
      zh: '一个不足十平方米的小室，曾是晚唐河西都僧统洪辩的影堂。北壁晚唐画双树，西侧树下画近侍女一身，执杖持巾，树间挂布囊；东侧树下画比丘尼一身，手持纨扇，树间挂水壶。画面安静、克制，充满真实生活气息。',
      en: 'A room of under ten square metres, once the memorial hall of Hongbian, head of the Hexi monastic order in the late Tang. The north wall shows a pair of trees: beneath the western one a lay attendant holding a staff and towel with a cloth bag hung in the branches; beneath the eastern one a nun with a round fan and a water flask hanging among the leaves. Quiet, restrained, and full of real life.',
    },
    story: {
      zh: '这里原本不是书库，而是一间纪念堂。公元1900年6月22日，道士王圆箓清理第16窟积沙时偶然发现了一个封闭的耳室，里面堆满四至十一世纪的经卷、绢画、契约、账本、书信，六万余件。那些被当时人视为"废纸"的东西——借贷契约、离婚协议、学童练字的涂鸦、寺院账本、药方与食谱——恰恰让我们第一次看见了普通唐人的生活。',
      en: 'This was never a library but a memorial hall. On 22 June 1900 the caretaker Wang Yuanlu, clearing sand from Cave 16, came upon a sealed side chamber packed with scrolls, silk paintings, contracts, ledgers and letters from the fourth to eleventh centuries — more than sixty thousand items. And it was precisely the "waste paper" — loan contracts, divorce agreements, schoolboys\' practice scrawls, monastery accounts, prescriptions, recipes — that let us see ordinary Tang life for the first time.',
    },
    artisticValue: {
      zh: '与宏大的经变相比，这面墙的价值在于"日常"：一把执杖、一条手巾、一只挂在树上的布囊、一把纨扇、一只水壶。晚唐画师的写实能力在这里不再服务于宗教叙事，而是完整地描述两个人的照料与陪伴。',
      en: 'Compared with vast sutra illustrations, the value of this wall is its ordinariness: a staff, a towel, a cloth bag hung in a tree, a round fan, a water flask. Here the late Tang painter\'s realism serves no religious narrative at all — it simply describes two people caring for someone.',
    },
    pigments: ['赭石', '石绿', '朱砂', '松烟墨', '铅白'],
    hotspots: [
      {
        id: 'hs-library-1',
        x: 32,
        y: 56,
        title: { zh: '近侍女 · 执杖持巾', en: 'The Attendant with Staff and Towel' },
        description: {
          zh: '西侧树下的侍女手执杖与巾，树间挂着布囊。这些物件都是真实的生活用品，晚唐画师把"侍奉"画成了一系列具体的动作与器物。',
          en: 'Beneath the western tree the attendant holds a staff and towel, a cloth bag hanging in the branches. These are real household objects: late Tang painters turned service into a set of specific gestures and things.',
        },
        detailHighlight: '日常器物作为叙事的载体',
      },
      {
        id: 'hs-library-2',
        x: 68,
        y: 58,
        title: { zh: '比丘尼 · 手持纨扇', en: 'The Nun with a Round Fan' },
        description: {
          zh: '东侧树下的比丘尼手持纨扇，树间挂着一只水壶。整幅壁画的情感并不外露，而是靠这些细小的物件与安静的站姿传达。',
          en: 'Beneath the eastern tree a nun holds a round fan, a water flask hanging among the leaves. The emotion of the wall is never stated; it is carried by these small objects and by the stillness of the pose.',
        },
      },
    ],
    audioGuide: {
      duration: '1分15秒',
      transcripts: {
        zh: '您正站在世界上最小的著名洞窟之一里。它不到十平方米，却装下了六万余件文书。请注意，这里原本不是书库，而是一间纪念堂——晚唐河西都僧统洪辩的影堂。请看北壁：画着一对树。西侧树下是一位近侍女，手执杖和巾，树间挂着布囊；东侧树下是一位比丘尼，手持纨扇，树间挂着一只水壶。一把杖、一条巾、一个布囊、一把扇、一只水壶——晚唐画师的写实能力在这里不再服务于宗教叙事，它只是安静地描述了两个人如何照料另一个人。公元1900年6月22日，道士王圆箓在清理第16窟积沙时，偶然发现了这里的封门。里面堆满了四世纪到十一世纪的经卷、绢画、契约、账本和书信。有意思的是，那些被当时人视为"废纸"的东西——借贷契约、离婚协议、学童练字的涂鸦、寺院账本、药方和食谱——恰恰让我们第一次看见了普通唐人的生活。',
        en: 'You are standing in one of the smallest famous rooms in the world. Under ten square metres, yet it held more than sixty thousand documents. And notice: this was never a library but a memorial hall — the shrine of Hongbian, head of the Hexi monastic order in the late Tang. Look at the north wall: a pair of trees. Beneath the western one a lay attendant holds a staff and a towel, with a cloth bag hung in the branches; beneath the eastern one a nun holds a round fan, a water flask hanging among the leaves. A staff, a towel, a cloth bag, a fan, a flask — the late Tang painter\'s realism serves no religious narrative here; it simply and quietly describes how two people cared for another. On 22 June 1900 the caretaker Wang Yuanlu, clearing sand from Cave 16, happened upon the sealed door. Behind it were scrolls, silk paintings, contracts, ledgers and letters from the fourth to eleventh centuries. And remarkably, the things contemporaries treated as waste paper — loan agreements, divorce contracts, schoolboys\' practice scrawls, monastery accounts, prescriptions, recipes — are exactly what let us see ordinary Tang life for the first time.',
      },
    },
  },
];

/* =========================================================================
   Encyclopedia
   ========================================================================= */

export const ENCYCLOPEDIA_ENTRIES: EncyclopediaEntry[] = [
  {
    id: 'pigment-lapis',
    category: 'pigment',
    title: { zh: '石青 · 跨越帕米尔的深蓝', en: 'Azurite & Lapis: The Deep Blue from Beyond the Pamirs' },
    subtitle: { zh: '一种颜料，一条商路', en: 'One pigment, one trade route' },
    summary: {
      zh: '敦煌壁画中最贵重的蓝色。宝石级的青金石并不产自中原，它来自今阿富汗东北部的巴达赫尚，经帕米尔高原与河西走廊，用骆驼一路运到鸣沙山下。',
      en: 'The most precious blue at Dunhuang. Gem-grade lapis lazuli is not found in China: it comes from Badakhshan in north-eastern Afghanistan, carried by camel across the Pamirs and the Hexi corridor to the foot of the Singing Sand Dunes.',
    },
    content: {
      zh: [
        '产地与运输：青金石（Lapis Lazuli）的主要产地是今阿富汗巴达赫尚地区。中国境内并不出产宝石级青金石，莫高窟所用的优质石青几乎全部依靠丝绸之路的长途贸易输入，价格远高于黄金。',
        '使用方法：天然青金石需先粉碎、水选（"水飞"）多次，才能分离出杂质、得到纯净的蓝色粉末。颗粒越细颜色越浅，因此画师会用不同粗细的石青表现不同层次——最深的用于佛发与天衣，最浅的用于云气。',
        '为什么千年不褪：与植物染料不同，青金石是化学性质极其稳定的硅酸盐矿物。即使经历千年风沙与光照，它依然保持宝石般的蓝色；如今壁画上发绿、发暗的部分，往往是铜系颜料（石绿）的氧化，而不是石青。',
      ],
      en: [
        'Source and transport: gem-grade lapis comes from Badakhshan in present-day Afghanistan. China produced none, so almost all the fine blue at Mogao arrived by long-distance Silk Road trade, costing more than gold.',
        'Preparation: the stone was crushed and washed repeatedly ("water levigation") to separate out impurities and obtain pure blue powder. Finer grinding gives a paler blue, so painters used different grades for different depths — the deepest for Buddha hair and celestial robes, the palest for clouds.',
        'Why it never fades: unlike plant dyes, lapis is a chemically inert silicate. After a thousand years of sand and sunlight it keeps its jewel blue. The green and dark patches on the walls today are usually oxidised copper pigments such as malachite, not azurite.',
      ],
    },
    image: media('encyc-lapis.webp'),
    attributes: {
      化学成分: 'Na₈(AlSiO₄)₆(SO₄,S,Cl)₂',
      古代产地: '阿富汗巴达赫尚 (Badakhshan)',
      代表洞窟: '第257窟、第420窟、第285窟',
      颜料特性: '耐光、抗碱、色泽深邃',
    },
  },
  {
    id: 'pigment-cinnabar',
    category: 'pigment',
    title: { zh: '朱砂与变色之谜', en: 'Cinnabar, and the Mystery of Blackened Faces' },
    subtitle: { zh: '为什么早期壁画里的人变黑了', en: 'Why early murals have dark faces' },
    summary: {
      zh: '十六国与北朝洞窟中，许多人物原本粉嫩的面容如今呈暗棕或铅灰。这不是画师本意，而是含铅、汞的矿物颜料在千年光照与潮气中发生了化学变化。',
      en: 'In the earliest caves many figures whose faces were once pink and fresh now appear dark brown or leaden grey. This is not what the painter intended: it is chemistry — lead- and mercury-based pigments changing over a thousand years of light and humidity.',
    },
    content: {
      zh: [
        '变色机制：画师调配肉色时大量使用了铅丹（Pb₃O₄）与白铅粉。在微量硫化气体、光照与湿气作用下，铅丹会转化为二氧化铅（PbO₂），呈暗棕色——于是"晒黑"发生了，而且是不可逆的。',
        '朱砂为何稳定：天然朱砂是硫化汞（HgS），化学性质远比铅丹稳定。它被用来勾勒佛唇、璎珞与背光，许多朱红至今仍然鲜明。在古代中原，朱砂还被视为驱邪的灵石。',
        '现代修复的可能：敦煌研究院借助高光谱成像、多光谱扫描与拉曼光谱分析，已能在不接触壁画的前提下识别每一种颜料，并在计算机中数字复原部分壁画初绘时的色彩——您在本站看到的"原作 / 细节 / 线稿"三种视图，就是这种思路的简化版。',
      ],
      en: [
        'Mechanism: flesh tones were mixed with minium (Pb₃O₄) and white lead. Under trace sulphur gases, light and moisture, minium converts to lead dioxide (PbO₂) — a dark brown. So the "tanning" happened, and it is irreversible.',
        'Why cinnabar survives: natural cinnabar is mercury sulphide (HgS), far more stable than lead red. It was used for lips, necklaces and halos, and much of it is still vivid. In ancient China it was also regarded as a protective stone.',
        'Digital restoration: using hyperspectral imaging, multispectral scanning and Raman spectroscopy, the Dunhuang Academy can now identify every pigment without touching the surface, and reconstruct the original colours digitally.',
      ],
    },
    image: media('encyc-cinnabar.webp'),
    attributes: {
      变色原因: '铅丹 → 二氧化铅 (PbO₂)',
      稳定颜料: '朱砂 HgS',
      代表洞窟: '第257窟、第254窟（北魏人物）',
      检测手段: '高光谱 / 拉曼光谱',
    },
  },
  {
    id: 'instrument-pipa',
    category: 'instrument',
    title: { zh: '琵琶 · 从波斯到敦煌', en: 'The Pipa: From Persia to Dunhuang' },
    subtitle: { zh: '壁画里的乐器图鉴', en: 'An instrument catalogue written on walls' },
    summary: {
      zh: '琵琶经由丝绸之路传入中原，在唐代成为最流行的乐器。敦煌壁画中保存了上千件乐器的图像，包括大量今天已无实物留存的品种，凭这些图像可以复原它们的持奏方式。',
      en: 'The pipa entered China along the Silk Road and became the most popular instrument of the Tang. Dunhuang walls preserve images of over a thousand instruments, including many that survive nowhere as objects — enough to reconstruct exactly how they were played.',
    },
    content: {
      zh: [
        '形制：唐代琵琶多为四弦、梨形音箱、曲项。第112窟的舞伎所持即为此型，图像中还可以看出轸子、缚弦与面板的细节。',
        '反弹琵琶：把琵琶举到背后反手拨弦，在唐代乐舞中可能确有其技。第112窟南壁《观无量寿经变》中这一姿态，后来成为敦煌乃至中国乐舞艺术的象征，1979年的舞剧《丝路花雨》让它再度风靡世界。',
        '乐队编制：壁画中的乐队动辄十余人，包含排箫、笙、筚篥、阮、筝、腰鼓、答腊鼓、拍板等。乐器的组合与座次本身就是一份唐代音乐制度的记录。',
      ],
      en: [
        'Construction: Tang pipas were usually four-stringed with a pear-shaped body and a bent neck. The dancer in Cave 112 holds exactly this type, and the pegs, string fastener and soundboard are all legible.',
        'Reverse playing: lifting the instrument behind the back and plucking with a reversed wrist may well have been a real technique. The pose on the south wall of Cave 112 became the emblem of Dunhuang and of Chinese dance, and the 1979 ballet Along the Silk Road made it famous worldwide once again.',
        'The orchestra: ensembles in the murals often number a dozen or more players — panpipes, mouth organ, bili oboe, ruan, zither, waist drum, dala drum and clappers. Their combination and seating is itself a record of Tang musical institutions.',
      ],
    },
    image: media('encyc-pipa.webp'),
    attributes: {
      形制: '四弦 · 梨形音箱 · 曲项',
      代表图像: '第112窟 南壁 反弹琵琶',
      乐队乐器: '排箫 / 笙 / 阮 / 鼓 / 拍板',
      传承影响: '1979年舞剧《丝路花雨》',
    },
  },
  {
    id: 'figure-guardians',
    category: 'figure',
    title: { zh: '天王与力士 · 护法的身体', en: 'Guardian Kings: The Body as Protection' },
    subtitle: { zh: '敦煌壁画里的力量如何被画出来', en: 'How strength gets painted' },
    summary: {
      zh: '天王、力士、药叉是敦煌壁画中唯一被允许"用力"的形象。画师把人体夸张成弓形与块面，用翻卷的飘带与紧咬的牙关，把守护画成一种可感的重量。',
      en: 'Guardian kings, vajra warriors and yakshas are the only figures at Dunhuang allowed to strain. Painters exaggerate the body into bow-shapes and slabs, using whipping ribbons and clenched jaws to make protection feel like weight.',
    },
    content: {
      zh: [
        '造型语言：天王多着铠甲，脚踏小鬼，一臂高举；力士袒露上身，肌肉以粗重的墨线勾出块面；药叉（金刚力士）常画在壁面最下层，形态怪异而充满动势。',
        '飘带的妙用：护法神身上的飘带不是装饰，而是"速度线"——它让静止的站姿产生运动感，同时把力量从身体传导到画面之外。',
        '与佛的对比：佛与菩萨的身体永远是安静的、垂直的、内敛的；天王与力士则被画成倾斜的、扩张的、外放的。敦煌的画师用身体姿态就完成了宗教等级的区分。',
      ],
      en: [
        'Form language: guardian kings wear armour and trample demons, one arm raised; vajra warriors are bare-chested, muscle modelled in heavy ink slabs; yakshas occupy the lowest register, grotesque and full of motion.',
        'The work of ribbons: the scarves on a guardian are not decoration but speed lines — they set a still pose in motion and carry the force outward past the edge of the picture.',
        'Contrast with the Buddha: Buddhas and bodhisattvas are always still, vertical, contained; guardians are tilted, expansive, projected outward. Posture alone establishes the hierarchy of the sacred.',
      ],
    },
    image: media('encyc-guardian.webp'),
    attributes: {
      代表形象: '天王 / 力士 / 药叉',
      常见位置: '壁面下层、龛外两侧、门侧',
      造型手法: '粗墨块面 + 飘带加速度线',
      代表洞窟: '第285窟、第254窟',
    },
  },
  {
    id: 'craft-caisson',
    category: 'craft',
    title: { zh: '藻井 · 中国建筑最华丽的一格', en: 'The Caisson: A Ceiling\'s Most Ornate Square' },
    subtitle: { zh: '为什么最高处要画水草莲花', en: 'Why water plants belong at the top of a building' },
    summary: {
      zh: '"藻"是水生植物，"井"是井口。古人相信在木构建筑的最高处画上水草与莲花可以厌火，于是藻井成了中国建筑里装饰最繁复的部位：一圈圈方井向中心收拢，宝相花或三兔端坐其中。',
      en: '"Zao" means water plant, "jing" a well mouth. The ancients believed that painting waterweed and lotus at the highest point of a timber building would hold fire at bay — and so the caisson became the most ornate part of any Chinese interior: square frames converging inward on a central medallion.',
    },
    content: {
      zh: [
        '结构：藻井由层层出挑的斗拱围合而成，形成向上收拢的方形凹面。画师在每一层画出不同的边饰——卷草、联珠、团花、鳞纹、垂幔，层层递进，越往上越繁密。',
        '井心图像：最中心的一格是整窟的"句号"。隋代多画三兔共耳或莲花，盛唐多画云头牡丹，西魏则常见斗四莲花配以化生童子。',
        '观看方式：藻井是为"仰望"设计的。请您在洞窟里站定，慢慢抬头——视觉会被方井的收拢与中心图案的旋转带着走，这是古代工匠的沉浸式设计。',
      ],
      en: [
        'Structure: the caisson is formed by tiers of bracket sets stepping inward, creating a square recess that narrows as it rises. Each tier carries different border ornament — scrolling vine, beaded string, rosettes, scale pattern, hanging valance — densifying toward the top.',
        'The centre: the innermost square is the full stop of the cave. Sui caves favour the three hares or a lotus; High Tang caves a cloud-scroll peony; Western Wei caves a lotus of nested squares with reborn children.',
        'How to look: the caisson was designed for looking up. Stand still and raise your head slowly — the converging frames and the rotation at the centre pull your eye along. This is ancient immersive design.',
      ],
    },
    image: media('encyc-caisson.webp'),
    attributes: {
      名称来源: '"藻"水草 + "井"井口，取厌火之意',
      常见井心: '莲花 / 三兔共耳 / 云头牡丹',
      代表洞窟: '第420窟（三兔）、第320窟（牡丹）、第285窟（斗四莲花）',
      观看方式: '仰视——为抬头而设计',
    },
  },
];

/* =========================================================================
   Quiz
   ========================================================================= */

export const CULTURAL_QUIZ = [
  {
    id: 'q1',
    question: {
      zh: '第420窟隋代藻井的"三兔共耳"中，三只兔子一共画了几只耳朵？',
      en: 'In the Sui caisson of Cave 420, how many ears are drawn for the three hares in total?',
    },
    options: {
      zh: ['6 只', '3 只，两两共用', '4 只', '9 只'],
      en: ['Six', 'Three, shared in pairs', 'Four', 'Nine'],
    },
    correctAnswer: 1,
    explanation: {
      zh: '画师只画了三只耳朵，相邻两兔共用一只，于是每只兔子看起来都有双耳——一个一千五百年前的视觉魔术。同样的图形也出现在中亚、伊朗与欧洲中世纪教堂里。',
      en: 'Only three ears are drawn, each shared by two neighbours, so every hare appears to have a pair — an optical trick fifteen centuries old. The same figure appears in Central Asia, Iran and medieval European churches.',
    },
  },
  {
    id: 'q2',
    question: {
      zh: '被誉为东方舞姿图腾的"反弹琵琶"，画在第几窟？',
      en: 'In which cave is the iconic reverse-played pipa painted?',
    },
    options: {
      zh: ['第257窟', '第112窟', '第320窟', '第17窟'],
      en: ['Cave 257', 'Cave 112', 'Cave 320', 'Cave 17'],
    },
    correctAnswer: 1,
    explanation: {
      zh: '第112窟南壁《观无量寿经变》的乐舞场面中，舞伎反手于背后拨弦。1979年的舞剧《丝路花雨》让这个姿态再次风靡世界。',
      en: 'It appears in the music-and-dance passage of the Contemplation Sutra illustration on the south wall of Cave 112. The 1979 ballet Along the Silk Road made the pose world-famous again.',
    },
  },
  {
    id: 'q3',
    question: {
      zh: '早期壁画中人物皮肤变成暗棕色，主要是什么原因？',
      en: 'Why did figures in the earliest murals turn dark brown?',
    },
    options: {
      zh: ['烟熏火燎', '铅丹颜料氧化成二氧化铅', '后人重绘', '颜料被人为刮除'],
      en: ['Soot from lamps', 'Lead red oxidising into lead dioxide', 'Later repainting', 'Pigment deliberately scraped off'],
    },
    correctAnswer: 1,
    explanation: {
      zh: '调配肉色时大量使用的铅丹（Pb₃O₄）在光照、湿气与微量硫化物作用下转为黑色的二氧化铅，于是原本粉润的面容变成了暗棕或铅灰。',
      en: 'Minium (Pb₃O₄), used liberally in flesh tones, converts to black lead dioxide under light, moisture and trace sulphur — turning pink faces dark brown or lead grey.',
    },
  },
  {
    id: 'q4',
    question: {
      zh: '第249窟窟顶四披画的是哪一类图像？',
      en: 'What kind of imagery fills the ceiling slopes of Cave 249?',
    },
    options: {
      zh: ['千佛行列', '汉地神话：西王母、东王公、阿修罗王', '供养人列队', '经变中的建筑'],
      en: ['Rows of thousand Buddhas', 'Chinese myth: Queen Mother of the West, King Father of the East, Asura', 'Donor processions', 'Architecture from sutra illustrations'],
    },
    correctAnswer: 1,
    explanation: {
      zh: '西魏画师把汉地的西王母、东王公、阿修罗王、雷神、飞廉与印度的飞天画在同一个穹顶上，用云气把它们缝在一起——这是佛教东传途中与汉文化最深的一次融合。',
      en: 'Western Wei painters put the Queen Mother of the West, the King Father of the East, the Asura, the thunder god and feilían on one vault together with Indian apsaras, stitching them with cloud scrolls — the deepest fusion of Buddhism with Chinese tradition.',
    },
  },
  {
    id: 'q5',
    question: {
      zh: '第17窟原本是什么用途的空间？',
      en: 'What was Cave 17 originally built as?',
    },
    options: {
      zh: ['藏经书库', '洪辩法师的影堂（纪念堂）', '僧人禅修窟', '商旅驿站'],
      en: ['A library', 'The memorial hall of the monk Hongbian', 'A meditation cell', 'A merchant waystation'],
    },
    correctAnswer: 1,
    explanation: {
      zh: '它本是晚唐河西都僧统洪辩的影堂。后来被封存了六万余件文书，1900年王圆箓发现后，敦煌学由此诞生。',
      en: 'It was the memorial hall of Hongbian, head of the Hexi monastic order. It was later sealed with more than sixty thousand documents; its discovery by Wang Yuanlu in 1900 gave birth to Dunhuang studies.',
    },
  },
];

export const INITIAL_COMMENTS = [
  {
    id: 'c1',
    author: '云中客',
    avatar: media('seal-emblem.webp'),
    time: '三天前',
    text: '第一次知道"沥粉贴金"是立体的，原来金冠真的会随光线闪。',
    muralId: 'mural-beauty',
  },
  {
    id: 'c2',
    author: '沙洲行者',
    avatar: media('seal-emblem.webp'),
    time: '一周前',
    text: '第254窟那幅舍身饲虎，戴耳机听讲解的时候真的不敢呼吸。',
    muralId: 'mural-tigress',
  },
  {
    id: 'c3',
    author: '鸣沙',
    avatar: media('seal-emblem.webp'),
    time: '两周前',
    text: '放大到石青的颗粒都能看见，比我当年在洞窟里打手电看的清楚多了。',
    muralId: 'mural-threehares',
  },
];
