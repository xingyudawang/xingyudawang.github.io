import sharp from "sharp";
const meta = await sharp("../media/detail-cave-57.webp").metadata();
console.log("detail-cave-57:", meta.width + "x" + meta.height);
const m2 = await sharp("../media/mural-cave-57.webp").metadata();
console.log("mural-cave-57:", m2.width + "x" + m2.height);
const m3 = await sharp("../media/ceiling-cave-420.webp").metadata();
console.log("ceiling-cave-420:", m3.width + "x" + m3.height);
const m4 = await sharp("../media/avatar-guide.webp").metadata();
console.log("avatar-guide:", m4.width + "x" + m4.height);
