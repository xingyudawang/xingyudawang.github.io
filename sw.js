/* generated at build time */
const VERSION = "v1792593448404";
const CACHE = 'mogao-' + VERSION;
const PRECACHE = ["/","/index.html","/media/thumb-mural-cave-320.webp","/assets/CavePanorama-9zdv4tv6.js","/assets/DeepZoomGallery-CPIpGec3.js","/assets/DrawingStudio-DpQTzC2N.js","/assets/icons-ZnidQ9Cn.js","/assets/index-BqaVw8ap.js","/assets/index-NUKn2zNR.css","/assets/react-BUQJQBo4.js","/assets/rolldown-runtime-WkwZ5CU-.js","/assets/three-BjAaiPDQ.js"];

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

  // Always bypass the browser HTTP cache when the service worker fetches.
  // GitHub Pages serves Cache-Control: max-age=600, which used to pin a
  // stale index.html (and with it the whole old app) for up to 10 minutes
  // after every deploy.
  const network = (request) => fetch(request, { cache: 'no-store' });

  // hashed, immutable shell chunks: cache-first
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || network(req).then((res) => {
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
        const fresh = network(req)
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

  // navigations: strictly network-first with offline fallback to the shell
  if (req.mode === 'navigate') {
    e.respondWith(
      network(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
  }
});
