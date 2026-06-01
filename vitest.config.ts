import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // Exclude Angular-era spec files until Phase 5 removes Angular source
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'src/app/app.spec.ts',
      'src/app/core/**/*.spec.ts',
      'src/app/core/**/*.spec.tsx',
      'src/app/shared/**/*.spec.ts',
      'src/app/shared/**/*.spec.tsx',
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
