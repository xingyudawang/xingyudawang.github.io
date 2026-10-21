import fs from "node:fs";

// 1. profile avatar becomes the abstract seal, so the only "digital human" is 妙音
let a = fs.readFileSync("src/context/AppContext.tsx", "utf8");
a = a.replace("avatar: 'avatar-guide.webp',", "avatar: 'seal-emblem.webp',");
fs.writeFileSync("src/context/AppContext.tsx", a, "utf8");

// 2. sample comments use the seal too
let d = fs.readFileSync("src/data/dunhuangData.ts", "utf8");
d = d.replace(/avatar: media\('avatar-guide\.webp'\)/g, "avatar: media('seal-emblem.webp')");
fs.writeFileSync("src/data/dunhuangData.ts", d, "utf8");

console.log("avatar-guide refs left:", (fs.readFileSync("src/context/AppContext.tsx","utf8").match(/avatar-guide/g)||[]).length);
console.log("seal refs:", (d.match(/seal-emblem/g)||[]).length);
