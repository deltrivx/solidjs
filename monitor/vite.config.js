import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: '/solidjs/monitor/',
  build: {
    target: 'esnext',
    outDir: '../dist/monitor',
  },
});
