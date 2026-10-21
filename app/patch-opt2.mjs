import fs from "node:fs";
let s = fs.readFileSync("scripts/optimize-media.mjs", "utf8");
// wrap the per-file resize+thumb logic so a locked file only skips, never aborts
s = s.replace(
  `  const cfg = ruleFor(file);
  if (cfg && meta.width > cfg.width * 1.05) {`,
  `  try {
  const cfg = ruleFor(file);
  if (cfg && meta.width > cfg.width * 1.05) {`
);
s = s.replace(
  `  // 640px thumb (unless the source is already tiny)
  if (meta.width > 700) {
    const thumb = await sharp(src, { limitInputPixels: false })
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 70, effort: 6 })
      .toBuffer();
    await writeWithRetry(path.join(PUB, `thumb-${file}`), thumb);
    thumbTotal += thumb.length;
  }
}`,
  `  // 640px thumb (unless the source is already tiny)
  if (meta.width > 700) {
    const thumb = await sharp(src, { limitInputPixels: false })
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 70, effort: 6 })
      .toBuffer();
    await writeWithRetry(path.join(PUB, `thumb-${file}`), thumb);
    thumbTotal += thumb.length;
  }
  } catch (e) {
    console.log('SKIP ' + file + ': ' + e.message.slice(0, 60));
  }`
);
fs.writeFileSync("scripts/optimize-media.mjs", s, "utf8");
console.log("patched with skip-on-error");
