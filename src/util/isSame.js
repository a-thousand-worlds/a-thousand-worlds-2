/** Returns true if a string is "same", "is same", or "the same" */
const isSame = s =>
  /\s*((is|the)\s+)?same\s*$/i.test(s)

export default isSame
