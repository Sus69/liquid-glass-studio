import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import glsl from 'vite-plugin-glsl';

// Dedicated standalone production build configuration for Liquid Glass Studio
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    glsl({
      warnDuplicatedImports: true,
      removeDuplicatedImports: true,
    }),
  ],
  build: {
    outDir: 'dist-studio',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        mock: 'mock.html',
        showcase: 'showcase.html',
      },
    },
  },
});
