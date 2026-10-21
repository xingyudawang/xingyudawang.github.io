/* generated at build time */
const VERSION = "v1792589801090";
const CACHE = 'mogao-' + VERSION;
const PRECACHE = ["/","/index.html","/media/thumb-mural-cave-320.webp","/assets/CavePanorama-BQHKosyZ.js","/assets/DeepZoomGallery-DPUl2SLq.js","/assets/DrawingStudio-HRmPP_1d.js","/assets/GuideAvatar-Crp-_i0N.js","/assets/icons-C6-198Xm.js","/assets/index-BkvOVCGx.js","/assets/index-zwZfwdvT.css","/assets/react-nGA66W8Q.js","/assets/rolldown-runtime-WkwZ5CU-.js","/assets/three-BMmBaCGJ.js","/assets/useGestures-CWtiGO9T.js"];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // hashed, immutable shell chunks: cache-first
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }))
    );
    return;
  }

  // murals: serve from cache instantly, refresh in the background
  if (url.pathname.startsWith('/media/')) {
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        const fresh = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || fresh;
      })
    );
    return;
  }

  // navigations: network-first with offline fallback to the cached shell
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
  }
});
