module.exports = {
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    }
  },
  /*
  */
  // https://github.com/visualfanatic/vue-svg-loader
  chainWebpack: config => {

    // svg
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('vue-loader')
      .loader('vue-loader-v16')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      // vue-svg-loader removes viewBox by default if width and height are present to optimize size
      // override to preserve width and height while allowing it to scale properly if width and height are overridden (e.g. set to 100% to fill container)
      // https://github.com/visualfanatic/vue-svg-loader/issues/58
      .options({
        svgo: {
          plugins: [{ removeViewBox: false }]
        }
      })
  },
}
