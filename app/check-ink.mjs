import sharp from "sharp";
import fs from "node:fs";
const files = fs.readdirSync("public/media").filter(f => f.startsWith("lineart-"));
for (const f of files) {
  const { data, info } = await sharp("public/media/" + f).greyscale().raw().toBuffer({ resolveWithObject: true });
  let dark = 0;
  for (let i = 0; i < data.length; i++) if (data[i] < 110) dark++;
  console.log(f.padEnd(28), info.width + "x" + info.height, "ink=" + ((dark / data.length) * 100).toFixed(2) + "%");
}
