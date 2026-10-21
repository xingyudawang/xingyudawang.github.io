import sharp from "sharp";
import fs from "node:fs";
const S = 512;
const src = "../media/guide-avatar-alt.webp";

// radial vignette + circular alpha mask so the portrait reads as a medallion
const vignette = Buffer.from(
  `<svg width="${S}" height="${S}"><defs><radialGradient id="v" cx="50%" cy="46%" r="62%">
     <stop offset="55%" stop-color="#000" stop-opacity="0"/>
     <stop offset="100%" stop-color="#000" stop-opacity="0.55"/></radialGradient></defs>
   <rect width="${S}" height="${S}" fill="url(#v)"/></svg>`
);
const mask = Buffer.from(
  `<svg width="${S}" height="${S}"><circle cx="${S/2}" cy="${S/2}" r="${S/2}" fill="#fff"/></svg>`
);

const base = await sharp(src).resize(S, S, { fit: "cover" }).toBuffer();
const out = await sharp(base)
  .composite([{ input: vignette, blend: "over" }])
  .composite([{ input: mask, blend: "dest-in" }])
  .webp({ quality: 90, effort: 6 })
  .toBuffer();

fs.writeFileSync("../media/guide-avatar.webp", out);
fs.unlinkSync("../media/guide-avatar-alt.webp");
fs.unlinkSync("../media/avatar-guide.webp");
console.log("guide-avatar.webp", Math.round(out.length/1024)+"KB", "(circular medallion)");
console.log("media count:", fs.readdirSync("../media").length);
