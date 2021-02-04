module.exports = {
  // https://github.com/visualfanatic/vue-svg-loader
  chainWebpack: config => {

    // meta
    const description = 'Colorful Reads X Colorful People'
    const image = '/social/red.png'
    const logo = '/logo/red.png'
    const title = 'A Thousand Worlds'
    const twitter = 'worlds_thousand'
    const url = 'https://athousandworlds.org'

    config
      .plugin('html')
      .tap(args => {
        const options = {
          title: `${title} : ${description}`,
          meta: {

            // twitter
            'twitter:card': 'summary_large_image',
            'twitter:description': description,
            'twitter:image': `${url}${image}`,
            'twitter:site': '@' + twitter,
            'twitter:title': title,
            'twitter:url': url,

            // open graph
            'og:description': description,
            'og:image': `${url}${image}?fbreset=1`,
            'og:title': title,
            'og:type': 'article',
            'og:url': url,

            // facebook
            // 'fb:app_id': '',
            'fb:pages': '102421671707042',
            'article:opinion': 'false',
            'article:content_tier': 'free',

          },

          // pass options to index.html for Google structured data
          // (maybe there is a way to do this with html-plugin-webpack)
          image,
          logo,
          url,
        }

        // merge options into first arg
        return [
          {
            ...args[0],
            ...options,
          },
          ...args.slice(1)
        ]
      })

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
