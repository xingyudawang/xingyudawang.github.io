# 素材来源与版权说明 / Credits & Licensing

## 一、壁画与洞窟图片

本站所有壁画、窟顶、墙体图像，均来自 **敦煌研究院「数字敦煌」**（Digital Dunhuang）公开档案中的真实高精度扫描：

- 数据来源：<https://www.e-dunhuang.com/>
- 图像 CDN：`https://cdn.e-dunhuang.com/SOURCES/...`
- 采集方式：读取每幅壁画的 Deep Zoom 瓦片金字塔（`index.dzi` + `index_files/{level}/{col}_{row}.jpg`），
  按展示需要选择层级取瓦片、拼接成完整图，再缩放并转为 WebP。
- **没有使用任何 AI 生成图像。** 所有像素都来自原作扫描。

### 采集清单

| 文件 | 来源 |
| --- | --- |
| `mural-cave-<n>.webp` | 该窟最具代表性的一面墙，按目标宽度 3400 px 拼接 |
| `wall-cave-<n>-{e,s,w,n}.webp` | 该窟东 / 南 / 西 / 北壁，1700 px，用于 360° 洞窟的四面墙 |
| `ceiling-cave-<n>.webp` | 该窟藻井 / 平棋顶 / 披面，用于窟顶 |
| `detail-cave-<n>.webp` | 代表性墙壁的**原生分辨率局部裁切**（约 2000 px 宽），用于「放大看细节」 |
| `encyc-*.webp` | 从真实扫描中裁出的颜料、乐器、护法、藻井局部 |
| `wash-*.webp` | 由真实壁画经去饱和 + 提亮处理得到的「等待上色」底稿 |
| `guide-avatar.webp` | 数字人「九色鹿」头像：第 257 窟西壁《九色鹿王本生》的裁切（圆形徽章） |
| `guide-deer-card.webp` | 数字人横幅：同一壁画的宽幅裁切，用于讲解卡片顶部 |
| `seal-emblem.webp` | 第 420 窟三兔藻井井心的局部（个人印章徽记） |
| `hero-mural-bg.webp` | 第 320 窟南壁的横幅裁切（背景纹理） |

### 各窟原始扫描尺寸（取自 `index.dzi`）

| 窟号 | 规模 |
| --- | --- |
| 第257窟 | 南壁 35686 × 20484 px · 西壁 21515 × 15796 px · 北壁 29988 × 17347 px |
| 第254窟 | 南壁 32845 × 16680 px · 北壁 30634 × 15489 px |
| 第249窟 | 南壁 19856 × 14616 px · 北壁 21118 × 14401 px |
| 第285窟 | 东壁 25856 × 12898 px · 西壁 22571 × 11653 px |
| 第420窟 | 南壁 22601 × 17467 px · 西壁 20554 × 17148 px |
| 第320窟 | 北壁 19160 × 13872 px · 南壁 17406 × 13828 px |
| 第57窟 | 南壁 14899 × 13082 px · 西壁 15031 × 11881 px |
| 第112窟 | 东壁 9787 × 8888 px · 北壁 8309 × 8622 px |
| 第17窟 | 北壁 10648 × 9327 px |

### ⚠️ 版权

**壁画数字影像的著作权属于敦煌研究院。**「数字敦煌」的公开素材主要面向学习、研究与非商业展示。

- 本站是**个人、非商业**的数字化展示习作，已尽到注明出处的义务。
- 若要正式对外发布、用于商业用途或再分发，**请先联系敦煌研究院取得授权**。
- 替代方案：把 `media/` 中相关图片替换为你自己拥有版权的素材即可，文件名保持一致，代码无需改动。

为了让出处可见，页脚标注了「数字壁画为艺术再现，原作藏于敦煌莫高窟」，并链接到数字敦煌。

## 二、文字内容

- 界面文案、讲解词、百科条目、题库：本项目自行撰写。
- 洞窟年代、壁面方位、图像内容等事实性信息，参考敦煌研究院「数字敦煌」各窟说明页的公开描述（仅作事实核对，正文为自行撰写）。

## 三、字体

通过 Google Fonts 引入，遵循各自的授权：

- [Noto Serif SC](https://fonts.google.com/specimen/Noto+Serif+SC) — SIL Open Font License 1.1
- [Ma Shan Zheng](https://fonts.google.com/specimen/Ma+Shan+Zheng) — SIL Open Font License 1.1
- [Cinzel](https://fonts.google.com/specimen/Cinzel) — SIL Open Font License 1.1

## 四、开源依赖

| 依赖 | 许可 |
| --- | --- |
| React / React DOM | MIT |
| three.js | MIT |
| Vite | MIT |
| Tailwind CSS | MIT |
| perfect-freehand | MIT |
| lucide-react | ISC |
| canvas-confetti | ISC |

## 五、致谢

感谢敦煌研究院与「数字敦煌」项目长期以来的数字化工作——没有这些公开的高精度扫描，
这个项目不可能呈现出哪怕是原作的一小部分质感。
