import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    css: false,
    setupFiles: ['./sources/__tests__/setup.ts'],
    include: ['sources/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['sources/**/*.{ts,tsx}'],
      exclude: ['sources/__tests__/**', 'sources/main.tsx'],
    },
  },
});
