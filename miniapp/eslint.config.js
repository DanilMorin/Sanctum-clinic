export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.js', 'test/**/*.js', '*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly',
        fetch: 'readonly',
        window: 'readonly',
      },
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-undef': 'error',
      'no-unused-vars': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];
