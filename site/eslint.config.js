import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'dist-drafts/', '.astro/', 'node_modules/', 'playwright-report/', 'test-results/', 'lighthouse/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: "JSXAttribute[name.name='set:html']", message: 'set:html is only allowed for serialised JSON-LD.' },
      ],
    },
  },
  {
    files: ['src/components/SEOHead.astro'],
    rules: { 'no-restricted-syntax': 'off' },
  },
];
