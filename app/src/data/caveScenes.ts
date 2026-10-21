import { media } from '../lib/media';
import { MURALS } from './dunhuangData';

export type Lang = 'zh' | 'en' | 'ja' | 'fr';
export type Loc = Record<string, string | undefined> & { zh: string };

/** Pick the best available translation for a locale. */
export function loc(value: Record<string, string | undefined>, lang: Lang): string {
  const picked = value[lang];
  if (picked) return picked;
  // Japanese readers get more from Chinese hanzi than from English; French from English.
  if (lang === 'ja' && value.zh) return value.zh;
  if (lang === 'fr' && value.en) return value.en;
  return value.zh ?? '';
}

/** Resolve the narration for a spot: its own script, else the linked mural's. */
export function narrationFor(spot: Spot, lang: Lang): string {
  if (spot.narration) return loc(spot.narration, lang);
  if (spot.muralId) {
    const mural = MURALS.find((m) => m.id === spot.muralId);
    if (mural) return loc(mural.audioGuide.transcripts as Record<string, string>, lang);
  }
  return loc(spot.title, lang);
}

export interface Spot {
  id: string;
  /** Bearing in degrees. 0 = the wall you face on arrival, positive = clockwise. */
  yaw: number;
  /** Elevation in degrees. 0 = eye level, positive = above. Values past the wall/ceiling
      junction place the marker on the painted ceiling instead. */
  pitch: number;
  title: Loc;
  /** Optional dedicated script. When omitted the linked mural's guide is used. */
  narration?: Loc;
  facts?: Loc[];
  /** Link to the ultra-HD gallery. */
  muralId?: string;
  thumb?: string;
  kind?: 'mural' | 'ceiling' | 'sculpture' | 'architect';
}

export interface CaveScene {
  caveId: string;
  /** Painted walls in the order you see them standing in the doorway:
      front (west), right (north), back (east), left (south). */
  walls: [string, string, string, string];
  ceiling: string;
  /** tile the ceiling painting (coffered ceilings repeat) */
  ceilingRepeat?: [number, number];
  room: { radius: number; height: number };
  pillar?: { radius: number; height: number; texture: string };
  startYaw: number;
  intro: Loc;
  spots: Spot[];
}

/* -------------------------------------------------------------------------
   The four walls are stitched from the Dunhuang Academy's own scans of each
   wall of each cave, so turning to the north wall really shows that cave's
   north wall. Orientation follows the caves themselves: you enter from the
   east and the altar is on the west wall.
   ------------------------------------------------------------------------- */

export const CAVE_SCENES: CaveScene[] = [
  {
    caveId: 'cave-257',
    walls: [
      media('wall-cave-257-w.webp'),
      media('wall-cave-257-n.webp'),
      media('wall-cave-257-e.webp'),
      media('wall-cave-257-s.webp'),
    ],
    ceiling: media('ceiling-cave-257.webp'),
    ceilingRepeat: [2, 2],
    room: { radius: 6.0, height: 5.4 },
    pillar: { radius: 1.35, height: 5.4, texture: media('wall-cave-257-s.webp') },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第257窟，北魏。您正站在一座中心塔柱窟里——身侧这根方形塔柱，就是整座洞窟的"心脏"。信众入窟后先绕塔右旋一周，最后才面对西壁。请先向前看：西壁中层那条长长的横卷，就是举世闻名的《九色鹿王本生》。您可以拖动环视，抬头看人字披顶，或者直接点亮画面中闪光的金色光点，我会一处一处讲给您听。',
      en: 'Welcome to Cave 257, from the Northern Wei. You are standing in a central-pillar cave — the square column beside you is its heart. Worshippers entered and walked clockwise around it before finally facing the west wall. Look ahead first: the long horizontal scroll at the middle of the west wall is the world-famous Jātaka of the Nine-Coloured Deer King. Drag to look around, raise your head to the gabled ceiling, or tap any glowing golden marker and I will explain it.'
    },
    spots: [
      {
        id: 'c257-deer',
        yaw: 0,
        pitch: -4,
        kind: 'mural',
        title: { zh: '九色鹿王本生 · 横卷连环画', en: 'The Deer King Jātaka' },
        facts: [
          { zh: '故事自两端向中央推进', en: 'The narrative advances from both ends inward' },
          { zh: '铁线描 + 凹凸晕染', en: 'Iron-wire line work and Western-Region shading' }
        ],
        muralId: 'mural-deer',
        thumb: media('detail-cave-257.webp')
      },
      {
        id: 'c257-south',
        yaw: -90,
        pitch: -2,
        kind: 'mural',
        title: { zh: '南壁 · 沙弥守戒自杀因缘', en: 'South Wall: The Monk Who Kept His Vow' },
        narration: {
          zh: '请转向您的左手边，这是南壁。上半部画天宫伎乐，中部画千佛，而值得您停下来看的是下方那条故事带：《沙弥守戒自杀因缘》。一个年轻沙弥奉命去长者家乞食，开门的少女心生爱慕，沙弥为守戒律自刎而死。故事分七个情节，自东向西依次展开——受命、乞食、开门、守戒、陈情、交罚金、火化起塔。它其实是北魏的"戒律教科书"，用最极端的故事告诉僧人：戒不可破。旁边的《弊狗因缘》讲一条恶狗因善待比丘而转世为僧，因果报应，一目了然。',
          en: 'Turn to your left — this is the south wall. Celestial musicians above, a thousand Buddhas in the middle, but what deserves your attention is the story band below: the tale of the young monk who took his own life to keep his vow. Sent to beg at a layman\'s house, he was met by a daughter who fell in love with him; rather than break a precept he cut his own throat. The story unfolds across seven episodes from east to west — the errand, the begging, the opening door, the vow, the explanation, the payment of a fine, the cremation and the stupa. It is a Northern Wei textbook of monastic discipline, using the most extreme story available to say one thing: a vow cannot be broken. Beside it, the tale of the wicked dog reborn as a monk makes the workings of cause and effect equally plain.'
        },
        thumb: media('wall-cave-257-s.webp')
      },
      {
        id: 'c257-ceiling',
        yaw: 0,
        pitch: 46,
        kind: 'ceiling',
        title: { zh: '人字披顶 · 把木构搬进石窟', en: 'The Gabled Ceiling' },
        narration: {
          zh: '请抬头。这道像屋顶一样从脊线向两侧倾斜的结构叫"人字披"。莫高窟开凿在砂砾岩崖壁上，石质松散无法雕刻，所以工匠用泥塑与彩绘，把中原木构建筑的屋顶"搬"进了洞窟：椽子、斗拱、瓦垄一样不少。椽与椽之间画着连绵的忍冬纹——那种像藤蔓一样卷曲、生生不息的纹样。窟顶后部则转为"平棋顶"，方格层层套叠，格心画莲花，叉角画飞天与火焰。抬头三十秒，您看到的就是一部立体的中国建筑史。',
          en: 'Look up. This roof-like structure sloping from a central ridge is the "gabled scarf". The Mogao cliffs are loose conglomerate that cannot be carved, so the artisans reproduced the timber roofs of the Central Plains in mud plaster and paint — rafters, bracket sets, tile courses and all. Between the rafters runs an unbroken band of honeysuckle scroll, a curling vine that stands for endless renewal. Toward the rear the ceiling becomes a coffered grid, squares within squares, lotuses at the centres and apsaras and flames in the corners. Thirty seconds of looking up is thirty seconds of three-dimensional Chinese architectural history.'
        },
        thumb: media('ceiling-cave-257.webp')
      },
      {
        id: 'c257-pillar',
        yaw: 90,
        pitch: 2,
        kind: 'architect',
        title: { zh: '中心塔柱 · 可以走进去的仪式', en: 'The Central Pillar' },
        narration: {
          zh: '在您身旁这座方形塔柱，是北魏洞窟最典型的空间装置。它连接窟顶与地面，每一面都开龛，龛内塑佛像，龛外画供养菩萨与飞天。信众入窟后要绕着它右旋行走，边走边观想——所以这类洞窟不是让人"看"的，而是让人"走"的。整座窟就是一个可以穿行的仪式空间。您现在的位置在塔柱东向面，请按住拖动，绕到它的背面去看看。',
          en: 'The square pillar beside you is the defining device of a Northern Wei cave. It runs from floor to ceiling, opening into niches on each face, with sculptures inside and donors and apsaras painted around them. Worshippers circled it clockwise while contemplating the images — a cave like this was not built to be looked at but to be walked through, a ritual space you move inside. You are facing its eastern side; press and drag to walk around to the back.'
        },
        facts: [{ zh: '右旋绕塔源自印度礼拜传统', en: 'Clockwise circumambulation comes from Indian practice' }]
      }
    ]
  },

  {
    caveId: 'cave-254',
    walls: [
      media('wall-cave-254-w.webp'),
      media('wall-cave-254-n.webp'),
      media('wall-cave-254-e.webp'),
      media('wall-cave-254-s.webp'),
    ],
    ceiling: media('ceiling-cave-254.webp'),
    ceilingRepeat: [2, 2],
    room: { radius: 5.8, height: 5.2 },
    pillar: { radius: 1.3, height: 5.2, texture: media('wall-cave-254-e.webp') },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第254窟，北魏。请您先深呼吸——这座洞窟里的画，是莫高窟最激烈的一批。左手边南壁是《萨埵太子舍身饲虎》，右手边北壁是《尸毗王割肉贸鸽》，正前方西壁千佛中央有一铺保存极好的白衣佛。远处的东壁还留着《降魔变》。请慢慢转身，再点亮光点，我一处一处讲。',
      en: 'Welcome to Cave 254, from the Northern Wei. Take a breath first — the paintings in this cave are among the most intense at Mogao. To your left, on the south wall, the prince feeds himself to a starving tigress; to your right, on the north wall, King Sibi trades his flesh for a dove; straight ahead, at the centre of the thousand Buddhas on the west wall, a beautifully preserved White-Robed Buddha. Turn slowly, then light up the markers and I will take you through them.'
    },
    spots: [
      {
        id: 'c254-tigress',
        yaw: -90,
        pitch: -2,
        kind: 'mural',
        title: { zh: '萨埵太子舍身饲虎', en: 'Prince Mahāsattva Feeds the Tigress' },
        facts: [
          { zh: '异时同图：多个瞬间共存一幅', en: 'Simultaneous narration: several moments in one image' },
          { zh: '墨色最深处即叙事重心', en: 'The darkest ink marks the centre of gravity' }
        ],
        muralId: 'mural-tigress',
        thumb: media('detail-cave-254.webp')
      },
      {
        id: 'c254-sibi',
        yaw: 90,
        pitch: -2,
        kind: 'mural',
        title: { zh: '尸毗王割肉贸鸽', en: 'King Sibi Trades His Flesh' },
        narration: {
          zh: '请转向右手边，北壁。这里画的是《尸毗王割肉贸鸽》。帝释天为了试探尸毗王的慈悲，让毗首羯摩变成鹰、自己变成鸽子。鸽子逃到王腋下求救，鹰却追来索食。王说：我不忍伤鸽，也不愿鹰饿死——于是割下自己的肉，放在秤上，要与鸽等重。肉割尽了，仍不够重，王便举身坐上秤盘。请看他坐上去的那一刻：天平终于平了。北魏画师把整个身体重量都压在这个动作上，人物的轮廓被画得极其镇定，反而是周围旁观的人在捶胸痛哭。这是北魏式的慈悲：不做姿态，只上秤。',
          en: 'Turn to your right — the north wall, painted with the story of King Sibi. To test the king\'s compassion, the god Indra had a falcon chase a dove into his protection. The falcon demanded its food. I cannot bear to harm the dove, said the king, nor let the falcon starve: so he cut flesh from his own body and weighed it against the bird. Piece after piece, it was never enough; at last he climbed onto the pan himself. Look at that moment — the scales finally balance. The Northern Wei painter put the weight of the whole body into that one action, drawing the king with absolute composure while everyone around him beats their breast and weeps. This is Northern Wei compassion: no gesture, just the scales.'
        },
        thumb: media('wall-cave-254-n.webp')
      },
      {
        id: 'c254-whitebuddha',
        yaw: 0,
        pitch: 0,
        kind: 'mural',
        title: { zh: '西壁白衣佛', en: 'The White-Robed Buddha' },
        narration: {
          zh: '正前方是西壁。请您看千佛中央这一铺：佛着白色通肩袈裟，作说法印，两侧各立一菩萨。这是第254窟保存最完好、也最特别的一幅——北魏壁画里的佛像大多是红色的、赭色的，唯独这一身是白衣。白在北魏的画法里极难：它不靠颜料覆盖，而靠"留白"与极薄的白色晕染，稍有失误就前功尽弃。请再注意佛的面部：凹凸晕染的痕迹依然清晰，鼻梁、眼窝、下颌都有一层渐变的暖白——这正是西域传来的"天竺遗法"。',
          en: 'Straight ahead is the west wall. Look at the panel at the centre of the thousand Buddhas: a Buddha in a white robe over both shoulders, right hand raised in the teaching gesture, a bodhisattva standing on either side. It is the best preserved and most unusual image in Cave 254 — Northern Wei Buddhas are almost always red or ochre, yet this one is white. White was the hardest colour to paint here: it depends not on pigment coverage but on reserved ground and the thinnest possible white washes, where a single mistake ruins the passage. And look at the face: the modelling is still legible, a graded warm white along the bridge of the nose, the eye sockets and the jaw — the Western Region technique of chiaroscuro, straight from India.'
        },
        thumb: media('wall-cave-254-w.webp')
      },
      {
        id: 'c254-ceiling',
        yaw: 0,
        pitch: 48,
        kind: 'ceiling',
        title: { zh: '平棋顶与人字披', en: 'Coffered and Gabled Ceilings' },
        narration: {
          zh: '抬头看窟顶。前部是人字披，东西两披浮塑出十六条凸起的椽子，椽与椽之间画着手持莲花的天人与忍冬；后部转为平棋顶，斗四套叠的方格中央画莲花，四个叉角画飞天、忍冬或火焰。这些斗拱与椽子其实是木构建筑的"备份"——砂砾岩无法雕刻，工匠便用泥塑把它一笔一笔做了出来。',
          en: 'Look up. The front is a gabled ceiling whose two slopes carry sixteen raised rafters in relief, honeysuckle and lotus-bearing Celestials painted between them; the rear becomes a coffered grid, squares within squares, a lotus at each centre and apsaras, honeysuckle or flames in the corners. These brackets and rafters are effectively a papier-mâché backup of timber architecture: the conglomerate cliff could not be carved, so the artisans modelled it in clay, stroke by stroke.'
        }
      }
    ]
  },

  {
    caveId: 'cave-249',
    walls: [
      media('wall-cave-249-w.webp'),
      media('wall-cave-249-n.webp'),
      media('wall-cave-249-e.webp'),
      media('wall-cave-249-s.webp'),
    ],
    ceiling: media('ceiling-cave-249.webp'),
    ceilingRepeat: [2, 3],
    room: { radius: 4.6, height: 4.4 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第249窟，西魏。这座洞窟最动人的东西不在四壁，而在您的头顶——请先不要急着抬头。您身边四壁的上缘画着一整圈天宫伎乐：乐伎从栏墙后探出半身，吹排箫、弹琵琶、击腰鼓。而现在，请慢慢地抬起头来：窟顶四披上不是佛国，而是中国上古神话的天空。西王母乘凤车，东王公乘龙车，阿修罗王四目四臂托举日月。',
      en: 'Welcome to Cave 249, from the Western Wei. The most moving thing in this cave is not on the walls but above you — though don\'t look up too soon. Along the top of the walls runs an unbroken frieze of celestial musicians leaning half out of a balustrade with panpipes, pipa and waist drums. Now raise your head slowly: the ceiling slopes hold no Buddhist heaven but the sky of ancient Chinese myth. The Queen Mother of the West rides a phoenix, the King Father of the East a dragon, and the four-armed Asura lifts sun and moon.'
    },
    spots: [
      {
        id: 'c249-xwm',
        yaw: 0,
        pitch: -2,
        kind: 'mural',
        title: { zh: '壁上缘 · 天宫伎乐', en: 'Celestial Musicians' },
        facts: [
          { zh: '栏墙与垂幔连成一条水平带', en: 'Balustrade and valance form one horizontal band' },
          { zh: '乐伎执排箫、琵琶、腰鼓', en: 'Panpipes, pipa and waist drums' }
        ],
        muralId: 'mural-xiwangmu',
        thumb: media('detail-cave-249.webp')
      },
      {
        id: 'c249-ceiling',
        yaw: 0,
        pitch: 52,
        kind: 'ceiling',
        title: { zh: '窟顶四披 · 汉地的天空', en: 'The Chinese Sky on the Ceiling' },
        narration: {
          zh: '现在请抬头，慢慢转动——这是莫高窟最特别的一片穹顶。南披画西王母乘凤车，有仙人骑凤前导；北披画东王公乘龙车，四龙拉车、羽人随行；西披正中是阿修罗王，四目四臂，立于海水中，上两手分别托着日月，头顶是须弥山与忉利天宫。东披则是莲花摩尼宝珠，两侧伏羲与女娲人首蛇身相对，下面还有雷公击鼓、飞廉奔跑、朱雀与羽人往来。请注意这意味着什么：佛教从印度来，却没有把这片土地原有的天空抹掉。印度来的飞天，和汉地的西王母、东王公、伏羲女娲，同住在一个穹顶之下。画师用云气把它们缝在了一起——这就是敦煌最动人的地方：它不是某一种文明的独白，而是一场持续千年的对话。',
          en: 'Now look up and turn slowly — this is the most extraordinary ceiling at Mogao. On the south slope the Queen Mother of the West rides a phoenix chariot with an immortal on a phoenix leading the way; on the north the King Father of the East rides a four-dragon carriage with winged attendants. At the centre of the west slope stands the Asura, four-eyed and four-armed, in the sea, holding up sun and moon, with Mount Sumeru and the heaven of the Thirty-Three above his head. On the east slope a jewelled lotus leans between Fuxi and Nüwa, human-headed and serpent-bodied, while the thunder god drums, feilían race, and vermilion birds and winged men cross between them. Consider what this means: Buddhism came from India but did not erase the sky that was already here. Indian apsaras keep company on one vault with Chinese deities. Cloud scrolls are the thread that sews them together. That is what moves people most about Dunhuang — not the monologue of one civilisation, but a conversation lasting a thousand years.'
        },
        thumb: media('ceiling-cave-249.webp')
      },
      {
        id: 'c249-sutra',
        yaw: 90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '北壁 · 说法图与千佛', en: 'North Wall: Preaching and a Thousand Buddhas' },
        narration: {
          zh: '请看向右手边北壁。这一壁分上中下三段：最上是天宫伎乐二十身，中部正中画说法图一铺——佛两侧上方各绘两身飞天，下方各绘两身菩萨；其余壁面以千佛填满。千佛不是重复劳动，而是一种宗教观念的形象化：它们排成一眼望不到头的行列，让信众感受到时间的长度。而在这片秩序里，画师悄悄留出几个位置给飞天——秩序中出现一点动，整面墙就活了。',
          en: 'Look to your right, the north wall. It divides into three registers: twenty celestial musicians at the top, a preaching assembly at the centre with two apsaras above the Buddha and two bodhisattvas below on either side, and a thousand Buddhas filling the rest. The thousand Buddhas are not busywork but doctrine made visible: endless rows let the viewer feel the length of time. And within that order the painter quietly leaves a few places for flying apsaras — one note of movement that brings the whole wall alive.'
        },
        thumb: media('wall-cave-249-n.webp')
      }
    ]
  },

  {
    caveId: 'cave-285',
    walls: [
      media('wall-cave-285-w.webp'),
      media('wall-cave-285-n.webp'),
      media('wall-cave-285-e.webp'),
      media('wall-cave-285-s.webp'),
    ],
    ceiling: media('ceiling-cave-285.webp'),
    room: { radius: 5.2, height: 4.7 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第285窟，西魏，公元538到539年——这是莫高窟少数有确切纪年的洞窟之一。左手边南壁是一条通壁横卷，讲《五百强盗成佛因缘》：造反、被俘、剜眼、放逐、闻法、复明、出家。抬头则是伏羲女娲与雷神飞廉。请点亮光点。',
      en: 'Welcome to Cave 285, Western Wei, 538 to 539 CE — one of the very few caves at Mogao with a secure date. To your left, the south wall runs a single full-length scroll telling of five hundred bandits: revolt, capture, blinding, exile, hearing the teaching, recovering sight, ordination. Above you are Fuxi and Nüwa, the thunder god and winged spirits. Light up the markers.'
    },
    spots: [
      {
        id: 'c285-bandits',
        yaw: -90,
        pitch: -2,
        kind: 'mural',
        title: { zh: '五百强盗成佛因缘 · 通壁长卷', en: 'The Five Hundred Bandits' },
        facts: [
          { zh: '有确切纪年：大统四—五年', en: 'Securely dated to 538–539 CE' },
          { zh: '山峦作为叙事节拍器', en: 'Hills used as the metronome of the plot' }
        ],
        muralId: 'mural-bandits',
        thumb: media('detail-cave-285.webp')
      },
      {
        id: 'c285-ceiling',
        yaw: 0,
        pitch: 52,
        kind: 'ceiling',
        title: { zh: '四披 · 伏羲女娲与山居禅僧', en: 'Fuxi, Nüwa and the Mountain Hermits' },
        narration: {
          zh: '抬头看四披。东披画伏羲女娲，人首蛇身，相对而立，中间共举一颗莲花摩尼宝珠，两侧还有飞廉、飞天与十三首的瑞兽；南披画朱雀、九首瑞兽与羽人；北披画十一首瑞兽与乌获。请再往下看披脚：一排小小的禅僧正坐在山间石窟里打坐——这是"山居禅僧"的图像，几乎每一位都坐在一个尖顶的小龛中。这些禅僧像其实把这整座洞窟的用途说了出来：第285窟主室两侧还开有四个小禅窟，僧人在其中观像、禅修。也就是说，这里不只是一个可以参观的礼拜空间，更是一个可以住进去修行的场所。',
          en: 'Look up at the four slopes. On the east, Fuxi and Nüwa stand facing one another, human-headed and serpent-bodied, jointly lifting a jewelled lotus, flanked by feilían, apsaras and a thirteen-headed auspicious beast; the south carries vermilion birds, nine-headed beasts and winged men; the north an eleven-headed beast and the giant Wuhuo. Then look down to the base of the slopes: rows of tiny monks sit meditating in mountain caves, almost every one inside a pointed niche. These hermit monks explain what the cave was for — four small meditation cells open off the main chamber, where monks contemplated images and practised. This was not only a hall to visit but a place to move into and practise in.'
        },
        thumb: media('ceiling-cave-285.webp')
      },
      {
        id: 'c285-west',
        yaw: 0,
        pitch: 0,
        kind: 'sculpture',
        title: { zh: '西壁 · 圆券大龛与护法诸神', en: 'West Wall: The Great Niche' },
        narration: {
          zh: '正前方西壁中央凿一圆券形大龛，两侧各有一小龛。龛内的塑像经历代重修，但龛外壁面上的护法诸神仍是西魏原笔：龛外南侧上部与窟顶连接处，画着一个白色圆轮与六个白色椭圆轮——这是西魏人对日月星辰的想象。这类"天文图像"在佛教洞窟里出现得很早，说明此时的敦煌，佛、道、汉地神话与天文知识仍然混融在同一套宇宙观里。',
          en: 'Straight ahead, at the centre of the west wall, a great arched niche is flanked by smaller ones. The sculptures inside were restored in later dynasties, but the guardian deities painted outside the niche are original Western Wei work: at the junction of the wall and ceiling on the south side, a white disc and six white ellipses represent the sun, moon and stars as these painters imagined them. Astronomical imagery of this kind appears very early in Buddhist caves, a sign that in Dunhuang Buddhism, Daoism, Chinese myth and astronomy still shared a single cosmology.'
        }
      }
    ]
  },

  {
    caveId: 'cave-420',
    walls: [
      media('wall-cave-420-w.webp'),
      media('wall-cave-420-n.webp'),
      media('wall-cave-420-e.webp'),
      media('wall-cave-420-s.webp'),
    ],
    ceiling: media('ceiling-cave-420.webp'),
    room: { radius: 5.0, height: 4.8 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第420窟，隋代。请您先慢慢抬头，用力地看窟顶正中——那里有三只正在互相追逐的兔子。奇怪的是，每只兔子看起来都有两只耳朵，可整幅画上一共只画了三只耳朵。这是一个一千五百年前的视觉魔术。四披则画满了《法华经》经变。点亮光点，我们从兔子说起。',
      en: 'Welcome to Cave 420, from the Sui dynasty. Raise your head slowly and look hard at the centre of the ceiling — three hares are chasing one another. Strangely, each appears to have two ears, yet the whole design contains only three. This is an optical trick fifteen centuries old. The slopes around it are covered with illustrations of the Lotus Sutra. Light up the markers and we will start with the hares.'
    },
    spots: [
      {
        id: 'c420-hares',
        yaw: 0,
        pitch: 62,
        kind: 'ceiling',
        title: { zh: '三兔共耳 · 千古视觉魔术', en: 'Three Hares, Three Ears' },
        facts: [
          { zh: '共用形：三只耳朵让每兔皆似双耳', en: 'Shared form: three ears, every hare complete' },
          { zh: '同一纹样横跨欧亚大陆', en: 'The motif travelled across all of Eurasia' }
        ],
        muralId: 'mural-threehares',
        thumb: media('detail-cave-420.webp')
      },
      {
        id: 'c420-fahua',
        yaw: -60,
        pitch: 44,
        kind: 'ceiling',
        title: { zh: '法华经变 · 观音普门品', en: 'Lotus Sutra: The Guanyin Chapter' },
        narration: {
          zh: '请把视线从三兔移向西披与南披。这里画的是《法华经·观世音菩萨普门品》：火难、水难、罗刹难、刀杖难、牢狱难、盗贼难……一格一难，观世音在每一格中现身相救。您可以把它理解成一份用图绘成的"应急清单"——只要念诵名号，任何困境都有对应的救援画面。南披则转向《譬喻品》：曲尺形的院墙、殿堂、重阁回廊错落相间，那是著名的"火宅"与"化城"比喻，整座建筑群正在燃烧，而孩子们还在里面游戏。隋代画师用建筑的纵深，把一部抽象的经变画成了一座可以走进去的房子。',
          en: 'Move your gaze from the hares to the west and south slopes. Here is the Guanyin chapter of the Lotus Sutra: fire, flood, demons, blades, prison, bandits — one peril per scene, with Avalokitesvara appearing in each to rescue. You can read it as an illustrated emergency list: recite the name and every predicament has its matching rescue. The south slope turns to the parable chapter — L-shaped courtyards, halls and galleries stepped against one another, the famous burning house and phantom city, the whole complex in flames while the children play inside. Using architectural depth, Sui painters turned an abstract sutra into a house you could walk into.'
        },
        thumb: media('ceiling-cave-420.webp')
      },
      {
        id: 'c420-nirvana',
        yaw: 60,
        pitch: 44,
        kind: 'ceiling',
        title: { zh: '北披 · 涅槃与二十三铺说法图', en: 'The Parinirvana and Twenty-Three Assemblies' },
        narration: {
          zh: '转向另一侧。北披画面的中心是一大幅佛涅槃的场景，以此为中心，左侧分上中下三层，绘有共八幅佛说法图；西披大致分三层横幅，每层都画有数幅说法图，总共达二十三幅之多——这是隋代经变画的一次"密集展示"。请留意画师解决困难的方法：画面被切得如此之碎，他却用统一的青绿色调与连续的山峦把它们串起来，让观众的眼睛不至于散掉。',
          en: 'Turn to the other side. At the centre of the north slope is a large parinirvana scene; around it, three registers of eight preaching assemblies to the left, while the west slope holds three horizontal bands with some twenty-three assemblies in total — a dense showcase of Sui sutra illustration. Note how the painter solves the obvious problem: the surface is shattered into dozens of small episodes, yet a unified blue-green key and continuous mountain forms thread them together, so the eye never loses its place.'
        }
      },
      {
        id: 'c420-walls',
        yaw: 90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '四壁 · 千佛与说法图', en: 'The Walls: Thousand Buddhas' },
        narration: {
          zh: '最后请看四壁。中央开一方形浅龛，龛内塑趺坐佛一身、胁侍菩萨二身，佛袈裟下摆上还能看到数个"卍"字符号；龛顶绘飞天二身、火焰忍冬佛光，佛座两侧各绘一狮子。龛的四周被千佛填满，一格一格，像织物的经纬。整座洞窟的布局非常清楚：下面是给眼睛看的佛国，上面是给时间看的经变，最上面是给宇宙看的三只兔子。',
          en: 'Finally the walls. A square shallow niche holds a seated Buddha with two attendant bodhisattvas, several swastika symbols still visible on the hem of the robe; two apsaras and a flame-and-honeysuckle halo are painted above the niche, a pair of lions beside the throne. Everything else is filled with thousand Buddhas, gridded like warp and weft. The whole cave reads clearly: at eye level a Buddha realm to look at, above it sutra narratives for the length of time, and at the very top three hares for the cosmos.'
        },
        thumb: media('wall-cave-420-n.webp')
      }
    ]
  },

  {
    caveId: 'cave-320',
    walls: [
      media('wall-cave-320-w.webp'),
      media('wall-cave-320-n.webp'),
      media('wall-cave-320-e.webp'),
      media('wall-cave-320-s.webp'),
    ],
    ceiling: media('ceiling-cave-320.webp'),
    room: { radius: 4.6, height: 4.5 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第320窟，盛唐。请您转向左手边，然后抬头看南壁的上部——那里有四身散花飞天，被公认为盛唐最美的一屏。她们两两成对，相对而舞，一手散花，一手托着花盘。请点开光点，我讲给您听她们是怎么"飞"起来的。',
      en: 'Welcome to Cave 320, High Tang. Turn to your left and look to the upper part of the south wall — four scattering apsaras, widely held to be the finest panel of the High Tang. They come in pairs, dancing toward one another, one hand scattering blossoms and the other holding a tray. Tap the marker and I will explain how they fly.'
    },
    spots: [
      {
        id: 'c320-apsara',
        yaw: -90,
        pitch: 24,
        kind: 'mural',
        title: { zh: '散花飞天 · 盛唐最美的一屏', en: 'The Scattering Apsaras' },
        facts: [
          { zh: '对称中藏着不对称的视线', en: 'Symmetry containing asymmetry of gaze' },
          { zh: '兰叶描：一根线画出丝绸与风', en: 'Orchid-leaf stroke: silk and wind in one line' }
        ],
        muralId: 'mural-apsara',
        thumb: media('detail-cave-320.webp')
      },
      {
        id: 'c320-sutra',
        yaw: 90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '北壁 · 观无量寿经变', en: 'North Wall: The Contemplation Sutra' },
        narration: {
          zh: '请转向右手边北壁。这里是一铺完整的《观无量寿经变》：中间是极乐世界的净土场面，东侧画"未生怨"——阿阇世王子囚禁父王的故事；西侧画"十六观"——韦提希夫人在狱中依佛所教，一观一观地观想。所以一整面墙其实同时在讲三件事：净土是什么样子、为什么要往生、以及具体怎么修。经变不是装饰画，它是一部可以"读"的图文教科书。',
          en: 'Turn to your right, the north wall. Here is a complete Contemplation Sutra illustration: the Pure Land in the centre, the "unborn resentment" of Prince Ajatashatru imprisoning his father to the east, and the sixteen contemplations to the west, in which Queen Vaidehi follows the Buddha\'s teaching one visualisation at a time. So a single wall is telling three things at once: what the Pure Land looks like, why one should be reborn there, and precisely how to practise. A sutra illustration is not decoration — it is an illustrated textbook you can read.'
        },
        thumb: media('wall-cave-320-n.webp')
      },
      {
        id: 'c320-ceiling',
        yaw: 0,
        pitch: 58,
        kind: 'ceiling',
        title: { zh: '云头牡丹藻井', en: 'The Cloud-Scroll Peony Caisson' },
        narration: {
          zh: '抬头看窟顶。藻井井心是一朵云头牡丹，周围一圈圈边饰：方胜纹、半团花、菱形纹、团花、鳞纹，最外一层是垂角铃幔帷。朱、青、绿三色叠韵交替，色彩浓艳厚重，保存得极好。请留意一个细节：边饰的每一层都不一样，但它们的"节奏"是统一的——就像一首曲子换了乐器，节拍不变。盛唐的装饰设计，靠的不是繁复，而是节奏。',
          en: 'Look up at the ceiling. The caisson centre holds a cloud-scroll peony, ringed by band after band of ornament: lozenge, half-rosette, diamond, rosette, scale pattern, and outermost a valance of hanging bells. Cinnabar, azurite and malachite alternate in layered harmony, rich and heavy, and remarkably well preserved. Note one detail: every band is different, yet their rhythm is unified — the same tune played on different instruments. High Tang ornament relies not on complexity but on rhythm.'
        },
        thumb: media('ceiling-cave-320.webp')
      }
    ]
  },

  {
    caveId: 'cave-57',
    walls: [
      media('wall-cave-57-w.webp'),
      media('wall-cave-57-n.webp'),
      media('wall-cave-57-e.webp'),
      media('wall-cave-57-s.webp'),
    ],
    ceiling: media('ceiling-cave-57.webp'),
    room: { radius: 4.4, height: 4.2 },
    startYaw: 0,
    intro: {
      zh: '第57窟被称为"美人窟"，全部原因就在您左手边的南壁上。请走近一些——那一身观世音菩萨面容丰润、眉眼细长、朱唇微启，仿佛下一秒就要开口说话。她的头冠是先用泥浆堆出立体纹样、再贴上纯金箔做成的，一千四百年后依然在烛光下闪烁。',
      en: 'Cave 57 is called the "Cave of Beauties", and the whole reason is on the south wall to your left. Step closer — this Avalokitesvara has a full luminous face, long fine brows and red lips slightly parted, as if she might speak in the next moment. Her crown was built up in plaster relief and gilded with real gold leaf; fourteen centuries later it still catches candlelight.'
    },
    spots: [
      {
        id: 'c57-beauty',
        yaw: -90,
        pitch: 4,
        kind: 'mural',
        title: { zh: '美人菩萨 · 沥粉贴金', en: 'The "Beauty" Bodhisattva' },
        facts: [
          { zh: '金冠是真的金属，不是颜料', en: 'The crown is real metal, not paint' },
          { zh: '初唐贵妇妆：桂叶眉 + 点唇', en: 'Early Tang make-up: cassia-leaf brows, dot lips' }
        ],
        muralId: 'mural-beauty',
        thumb: media('detail-cave-57.webp')
      },
      {
        id: 'c57-donors',
        yaw: -90,
        pitch: -26,
        kind: 'mural',
        title: { zh: '供养人列 · 一份初唐时尚档案', en: 'The Donor Procession' },
        narration: {
          zh: '请把视线往下移。说法图的下部画着一列供养人，领头的是都督夫人太原王氏，身后依次是女儿与侍女，共十余身。请看她们的妆容：脸上敷着厚厚的白粉，两颊晕着胭脂，眉画成细长的"桂叶眉"，唇只点中间一点朱红——这是初唐最时髦的贵妇妆。再看衣裙：宽大的袖、拖地的裙，颜色一层压一层。这幅画其实是一份"时尚档案"，比任何文字记载都更直观。而它之所以被画在这里，是因为供养人是真实出钱开窟的人——她们用一笔钱，买到了一个在一千四百年后仍被人注视的位置。',
          en: 'Move your gaze down. Beneath the assembly runs a procession of donors led by the commandant\'s wife of the Taiyuan Wang clan, followed by daughters and maids — more than ten figures. Study the make-up: a thick white lead foundation, rouge on the cheeks, brows drawn long and fine in the "cassia leaf" style, lips touched with vermilion only at the centre. This was the height of Early Tang fashion. And the dress: wide sleeves, floor-length skirts, colour over colour. The painting is a fashion archive, far more vivid than any written record. It is here because the donors actually paid for the cave — for a sum of money they bought a position at which people would still be looking fourteen hundred years later.'
        }
      },
      {
        id: 'c57-ceiling',
        yaw: 0,
        pitch: 58,
        kind: 'ceiling',
        title: { zh: '双龙藻井', en: 'The Twin-Dragon Caisson' },
        narration: {
          zh: '抬头看窟顶。这口藻井的井心画着两条龙，环绕中央的莲花相对而立，尾部相交叉。方形井心之外是一层圆环联珠纹，再外面是方形二方连续纹——方中有圆，圆外有方，一层层套下去。"藻"是水生植物，"井"是井口，古人相信在木构建筑最高处画上水草莲花可以厌火。于是藻井成了中国建筑里装饰最繁复的一个部位，也是画师留给自己的一份炫技。',
          en: 'Look up at the ceiling. The caisson centre carries two dragons facing one another around a central lotus, their tails crossing. Outside the square well runs a ring of beaded string, and outside that a square continuous border — square within circle within square, tier after tier. "Zao" means water plant, "jing" a well mouth; the ancients believed that painting waterweed and lotus at the highest point of a timber building would ward off fire. And so the caisson became the most ornate part of any Chinese interior, and the painter\'s own display of mastery.'
        },
        thumb: media('ceiling-cave-57.webp')
      }
    ]
  },

  {
    caveId: 'cave-112',
    walls: [
      media('wall-cave-112-w.webp'),
      media('wall-cave-112-n.webp'),
      media('wall-cave-112-e.webp'),
      media('wall-cave-112-s.webp'),
    ],
    ceiling: media('ceiling-cave-112.webp'),
    room: { radius: 4.4, height: 4.4 },
    startYaw: 0,
    intro: {
      zh: '这里是第112窟，中唐。请您屏住呼吸——左手边南壁《观无量寿经变》里，藏着中国美术史上最著名的一个舞姿：反弹琵琶。她把琵琶举到背后，反手拨弦，一足踢起，衣带翻卷。有人说这是一个真实存在过的舞姿，也有人说它是画师心中的极致想象。点亮光点，我一处处讲给您听。',
      en: 'This is Cave 112, Middle Tang. Take a breath — in the Contemplation Sutra illustration on the south wall to your left lies the most famous dance pose in Chinese art history: the reverse-played pipa. She lifts the instrument behind her back and plucks it, one foot raised, ribbons whirling. Some say the pose was really danced; others that it is the painter\'s ultimate fantasy. Light up the markers and I will walk you through it.'
    },
    spots: [
      {
        id: 'c112-pipa',
        yaw: -90,
        pitch: -4,
        kind: 'mural',
        title: { zh: '反弹琵琶 · 盛唐遗韵', en: 'The Reverse-Played Pipa' },
        facts: [
          { zh: '兰叶描：一根线画出丝绸与柔软', en: 'Orchid-leaf stroke: silk and softness in one line' },
          { zh: '两侧是一支完整的唐代乐队', en: 'Flanked by a complete Tang orchestra' }
        ],
        muralId: 'mural-pipa',
        thumb: media('detail-cave-112.webp')
      },
      {
        id: 'c112-west',
        yaw: 0,
        pitch: 0,
        kind: 'sculpture',
        title: { zh: '西壁 · 盝顶帐形龛与唐塑', en: 'West Wall: The Canopied Niche' },
        narration: {
          zh: '正前方西壁开一个盝顶帐形龛——您可以把龛形理解成一顶帐子，佛坐在里面，龛顶饰棋格团花图案及佛、菩萨像。龛下是马蹄形佛床，唐塑一铺佛、菩萨、弟子五身像；佛床之下还有壸门，门内画着伎乐。请留意这个布局的用意：从窟门进来，先看到壁画上的乐舞，再看到龛内真实的塑像，最后看到佛床下小小的伎乐——图像、雕塑与建筑被串成了一条连续的观看动线。',
          en: 'Straight ahead the west wall opens into a canopied niche — think of it as a tent, with the Buddha seated inside and the vault painted with chequered rosettes, Buddhas and bodhisattvas. Below is a horseshoe-shaped altar carrying five Tang sculptures: Buddha, bodhisattvas and disciples. Beneath the altar are pierced panels painted with musicians. Note the intent: entering the cave you first meet music and dance in paint, then real sculpture in the niche, then tiny musicians under the altar — image, sculpture and architecture threaded into one continuous line of sight.'
        },
        thumb: media('wall-cave-112-w.webp')
      },
      {
        id: 'c112-ceiling',
        yaw: 0,
        pitch: 56,
        kind: 'ceiling',
        title: { zh: '四云头团花藻井', en: 'The Cloud-Rosette Caisson' },
        narration: {
          zh: '抬头看窟顶。这一口藻井井心是四云头团花：四朵云头向中心收拢，托起中央一朵团花，简洁而饱满。覆斗顶四面向中心收拢，形似一座华盖，象征佛说法时头顶的宝盖。四披则画千佛，中央各画趺坐佛一身。请注意一个细节：四披的千佛排列方式与四壁的经变完全不同——上面是秩序，下面是叙事，眼睛在两者之间移动时会自然产生"内外"的层次感。',
          en: 'Look up. The caisson centre holds four cloud scrolls converging on a single rosette — simple and full. The inverted-funnel ceiling closes inward like a jewelled canopy held above the Buddha while teaching, and the four slopes carry thousand Buddhas with a seated Buddha at the centre of each. Note one detail: the grid of Buddhas on the slopes is organised quite differently from the narratives on the walls below — order above, story below — and as the eye moves between them it registers a natural sense of inside and outside.'
        },
        thumb: media('ceiling-cave-112.webp')
      }
    ]
  },

  {
    caveId: 'cave-17',
    walls: [
      media('wall-cave-17-w.webp'),
      media('wall-cave-17-n.webp'),
      media('wall-cave-17-n.webp'),
      media('wall-cave-17-w.webp'),
    ],
    ceiling: media('ceiling-cave-17.webp'),
    ceilingRepeat: [2, 2],
    room: { radius: 2.6, height: 3.2 },
    startYaw: 0,
    intro: {
      zh: '第17窟，藏经洞。这是世界上最小的著名洞窟之一——面积不到十平方米，却装下了六万余件文书。请注意，这里原本不是书库，而是晚唐河西都僧统洪辩的影堂，也就是纪念堂。公元1900年6月22日，道士王圆箓清理第16窟积沙时偶然发现了一个封闭的耳室。那一刻，一门国际性的学问"敦煌学"，就此诞生。',
      en: 'Cave 17, the Library Cave. It is one of the smallest famous rooms in the world — under ten square metres — yet it held more than sixty thousand documents. And note: this was never a library but the memorial hall of Hongbian, head of the Hexi monastic order in the late Tang. On 22 June 1900 the caretaker Wang Yuanlu, clearing sand from Cave 16, happened upon a sealed side chamber. In that moment Dunhuang studies was born.'
    },
    spots: [
      {
        id: 'c17-trees',
        yaw: 90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '北壁 · 双树与侍女', en: 'North Wall: Two Trees, Two Attendants' },
        facts: [
          { zh: '日常器物承载全部情感', en: 'Everyday objects carry all the feeling' },
          { zh: '晚唐写实的克制样本', en: 'Late Tang realism at its most restrained' }
        ],
        muralId: 'mural-library',
        thumb: media('detail-cave-17.webp')
      },
      {
        id: 'c17-stele',
        yaw: 0,
        pitch: 0,
        kind: 'mural',
        title: { zh: '西壁 · 洪辩告身碑', en: 'West Wall: The Stele of Hongbian' },
        narration: {
          zh: '正前方西壁嵌着一通石碑，高约一点五米，宽约零点七米，是大中五年也就是公元851年的《洪辩告身碑》。碑文分三段：上段刻唐朝敕封洪辩为河西都僧统的诏令，中段记沙州收复的经过，下段是洪辩的告身文书。它同时是一份政治档案与一件书法作品。请您记住这面墙的意义：这是我们今天能够确认这位僧人真实身份、官职与年代的最直接证据——而这间屋子本来是纪念他的。',
          en: 'In the west wall ahead is a stone stele, about 1.5 metres tall and 0.7 wide, the Investiture Stele of Hongbian dated to the fifth year of the Dazhong era, 851 CE. Its text runs in three parts: the imperial edict appointing Hongbian head of the Hexi monastic order, an account of the recovery of Shazhou, and Hongbian\'s own investiture document. It is at once a political archive and a work of calligraphy. And remember what this wall means: it is the most direct evidence we have for this monk\'s real identity, rank and date — in a room built to commemorate him.'
        },
        thumb: media('wall-cave-17-w.webp')
      },
      {
        id: 'c17-discovery',
        yaw: 180,
        pitch: 0,
        kind: 'architect',
        title: { zh: '六万余件文书 · 为什么被封存', en: 'Sixty Thousand Documents' },
        narration: {
          zh: '请环视这个小小的空间。按照记载，这里当年堆满了文书，几乎顶到窟顶。现在学者们大多认为，这些文献是在十一世纪初为了避战乱而封存的——也有说法认为这里堆放的是废弃纸张。有意思的是，那些被当时人视为"废纸"的东西，包含了借贷契约、离婚协议、学童练字的涂鸦、寺院账本、甚至药方和食谱。正是这些"不重要的纸"，让我们第一次看见了普通唐人的生活：他们借钱、离婚、练字、算账、看病、吃饭。宏大叙事里没有他们，但藏经洞里有。',
          en: 'Look around this tiny space. By all accounts it was stacked almost to the ceiling. Most scholars now believe the documents were sealed in the early eleventh century to protect them from war — though some argue it was simply a dump for discarded paper. What is remarkable is that the "waste" includes loan contracts, divorce agreements, schoolboys\' practice scrawls, monastery ledgers, prescriptions and even recipes. It is precisely these unimportant sheets that let us see ordinary people of the Tang for the first time: borrowing money, divorcing, practising handwriting, keeping accounts, seeing a doctor, eating dinner. Grand narratives leave them out. The Library Cave does not.'
        }
      }
    ]
  },
  {
    caveId: 'cave-220',
    walls: [
      media('wall-cave-220-w.webp'),
      media('wall-cave-220-n.webp'),
      media('wall-cave-220-e.webp'),
      media('wall-cave-220-s.webp'),
    ],
    ceiling: media('ceiling-cave-220.webp'),
    room: { radius: 5.2, height: 4.8 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第220窟，开凿于贞观十六年——公元642年。这是敦煌翟氏家族的"家窟"，四壁全是初唐画坛第一流的手笔。转过身去，东壁的《维摩诘经变》里有著名的帝王问疾图；右手边北壁是药师七佛与乐舞；左手边南壁，是莫高窟最早、场面最大的净土变。请点亮光点。',
      en: 'Welcome to Cave 220, cut in 642 CE, the family cave of Dunhuang\'s Zhai clan, every wall the work of the finest early Tang hands. Turn around: the Vimalakīrti illustration on the east wall holds the famous emperor procession; on the north wall to your right are the seven Medicine Buddhas with their dancers; on the south wall to your left is the earliest and largest Pure Land tableau at Mogao. Light up the markers.'
    },
    spots: [
      {
        id: 'c220-vk',
        yaw: 180,
        pitch: -2,
        kind: 'mural',
        title: { zh: '东壁 · 帝王问疾图', en: 'East Wall: The Emperor\'s Visit' },
        facts: [
          { zh: '帝王冕旒大裘，各国王子相随', en: 'The emperor in regalia with foreign princes in train' },
          { zh: '1943年剥出，初唐原作重见天日', en: 'Revealed in 1943 from beneath a later layer' }
        ],
        muralId: 'mural-vimalakirti',
        thumb: media('detail-cave-220.webp')
      },
      {
        id: 'c220-yakshi',
        yaw: 90,
        pitch: -2,
        kind: 'mural',
        title: { zh: '北壁 · 药师七佛与乐舞', en: 'North Wall: The Medicine Buddhas' },
        narration: {
          zh: '请转向右手边北壁。这是根据《药师如来本愿经》绘制的巨型壁画，主题是七身药师佛，身边有日光、月光菩萨。请把视线放到画面下部：舞伎在莲花座上起舞，两侧乐队伴奏——这是研究唐代乐舞最珍贵的图像之一。当年剥开表层壁画时，人们第一次看到了贞观年间长安城里的流行舞姿与乐器。您可以把这面墙当成一座唐代的音乐厅：画上的每件乐器、每个舞姿，都是实物与文献之外唯一的现场。',
          en: 'Turn to the north wall on your right. This is the great illustration of the Medicine Buddha Sutra, built around seven Bhaisajyaguru Buddhas with the Sunlight and Moonlight bodhisattvas. Now look to the lower register: a dancer moves on a lotus pedestal while the orchestra plays on either side — one of the most precious images for the study of Tang music and dance. When the overlying layer was removed, people saw for the first time the fashionable dances and instruments of Chang\'an in the Zhenguan era. Read this wall as a Tang concert hall: every instrument and every pose is a live performance no text or surviving object can replace.'
        },
        thumb: media('wall-cave-220-n.webp')
      },
      {
        id: 'c220-sukhavati',
        yaw: -90,
        pitch: -2,
        kind: 'mural',
        title: { zh: '南壁 · 最早的净土变', en: 'South Wall: The Earliest Pure Land' },
        narration: {
          zh: '左手边南壁，是根据《佛说阿弥陀经》绘成的西方极乐世界图——莫高窟最早、场面最大的净土变。整铺画面分三段：中央是阿弥陀佛说法，楼阁亭台浮于七宝池上；两侧是听法的众生与化生童子。请注意画师对"水"的处理：池水用一道道细线画出波纹，楼阁的倒影倒映其中。盛唐以后无数的净土变，都是从这里出发的。',
          en: 'On the south wall to your left is the Western Paradise according to the Amitābha Sutra — the earliest and largest Pure Land tableau at Mogao. It builds in three registers: the Buddha preaching at the centre with pavilions rising from seven-jewel pools, and hosts of listeners and lotus-born children on either side. Watch how the painter treats water: the pools ripple with fine parallel lines, and the pavilions cast their reflections into them. Every later Pure Land illustration sets out from this wall.'
        },
        thumb: media('wall-cave-220-s.webp')
      },
      {
        id: 'c220-ceiling',
        yaw: 0,
        pitch: 56,
        kind: 'ceiling',
        title: { zh: '藻井 · 莲花团龙之下', en: 'The Caisson' },
        narration: {
          zh: '抬头看窟顶。这口藻井是宋代重绘的卷瓣莲花团龙井心，而底层的初唐藻井与千佛至今仍在——剥落处隐隐露出初唐的莲花与团花纹样。一层画盖着另一层，第220窟本身就像一本地层书：最深处是贞观十六年的初唐，其上依次是五代、宋代的补绘。您抬头看到的，是一千三百年层层叠起来的时间。',
          en: 'Look up. This caisson was repainted in the Song dynasty with a lotus-and-dragon medallion, yet beneath it the early Tang caisson and its thousand Buddhas still survive — where the upper layer flakes, early Tang lotuses and rosettes show through. One painting lying over another, Cave 220 is a book of strata: at the bottom the Zhenguan-era first layer, above it the repairs of the Five Dynasties and Song. What you see when you look up is thirteen hundred years stacked in layers.'
        }
      }
    ]
  },

  {
    caveId: 'cave-61',
    walls: [
      media('wall-cave-61-w.webp'),
      media('wall-cave-61-n.webp'),
      media('wall-cave-61-e.webp'),
      media('wall-cave-61-s.webp'),
    ],
    ceiling: media('ceiling-cave-61.webp'),
    room: { radius: 5.6, height: 5.2 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第61窟，五代，曹氏归义军时期开凿的"文殊堂"。请先不要转身，正前方西壁上，是一张十三米长、三米六高的《五台山图》——现存最宏大的地图式山水画。五代时敦煌与中原道路阻隔，信徒无法亲赴五台山，于是曹氏家族把整座山画在了墙上。点亮光点，我带您在这张地图里走一走。',
      en: 'Welcome to Cave 61, the "Hall of Mañjuśrī" cut under the Cao family government of the Five Dynasties. Do not turn yet: straight ahead, the west wall carries a Map of Mount Wutai thirteen metres long and 3.6 high — the grandest map-like landscape in existence. With the roads to the Central Plains cut, pilgrims from Dunhuang could not reach the mountain, so the Cao family painted the whole of it onto this wall. Light up the markers and I will walk you through the map.'
    },
    spots: [
      {
        id: 'c61-wutai',
        yaw: 0,
        pitch: -2,
        kind: 'mural',
        title: { zh: '西壁 · 五台山图', en: 'West Wall: The Map of Mount Wutai' },
        facts: [
          { zh: '长13米 高3.6米，地图式山水', en: '13 m × 3.6 m of map-like landscape' },
          { zh: '五百里山川、寺院、道路尽收画中', en: 'Five hundred li of mountains, monasteries and roads' }
        ],
        muralId: 'mural-wutai',
        thumb: media('detail-cave-61.webp')
      },
      {
        id: 'c61-sutras',
        yaw: 90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '北壁 · 五铺大型经变', en: 'North Wall: Five Great Sutra Illustrations' },
        narration: {
          zh: '请转向右手边北壁。上部并排五铺大型经变，自西向东依次是：密严经变、天请问经变、药师经变、华严经变、思益经变。一壁五铺，这是敦煌经变画"饱和"到极限的样子。每一铺都有独立的构图与主尊，但它们共用同一套配色与山水语言，远看是五扇连续的屏风，近看是五部不同的经。请慢慢横移视线，感受五代画师如何在一面墙上安排五部经典。',
          en: 'Turn to the north wall on your right. Five great sutra illustrations stand side by side along its upper half — from west to east the Ghanavyūha, the Questions of a Deva, the Medicine Buddha, the Avatamsaka and the Viśesacinti. Five sutras to one wall: sutra illustration at maximum saturation. Each panel has its own composition and central deity, yet all five share one palette and one landscape language — at a distance five consecutive screens, up close five different scriptures. Move your gaze slowly across and watch how a tenth-century painter staged five classics on a single wall.'
        },
        thumb: media('wall-cave-61-n.webp')
      },
      {
        id: 'c61-ceiling',
        yaw: 0,
        pitch: 58,
        kind: 'ceiling',
        title: { zh: '华盖式藻井 · 五莲团龙鹦鹉', en: 'The Canopy Caisson' },
        narration: {
          zh: '抬头看窟顶。这是敦煌最大的华盖式藻井之一：中心井心画五莲团龙鹦鹉，四周依次铺开联珠纹、回纹、团花、双凤双麒麟纹饰，最外圈是层层垂幔——整个窟顶被画成一顶张开的华盖，仿佛文殊说法时头顶的宝盖。注意它的尺度感：正因为洞窟如此之大，这口藻井的每一圈纹饰都被放大到可以被"仰望"的尺寸。',
          en: 'Look up at the ceiling. This is among the largest canopy caissons at Dunhuang: five lotuses, dragons and parrots at the centre, then rings of beaded string, fret, rosettes and paired phoenixes and qilin, and outermost tier upon tier of hanging valance — the whole vault painted as a single open canopy, the jewelled parasol above the teaching Mañjuśrī. Note the sense of scale: precisely because the cave is so vast, every ring of ornament is enlarged to a size meant to be looked up at.'
        },
        thumb: media('ceiling-cave-61.webp')
      },
      {
        id: 'c61-vimala',
        yaw: 180,
        pitch: 0,
        kind: 'mural',
        title: { zh: '东壁 · 维摩诘经变', en: 'East Wall: Vimalakīrti' },
        narration: {
          zh: '转过身看东壁。上段是一铺大型《维摩诘经变》，以"品"字形排列：门上方是佛国品，维摩诘与文殊分列两侧。它正对着西壁的五台山图——文殊的道场在身后，文殊的化身在面前。第61窟的一切，都是围绕这位骑狮子的菩萨安排的。',
          en: 'Turn around to the east wall. Its upper half is a great Vimalakīrti illustration arranged like a pyramid: the Buddha field above the door, Vimalakīrti and Mañjuśrī to either side. It faces the Map of Mount Wutai across the room — the bodhisattva\'s seat behind you, his manifestation before you. Everything in Cave 61 is arranged around this lion-riding bodhisattva.'
        },
        thumb: media('wall-cave-61-e.webp')
      }
    ]
  },

  {
    caveId: 'cave-217',
    walls: [
      media('wall-cave-217-w.webp'),
      media('wall-cave-217-n.webp'),
      media('wall-cave-217-e.webp'),
      media('wall-cave-217-s.webp'),
    ],
    ceiling: media('ceiling-cave-217.webp'),
    room: { radius: 4.8, height: 4.6 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第217窟，盛唐。这座洞窟藏着唐代青绿山水在洞窟里的巅峰。请转向右手边北壁——那铺《观无量寿经变》用石青石绿把山峦、流水、楼阁画成一体；再转身看东壁，那里是《法华经·观音普门品》的诸难救济。点亮光点。',
      en: 'Welcome to Cave 217, High Tang. This cave holds the peak of Tang blue-green landscape inside a cave. Turn to the north wall on your right: the Contemplation Sutra illustration builds mountains, water and pavilions into one continuous blue-green world. Then turn to the east wall for the Guanyin chapter of the Lotus Sutra and its rescues from every peril. Light up the markers.'
    },
    spots: [
      {
        id: 'c217-amitayus',
        yaw: 90,
        pitch: -2,
        kind: 'mural',
        title: { zh: '北壁 · 观无量寿经变', en: 'North Wall: Contemplation Sutra' },
        facts: [
          { zh: '青绿重彩：唐代山水在洞窟里的巅峰', en: 'The peak of Tang blue-green landscape in a cave' },
          { zh: '净土楼阁与真实山峦共用一条地平线', en: 'Paradise pavilions share a horizon with real hills' }
        ],
        muralId: 'mural-amitayus',
        thumb: media('detail-cave-217.webp')
      },
      {
        id: 'c217-pumen',
        yaw: 180,
        pitch: 0,
        kind: 'mural',
        title: { zh: '东壁 · 观音普门品', en: 'East Wall: The Guanyin Chapter' },
        narration: {
          zh: '转过身看东壁。通壁绘《法华经·观音普门品》：火难、水难、罗刹难、刀杖难……每一种灾难都是一个独立的山水小景，观世音在每一景中现身相救。整面墙就像一本图绘的"应急手册"——念诵名号，就能找到对应的那一格。请留意画师如何在整壁的大构图中给每一"难"留出独立的空间：山与山之间，就是故事与故事之间的呼吸。',
          en: 'Turn to the east wall. The entire surface illustrates the Guanyin chapter of the Lotus Sutra: fire, flood, demons, blades — each peril a self-contained little landscape, Avalokitesvara appearing in each to rescue. The whole wall reads as an illustrated emergency manual: recite the name and find your own panel. Notice how the painter gives every peril its own space inside one continuous composition: between the hills, the story breathes.'
        },
        thumb: media('wall-cave-217-e.webp')
      },
      {
        id: 'c217-ceiling',
        yaw: 0,
        pitch: 56,
        kind: 'ceiling',
        title: { zh: '团花藻井', en: 'The Rosette Caisson' },
        narration: {
          zh: '抬头看窟顶。覆斗顶的井心是一朵团花，卷草与垂幔铺向四披。它比四壁的经变简单得多——但正是这种克制，让眼睛在看完满壁青绿之后，有一处可以休息的地方。窟顶的留白，是盛唐设计里最安静的一笔。',
          en: 'Look up. At the centre of the inverted-funnel vault a single rosette sits, with scrolling vine and valance spreading down the four slopes. It is far simpler than the sutra illustrations below — and that restraint is deliberate: after a wall full of blue-green, the eye needs somewhere to rest. The quiet of the ceiling is the calmest stroke in High Tang design.'
        }
      }
    ]
  },

  {
    caveId: 'cave-323',
    walls: [
      media('wall-cave-323-w.webp'),
      media('wall-cave-323-n.webp'),
      media('wall-cave-323-e.webp'),
      media('wall-cave-323-s.webp'),
    ],
    ceiling: media('ceiling-cave-323.webp'),
    room: { radius: 4.6, height: 4.4 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第323窟，初唐。这座洞窟最有名的是"佛教史迹画"——敦煌独有的题材。请转向右手边北壁：第一景是汉武帝礼拜金人，第二景是张骞出使西域。史实上这两件事相隔两百年，但初唐画师把它们画成了同一条因果链。点亮光点。',
      en: 'Welcome to Cave 323, Early Tang. What makes this cave famous is its Buddhist history painting — a genre unique to Dunhuang. Turn to the north wall on your right: the first episode shows Emperor Wu of Han worshipping a golden statue, the second Zhang Qian setting out for the Western Regions. The two events are two hundred years apart in fact, but the early Tang painters drew them as one chain of cause and effect. Light up the markers.'
    },
    spots: [
      {
        id: 'c323-zhangqian',
        yaw: 90,
        pitch: -2,
        kind: 'mural',
        title: { zh: '北壁 · 张骞出使西域', en: 'North Wall: Zhang Qian' },
        facts: [
          { zh: '史实与传说的合流：为信仰重写历史', en: 'History rewritten so faith could have a route' },
          { zh: '敦煌壁画里最早的历史叙事', en: 'The earliest historical narrative at Dunhuang' }
        ],
        muralId: 'mural-zhangqian',
        thumb: media('detail-cave-323.webp')
      },
      {
        id: 'c323-south',
        yaw: -90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '南壁 · 石佛浮江', en: 'South Wall: The Floating Buddha' },
        narration: {
          zh: '请转向左手边南壁。这里画的是江南的感应故事：西晋吴淞江石佛浮江、东晋扬都出金像。传说中，佛像不从西域来，而是从江水里"浮"出来——佛教进入江南，就这样被画成了一次次水上的奇迹。请注意山水在其中的作用：江水把情节一格格隔开，人物乘船、岸上礼拜，山与水共同完成了叙事。',
          en: 'Turn to the south wall on your left. Here are the miracle tales of the south: the stone Buddha floating up the Wusong River in the Western Jin, and the golden image emerging at Yangdu in the Eastern Jin. In these stories the Buddha\'s image does not arrive from the west but rises out of the water — Buddhism entering the south painted as a series of river miracles. Watch the role of landscape: the river divides the episodes into cells, people travel by boat and worship from the banks, and mountain with water together carry the narrative.'
        },
        thumb: media('wall-cave-323-s.webp')
      },
      {
        id: 'c323-ceiling',
        yaw: 0,
        pitch: 56,
        kind: 'ceiling',
        title: { zh: '团花藻井与千佛四披', en: 'The Caisson and Thousand Buddhas' },
        narration: {
          zh: '抬头看窟顶。井心是一朵团花，四披垂幔之下铺满千佛。注意上下的对比：四壁讲历史与传说，窟顶只讲秩序。千佛一行行排列，像织物的经纬，把一切故事都收拢在一个安静的网格之下。',
          en: 'Look up. A rosette sits at the centre of the vault, and beneath the valance the four slopes are packed with thousand Buddhas. Note the contrast between above and below: the walls tell history and legend, the ceiling tells only order. The Buddhas file row on row like warp and weft, folding every story into a quiet grid.'
        }
      }
    ]
  },

  {
    caveId: 'cave-3',
    walls: [
      media('wall-cave-3-w.webp'),
      media('wall-cave-3-n.webp'),
      media('wall-cave-3-e.webp'),
      media('wall-cave-3-s.webp'),
    ],
    ceiling: media('ceiling-cave-3.webp'),
    room: { radius: 3.0, height: 3.4 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第3窟——莫高窟保存最完好的元代洞窟，也是最小的一批洞窟之一。请转向左手边南壁：一铺十一面千手千眼观音立像。这座洞窟的全部力量来自一种几乎失传的本事：白描。没有大块浓彩，千手千眼全靠一根根细线画出。',
      en: 'Welcome to Cave 3 — the best-preserved Yuan-dynasty cave at Mogao, and one of the smallest. Turn to the south wall on your left: a standing eleven-faced, thousand-armed Avalokiteśvara. The entire power of this cave comes from a nearly lost skill: outline drawing. No heavy colour — a thousand arms and eyes put down in fine lines.'
    },
    spots: [
      {
        id: 'c3-sahasra',
        yaw: -90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '南壁 · 千手千眼观音', en: 'South Wall: Thousand-Armed Guanyin' },
        facts: [
          { zh: '十一面作 3·7·1 排列', en: 'Eleven faces in rows of 3-7-1' },
          { zh: '元代白描艺术的最高成就', en: 'The summit of Yuan outline drawing' }
        ],
        muralId: 'mural-sahasrabhuja',
        thumb: media('detail-cave-3.webp')
      },
      {
        id: 'c3-north',
        yaw: 90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '北壁 · 另一铺千手观音', en: 'North Wall: A Second Guanyin' },
        narration: {
          zh: '转过身看北壁。这里还有一铺十一面千手千眼观音，十一面作5、5、1排列，与南壁的3、7、1正好不同。两铺观音相对而立，把整座洞窟变成了一条被千手环抱的甬道。请在两面之间慢慢移动视线——画师的线描功力，就在这两套"一千只手"的细微差别里。',
          en: 'Turn to the north wall. Here stands a second eleven-faced, thousand-armed Guanyin, her faces stacked in rows of five, five and one — deliberately different from the 3-7-1 of the south wall. The two Guanyins face each other, turning the little cave into a corridor embraced by a thousand arms. Move your gaze slowly between the two walls: the painter\'s mastery lives in the subtle differences between two sets of a thousand hands.'
        },
        thumb: media('wall-cave-3-n.webp')
      },
      {
        id: 'c3-almsgiving',
        yaw: 180,
        pitch: 0,
        kind: 'mural',
        title: { zh: '东壁 · 散财观音', en: 'East Wall: The Treasure-Scattering Guanyin' },
        narration: {
          zh: '转身看东壁。门上画五身趺坐佛，门北绘散财观音——象牙、金钱、宝珠从观音手中流泻而下，下方一贫儿捧盘承接，这叫"七宝施贫"。元代画师在这里画出了整座洞窟最温柔的瞬间：千手千眼不是为了威严，而是为了能同时接住每一个需要帮助的人。',
          en: 'Turn to the east wall. Five seated Buddhas above the door, and to its north the treasure-scattering Guanyin — ivory, coins and jewels pouring from her hands while a poor child below holds out a dish to catch them: the offering of the seven treasures. Here the Yuan painter drew the gentlest moment in the cave: a thousand arms and eyes exist not for majesty, but so that every person in need can be caught at once.'
        },
        thumb: media('wall-cave-3-e.webp')
      }
    ]
  },

  {
    caveId: 'cave-329',
    walls: [
      media('wall-cave-329-w.webp'),
      media('wall-cave-329-n.webp'),
      media('wall-cave-329-e.webp'),
      media('wall-cave-329-s.webp'),
    ],
    ceiling: media('ceiling-cave-329.webp'),
    room: { radius: 4.6, height: 4.4 },
    startYaw: 0,
    intro: {
      zh: '欢迎来到第329窟，初唐。这座洞窟最珍贵的东西在您的头顶——请先环视四壁，再慢慢地、用力地抬头。窟顶的莲花飞天藻井，四身持花飞天在湛蓝的天空中同向飞行，是初唐藻井里的名作。',
      en: 'Welcome to Cave 329, Early Tang. The treasure of this cave is above you — first look around the walls, then raise your head slowly. The lotus-and-apsara caisson above, with four flower-bearing apsaras flying through a deep blue sky, is a masterpiece among early Tang caissons.'
    },
    spots: [
      {
        id: 'c329-caisson',
        yaw: 0,
        pitch: 60,
        kind: 'ceiling',
        title: { zh: '莲花飞天藻井 · 会旋转的窟顶', en: 'The Revolving Caisson' },
        facts: [
          { zh: '五色法轮花心，四飞天同向而飞', en: 'A five-coloured wheel centre, four apsaras flying one way' },
          { zh: '衣带与蓝云同向，窟顶因此旋转', en: 'Scarves and clouds stream together, setting the vault turning' }
        ],
        muralId: 'mural-lotusapsara',
        thumb: media('detail-cave-329.webp')
      },
      {
        id: 'c329-amitabha',
        yaw: -90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '南壁 · 阿弥陀经变', en: 'South Wall: The Amitābha Paradise' },
        narration: {
          zh: '请把视线放下来，转向左手边南壁。这是一铺阿弥陀经变：净土世界以绿水池潭和楼阁亭台来表现，楼阁之间有飞天往来。请留意水的画法——池水碧绿，水波用细线勾出，倒影清清楚楚。初唐画师画净土，画的其实是他们见过的最好的园林。',
          en: 'Bring your gaze down and turn to the south wall on your left. This is an Amitābha illustration: the Pure Land rendered as green pools and storied pavilions, apsaras moving between the towers. Watch the water — the pools are malachite green, rippled with fine lines, reflections clear in them. When early Tang painters painted paradise, they were really painting the finest gardens they had ever seen.'
        },
        thumb: media('wall-cave-329-s.webp')
      },
      {
        id: 'c329-maitreya',
        yaw: 90,
        pitch: 0,
        kind: 'mural',
        title: { zh: '北壁 · 弥勒经变', en: 'North Wall: The Maitreya Paradise' },
        narration: {
          zh: '转身看北壁，这里画的是弥勒经变：水池和楼阁亭台之间，尽是七宝庄严。弥勒净土的特点是"未来"——经中说，弥勒下生成佛时，人寿八万四千岁，庄稼一种七收。画师把这些细节全画了出来：田地里庄稼茂盛，路不拾遗。这不是一张风景，而是一份关于未来的承诺。',
          en: 'Turn to the north wall: the Maitreya paradise, its pools and pavilions decked in seven jewels. The Maitreya Pure Land is defined by the future — when Maitreya is born as Buddha, human life will last eighty-four thousand years and one sowing will yield seven harvests. The painter drew these details in: fields thick with grain, roads where nothing is ever lost. This is not a landscape but a promise about the future.'
        },
        thumb: media('wall-cave-329-n.webp')
      }
    ]
  }
];

export function getCaveScene(caveId: string): CaveScene {
  return CAVE_SCENES.find((s) => s.caveId === caveId) ?? CAVE_SCENES[0];
}
