const rebuildCache = require('./util/rebuildCache')

module.exports = async () => {
  console.log('run every day')
  const res = await rebuildCache()
  console.log('done', res)
}
