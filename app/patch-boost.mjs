import fs from "node:fs";
let s = fs.readFileSync("src/three/CaveEngine.ts", "utf8");
// wall material
s = s.replace(
`      const mat = new THREE.MeshBasicMaterial({
        color: 0x241a12,
        side: THREE.BackSide,
        toneMapped: false,
      });
      const fullTex = this.loadTextureInto(mat, sceneData.walls[i], thumb(sceneData.walls[i]));`,
`      const mat = new THREE.MeshBasicMaterial({
        color: 0x241a12,
        side: THREE.BackSide,
        toneMapped: false,
      });
      boostColor(mat);
      const fullTex = this.loadTextureInto(mat, sceneData.walls[i], thumb(sceneData.walls[i]));`
);
// ceiling
s = s.replace(
`    const ceilMat = new THREE.MeshBasicMaterial({
      color: 0x241a12,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.loadTextureInto(ceilMat, sceneData.ceiling, thumb(sceneData.ceiling));`,
`    const ceilMat = new THREE.MeshBasicMaterial({
      color: 0x241a12,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    boostColor(ceilMat);
    this.loadTextureInto(ceilMat, sceneData.ceiling, thumb(sceneData.ceiling));`
);
// floor
s = s.replace(
`    const floorMat = new THREE.MeshBasicMaterial({ color: 0x33251a });`,
`    const floorMat = new THREE.MeshBasicMaterial({ color: 0x33251a });
    boostColor(floorMat);`
);
// pillar
s = s.replace(
`      const mat = new THREE.MeshBasicMaterial({
        color: 0x241a12,
        toneMapped: false,
      });
      this.loadTextureInto(mat, p.texture, thumb(p.texture));`,
`      const mat = new THREE.MeshBasicMaterial({
        color: 0x241a12,
        toneMapped: false,
      });
      boostColor(mat);
      this.loadTextureInto(mat, p.texture, thumb(p.texture));`
);
fs.writeFileSync("src/three/CaveEngine.ts", s, "utf8");
console.log("boostColor calls:", (s.match(/boostColor\(/g) || []).length);
