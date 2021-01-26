import almostEqual from './almostEqual'

test('case insensitive', () => {
  expect(almostEqual('Thousand', 'thousand'))
})

test('punctuation', () => {
  expect(almostEqual('Thousand', 'Thou-sand'))
  expect(almostEqual('Thousand', 'Thou\'sand'))
  expect(almostEqual('Thousand', 'Thou_sand'))
})

test('spacing', () => {
  expect(almostEqual('A Thousand Worlds', ' A Thousand Worlds'))
  expect(almostEqual('A Thousand Worlds', 'A   Thousand    Worlds'))
  expect(almostEqual('A Thousand Worlds', 'AThousandWorlds'))
})

test('accents', () => {
  expect(almostEqual('Worlds', 'Wórlds'))
})
