import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],

    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.svelte'],
        svelteConfig: {
          onwarn(warning, handler) {
            // only relevant when compiling to custom elements, which this app doesn't
            if (warning.code !== 'custom_element_props_identifier') {
              handler(warning);
            }
          },
        },
      },
    },
    rules: {
      // TypeScript already checks this and knows about generics and global namespaces
      'no-undef': 'off',
      // flags local, non-reactive Date/Map/URLSearchParams instances too
      'svelte/prefer-svelte-reactivity': 'off',
      // the app has no base path, so resolve() would be a no-op
      'svelte/no-navigation-without-resolve': 'off',
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', '.vercel/'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn', // or "error"
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
);
