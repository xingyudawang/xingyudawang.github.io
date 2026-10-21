import fs from 'node:fs';

// 1. CavePanorama: hide the loading veil sooner (wall previews arrive in ~1s)
let cp = fs.readFileSync('src/components/CavePanorama.tsx', 'utf8');
cp = cp.replace(
  'const readyTimer = setTimeout(() => setReady(true), 2600);',
  '// the first wall preview arrives within ~1s; stop waiting for the full scans\n    const readyTimer = setTimeout(() => setReady(true), 1000);'
);
fs.writeFileSync('src/components/CavePanorama.tsx', cp, 'utf8');
console.log('panorama early veil:', cp.includes('setReady(true), 1000)'));

// 2. PortalHome hero: lighter full image (1400w band instead of the large wall)
let ph = fs.readFileSync('src/components/PortalHome.tsx', 'utf8');
ph = ph.replace(
  "src={thumb(media('mural-cave-320.webp'))}\n          onError={(e) => (e.currentTarget.style.display = 'none')}",
  "src={thumb(media('hero-mural-bg.webp'))}\n          onError={(e) => (e.currentTarget.style.display = 'none')}"
);
ph = ph.replace(
  "src={media('mural-cave-320.webp')}",
  "src={media('hero-mural-bg.webp')}"
);
fs.writeFileSync('src/components/PortalHome.tsx', ph, 'utf8');
console.log('portal hero uses hero-mural-bg:', (ph.match(/hero-mural-bg/g) || []).length >= 3);

// 3. index.html: non-blocking font CSS
let ih = fs.readFileSync('index.html', 'utf8');
const OLD = `    <link\n      href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@300;400;600;700;900&family=Cinzel:wght@500;700&display=swap"\n      rel="stylesheet"\n    />`;
const NEW = `    <link\n      href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@300;400;600;700;900&family=Cinzel:wght@500;700&display=swap"\n      rel="stylesheet"\n      media="print"\n      onload="this.media='all'"\n    />\n    <noscript>\n      <link\n        href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@300;400;600;700;900&family=Cinzel:wght@500;700&display=swap"\n        rel="stylesheet"\n      />\n    </noscript>`;
if (!ih.includes("this.media='all'")) {
  ih = ih.replace(OLD, NEW);
}
fs.writeFileSync('index.html', ih, 'utf8');
console.log('async fonts:', ih.includes("this.media='all'"));
