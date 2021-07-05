import { get, set } from '@/util/get-set'

const now = new Date()

// persists structured data to an application/ld+json script in the <head>
const structuredData = {
  namespaced: true,
  state: {
    data: {
      '@context': 'http://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.origin,
      },
      image: {
        '@type': 'ImageObject',
      },
      author: {
        '@type': 'Person',
        name: 'A Thousand Worlds',
      },
      publisher: {
        '@type': 'Organization',
        name: 'A Thousand Worlds',
      },
      datePublished: now.toISOString()
    },
  },
  mutations: {
    set(state, { path, value }) {
      if (path) {
        set(state.data, path, value)
      }
      else {
        state.data = value
      }
    }
  },
  getters: {
    get: state => path => get(state.data, path),
  },
  actions: {
    set(context, { path, value }) {

      // update all structured data or only data at a specific path
      context.commit('set', { path, value })

      // save to ld+json script
      let script = document.querySelector('script[type="application/ld+json"]')
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(context.state.data, null, 2)
    }
  }
}

export default structuredData
