import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Copy the shared mural assets into `<outDir>/media` at build time.
 *
 * The assets live once, in the repository's top-level `media/` folder, instead of
 * being duplicated inside the app source tree. They are served from `/media/…`,
 * which keeps the URLs stable and lets Vite hash the JS/CSS around them.
 */
function mediaAssets(): Plugin {
  const from = path.resolve(__dirname, '../media');
  let outDir = path.resolve(__dirname, '../.build-out');
  return {
    name: 'dsh-media-assets',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      if (!fs.existsSync(from)) {
        this.warn(`media folder not found at ${from} — skipping asset copy`);
        return;
      }
      const to = path.join(outDir, 'media');
      await fs.promises.rm(to, { recursive: true, force: true });
      await fs.promises.cp(from, to, { recursive: true });
      const count = (await fs.promises.readdir(to)).length;
      this.info(`copied ${count} media files to ${path.relative(process.cwd(), to)}`);
    },
  };
}

/**
 * Emit a service worker that caches the shell and every image it serves.
 *
 * GitHub Pages sends `Cache-Control: max-age=600`, so without this every return
 * visit re-downloads ~30 MB of murals. The worker caches /media and /assets
 * indefinitely (hashed + versioned names), making second and later visits load
 * instantly from disk.
 */
function serviceWorker(): Plugin {
  let outDir = path.resolve(__dirname, '../.build-out');
  return {
    name: 'dsh-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const version = `v${Date.now()}`;

      // precache the shell: hashed JS/CSS + the hero preview for first paint
      const precache = ['/', '/index.html', '/media/thumb-mural-cave-320.webp'];
      const assetsDir = path.join(outDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        for (const f of fs.readdirSync(assetsDir)) {
          if (/\.(js|css|woff2?)$/.test(f)) precache.push(`/assets/${f}`);
        }
      }

      const sw = `/* generated at build time */
const VERSION = ${JSON.stringify(version)};
const CACHE = 'mogao-' + VERSION;
const PRECACHE = ${JSON.stringify(precache, null, 0)};

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
`;
      fs.writeFileSync(path.join(outDir, 'sw.js'), sw, 'utf8');
      this.info(`wrote sw.js (${precache.length} precached entries)`);
    },
  };
}

export default defineConfig(() => ({
  base: '/',
  plugins: [react(), tailwindcss(), mediaAssets(), serviceWorker()],
  build: {
    outDir: '../.build-out',
    emptyOutDir: true,
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/react')) return 'react';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          return undefined;
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
}));
