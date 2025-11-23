import { defineConfig } from 'vite';

export default defineConfig({
  base: '/kart/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  assetsInclude: ['**/*.dae'],
});
