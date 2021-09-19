import { v4 as uid } from 'uuid'

// use numeric timestamp since +new Date('10000-01-01:00:00Z') coerces to NaN on some systems (?)
const decamillenium = 253402304400000

/** Returns a 20 character universally unique identifier which lexicographic sorts in reverse chronological order. */
const chronouid = () => `${(decamillenium - Date.now()).toString(16)}-${uid().slice(0, 7)}`

export default chronouid
