import sharp from "sharp";
for (const f of ["guide-avatar.webp","guide-avatar-alt.webp"]) {
  const { data, info } = await sharp("../media/" + f).greyscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  // edge density via simple gradient
  let edges = 0, sum = 0, n = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y*w+x;
    const gx = Math.abs(data[i+1]-data[i-1]);
    const gy = Math.abs(data[i+w]-data[i-w]);
    if (gx+gy > 26) edges++;
    sum += data[i]; n++;
  }
  // central-patch uniformity (faces are smoother than halos/drapery)
  const cx0 = Math.round(w*0.3), cy0 = Math.round(h*0.3), cw = Math.round(w*0.4), ch = Math.round(h*0.4);
  let cSum=0, cSq=0, cN=0;
  for (let y=cy0;y<cy0+ch;y++) for (let x=cx0;x<cx0+cw;x++){ const v=data[y*w+x]; cSum+=v; cSq+=v*v; cN++; }
  const cMean=cSum/cN, cStd=Math.sqrt(cSq/cN-cMean*cMean);
  console.log(f.padEnd(24), "mean="+(sum/n).toFixed(0), "edge="+((edges/n)*100).toFixed(2)+"%", "centreStd="+cStd.toFixed(1));
}
