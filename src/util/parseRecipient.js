import { validate as validateEmail } from 'email-validator'

/** Parse a string into a name and email. */
const parseRecipient = s => {

  const words = s
    .split(/\s+/g)
    // replace empty words or dashes
    .filter(word => word && word !== '-')
    // replace dashes at the beginning or end of a word
    .map(word => word.replace(/^[-–]+|[-–]$/g, '').trim())

  const email = words[words.length - 1]
    // replace brackets at beginning or end of email
    .replace(/^[<>]+|[<>]$/g, '')

  if (!validateEmail(email)) {
    return {
      raw: s,
      isValid: false,
    }
  }

  return {
    firstName: words.length > 1 ? words[0] : '',
    lastName: words.slice(1, words.length - 1).join(' '),
    email,
    raw: s,
    isValid: true
  }
}

export default parseRecipient
