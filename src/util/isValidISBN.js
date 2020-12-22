/** Simple test for ISBN to be a sting length 10 of 13 chars */
const isValidISBN = isbn => typeof isbn === 'string' && (isbn.length === 10 || isbn.length === 13)

export default isValidISBN
