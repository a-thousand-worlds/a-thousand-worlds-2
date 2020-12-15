/** Merges two objects, one level deep. One level deeper than { ...a, ...b }. */
const mergeOne = (a, b) => {
  const o = { ...a }
  for (let key in b) {
    o[key] = { ...a[key], ...b[key] }
  }
  return o
}

export default mergeOne
