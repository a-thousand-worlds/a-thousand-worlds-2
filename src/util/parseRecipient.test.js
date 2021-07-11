import parseRecipient from './parseRecipient'

test('first last email@domain.com', () => {
  expect(parseRecipient('Luke Skywalker luke@rebelalliance.org')).toEqual({
    firstName: 'Luke',
    lastName: 'Skywalker',
    email: 'luke@rebelalliance.org',
    isValid: true,
    raw: 'Luke Skywalker luke@rebelalliance.org',
  })
})

test('multiple spaces', () => {
  expect(parseRecipient('Luke   Skywalker      luke@rebelalliance.org')).toEqual({
    firstName: 'Luke',
    lastName: 'Skywalker',
    email: 'luke@rebelalliance.org',
    isValid: true,
    raw: 'Luke   Skywalker      luke@rebelalliance.org',
  })
})

test('leading spaces', () => {
  expect(parseRecipient('  Luke Skywalker luke@rebelalliance.org')).toEqual({
    firstName: 'Luke',
    lastName: 'Skywalker',
    email: 'luke@rebelalliance.org',
    isValid: true,
    raw: '  Luke Skywalker luke@rebelalliance.org',
  })
})

test('trailing spaces', () => {
  expect(parseRecipient('Luke Skywalker luke@rebelalliance.org   ')).toEqual({
    firstName: 'Luke',
    lastName: 'Skywalker',
    email: 'luke@rebelalliance.org',
    isValid: true,
    raw: 'Luke Skywalker luke@rebelalliance.org   ',
  })
})

test('brackets', () => {
  expect(parseRecipient('Luke Skywalker <luke@rebelalliance.org>')).toEqual({
    firstName: 'Luke',
    lastName: 'Skywalker',
    email: 'luke@rebelalliance.org',
    isValid: true,
    raw: 'Luke Skywalker <luke@rebelalliance.org>',
  })
})

test('separated by a dash', () => {
  const expected = {
    firstName: 'Luke',
    lastName: 'Skywalker',
    email: 'luke@rebelalliance.org',
    isValid: true,
  }

  expect(parseRecipient('Luke Skywalker - luke@rebelalliance.org')).toMatchObject(expected)
  expect(parseRecipient('Luke Skywalker- luke@rebelalliance.org')).toMatchObject(expected)
  expect(parseRecipient('Luke Skywalker -luke@rebelalliance.org')).toMatchObject(expected)
  expect(parseRecipient('Luke Skywalker   -    luke@rebelalliance.org')).toMatchObject(expected)
})

test('no false positive on dashed names', () => {
  expect(parseRecipient('Abra Ca-Dabra - abra@cadabra.org')).toEqual({
    firstName: 'Abra',
    lastName: 'Ca-Dabra',
    email: 'abra@cadabra.org',
    isValid: true,
    raw: 'Abra Ca-Dabra - abra@cadabra.org',
  })
})

test('first name and email only', () => {
  expect(parseRecipient('Luke luke@rebelalliance.org')).toEqual({
    firstName: 'Luke',
    lastName: '',
    email: 'luke@rebelalliance.org',
    isValid: true,
    raw: 'Luke luke@rebelalliance.org',
  })
})

test('email only', () => {
  expect(parseRecipient('luke@rebelalliance.org')).toEqual({
    firstName: '',
    lastName: '',
    email: 'luke@rebelalliance.org',
    isValid: true,
    raw: 'luke@rebelalliance.org',
  })
})

test('return invalid result if no email', () => {
  expect(parseRecipient('Luke Skywalker')).toEqual({
    isValid: false,
    raw: 'Luke Skywalker',
  })
})

test('return invalid result if invalid email', () => {
  expect(parseRecipient('Luke Skywalker luke@@rebelalliance.org')).toEqual({
    isValid: false,
    raw: 'Luke Skywalker luke@@rebelalliance.org',
  })
})
