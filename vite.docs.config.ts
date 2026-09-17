import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import glsl from 'vite-plugin-glsl';

import fs from 'node:fs';
import path from 'node:path';

// Dedicated standalone production build configuration for Documentation Portal
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    glsl({
      warnDuplicatedImports: true,
      removeDuplicatedImports: true,
    }),
    {
      name: 'copy-index-to-docs',
      closeBundle() {
        const src = path.resolve('dist-docs/index.html');
        const dest = path.resolve('dist-docs/docs.html');
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      },
    },
  ],
  build: {
    outDir: 'dist-docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: 'index.html',
      },
    },
  },
});
