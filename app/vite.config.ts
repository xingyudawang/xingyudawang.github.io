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

export default defineConfig(() => ({
  base: '/',
  plugins: [react(), tailwindcss(), mediaAssets()],
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
