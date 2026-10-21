import fs from "node:fs";

// PortalHome: fall back to the full image whenever a thumb is missing
let p = fs.readFileSync("src/components/PortalHome.tsx", "utf8");
p = p.replace(
  `src={thumb(media('mural-cave-320.webp'))}`,
  `src={thumb(media('mural-cave-320.webp'))}
          onError={(e) => (e.currentTarget.style.display = 'none')}`
);
p = p.replace(
  `src={thumb(cave.coverImage)}`,
  `src={thumb(cave.coverImage)}
                  onError={(e) => (e.currentTarget.src = cave.coverImage)}`
);
p = p.replace(
  `src={thumb(m.imageUrl)}`,
  `src={thumb(m.imageUrl)}
                onError={(e) => (e.currentTarget.src = m.imageUrl)}`
);
p = p.replace(
  `src={thumb(media('hero-mural-bg.webp'))}`,
  `src={thumb(media('hero-mural-bg.webp'))}
            onError={(e) => (e.currentTarget.src = media('hero-mural-bg.webp'))}`
);
fs.writeFileSync("src/components/PortalHome.tsx", p, "utf8");
console.log("portal:", (p.match(/onError=/g) || []).length);

// ProfileScreen favourites
let pf = fs.readFileSync("src/components/ProfileScreen.tsx", "utf8");
pf = pf.replace(
  `src={thumb(m.imageUrl)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover"`,
  `src={thumb(m.imageUrl)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = m.imageUrl)}`
);
fs.writeFileSync("src/components/ProfileScreen.tsx", pf, "utf8");
console.log("profile:", pf.includes("onError"));

// DeepZoomGallery underlay: hide when missing
let dz = fs.readFileSync("src/components/DeepZoomGallery.tsx", "utf8");
dz = dz.replace(
  `src={thumb(imageUrl)}
              alt=""
              aria-hidden="true"`,
  `src={thumb(imageUrl)}
              alt=""
              aria-hidden="true"
              onError={(e) => (e.currentTarget.style.display = 'none')}`
);
fs.writeFileSync("src/components/DeepZoomGallery.tsx", dz, "utf8");
console.log("gallery:", dz.includes("onError"));
