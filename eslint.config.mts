import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';
import { globalIgnores, defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';

export default defineConfig(
  globalIgnores([
    'node_modules',
    'dist',
    'esbuild.config.mjs',
    'version-bump.mjs',
    'versions.json',
    'main.js',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
  ]),
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mts', 'jest.config.cjs', 'manifest.json'],
          tsconfigRootDir: import.meta.resolve('./'),
          extraFileExtensions: ['.json'],
        },
      },
    },
  },
  ...obsidianmd.configs.recommended,
  {
    rules: {
      'obsidianmd/regex-lookbehind': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      globals: { ...globals.jest, ...globals.node },
    },
    rules: {
      'obsidianmd/no-nodejs-modules': 'off',
    },
  },
  {
    files: ['jest.config.cjs'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
  },
  prettier,
);
