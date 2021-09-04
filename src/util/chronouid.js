import { v4 as uid } from 'uuid'

const decamillenium = new Date('10000-01-01:00:00Z')

/** Returns a 20 character universally unique identifier which lexicographic sorts in reverse chronological order. */
const chronouid = () => `${(decamillenium - new Date()).toString(16)}-${uid().slice(0, 7)}`

export default chronouid
