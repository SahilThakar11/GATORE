import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Simulate browser DOM environment for React component tests
    environment: 'jsdom',
    // Run setup file after jsdom is ready (adds jest-dom matchers)
    setupFiles: ['./tests/setup.ts'],
    // Allow using `describe`, `it`, `expect` etc. without imports
    globals: true,
    // Pattern to find test files
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/types/**'],
    },
  },
});
