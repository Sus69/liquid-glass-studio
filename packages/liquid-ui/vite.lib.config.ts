import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

/**
 * Library build for liquid-ui. Emits ESM + CJS bundles with a matching d.ts
 * tree (d.ts via tsc in a follow-up `build:types` step when packaging).
 */
export default defineConfig({
  plugins: [
    glsl({
      warnDuplicatedImports: true,
      removeDuplicatedImports: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    cssCodeSplit: false,
    rollupOptions: {
      // Peer deps stay external — never bundled into the library output.
      external: ['react', 'react-dom', 'react/jsx-runtime', '@react-spring/web'],
      output: {
        assetFileNames: (asset) => (asset.name?.endsWith('.css') ? 'styles.css' : asset.name ?? 'asset'),
      },
    },
  },
});
