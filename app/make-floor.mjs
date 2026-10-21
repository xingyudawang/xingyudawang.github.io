import sharp from "sharp";
import fs from "node:fs";
const src = "D:\\wangzhan\\media-src\\cave-floor.png";
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
let r=0,g=0,b=0,min=255,max=0,n=info.width*info.height;
for (let i=0;i<n;i++){ const R=data[i*3],G=data[i*3+1],B=data[i*3+2]; r+=R;g+=G;b+=B; const v=(R+G+B)/3; if(v<min)min=v; if(v>max)max=v; }
console.log(`size=${info.width}x${info.height} rgb=(${(r/n).toFixed(0)},${(g/n).toFixed(0)},${(b/n).toFixed(0)}) range=${min.toFixed(0)}-${max.toFixed(0)}`);

// mirror-tile 2x2 into a seamless 2048 texture
const tile = await sharp(src).resize(1024, 1024).toBuffer();
const seamless = await sharp({
  create: { width: 2048, height: 2048, channels: 3, background: { r: 0, g: 0, b: 0 } }
}).composite([
  { input: tile, left: 0, top: 0 },
  { input: await sharp(tile).flop().toBuffer(), left: 1024, top: 0 },
  { input: await sharp(tile).flip().toBuffer(), left: 0, top: 1024 },
  { input: await sharp(tile).flip().flop().toBuffer(), left: 1024, top: 1024 },
]).webp({ quality: 86, effort: 5 }).toBuffer();
fs.writeFileSync("../media/cave-floor.webp", seamless);
console.log("cave-floor.webp", Math.round(seamless.length/1024)+"KB (seamless 2048)");
