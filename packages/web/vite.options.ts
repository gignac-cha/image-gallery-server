import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: import.meta.dirname,
  build: {
    outDir: 'outputs',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/_thumbnails': 'http://localhost:8080',
      '/images': 'http://localhost:8080',
      '/media': 'http://localhost:8080',
    },
  },
});
