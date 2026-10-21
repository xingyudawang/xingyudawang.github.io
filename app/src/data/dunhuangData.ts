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
  {
    id: 'cave-220',
    number: '第220窟',
    name: { zh: '帝王图 · 维摩诘经变窟', en: 'Cave of the Vimalakīrti Emperor Procession' },
    dynasty: { zh: '初唐', en: 'Early Tang' },
    era: '贞观十六年（642年）',
    coverImage: media('mural-cave-220.webp'),
    cliffLevel: '中层崖壁 · 覆斗顶窟',
    tags: ['帝王问疾图', '维摩诘经变', '药师七佛乐舞', '最早净土变'],
    highlightMuralId: 'mural-vimalakirti',
    hook: { zh: '初唐画坛的第一流高手，把大唐气度画满了四壁', en: 'The full confidence of the early Tang, painted across all four walls' },
    description: {
      zh: '开凿于贞观十六年（642年）的翟家窟。东壁《维摩诘经变》中的帝王问疾图，帝王冕旒大裘、群臣与各国王子相随，气度堂皇；北壁《药师经变》中的七佛与乐舞场面，是唐代音乐史的重要图像；南壁《阿弥陀经变》是莫高窟最早、场面最大的净土变。1943年剥离表层宋代壁画后，这批初唐杰作才重见天日。',
      en: 'A family cave of the Zhai clan, cut in 642 CE. The emperor procession in the Vimalakīrti illustration on the east wall — crown, robes, ministers and foreign princes — carries the full dignity of the early Tang; the seven Medicine Buddhas and their dance troupe on the north wall are a cornerstone of Tang music history; and the Amitābha illustration on the south wall is the earliest and largest Pure Land tableau at Mogao. The early Tang paintings were only revealed in 1943 when a later Song-dynasty layer was removed.',
    },
  },
  {
    id: 'cave-61',
    number: '第61窟',
    name: { zh: '五台山图窟 · 文殊堂', en: 'Cave of the Mount Wutai Map' },
    dynasty: { zh: '五代', en: 'Five Dynasties' },
    era: '10世纪 · 曹氏归义军时期',
    coverImage: media('mural-cave-61.webp'),
    cliffLevel: '中层崖壁 · 覆斗顶窟',
    tags: ['五台山图', '地图式山水', '文殊信仰', '华盖式藻井'],
    highlightMuralId: 'mural-wutai',
    hook: { zh: '一张十三米长的五台山地图，画在石窟的西壁上', en: 'A thirteen-metre map of Mount Wutai painted across the west wall' },
    description: {
      zh: '五代曹氏归义军时期开凿的"文殊堂"。西壁通壁绘制《五台山图》，长13米、高3.6米，把五台山及周边五百里山川、寺院、道路、商旅、朝圣者尽收画中，是现存最宏大的地图式山水画；南北两壁上部各绘五铺大型经变；窟顶是巨大的华盖式藻井，井心为五莲团龙鹦鹉。',
      en: 'The "Hall of Mañjuśrī", cut under the Cao family government of Dunhuang in the tenth century. The whole west wall is given to a Map of Mount Wutai, thirteen metres long by 3.6 high — mountains, monasteries, roads, merchants and pilgrims across five hundred li of landscape, the grandest map-like landscape painting in existence. The north and south walls each carry five great sutra illustrations above, and the ceiling is a vast canopy-shaped caisson centred on five lotuses, dragons and parrots.',
    },
  },
  {
    id: 'cave-217',
    number: '第217窟',
    name: { zh: '青绿山水经变窟', en: 'Cave of the Blue-Green Landscape' },
    dynasty: { zh: '盛唐', en: 'High Tang' },
    era: '公元8世纪初',
    coverImage: media('mural-cave-217.webp'),
    cliffLevel: '中层崖壁 · 覆斗顶窟',
    tags: ['观无量寿经变', '青绿山水', '十六观', '法华经变'],
    highlightMuralId: 'mural-amitayus',
    hook: { zh: '唐代青绿山水的巅峰，不在卷轴上，在洞窟里', en: 'The peak of Tang blue-green landscape, painted on a cave wall' },
    description: {
      zh: '盛唐覆斗顶窟。北壁《观无量寿经变》以青绿重彩绘出山峦、流水、楼阁与人物，山水不再只是背景，而是与净土世界互相贯通——被视为唐代青绿山水的代表作之一；东壁通壁画《法华经·观音普门品》，把诸难救济画成一幅幅独立的山水小品。',
      en: 'A High Tang cave with an inverted-funnel ceiling. The Contemplation Sutra illustration on the north wall builds mountains, streams, pavilions and figures in heavy blue-green mineral colour — landscape no longer a backdrop but continuous with the Pure Land itself, and counted among the masterpieces of Tang blue-green painting. The east wall is entirely given to the Guanyin chapter of the Lotus Sutra, each rescue painted as its own small landscape.',
    },
  },
  {
    id: 'cave-323',
    number: '第323窟',
    name: { zh: '佛教史迹画窟 · 张骞出使西域', en: 'Cave of Buddhist History Painting' },
    dynasty: { zh: '初唐', en: 'Early Tang' },
    era: '公元7世纪',
    coverImage: media('mural-cave-323.webp'),
    cliffLevel: '中层崖壁 · 覆斗顶窟',
    tags: ['张骞出使西域', '汉武帝拜金人', '石佛浮江', '佛教史迹画'],
    highlightMuralId: 'mural-zhangqian',
    hook: { zh: '把张骞出使西域，画进了佛教的史诗', en: 'Zhang Qian\'s journey to the west, painted into a Buddhist epic' },
    description: {
      zh: '初唐窟。北壁中部绘佛教史迹画，第一景即"汉武帝拜金人"与"张骞出使西域"——把佛教传入中国与凿空西域的历史连缀成因果；南壁绘吴淞江石佛浮江、扬都出金像等江南感应故事。这些"史迹画"是敦煌特有的题材，把历史、传说与信仰织进同一幅长卷。',
      en: 'An Early Tang cave. The middle register of the north wall carries Buddhist history paintings whose first episode shows Emperor Wu of Han worshipping a golden statue, and Zhang Qian setting out for the Western Regions — the coming of Buddhism to China fused into a single chain of cause and effect with the opening of the Silk Road. The south wall tells the miracle tales of the stone Buddha floating up the Wusong River and the golden image of Yangdu. Such "history paintings" are a genre unique to Dunhuang, weaving history, legend and faith into one scroll.',
    },
  },
  {
    id: 'cave-3',
    number: '第3窟',
    name: { zh: '千手千眼观音窟', en: 'Cave of the Thousand-Armed Avalokiteśvara' },
    dynasty: { zh: '元代', en: 'Yuan' },
    era: '公元13–14世纪',
    coverImage: media('mural-cave-3.webp'),
    cliffLevel: '底层崖壁 · 小型洞窟',
    tags: ['千手千眼观音', '十一面观音', '元代线描', '散财观音'],
    highlightMuralId: 'mural-sahasrabhuja',
    hook: { zh: '千手千眼，全是画师用一根根细线画出来的', en: 'A thousand arms and eyes, every one of them drawn by hand' },
    description: {
      zh: '莫高窟保存最完好的元代洞窟。南北两壁各绘一铺十一面千手千眼观音立像，观音立于莲花之上，千手如光轮般展开，掌中各有一眼；东壁绘散财观音，宝物从手中流泻而下。整个洞窟没有大块浓彩，全凭细劲的线描与淡彩完成，是元代白描艺术在敦煌的最高成就。',
      en: 'The best-preserved Yuan-dynasty cave at Mogao. The north and south walls each carry a standing eleven-faced, thousand-armed Avalokiteśvara on a lotus, arms spread like a wheel of light with an eye in every palm; on the east wall a treasure-scattering Guanyin lets jewels pour from her hands. There are no heavy blocks of colour here — the whole cave is achieved with fine taut line drawing and thin washes, the summit of Yuan outline painting at Dunhuang.',
    },
  },
  {
    id: 'cave-329',
    number: '第329窟',
    name: { zh: '莲花飞天藻井窟', en: 'Cave of the Lotus-Apsara Caisson' },
    dynasty: { zh: '初唐', en: 'Early Tang' },
    era: '公元7世纪',
    coverImage: media('mural-cave-329.webp'),
    cliffLevel: '中层崖壁 · 覆斗顶窟',
    tags: ['莲花飞天藻井', '法轮花心', '阿弥陀经变', '弥勒经变'],
    highlightMuralId: 'mural-lotusapsara',
    hook: { zh: '四身飞天绕着莲花，在蓝天上转了千年', en: 'Four apsaras circling a lotus in a blue sky for a thousand years' },
    description: {
      zh: '初唐覆斗顶窟。窟顶藻井为莲花飞天井心：中心大团花呈五色法轮状，四身持花飞天在湛蓝天空中有蓝云围绕，同向飞行，是初唐藻井中的名作；四披画伎乐天环绕藻井飞行；南壁绘阿弥陀经变，以绿水楼阁表现净土；北壁绘弥勒经变，水池亭台间尽是七宝庄严。',
      en: 'An Early Tang cave with an inverted-funnel ceiling. Its caisson carries the famous lotus-and-apsara centre: a great floral medallion like a five-coloured dharma wheel, with four flower-bearing apsaras flying the same way around it against a deep blue sky and blue clouds. On the slopes, celestial musicians circle the caisson; the south wall shows the Amitābha Pure Land with green pools and pavilions, the north the Maitreya paradise with its seven-jewel terraces.',
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
  {
    id: 'mural-vimalakirti',
    caveNumber: '第220窟',
    title: { zh: '维摩诘经变 · 帝王问疾图', en: 'Vimalakīrti and the Emperor\'s Visit' },
    dynasty: { zh: '初唐', en: 'Early Tang' },
    eraPeriod: '贞观十六年（642年）',
    category: 'sutra',
    dimensions: '东壁 · 经变画',
    imageUrl: media('mural-cave-220.webp'),
    detailUrl: media('detail-cave-220.webp'),
    lineArtUrl: media('wash-vimalakirti.webp'),
    scanSize: '23971 × 14352 px',
    description: {
      zh: '《维摩诘经》里，居士维摩诘示疾，佛陀遣文殊问疾。画面上维摩诘与文殊相对辩论，而最出名的是文殊一侧的"帝王问疾图"：中原帝王头戴冕旒、身着大裘，群臣簇拥，各国王子相随——唐人把当时最熟悉的天可汗仪仗，画进了佛经故事。',
      en: 'In the Vimalakīrti Sutra the layman Vimalakīrti feigns illness and the Buddha sends Mañjuśrī to inquire. The two debate across the composition, but the most famous passage is on Mañjuśrī\'s side: an emperor in full regalia — crown, great robes, ministers, and foreign princes in his train. The painters dressed the episode in the ceremony of their own Tang court, the Son of Heaven walking into a sutra.',
    },
    story: {
      zh: '第220窟开凿于贞观十六年，是敦煌翟氏家族的"家窟"。画师留下的不是某一位文人的名字，而是一整套初唐的视觉语言：人物丰腴而挺立，衣纹爽利，色彩以朱、青、绿大块铺陈。1943年，剥开表层的宋代壁画，这批被遮蔽近千年的初唐原作第一次露出了真容。',
      en: 'Cave 220 was cut in 642 as the family cave of the Zhai clan. The painters left no individual signatures, but a complete early Tang visual language: full-bodied upright figures, crisp drapery, and large fields of cinnabar, azurite and malachite. In 1943 the overlying Song-dynasty layer was removed, and these originals, hidden for nearly a thousand years, were seen again.',
    },
    artisticValue: {
      zh: '初唐画坛高手的集体亮相。人物开脸圆润、体态敦厚，衣褶用"游丝描"与"铁线描"交错，线条爽劲而富有弹性；构图上维摩诘居左、文殊居右，中间留白处的天女散花把两侧辩论"缝"成一个整体。',
      en: 'A collective showcase of the finest early Tang hands. Faces are full and bodies solid, drapery drawn with an interplay of gossamer and iron-wire strokes, the line crisp and springy. Vimalakīrti occupies the left, Mañjuśrī the right, and the heavenly maiden scattering flowers across the gap sews the debate into one image.',
    },
    pigments: ['朱砂', '石青', '石绿', '雌黄', '铅白', '松烟墨'],
    hotspots: [
      {
        id: 'hs-vk-1',
        x: 62,
        y: 42,
        title: { zh: '帝王问疾图 · 天可汗的仪仗', en: 'The Emperor\'s Procession' },
        description: {
          zh: '帝王戴冕旒、服大裘，随行群臣按品级排列，各国王子深目高鼻。这是研究唐代舆服制度最完整的图像之一。',
          en: 'The emperor wears his crown and great robes, ministers ranked behind him, foreign princes deep-eyed and high-nosed in their train. It is one of the most complete visual records of Tang court costume.',
        },
      },
      {
        id: 'hs-vk-2',
        x: 30,
        y: 44,
        title: { zh: '维摩诘 · 辩才无碍的居士', en: 'Vimalakīrti the Layman' },
        description: {
          zh: '维摩诘凭几而坐，神情从容，衣带飘举。画师把这位"辩才第一"的居士画得比任何菩萨都更像一个真实的人。',
          en: 'Vimalakīrti sits at ease, composed, sashes lifting. The painter gave this greatest of debaters more human presence than any bodhisattva on the wall.',
        },
      },
    ],
    audioGuide: {
      duration: '1分15秒',
      transcripts: {
        zh: '请看东壁。这是《维摩诘经》最著名的一幕：居士维摩诘称病，佛陀派智慧的文殊菩萨去探病，两人展开了一场关于"不二法门"的大辩论。但真正让这幅画出名的，是文殊这一侧的帝王问疾图——头戴冕旒、身着大裘的帝王，身后跟着按品级排列的群臣，还有深目高鼻的各国王子。唐人把贞观年间最熟悉的朝堂仪仗，整个搬进了佛经故事。有意思的是：这些初唐杰作，直到1943年才重见天日。之前将近一千年里，它们一直被一层宋代壁画盖着。剥开表层的那一刻，等于把整个初唐画坛的最高水平，还给了世界。',
        en: 'Look at the east wall. This is the most famous episode of the Vimalakīrti Sutra: the layman Vimalakīrti feigns illness, the Buddha sends the wise Mañjuśrī to visit, and the two hold a great debate on the dharma gate of non-duality. But what made the painting famous is the emperor procession on Mañjuśrī\'s side — the ruler in crown and great robes, ministers ranked behind him, foreign princes deep-eyed and high-nosed in his train. The painters dressed the episode in the court ceremony of their own Zhenguan era and marched it into a sutra. And note this: these early Tang masterpieces were only revealed in 1943. For nearly a thousand years they had lain under a later Song-dynasty layer. The moment that surface came off, the finest painting of the early Tang was given back to the world.',
      },
    },
  },
  {
    id: 'mural-wutai',
    caveNumber: '第61窟',
    title: { zh: '五台山图', en: 'The Map of Mount Wutai' },
    dynasty: { zh: '五代', en: 'Five Dynasties' },
    eraPeriod: '10世纪',
    category: 'sutra',
    dimensions: '西壁通壁 · 长13米 高3.6米',
    imageUrl: media('mural-cave-61.webp'),
    detailUrl: media('detail-cave-61.webp'),
    lineArtUrl: media('wash-wutai.webp'),
    scanSize: '52568 × 22818 px',
    description: {
      zh: '现存最宏大的地图式山水画。画面以五台山为中心，把五百里山川、数十座寺院、城郭村庄、桥梁道路尽收其中，行人、商队、驼马、朝圣者络绎于途——它不是一张风景画，而是一张可以"走"的地图。',
      en: 'The grandest map-like landscape painting in existence. Centred on Mount Wutai, it takes in five hundred li of mountains, dozens of monasteries, towns and villages, bridges and roads, crowded with travellers, merchant caravans, camels and pilgrims. It is not a landscape to admire but a map to travel.',
    },
    story: {
      zh: '五台山是文殊菩萨的道场。五代时，敦煌与中原的交通虽然阻隔，文殊信仰却更加炽热。曹氏家族开凿第61窟，把它建成一座"文殊堂"，并用整面西壁画下五台山——对于无法亲赴五台的敦煌信众，这面墙就是山本身。',
      en: 'Mount Wutai is the seat of Mañjuśrī. In the tenth century, though the roads between Dunhuang and the Central Plains were cut, devotion to Mañjuśrī burned hotter than ever. The Cao family cut Cave 61 as his hall and gave the entire west wall to the mountain — for believers in Dunhuang who could never make the journey, this wall was the mountain itself.',
    },
    artisticValue: {
      zh: '它把"舆地图"的画法用到了宗教题材上：山川用俯瞰的角度、建筑却用正立面，道路把一处处地名串联起来，榜题密密麻麻写满地名与寺院名。看这张画，等于拿到一份十世纪的五台山旅行手册。',
      en: 'It applies cartographic method to a religious subject: mountains are seen from above, buildings in elevation, and roads thread the place names together, with inscriptions identifying every site. To read it is to hold a tenth-century travel guide to Mount Wutai.',
    },
    pigments: ['石青', '石绿', '赭石', '朱砂', '铅白'],
    hotspots: [
      {
        id: 'hs-wt-1',
        x: 42,
        y: 34,
        title: { zh: '大清凉之寺 · 山中的都城', en: 'The Great Qingliang Monastery' },
        description: {
          zh: '画面中的寺院殿堂层层，中轴线上高阁矗立。五代画师用正立面的建筑画法，把一座寺院画得像一座微缩的都城。',
          en: 'Halls and pavilions stack in depth, a tall pavilion on the central axis. Using frontal elevation, the painter turns a monastery into a miniature capital.',
        },
      },
      {
        id: 'hs-wt-2',
        x: 66,
        y: 58,
        title: { zh: '朝圣之路 · 络绎于途的旅人', en: 'The Road of Pilgrims' },
        description: {
          zh: '山路上有挑担的行脚僧、骑马的官员、驼着货物的商队。山路把人引向画外——也引向真正的五台山。',
          en: 'On the mountain roads walk monks with shoulder poles, mounted officials and camel caravans. The paths lead the eye out of the frame — toward the real Mount Wutai.',
        },
      },
      {
        id: 'hs-wt-3',
        x: 22,
        y: 50,
        title: { zh: '榜题 · 地名织成的地图', en: 'Inscriptions: A Map of Names' },
        description: {
          zh: '山间密布榜题，写着城郭、寺院与关口之名。正是这些文字，让这幅山水变成了一幅真正可以导航的地图。',
          en: 'The mountainside is dense with cartouches naming towns, monasteries and passes. It is these inscriptions that turn a landscape into a navigable map.',
        },
      },
    ],
    audioGuide: {
      duration: '1分15秒',
      transcripts: {
        zh: '请看西壁。这是一张十三米长、三米六高的《五台山图》——现存最宏大的地图式山水画。五台山是文殊菩萨的道场。五代时期，敦煌到中原的路断了，但文殊信仰反而更热。曹氏家族凿了这座"文殊堂"，然后用整面西壁画下五台山。请靠近看：山川用俯瞰的角度，建筑却画成正立面，道路把一座座寺院、城郭、关口串起来，榜题密密麻麻写满地名。山路上有挑担的行脚僧、骑马的官员、驼着货物的商队。对于没法亲赴五台的敦煌信众，这面墙就是山本身。拿到这张画，等于拿到一份十世纪的五台山旅行手册。',
        en: 'Look at the west wall. This is a Map of Mount Wutai, thirteen metres long and 3.6 high — the grandest map-like landscape painting in existence. Mount Wutai is the seat of Mañjuśrī. In the tenth century the road from Dunhuang to the Central Plains was cut, yet devotion to Mañjuśrī burned hotter than ever. The Cao family cut this hall in his honour and gave the whole west wall to the mountain. Look closer: the mountains are seen from above, the buildings in frontal elevation, and roads thread through monasteries, towns and passes, with cartouches naming every site. On the paths walk monks with shoulder poles, mounted officials, camel caravans. For the faithful of Dunhuang who could never make the journey, this wall was the mountain itself. To hold this painting is to hold a tenth-century travel guide to Mount Wutai.',
      },
    },
  },
  {
    id: 'mural-amitayus',
    caveNumber: '第217窟',
    title: { zh: '观无量寿经变 · 青绿山水', en: 'Contemplation Sutra in Blue-Green Landscape' },
    dynasty: { zh: '盛唐', en: 'High Tang' },
    eraPeriod: '公元8世纪初',
    category: 'sutra',
    dimensions: '北壁 · 通壁经变',
    imageUrl: media('mural-cave-217.webp'),
    detailUrl: media('detail-cave-217.webp'),
    lineArtUrl: media('wash-amitayus.webp'),
    scanSize: '19733 × 13146 px',
    description: {
      zh: '《观无量寿经变》画的是韦提希夫人依佛所教、次第观想净土的故事。画师把"十六观"画进层层青绿山水之间——山不是背景，而是观想本身发生的地方；净土世界的楼阁与真实的山川，共用同一条地平线。',
      en: 'The Contemplation Sutra tells of Queen Vaidehi, taught by the Buddha to visualise the Pure Land step by step. The painter set the sixteen contemplations inside tier after tier of blue-green landscape — the mountains are not backdrop but the very place where contemplation happens, and the pavilions of paradise share one horizon with real terrain.',
    },
    story: {
      zh: '中唐以后的经变越来越依赖文字与榜题，而第217窟这一铺恰恰相反：它靠画面本身说话。流水从山间泻下，穿过楼阁与莲花，把"净土"与"人间"缝在一起。盛唐画师在这里证明了一件事——山水画有足够的力气，去承载一个关于来世的故事。',
      en: 'Later sutra illustrations lean on inscriptions, but this one speaks through paint alone. Water falls from the mountains, runs through pavilions and lotuses, and sews paradise and earth into one cloth. The High Tang painters prove here that landscape, by itself, has strength enough to carry a story about the next life.',
    },
    artisticValue: {
      zh: '青绿重彩在这里达到惊人的成熟：山体以石青石绿分层积染，坡脚以赭石过渡，水纹用细线勾勒。通壁画面层次分明而不琐碎，被称为"唐代青绿山水画在洞窟里的巅峰"。',
      en: 'Blue-green painting reaches astonishing maturity here: mountain flanks built up in layered washes of azurite and malachite, foothills transitioning through ochre, water drawn in fine lines. The whole wall holds clear hierarchy without fuss — called by many the peak of Tang blue-green landscape inside a cave.',
    },
    pigments: ['石青', '石绿', '赭石', '朱砂', '雌黄'],
    hotspots: [
      {
        id: 'hs-am-1',
        x: 50,
        y: 30,
        title: { zh: '净土楼阁 · 与山同高', en: 'Paradise Pavilions' },
        description: {
          zh: '净土世界的楼阁台榭层层叠起，与周围的青绿山峦共用一条地平线。天上与人间，在这里只隔一池水。',
          en: 'The pavilions of the Pure Land rise tier on tier, sharing one horizon with the blue-green ridges. Heaven and earth are separated by a single pool of water.',
        },
      },
      {
        id: 'hs-am-2',
        x: 24,
        y: 56,
        title: { zh: '十六观 · 在山间观想', en: 'The Sixteen Contemplations' },
        description: {
          zh: '韦提希夫人的观想场景散落在山水之间，每一"观"就是一处独立的山景。画师用山水给抽象的观想安了家。',
          en: 'Scenes of Vaidehi\'s contemplations are scattered through the landscape, each a small self-contained mountain view. The painter gave abstract meditation a home in the hills.',
        },
      },
      {
        id: 'hs-am-3',
        x: 74,
        y: 62,
        title: { zh: '未生怨 · 因果的山水', en: 'The Unborn Resentment' },
        description: {
          zh: '阿阇世王子囚禁父王的故事画在山脚的殿宇之间。同一面墙上，因果与救赎被山水串成了一条路。',
          en: 'The story of Prince Ajatashatru imprisoning his father unfolds among the halls at the foot of the mountain. On one wall, karma and redemption are threaded into a single path by the landscape.',
        },
      },
    ],
    audioGuide: {
      duration: '1分10秒',
      transcripts: {
        zh: '请看北壁。这铺《观无量寿经变》，被很多人认为是唐代青绿山水在洞窟里的巅峰。故事的主角是韦提希夫人：她的儿子阿阇世囚禁了父亲，她在狱中向佛陀请教，佛于是教她"十六观"——一观一观地观想净土。画师做了一件了不起的事：他把十六观全部画进了层层青绿山水之间。山不是背景，而是观想发生的地方。请顺着流水看：水从山间泻下，穿过楼阁与莲花。净土世界的楼阁，和真实的青绿山峦，共用同一条地平线——天上与人间只隔一池水。盛唐的画师在这里证明了一件事：山水画本身，就有足够的力气去讲一个关于来世的故事。',
        en: 'Look at the north wall. This Contemplation Sutra illustration is regarded by many as the peak of Tang blue-green landscape inside a cave. Its protagonist is Queen Vaidehi: her son Ajatashatru has imprisoned his father, and from her cell she asks the Buddha for guidance, so he teaches her the sixteen contemplations — visualising the Pure Land step by step. The painter did something remarkable: he set all sixteen inside tier upon tier of blue-green landscape. The mountains are not background but the place where contemplation happens. Follow the water: it falls from the heights, runs through pavilions and lotuses. The palaces of paradise and the real blue-green ridges share a single horizon — heaven and earth separated only by a pool. What the High Tang painters proved here is that landscape, on its own, has strength enough to tell a story about the next life.',
      },
    },
  },
  {
    id: 'mural-zhangqian',
    caveNumber: '第323窟',
    title: { zh: '张骞出使西域 · 佛教史迹画', en: 'Zhang Qian and the History of Buddhism in China' },
    dynasty: { zh: '初唐', en: 'Early Tang' },
    eraPeriod: '公元7世纪',
    category: 'sutra',
    dimensions: '北壁中部 · 史迹画长卷',
    imageUrl: media('mural-cave-323.webp'),
    detailUrl: media('detail-cave-323.webp'),
    lineArtUrl: media('wash-zhangqian.webp'),
    scanSize: '21618 × 16677 px',
    description: {
      zh: '敦煌独有的题材：佛教"史迹画"。北壁长卷的第一景是"汉武帝拜金人"——武帝于甘泉宫礼拜从匈奴缴获的金人，随后派张骞出使西域求取佛法。把凿空西域的历史与佛法东来画成同一条因果链，这是敦煌人对自己身世的讲述。',
      en: 'A genre unique to Dunhuang: Buddhist "history painting". The scroll\'s first episode shows Emperor Wu of Han worshipping a golden statue captured from the Xiongnu, then sending Zhang Qian west in search of the dharma. The opening of the Silk Road and the coming of Buddhism become a single chain of cause and effect — Dunhuang telling the story of its own origins.',
    },
    story: {
      zh: '史实上，张骞出使西域在公元前二世纪，佛教传入中国还要晚两百年；但初唐的画师们不管这些。他们需要一条更有力的叙事：佛像先到，佛法随之而来，而这条路上站着的正是敦煌。历史被重写，是为了给信仰一条来路。',
      en: 'Historically Zhang Qian journeyed west in the second century BCE, two hundred years before Buddhism arrived in China — but the early Tang painters were not interested. They needed a stronger story: the image of the Buddha came first, the teaching followed, and Dunhuang stood on the road between. History was rewritten so faith could have a route.',
    },
    artisticValue: {
      zh: '史迹画把"地图"与"故事"缝在一起：山水分隔出一段段情节，人物在其中行走、交谈、渡河。榜题写明每一景的内容。与同时期经变画的宏大相比，这些史迹画更接近"连环画"——它们是敦煌壁画里最早的历史叙事。',
      en: 'History paintings stitch map and story together: landscape panels separate the episodes, figures walk, talk and cross rivers between them, and cartouches label each scene. Compared with the grandeur of contemporary sutra illustrations, these read almost like comics — the earliest historical narrative in the murals of Dunhuang.',
    },
    pigments: ['石青', '石绿', '赭石', '朱砂', '铅白'],
    hotspots: [
      {
        id: 'hs-zq-1',
        x: 40,
        y: 44,
        title: { zh: '汉武帝拜金人', en: 'Emperor Wu Worships the Golden Statue' },
        description: {
          zh: '甘泉宫内，武帝率群臣礼拜一尊金人。唐人相信，这是佛像进入中国的起点。',
          en: 'Inside the Ganquan palace the emperor and his ministers bow to a golden statue. Tang viewers believed this was where the Buddha\'s image entered China.',
        },
      },
      {
        id: 'hs-zq-2',
        x: 66,
        y: 50,
        title: { zh: '张骞拜别 · 凿空西域', en: 'Zhang Qian Takes Leave' },
        description: {
          zh: '张骞持节跪别武帝，身后马匹与随从整装待发。画师把一位使臣的远行，画成了佛法的朝圣。',
          en: 'Zhang Qian kneels with his staff of office, horses and retinue ready behind him. The painter turns an envoy\'s departure into a pilgrimage for the dharma.',
        },
      },
      {
        id: 'hs-zq-3',
        x: 22,
        y: 58,
        title: { zh: '山水之间的史迹', en: 'History in Landscape' },
        description: {
          zh: '其余各景是石佛浮江、金像出渚等江南感应故事。山峦把一桩桩"史迹"隔成连续的格子。',
          en: 'The remaining scenes tell the southern miracle tales — the stone Buddha floating up the river, the golden image rising from the water. Ridges of landscape divide the episodes into a continuous grid.',
        },
      },
    ],
    audioGuide: {
      duration: '1分10秒',
      transcripts: {
        zh: '请看北壁中部这一条长卷。这是敦煌独有的题材：佛教"史迹画"。第一景是汉武帝在甘泉宫礼拜一尊金人——传说那金人来自匈奴的祭天之所，唐人相信，这就是佛像进入中国的起点。第二景，武帝派遣张骞持节出使西域，去求取佛法。请注意这里做了什么：史实上，张骞出使在公元前二世纪，佛教传入还要再晚两百年。但初唐的画师不管这些。他们需要一条更有力的叙事：金人先来，佛法随之而至，而这条路上站着的正是敦煌。历史被重写，是为了给信仰一条来路。其余各景，是石佛浮江、金像出渚这些江南感应故事。山峦把一桩桩"史迹"隔成格子，人物在山水之间行走、渡河——这是敦煌壁画里最早的历史叙事，几乎就是一部初唐的连环画。',
        en: 'Look at the long scroll in the middle register of the north wall. This is a genre unique to Dunhuang: Buddhist history painting. Its first episode shows Emperor Wu of Han worshipping a golden statue in the Ganquan palace — said to have come from the altars of the Xiongnu, and believed by Tang viewers to be the very point where the Buddha\'s image entered China. In the second, the emperor sends Zhang Qian west with his staff of office to seek the dharma. Notice what has been done here: historically Zhang Qian travelled in the second century BCE, two hundred years before Buddhism arrived. The early Tang painters did not care. They needed a stronger story: the golden image came first, the teaching followed, and Dunhuang stood on the road between. History was rewritten so faith could have a route. The remaining scenes are the southern miracle tales — the stone Buddha floating up the river, the golden image rising from the water. Ridges of landscape divide the episodes into cells, figures walking and crossing rivers between them. It is the earliest historical narrative in the murals of Dunhuang — almost a comic strip from the early Tang.',
      },
    },
  },
  {
    id: 'mural-sahasrabhuja',
    caveNumber: '第3窟',
    title: { zh: '千手千眼观音', en: 'Thousand-Armed Avalokiteśvara' },
    dynasty: { zh: '元代', en: 'Yuan' },
    eraPeriod: '公元13–14世纪',
    category: 'bodhisattva',
    dimensions: '南壁 · 十一面千手千眼观音立像',
    imageUrl: media('mural-cave-3.webp'),
    detailUrl: media('detail-cave-3.webp'),
    lineArtUrl: media('wash-sahasrabhuja.webp'),
    scanSize: '8414 × 8663 px',
    description: {
      zh: '观音十一面，自下而上作3、7、1排列；千手自肩后如光轮展开，掌中各有一眼。整铺像几乎不用重彩，全凭细劲的铁线描完成——每一只手、每一只眼，都是画师一笔一笔勾出来的。',
      en: 'Eleven faces stack in rows of three, seven and one; a thousand arms open behind her shoulders like a wheel of light, an eye in every palm. The whole image is drawn almost without heavy colour, in fine taut iron-wire lines — every hand and every eye put down stroke by stroke.',
    },
    story: {
      zh: '元代是中国绘画"白描"传统的高峰，而这座小窟证明了这条线在敦煌同样存在。观音的千手不是模糊的一片，而是一圈一圈可以数、可以看的光轮；它们托着日月、净瓶、法器，也托着一整个世纪的耐心。',
      en: 'The Yuan dynasty marks the summit of China\'s outline-drawing tradition, and this small cave proves the line ran through Dunhuang too. The thousand arms are not a blur but a wheel you can count, ring by ring, holding sun, moon, vase and ritual implements — holding, too, a whole century\'s patience.',
    },
    artisticValue: {
      zh: '画面里的线是有等级的：脸部与双手用最细的淡墨，衣纹用中锋长线，身后的光轮用铁线描层层展开。没有大块颜色干扰，线的疏密本身就是光。这是"白描"与"壁画"在敦煌的最后一次伟大合作。',
      en: 'The lines have hierarchy: faces and hands in the finest pale ink, drapery in long centred strokes, and the halo of arms built outward in iron-wire rings. With no mass of colour to interfere, the density of line itself becomes light — the last great collaboration of outline drawing and wall painting at Dunhuang.',
    },
    pigments: ['松烟墨', '赭石', '石绿', '朱砂'],
    hotspots: [
      {
        id: 'hs-sh-1',
        x: 50,
        y: 26,
        title: { zh: '十一面 · 3·7·1', en: 'Eleven Faces, Rows of 3-7-1' },
        description: {
          zh: '十一张脸自下而上按3、7、1排列，最上是佛面。每一张脸的眉眼都用极淡的细线勾出。',
          en: 'The eleven faces stack in rows of three, seven and one, a Buddha face at the top, each drawn with the finest pale lines.',
        },
      },
      {
        id: 'hs-sh-2',
        x: 50,
        y: 58,
        title: { zh: '千手光轮 · 掌中有眼', en: 'The Wheel of a Thousand Arms' },
        description: {
          zh: '手臂一圈圈展开，像光轮一样托在肩后，掌中各有一眼。请放大看：每一只手的手指都是完整画出的。',
          en: 'The arms open ring by ring behind her shoulders, an eye in every palm. Zoom in: every hand is drawn complete, fingers and all.',
        },
      },
    ],
    audioGuide: {
      duration: '1分05秒',
      transcripts: {
        zh: '这座小窟是莫高窟保存最完好的元代洞窟，而它的全部力量来自一种几乎失传的本事：白描。请看南壁这身十一面千手千眼观音。十一张脸，自下而上按三、七、一排列，最上面是佛面。身后，一千只手一圈一圈地展开，像光轮一样托在肩后，每一只掌心里都有一只眼睛。请您放大画面——每一只手的手指，都是画师一笔一笔完整勾出来的。整铺像几乎不用重彩：脸和手用最细的淡墨，衣纹用中锋长线，身后的光轮用铁线描层层展开。没有大块颜色干扰，线的疏密本身，就成了光。这是白描与壁画在敦煌的最后一次伟大合作。',
        en: 'This small cave is the best-preserved Yuan-dynasty cave at Mogao, and its entire power comes from a nearly lost skill: outline drawing. Look at the eleven-faced, thousand-armed Avalokiteśvara on the south wall. The faces stack in rows of three, seven and one, a Buddha face at the very top. Behind her, a thousand arms open ring by ring like a wheel of light, an eye in every palm. Zoom into the image — each hand is drawn complete, fingers and all, stroke by stroke. The whole painting uses almost no heavy colour: faces and hands in the finest pale ink, drapery in long centred strokes, the halo of arms built outward in iron-wire rings. With no mass of pigment in the way, the density of the line itself becomes light. It is the last great collaboration of outline drawing and wall painting at Dunhuang.',
      },
    },
  },
  {
    id: 'mural-lotusapsara',
    caveNumber: '第329窟',
    title: { zh: '莲花飞天藻井', en: 'The Lotus-Apsara Caisson' },
    dynasty: { zh: '初唐', en: 'Early Tang' },
    eraPeriod: '公元7世纪',
    category: 'caisson',
    dimensions: '主室窟顶 · 藻井井心',
    imageUrl: media('mural-cave-329.webp'),
    detailUrl: media('detail-cave-329.webp'),
    lineArtUrl: media('wash-lotusapsara.webp'),
    scanSize: '3610 × 3566 px',
    description: {
      zh: '初唐藻井的名作。井心是一朵大团花，花心呈五色法轮状；四身持花飞天在湛蓝的天空中同向飞行，蓝云环绕，仿佛整个井心正在缓缓旋转。四披另有伎乐天环绕藻井飞行。',
      en: 'A masterpiece among early Tang caissons. At its centre a great floral medallion opens like a five-coloured dharma wheel; four flower-bearing apsaras fly the same way around it through a deep blue sky with blue clouds, so that the whole centre seems slowly to revolve. On the slopes below, celestial musicians circle the caisson.',
    },
    story: {
      zh: '藻井是为"仰望"设计的。当你站定抬头，方井层层收拢，视线最终落在旋转的莲花与飞天之间——然后被带着一起转。没有屏幕，没有音响，只有线条的方向和颜色的节奏。一千三百年前的画师，就已经会做沉浸式设计了。',
      en: 'The caisson was designed for looking up. Stand still, raise your head, and the converging frames guide your eye to the turning lotus and apsaras at the centre — then carry it along in their motion. No screen, no sound, only the direction of lines and the rhythm of colour. Thirteen centuries ago these painters were already practising immersive design.',
    },
    artisticValue: {
      zh: '这口藻井最出色的是"动感"：四身飞天衣带的方向与蓝云的流向完全一致，中心法轮的花瓣也顺着同一方向旋转。所有元素被组织进同一个漩涡里——秩序与流动在窟顶达成了平衡。',
      en: 'What sets this caisson apart is its motion: the four apsaras\' scarves run in exactly the same direction as the blue clouds, and the petals of the central wheel turn the same way. Every element is gathered into one vortex — order and flow balanced on the vault.',
    },
    pigments: ['石青', '石绿', '朱砂', '雌黄', '铅白'],
    hotspots: [
      {
        id: 'hs-la-1',
        x: 50,
        y: 46,
        title: { zh: '五色法轮花心', en: 'The Dharma-Wheel Medallion' },
        description: {
          zh: '井心的大团花花心呈五色法轮状，花瓣顺着同一方向旋转。青、绿、朱、黄、白五色在此交汇。',
          en: 'The great medallion opens like a five-coloured dharma wheel, its petals turning in one direction. Azure, malachite, cinnabar, orpiment and white all meet here.',
        },
      },
      {
        id: 'hs-la-2',
        x: 50,
        y: 22,
        title: { zh: '持花飞天 · 蓝天上飞行', en: 'Apsaras in a Blue Sky' },
        description: {
          zh: '四身飞天手持花朵同向飞行，蓝云绕身。衣带与云的流向一致，给静止的窟顶装上了旋转。',
          en: 'Four apsaras fly the same way, flowers in hand, blue clouds around them. Scarves and clouds stream in one direction, setting the static ceiling in motion.',
        },
      },
    ],
    audioGuide: {
      duration: '1分05秒',
      transcripts: {
        zh: '请抬头，看这口初唐的莲花飞天藻井。井心是一朵大团花，花心呈五色法轮状，花瓣顺着同一个方向旋转。花的外圈，四身持花飞天在湛蓝的天空中同向飞行，蓝云环绕。请留意她们的衣带：方向和云的流向完全一致，中心法轮的花瓣也顺着同一方向——所有元素被组织进同一个漩涡。当你站定仰望，方井一层层收拢，视线最终落进这个漩涡，然后被带着一起转。没有屏幕，没有音响，只有线条的方向和颜色的节奏。一千三百年前的画师，就已经会做沉浸式设计了。',
        en: 'Look up, at this early Tang lotus-and-apsara caisson. At its centre a great floral medallion opens like a five-coloured dharma wheel, petals turning in one direction. Around it, four flower-bearing apsaras fly the same way through a deep blue sky ringed with blue clouds. Now watch their scarves: they stream in exactly the same direction as the clouds, and the wheel at the centre turns with them — every element gathered into a single vortex. Stand still and look up: the square frames converge, your eye falls into the vortex, and the motion carries you around with it. No screen, no sound — only the direction of lines and the rhythm of colour. Thirteen centuries ago, these painters were already making immersive design.',
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
