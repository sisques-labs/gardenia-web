import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'src/app/core/**',
      'src/app/shared/**',
      'src/app/app.ts',
      'src/app/app.config.ts',
      'src/app/app.routes.ts',
      'src/app/app.spec.ts',
    ],
  },
];

export default eslintConfig;
