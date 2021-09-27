import { remove as diacritics } from 'diacritics'

/** Eliminates non-letter characters for almostEqual comparisons. */
const normalize = s => (s || '').replace(/[\W]/g, '').toLowerCase()

/** Returns true if two strings are a match ignoring spacing, punctuation, and diacritics. */
const almostEqual = (a, b) => normalize(diacritics(a)) === normalize(diacritics(b))

export default almostEqual
