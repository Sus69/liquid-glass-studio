import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import glsl from 'vite-plugin-glsl';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        showcase: 'showcase.html',
        mock: 'mock.html',
        docs: 'docs.html',
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    // Inlines `#include` directives in .glsl / .wgsl shader files at build time
    glsl({
      warnDuplicatedImports: true,
      removeDuplicatedImports: true,
    }),
  ],
});
