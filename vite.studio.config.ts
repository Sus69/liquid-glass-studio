import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import glsl from 'vite-plugin-glsl';

import fs from 'node:fs';
import path from 'node:path';

// Dedicated standalone production build configuration for Liquid Glass Studio
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    glsl({
      warnDuplicatedImports: true,
      removeDuplicatedImports: true,
    }),
    {
      name: 'copy-studio-to-index',
      closeBundle() {
        const src = path.resolve('dist-studio/studio.html');
        const dest = path.resolve('dist-studio/index.html');
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      },
    },
  ],
  build: {
    outDir: 'dist-studio',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        studio: 'studio.html',
        mock: 'mock.html',
        showcase: 'showcase.html',
      },
    },
  },
});
