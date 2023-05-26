/*

Preloads Firebase tags into /src/assets/tags.json for loading initial filters faster. Use "npm run preload" instead of calling direcly.

Usage:

  - `mkdir -p /tmp/atw && firebase database:get /tags > /tmp/atw/tags.json && node ./preload.js`

Known Issues
  - cannot call firebase database:get in child_process due to truncated stdout (See: https://github.com/sindresorhus/execa/issues/130)

NOT USED. Will consider if the load time is noticeable.

*/
const fs = require('fs')
const _ = require('lodash')

let tagsFile
try {
  tagsFile = fs.readFileSync('/tmp/atw/tags.json')
} catch (e) {
  if (e.code === 'ENOENT') {
    console.error(
      'ERROR: Missing /tmp/atw/tags.json. Run "npm run preload" to download collections from Firebase Realtime Database.',
    )
    process.exit(1)
  }
  throw e
}

const tagsFull = JSON.parse(tagsFile)

// strip timestamps to reduce payload
const tags = Object.entries(tagsFull).reduce(
  (accum, [categoryKey, categoryValue]) => ({
    ...accum,
    [categoryKey]: Object.entries(categoryValue).reduce(
      (accumInner, [tagKey, tagValue]) => ({
        ...accumInner,
        [tagKey]: _.pick(tagValue, ['id', 'showOnFront', 'sortOrder', 'tag']),
      }),
      {},
    ),
  }),
  {},
)

fs.writeFileSync('src/assets/tags.json', JSON.stringify(tags, null, 2))
