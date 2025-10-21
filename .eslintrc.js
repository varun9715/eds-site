module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
    'plugin:storybook/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'no-console': 'off',
    'operator-linebreak': 'off', // conflicts with prettier
    'object-curly-newline': 'off', // this conflicts with prettier
    'implicit-arrow-linebreak': 'off', // conflicts with prettier
    'function-paren-newline': 'off',
    'import/no-extraneous-dependencies': 'off',
    'xwalk/max-cells': [
      'error',
      {
        '*': 40,
      },
    ],
  },
  globals: {
    describe: true,
    Cypress: true,
    it: true,
    before: true,
    beforeEach: true,
    afterEach: true,
    cy: true,
    expect: true,
    after: true,
  },
};
