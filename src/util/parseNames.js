/** Parses a user-provided string that is expected to contain one or more people's names and returns an array of trimmed values with conjugations and punctuation removed. Returns an empty array if the input is null or undefined. */
const parseNames = s =>
  s
    ? s
        .split(/[,;&]|\s+and\s+/g)
        .map(x => x && x.trim())
        .filter(x => x)
    : []

export default parseNames
