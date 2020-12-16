import get from './get'

test('using "." delimeter', () => {
  const o = { a: { b: 1 } }
  expect(get(o, 'a.b'))
    .toBe(1)
})

test('using "/" delimeter', () => {
  const o = { a: { b: 1 } }
  expect(get(o, 'a/b'))
    .toBe(1)
})
