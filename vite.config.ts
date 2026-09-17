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
        studio: 'studio.html',
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
    {
      name: 'dev-clean-urls',
      configureServer(server) {
        server.middlewares.use((req: any, _res: any, next: () => void) => {
          if (!req.url) return next();
          const cleanUrl = req.url.split('?')[0].split('#')[0];
          if (cleanUrl === '/studio') req.url = req.url.replace('/studio', '/studio.html');
          else if (cleanUrl === '/showcase') req.url = req.url.replace('/showcase', '/showcase.html');
          else if (cleanUrl === '/mock') req.url = req.url.replace('/mock', '/mock.html');
          else if (cleanUrl === '/docs') req.url = req.url.replace('/docs', '/index.html');
          next();
        });
      },
    },
  ],
});
