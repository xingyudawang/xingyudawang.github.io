import fs from "node:fs";
let s = fs.readFileSync("scripts/guide-check-live.mjs", "utf8");
s = s.replace(
  "const clicked = await evaluate(`(() => {",
  "let clicked = 'no-hotspot';\nfor (let i = 0; i < 14 && clicked === 'no-hotspot'; i++) {\n  clicked = await evaluate(`(() => {"
);
s = s.replace(
  "})()`);\nawait sleep(1500);",
  "})()`);\n  if (clicked !== 'no-hotspot') break;\n  await sleep(1000);\n}\nawait sleep(1500);"
);
fs.writeFileSync("scripts/guide-check-live.mjs", s, "utf8");
console.log("patched");
