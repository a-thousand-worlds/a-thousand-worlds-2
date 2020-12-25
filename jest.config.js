module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testMatch: [
    "**/__tests__/*.{j,t}s?(x)",
    "**/*.test.{j,t}s?(x)"
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    // fixed in next release of @vue/cli-plugin-unit-jest > 4.5.9
    // https://github.com/vuejs/vue-cli/pull/6170
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
}
