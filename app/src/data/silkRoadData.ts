import { media } from '../lib/media';

export interface SilkRoadNode {
  id: string;
  name: Record<string, string>;
  pinyin: string;
  category: 'core_cave' | 'fortress' | 'eastern_origin' | 'western_oasis' | 'mineral_source';
  region: 'hexi' | 'western_regions' | 'central_plains';
  coords: { x: number; y: number }; // percentage on map (0-100)
  era: Record<string, string>;
  historicalTitle: Record<string, string>;
  description: Record<string, string>;
  significance: Record<string, string>;
  image: string;
  targetType: 'cave' | 'mural' | 'encyclopedia' | 'workshop';
  targetId?: string;
  targetName: Record<string, string>;
  culturalTopic: Record<string, string>;
  audioNarration: Record<string, string>;
}

export const SILK_ROAD_NODES: SilkRoadNode[] = [
  {
    id: 'node-dunhuang',
    name: { zh: '敦煌 · 莫高窟', en: 'Dunhuang · Mogao Grottoes' },
    pinyin: 'Dūnhuáng Mògāokū',
    category: 'core_cave',
    region: 'hexi',
    coords: { x: 50, y: 50 },
    era: { zh: '公元366年起凿', en: 'Founded 366 CE' },
    historicalTitle: { zh: '丝路第一枢纽 · 万象神圣宝库', en: 'Crossroads of the Ancient Silk Road' },
    description: {
      zh: '古代丝绸之路南北两道与河西走廊交汇的关键咽喉。乐僔和尚在此开凿首窟，经十六国、北魏、隋、唐、五代、西夏、元千百年营造，成七百余窟佛国画卷。',
      en: 'The golden throat of the Silk Road where northern and southern desert routes merged. Over 735 caves carved into the sandstone cliff across a millennium.'
    },
    significance: {
      zh: '世界文化遗产、东西方文明互鉴集大成者、古代艺术全球档案。',
      en: 'UNESCO World Heritage, nexus of Hellenistic, Persian, Indian, and Han Chinese arts.'
    },
    image: media('w-sutra.webp'),
    targetType: 'cave',
    targetId: 'cave-96',
    targetName: { zh: '第96窟 九层楼北大佛', en: 'Cave 96 Colossal Buddha' },
    culturalTopic: { zh: '莫高窟九层飞檐与武则天盛唐造像', en: 'Empress Wu Zetian & 35.5m Colossus' },
    audioNarration: {
      zh: '您好！我们现在点击的是丝绸之路的核心地标——敦煌莫高窟。这里地处河西走廊最西端，是通往西域各国的总门户。点击下方按钮即可直接推门进入九层楼35.5米北大佛窟漫游。',
      en: 'Welcome to Dunhuang Mogao Grottoes, the beating heart of the Silk Road. Click below to enter Cave 96 in 360° VR.'
    }
  },
  {
    id: 'node-cave257',
    name: { zh: '莫高窟第257窟 · 九色鹿', en: 'Cave 257 · Deer Jātaka' },
    pinyin: 'Mògāokū Dì 257 Kū',
    category: 'core_cave',
    region: 'hexi',
    coords: { x: 47, y: 44 },
    era: { zh: '北魏 (公元386-534年)', en: 'Northern Wei (386–534 CE)' },
    historicalTitle: { zh: '鹿王本生 · 连环叙事奇迹', en: 'Deer King Jātaka Fresco' },
    description: {
      zh: '世界美术史上最著名的连环故事长卷之一。构图自两端向中心推进，展现神鹿救溺水者遭背叛后从容辩白之崇高道德精神。',
      en: 'The immortal continuous narrative fresco of the Nine-Colored Deer. Painted from both ends inward toward the dramatic center.'
    },
    significance: {
      zh: '凹凸晕染与铁线描结合，比西方蒙太奇电影早诞生千余年。',
      en: 'Pinnacle of early Silk Road ethical parables and cinematic composition.'
    },
    image: media('w-donor.webp'),
    targetType: 'cave',
    targetId: 'cave-257',
    targetName: { zh: '第257窟 九色鹿本生窟', en: 'Cave 257 (Deer King)' },
    culturalTopic: { zh: '北魏中心塔柱与连环壁画叙事艺术', en: 'Northern Wei Central Pillar Architecture' },
    audioNarration: {
      zh: '这里是北魏第257窟九色鹿窟。西壁的连环壁画代表了公元5世纪北朝融合西域画风的巅峰之作。点击即可进入该窟360度漫游。',
      en: 'This is Cave 257. Click to enter the panoramic cave interior to examine the sacred Deer King.'
    }
  },
  {
    id: 'node-cave112',
    name: { zh: '莫高窟第112窟 · 反弹琵琶', en: 'Cave 112 · Reverse Pipa' },
    pinyin: 'Mògāokū Dì 112 Kū',
    category: 'core_cave',
    region: 'hexi',
    coords: { x: 53, y: 55 },
    era: { zh: '中唐 (公元781-848年)', en: 'Middle Tang (781–848 CE)' },
    historicalTitle: { zh: '大唐乐舞绝唱 · 反弹琵琶舞姿', en: 'Pinnacle of Tang Dance & Music' },
    description: {
      zh: '盛唐丝绸之路乐舞文化的最高峰。舞伎单足腾空旋转，背负四弦琵琶狂放拨弦，天衣回旋翻卷，展现丝路交融的炽热生命力。',
      en: 'The indisputable apex of Dunhuang dance iconography. Dancer leaps while playing the four-stringed pipa behind her neck.'
    },
    significance: {
      zh: '东方舞蹈美学图腾，正仓院同款曲项四弦琵琶写实见证。',
      en: 'Iconic symbol of Silk Road cultural synthesis, preserved in Tang imperial banquets.'
    },
    image: media('w-guardian.webp'),
    targetType: 'cave',
    targetId: 'cave-112',
    targetName: { zh: '第112窟 反弹琵琶伎乐窟', en: 'Cave 112 Reverse Pipa' },
    culturalTopic: { zh: '极乐伎乐合奏与盛唐燕乐风尚', en: 'Tang Court Orchestra & Celestial Dancers' },
    audioNarration: {
      zh: '中唐第112窟，反弹琵琶的诞生之地。画中的舞姿是盛唐胡旋舞与中原宫廷燕乐融为一体的传世绝技。点击直接入窟漫游。',
      en: 'Cave 112 is the home of the Reverse Pipa dancer. Click to step inside in 360° VR.'
    }
  },
  {
    id: 'node-cave407',
    name: { zh: '莫高窟第407窟 · 三兔藻井', en: 'Cave 407 · Three Hares' },
    pinyin: 'Mògāokū Dì 407 Kū',
    category: 'core_cave',
    region: 'hexi',
    coords: { x: 48, y: 56 },
    era: { zh: '隋代 (公元581-618年)', en: 'Sui Dynasty (581–618 CE)' },
    historicalTitle: { zh: '三兔共耳 · 跨欧亚世界密码', en: 'Three Hares Caisson Mandala' },
    description: {
      zh: '八瓣大莲华中三兔循环追逐，三只耳朵两两共用，视觉错觉令人惊叹。外层八身飞天逆向翱翔，构成神秘的宇宙循环密码。',
      en: 'Three hares chasing inside a lotus center, sharing three ears in an optical miracle. Surrounded by eight counter-clockwise flying apsaras.'
    },
    significance: {
      zh: '该图腾自敦煌西传，远播中东、波斯及欧洲英法德中世纪大教堂。',
      en: 'Traveled along the Silk Road into Persian metalware and medieval European cathedrals.'
    },
    image: media('c-lotus.webp'),
    targetType: 'cave',
    targetId: 'cave-407',
    targetName: { zh: '第407窟 三兔藻井窟', en: 'Cave 407 Caisson' },
    culturalTopic: { zh: '覆斗顶藻井光学奇迹与丝路世界图腾', en: 'Three Hares Optics & Trans-Eurasian Legacy' },
    audioNarration: {
      zh: '隋代第407窟三兔共耳藻井，是丝绸之路上流传欧亚大陆的几何奇迹。点击可进入该窟仰望千年穹顶。',
      en: 'Cave 407 Three Hares Caisson ceiling. Click to look up into the 1,400-year-old mandala.'
    }
  },
  {
    id: 'node-cave17',
    name: { zh: '莫高窟第17窟 · 藏经洞', en: 'Cave 17 · Library Cave' },
    pinyin: 'Mògāokū Cángjīngdòng',
    category: 'core_cave',
    region: 'hexi',
    coords: { x: 53, y: 44 },
    era: { zh: '1900年王圆箓偶然发现', en: 'Discovered in 1900' },
    historicalTitle: { zh: '六万卷古写本 · 敦煌学起源', en: 'Birthplace of Dunhuangology' },
    description: {
      zh: '1900年6月被王圆箓道士发现。封存了公元4世纪至11世纪的经卷、文书、绢画、丝织品达六万余件，涵盖十余种古代文字。',
      en: 'Sealed for 900 years, holding over 60,000 manuscripts and silk scrolls. Rediscovered in 1900, sparking the global field of Dunhuang studies.'
    },
    significance: {
      zh: '人类近百年来最伟大的东方考古大发现之一。',
      en: 'One of the most consequential archaeological discoveries of world civilization.'
    },
    image: media('w-sutra.webp'),
    targetType: 'cave',
    targetId: 'cave-17',
    targetName: { zh: '第17窟 藏经洞密室', en: 'Cave 17 (Library Cave)' },
    culturalTopic: { zh: '洪辩法师影堂与敦煌遗书百年沧桑', en: 'Master Hongbian & Dunhuang Manuscripts' },
    audioNarration: {
      zh: '莫高窟第17窟藏经洞，封存了千年丝绸之路六万卷文书绢画。点击可进入密室查看洪辩高僧真容彩塑。',
      en: 'Cave 17 Library Cave. Click to step inside the legendary chamber.'
    }
  },
  {
    id: 'node-yangguan',
    name: { zh: '阳关古隘', en: 'Yangguan Pass' },
    pinyin: 'Yángguān',
    category: 'fortress',
    region: 'hexi',
    coords: { x: 44, y: 58 },
    era: { zh: '汉武帝元鼎年间建置', en: 'Established Han Dynasty' },
    historicalTitle: { zh: '丝路南道咽喉 · 烽燧雄关', en: 'Southern Silk Road Gateway' },
    description: {
      zh: '“劝君更尽一杯酒，西出阳关无故人”。汉代设立以扼守西域南道，古代商队僧侣自此过关西行，穿越塔克拉玛干南缘。',
      en: 'The southern strategic outpost guarding the Silk Road. Made immortal by Tang poet Wang Wei: "Drink one more cup of wine, for west of Yangguan, no old friends remain."'
    },
    significance: {
      zh: '古代边塞诗歌意象、通关文牒与丝路商旅检哨核心。',
      en: 'Key border checkpoint, beacon towers, and poetic landmark of departure.'
    },
    image: media('w-donor.webp'),
    targetType: 'cave',
    targetId: 'cave-158',
    targetName: { zh: '第158窟 涅槃卧佛窟', en: 'Cave 158 Reclining Buddha' },
    culturalTopic: { zh: '西出阳关与丝路南道各邦朝圣图', en: 'Southern Route Kingdoms Mourning Buddha' },
    audioNarration: {
      zh: '这里是著名的阳关。古代商队出阳关后，便进入西域南道。在莫高窟第158窟涅槃经变中，清晰描绘了来自阳关之外西域各国君王举哀的生动场景。',
      en: 'Yangguan Pass, gateway to the Southern Silk Road. Click to explore Cave 158 depicting foreign kings.'
    }
  },
  {
    id: 'node-yumenguan',
    name: { zh: '玉门关 · 小方盘城', en: 'Yumen Pass (Jade Gate)' },
    pinyin: 'Yùménguān',
    category: 'fortress',
    region: 'hexi',
    coords: { x: 43, y: 41 },
    era: { zh: '汉武帝太初年间设立', en: 'Founded ~104 BCE' },
    historicalTitle: { zh: '丝路北道咽喉 · 和田玉之路', en: 'Northern Silk Road Gateway' },
    description: {
      zh: '“羌笛何须怨杨柳，春风不度玉门关”。因西域和田美玉由此输入中原而得名，是商队西出天山南麓北道的必由之路。',
      en: 'The Jade Gate, through which precious Khotan jade entered China. Commemorated by Tang poet Wang Zhihuan.'
    },
    significance: {
      zh: '汉长城边防体系核心，出土数万枚汉晋木简。',
      en: 'Fortified gateway and key bastion of the Han Dynasty Western Frontier Wall.'
    },
    image: media('w-guardian.webp'),
    targetType: 'mural',
    targetId: 'mural-deer',
    targetName: { zh: '第257窟 九色鹿经图', en: 'Mural: Nine-Colored Deer' },
    culturalTopic: { zh: '汉简丝路与古代边关通商史', en: 'Border Trade & Han Bamboo Slips' },
    audioNarration: {
      zh: '玉门关，春风不度的戈壁雄关。来自西域的驼队满载胡椒、香料与和田玉在此验牒通关。点击可微距鉴赏九色鹿传世壁画。',
      en: 'Yumen Pass, the iconic Jade Gate. Click to inspect the legendary Deer King mural.'
    }
  },
  {
    id: 'node-changan',
    name: { zh: '大唐帝都 · 长安', en: "Chang'an (Xi'an)" },
    pinyin: 'Cháng’ān',
    category: 'eastern_origin',
    region: 'central_plains',
    coords: { x: 92, y: 65 },
    era: { zh: '西汉、隋、唐国都', en: 'Tang Imperial Capital' },
    historicalTitle: { zh: '丝绸之路东方起点 · 万国之都', en: 'Eastern Origin of the Silk Road' },
    description: {
      zh: '中古时期世界最大都市。东西两市汇聚波斯、粟特、大食、天竺胡商。宫廷燕乐吸纳龟兹乐、琵琶胡旋，深刻塑造了莫高窟经变乐舞的艺术范式。',
      en: 'The golden capital of the Tang Empire and terminus of the Silk Road. Its cosmopolitan court adopted Persian and Central Asian instruments.'
    },
    significance: {
      zh: '丝路文明的终点与辐射源，大唐自信与博大胸怀的象征。',
      en: 'Global metropolis that synthesized Eurasian cultures.'
    },
    image: media('c-lotus.webp'),
    targetType: 'mural',
    targetId: 'mural-pipa',
    targetName: { zh: '第112窟 反弹琵琶经变图', en: 'Reverse Pipa Mural' },
    culturalTopic: { zh: '长安宫廷燕乐与西域胡腾舞交融', en: 'Tang Court Banquets & Sogdian Whirl Dance' },
    audioNarration: {
      zh: '大唐长安，丝绸之路的东方起点。万国商贾云集西市，胡姬酒肆琵琶齐鸣。莫高窟第112窟的反弹琵琶舞伎，正是大唐长安极乐乐舞的真实写照。',
      en: "Chang'an, the imperial starting point. Click to inspect the Reverse Pipa mural inspired by Tang court ballets."
    }
  },
  {
    id: 'node-wuwei',
    name: { zh: '武威 · 凉州', en: 'Wuwei (Liangzhou)' },
    pinyin: 'Wǔwēi Liángzhōu',
    category: 'fortress',
    region: 'hexi',
    coords: { x: 80, y: 58 },
    era: { zh: '汉武帝“武功军威”设郡', en: 'Hexi Gateway since 121 BCE' },
    historicalTitle: { zh: '河西都会 · 凉州石窟模式', en: 'Liangzhou Grotto Prototype' },
    description: {
      zh: '天梯山石窟被宿白先生考证为“中国石窟鼻祖”，开创“凉州模式”，随后深刻影响了敦煌早期洞窟与云冈、龙门石窟。',
      en: 'Birthplace of the "Liangzhou Prototype" at Tiantishan Caves, which directly influenced early Dunhuang and Yungang caves.'
    },
    significance: {
      zh: '鸠摩罗什驻锡地、铜奔马（马踏飞燕）出土地。',
      en: 'Seat of translator Kumarajiva and home of the Flying Horse of Gansu.'
    },
    image: media('w-sutra.webp'),
    targetType: 'cave',
    targetId: 'cave-257',
    targetName: { zh: '第257窟 九色鹿窟', en: 'Cave 257 (Deer King)' },
    culturalTopic: { zh: '早期石窟造像“凉州模式”源流', en: 'Origins of Chinese Buddhist Grottoes' },
    audioNarration: {
      zh: '武威凉州，河西走廊东部门户。天梯山石窟的造像风格西传影响敦煌，东传影响云冈。点击可探索受凉州风范影响的北魏第257窟。',
      en: 'Wuwei, cradle of the Liangzhou grotto style. Click to explore Northern Wei Cave 257.'
    }
  },
  {
    id: 'node-zhangye',
    name: { zh: '张掖 · 甘州', en: 'Zhangye (Ganzhou)' },
    pinyin: 'Zhāngyè Gānzhōu',
    category: 'fortress',
    region: 'hexi',
    coords: { x: 72, y: 55 },
    era: { zh: '“张国臂掖，以通西域”', en: 'Center of Hexi Corridor' },
    historicalTitle: { zh: '金张掖 · 丝路国际商博会', en: 'Crossroads of the Hexi Corridor' },
    description: {
      zh: '隋炀帝曾亲临张掖焉支山接见西域二十七国君王使节，举办历史上首次“丝路万国博览会”。境内马蹄寺石窟壁画与敦煌莫高窟遥相辉映。',
      en: 'Emperor Yang of Sui held the historic International Silk Road Expo here in 609 CE with kings from 27 kingdoms.'
    },
    significance: {
      zh: '黑河滋润之塞上江南，丝路马匹与茶马互市核心。',
      en: 'Watered by Heihe River, trading hub for horses and silk.'
    },
    image: media('w-donor.webp'),
    targetType: 'encyclopedia',
    targetId: 'instrument-pipa',
    targetName: { zh: '丝路古乐器：曲项琵琶考', en: 'Ancient Pipa Instruments' },
    culturalTopic: { zh: '丝路多民族音乐乐器大融合', en: 'Silk Road Musical Exchange' },
    audioNarration: {
      zh: '张掖，河西走廊的重要枢纽。隋代在此举办万国博览会，琵琶、排箫等乐器在此大规模交流融合。点击查阅丝路乐器百科。',
      en: 'Zhangye, where international expos welcomed 27 kingdoms. Click to explore our Pipa Instrument archive.'
    }
  },
  {
    id: 'node-jiuquan',
    name: { zh: '酒泉 · 肃州', en: 'Jiuquan (Suzhou)' },
    pinyin: 'Jiǔquán Sùzhōu',
    category: 'fortress',
    region: 'hexi',
    coords: { x: 64, y: 53 },
    era: { zh: '汉武帝倾酒入泉', en: 'Western Hexi Fortress' },
    historicalTitle: { zh: '夜光杯之乡 · 铁骑出征要塞', en: 'City of Luminous Jade Cups' },
    description: {
      zh: '“葡萄美酒夜光杯，欲饮琵琶马上催”。祁连山美玉制成温润夜光杯，大军由此出征西域。酒泉文殊山石窟保存早期西域风貌泥塑。',
      en: 'Famed for jade cups crafted from Qilian serpentine stone and immortalized in frontier verses: "Fine wine in cups of glowing jade, drunk to the pipa’s call."'
    },
    significance: {
      zh: '祁连玉雕之源，河西走廊防卫莫高窟的重要屏障。',
      en: 'Source of luminous jade cups and military defense outpost.'
    },
    image: media('w-guardian.webp'),
    targetType: 'cave',
    targetId: 'cave-96',
    targetName: { zh: '第96窟 九层楼北大佛', en: 'Cave 96 Colossal Buddha' },
    culturalTopic: { zh: '大漠驼铃与边塞诗篇中的丝路豪情', en: 'Frontier Poems & Desert Caravans' },
    audioNarration: {
      zh: '酒泉，夜光杯与葡萄美酒的故乡。过了酒泉，大漠驼队便正式抵达莫高窟。点击进入第96窟九层楼北大佛。',
      en: 'Jiuquan, land of jade cups. Click to view the Nine-Story Pagoda of Cave 96.'
    }
  },
  {
    id: 'node-turpan',
    name: { zh: '高昌故城 / 吐鲁番', en: 'Gaochang / Turpan' },
    pinyin: 'Gāochāng Tǔlǔfān',
    category: 'western_oasis',
    region: 'western_regions',
    coords: { x: 32, y: 40 },
    era: { zh: '丝路天山南麓绿洲古国', en: 'Oasis Kingdom on Northern Route' },
    historicalTitle: { zh: '柏孜克里克千佛洞 · 回鹘高昌', en: 'Kingdom of Gaochang & Bezeklik' },
    description: {
      zh: '玄奘法师西行取经曾在此与高昌王结拜为兄弟。柏孜克里克千佛洞壁画与吐鲁番文书生动记录了汉文、粟特文与回鹘文商贸往来。',
      en: 'Where Xuanzang paused to lecture before heading to India. Bezeklik Thousand Buddha Caves feature multilingual contracts.'
    },
    significance: {
      zh: '吐鲁番阿斯塔那古墓群出土千年唐代饺子与双丝绫织锦。',
      en: 'Rich historical archive of silk textiles, bilingual contracts, and grape oases.'
    },
    image: media('c-lotus.webp'),
    targetType: 'cave',
    targetId: 'cave-407',
    targetName: { zh: '第407窟 三兔藻井窟', en: 'Cave 407 (Three Hares)' },
    culturalTopic: { zh: '回鹘佛教艺术与西域葡萄绿洲文明', en: 'Uyghur Buddhist Art & Silk Trade' },
    audioNarration: {
      zh: '这里是吐鲁番高昌故城。玄奘西行曾在此讲经一个月。高昌与敦煌文化互通，第407窟的藻井飞天正是隋唐丝路交融的写照。',
      en: 'Gaochang Oasis in Turpan. Click to view Cave 407 caisson ceiling.'
    }
  },
  {
    id: 'node-kucha',
    name: { zh: '龟兹 · 库车', en: 'Kucha (Qiuci)' },
    pinyin: 'Qiūcí Kùchē',
    category: 'western_oasis',
    region: 'western_regions',
    coords: { x: 23, y: 43 },
    era: { zh: '克孜尔石窟开凿于3世纪', en: 'Kizil Caves since 3rd Century' },
    historicalTitle: { zh: '克孜尔千佛洞 · 龟兹乐舞发源地', en: 'Kizil Caves & Ancient Qiuci Dance' },
    description: {
      zh: '中国开凿最早的石窟群之一。鸠摩罗什法师诞生地。克孜尔壁画的菱格本生图与独特的“屈铁盘丝”凹凸晕染法，是莫高窟北朝壁画的直系艺术祖型。',
      en: 'Home of the Kizil Caves, older than Mogao. Birthplace of great translator Kumarajiva. Its diamond-lattice murals shaped early Dunhuang art.'
    },
    significance: {
      zh: '古印度、犍陀罗与西域龟兹本土艺术的黄金结晶。',
      en: 'Source of chiaroscuro shading and the famous Qiuci music.'
    },
    image: media('w-sutra.webp'),
    targetType: 'mural',
    targetId: 'mural-pipa',
    targetName: { zh: '第112窟 反弹琵琶经变图', en: 'Reverse Pipa Mural' },
    culturalTopic: { zh: '龟兹乐舞输入中原宫廷演变史', en: 'From Kucha Melodies to Tang Court' },
    audioNarration: {
      zh: '龟兹库车，古代西域三十六国中的乐舞圣地。克孜尔石窟比莫高窟更早开凿，盛唐反弹琵琶的乐曲源头正是龟兹乐。点击鉴赏反弹琵琶壁画。',
      en: 'Kucha, center of Silk Road musical genius. Click to examine the Reverse Pipa mural inspired by Kucha musicians.'
    }
  },
  {
    id: 'node-hotan',
    name: { zh: '于阗 · 和田', en: 'Hotan (Yutian)' },
    pinyin: 'Yútián Hétián',
    category: 'western_oasis',
    region: 'western_regions',
    coords: { x: 22, y: 60 },
    era: { zh: '西域南道大乘佛教王国', en: 'Mahayana Buddhist Kingdom' },
    historicalTitle: { zh: '玉石之路核心 · 和田瑞象', en: 'Capital of Nephrite Jade' },
    description: {
      zh: '西域南道最重要的佛国绿洲，产羊脂美玉与丝绸。五代时期于阗国王李圣天与敦煌归义军曹氏家族世代联姻，莫高窟第98窟等绘有巨幅于阗国王后供养人像。',
      en: 'Capital of precious nephrite jade. The royal house of Hotan intermarried with Dunhuang rulers, depicted as donors in Mogao murals.'
    },
    significance: {
      zh: '在丝绸之路形成之前，和田玉已经开辟了连接中原的“玉石之路”。',
      en: 'The prehistoric "Jade Road" that preceded the Silk Road.'
    },
    image: media('w-donor.webp'),
    targetType: 'cave',
    targetId: 'cave-57',
    targetName: { zh: '第57窟 美人菩萨窟', en: 'Cave 57 (Mogao Beauty)' },
    culturalTopic: { zh: '于阗玉石贸易与莫高窟曹氏供养人', en: 'Hotan Jade & Dunhuang Donors' },
    audioNarration: {
      zh: '于阗和田，西域南道的佛国。于阗国王曾与敦煌归义军联姻，莫高窟壁画中大量菩萨像佩戴的璎珞与头冠，皆取自于阗玉与西域珠宝。点击查看第57窟美人菩萨。',
      en: 'Hotan, jade kingdom on the southern Silk Road. Click to examine the jeweled Bodhisattva of Cave 57.'
    }
  },
  {
    id: 'node-kashgar',
    name: { zh: '疏勒 · 喀什', en: 'Kashgar (Shule)' },
    pinyin: 'Shūlè Kāshí',
    category: 'western_oasis',
    region: 'western_regions',
    coords: { x: 14, y: 50 },
    era: { zh: '丝路西极重镇', en: 'Western Terminal in China' },
    historicalTitle: { zh: '帕米尔东麓总汇 · 欧亚分界', en: 'Gateway to the Pamir Knot' },
    description: {
      zh: '中国最西部的古老绿洲。西邻帕米尔高原，商队在此整备驼马，西逾葱岭前往中亚河中、波斯与印度，是欧亚大陆货物流转的枢纽。',
      en: 'Oasis at the foot of the Pamirs. Caravans prepared here to traverse high mountain passes into Central Asia and Persia.'
    },
    significance: {
      zh: '东西方四大文明汇聚的地理中心，丝路绿洲活化石。',
      en: 'Crossroads of Indian, Persian, Hellenistic, and Chinese cultures.'
    },
    image: media('w-guardian.webp'),
    targetType: 'encyclopedia',
    targetId: 'figure-guardians',
    targetName: { zh: '莫高守护名家史记', en: 'Guardians of Dunhuang' },
    culturalTopic: { zh: '葱岭商道与中亚商贾东行莫高史', en: 'Pamir Trails & Sogdian Merchants' },
    audioNarration: {
      zh: '喀什疏勒，天山南麓与昆仑山交汇的西极重镇。所有从阿富汗、波斯输入敦煌的矿物颜料与商货，均在此集散。点击查阅守护者史记。',
      en: 'Kashgar, gateway to the Pamirs through which pigments and merchants traveled to Dunhuang.'
    }
  },
  {
    id: 'node-badakhshan',
    name: { zh: '巴达赫尚 (阿富汗)', en: 'Badakhshan (Afghanistan)' },
    pinyin: 'Bādáhèshàng',
    category: 'mineral_source',
    region: 'western_regions',
    coords: { x: 5, y: 51 },
    era: { zh: '公元前古矿脉', en: 'Ancient Mineral Mines' },
    historicalTitle: { zh: '青金石源脉 · 莫高群青之祖', en: 'Source of Natural Lapis Lazuli' },
    description: {
      zh: '位于今阿富汗东北部兴都库什山脉深处。出产世界最纯正深邃的天然青金石矿。敦煌莫高窟所有千年不朽的湛蓝佛发与宝冠，皆源于此地经丝路驼队千里迢迢运抵鸣沙山。',
      en: 'Deep in the Hindu Kush mountains of northeastern Afghanistan. The sole ancient source of pure lapis lazuli mineral pigment used in Mogao murals.'
    },
    significance: {
      zh: '解开莫高窟群青千年不褪色的核心化学与地理密码。',
      en: 'Geographical origin of the unfading ultramarine blue in Dunhuang frescoes.'
    },
    image: media('c-lotus.webp'),
    targetType: 'encyclopedia',
    targetId: 'pigment-lapis',
    targetName: { zh: '青金石 (石青) 百科档案', en: 'Lapis Lazuli Mineral Entry' },
    culturalTopic: { zh: '跨越帕米尔高原的深蓝矿石贸易', en: 'Lapis Lazuli Trade Across the Pamir' },
    audioNarration: {
      zh: '巴达赫尚，位于阿富汗的高山深谷。莫高窟壁画中佛陀的深蓝螺发与纯蓝天华，使用的全部是产自这里的青金石。点击查阅青金石矿物档案。',
      en: 'Badakhshan in Afghanistan, source of the pure lapis lazuli blue on Dunhuang mural walls. Click to view the mineral entry.'
    }
  }
];
