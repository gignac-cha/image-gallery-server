import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['sources/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['sources/**/*.ts'],
      exclude: ['sources/**/*.test.ts', 'sources/testing/**'],
    },
  },
});
