import sharp from "sharp";
for (const name of ["cave-257","cave-420","cave-57","zoom-deer","workshop"]) {
  const f = `D:\\wangzhan\\shots\\${name}.png`;
  const img = sharp(f);
  const meta = await img.metadata();
  const w = Math.round(meta.width * 0.5), h = Math.round(meta.height * 0.4);
  const left = Math.round((meta.width - w) / 2), top = Math.round((meta.height - h) / 2);
  const { data } = await sharp(f).extract({ left, top, width: w, height: h }).raw().toBuffer({ resolveWithObject: true });
  let r=0,g=0,b=0, n=w*h;
  for (let i=0;i<n;i++){ r+=data[i*3]; g+=data[i*3+1]; b+=data[i*3+2]; }
  console.log(name.padEnd(12), "centre RGB =", Math.round(r/n), Math.round(g/n), Math.round(b/n), " warm:", (r/n) > (b/n));
}
