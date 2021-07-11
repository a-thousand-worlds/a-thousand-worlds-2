/** Eliminates non-letter characters for almostEqual comparisons. */
const normalize = s => (s || '').replace(/[\W]/g, '').toLowerCase()

/** Returns true if two strings are a match ignoring spacing and punctuation. */
const almostEqual = (a, b) => normalize(a) === normalize(b)

export default almostEqual
