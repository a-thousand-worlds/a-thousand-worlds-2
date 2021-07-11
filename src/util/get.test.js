import { get } from './get-set'

test('using "." delimeter', () => {
  const o = { a: { b: 1 } }
  expect(get(o, 'a.b')).toBe(1)
})

test('using "/" delimeter', () => {
  const o = { a: { b: 1 } }
  expect(get(o, 'a/b')).toBe(1)
})

test('support lone "/"', () => {
  const o = { a: { b: 1 } }
  expect(get(o, '/')).toBe(o)
})
