module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/recommended',
    'plugin:vue/vue3-recommended',
    'raine'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  plugins: [
    'jest-dom',
    'testing-library'
  ],
  rules: {
    'vue/component-name-in-template-casing': [
      2,
      'PascalCase'
    ],
    'vue/attribute-hyphenation': 0,
    'vue/attributes-order': 0,
    'vue/html-closing-bracket-newline': 0,
    'vue/max-attributes-per-line': 0,
    'vue/multiline-html-element-content-newline': 0,
    'vue/require-default-prop': 0,
    'vue/require-prop-types': 0,
    'vue/singleline-html-element-content-newline': 0,
    // use fork to allow MemberExpressions
    // https://github.com/jfmengels/eslint-plugin-fp/pull/54
    "fp/no-mutating-methods": [2, {
      "allowedObjects": ["$router"]
    }]

  }
}
