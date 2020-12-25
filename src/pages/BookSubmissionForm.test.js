import BookSubmissionForm from '@/pages/BookSubmissionForm.vue'
import { render } from '@/test-helpers'
import { fireEvent } from '@testing-library/vue'
import '@testing-library/jest-dom'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test('show loader after typing in title and author', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Author(s)'), 'Matthew Burgess')
  expect(await component.findByRole('loading', {}, { timeout: 1000 }))
})

test('show loader after typing in title and illustrator', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  expect(await component.findByRole('loading', {}, { timeout: 1000 }))
})

test('search for isbn after typing in title and author', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Author(s)'), 'Matthew Burgess')
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
})

test('search for isbn after typing in title and illustrator', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
})

test('do not search for isbn after typing in author and illustrator', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Author(s)'), 'Matthew Burgess')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  await delay(1000) // wait for input debounce
  expect(component.queryByRole('loading')).toBe(null)
})

test('do not search for isbn after typing in only title', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await delay(1000) // wait for input debounce
  expect(component.queryByRole('loading')).toBe(null)
})

test('do not search for isbn after typing in only author', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await delay(1000) // wait for input debounce
  expect(component.queryByRole('loading')).toBe(null)
})

test('do not search for isbn after typing in only illustrator', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await delay(1000) // wait for input debounce
  expect(component.queryByRole('loading')).toBe(null)
})

test('show the thumbnail after it has loaded', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'bear')
  await fireEvent.update(component.getByLabelText('Author(s)'), 'm')
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
  expect(component.getByAltText('thumbnail'))
    .not.toHaveStyle({ visibility: 'hidden' })
})

test('thank the user if they confirm it is their book', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
  await fireEvent.click(component.getByText('Yes'))
  expect(component.getByText('Great - Thanks!'))
})

test('ask for the isbn if the book is not theirs', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
  await fireEvent.click(component.getByText('No'))
  expect(component.getByText('Okay, please enter the ISBN:'))
})

test('hide the thumbnail if the book is not theirs', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
  await fireEvent.click(component.getByText('No'))
  expect(component.getByAltText('thumbnail'))
    .toHaveStyle({ visibility: 'hidden' })
})

test('re-show the thumbnail if they hit cancel after saying that the book is not theirs', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
  await fireEvent.click(component.getByText('No'))
  await fireEvent.click(component.getByText('Cancel'))
  expect(component.getByAltText('thumbnail'))
    .not.toHaveStyle({ visibility: 'hidden' })
})

test('remove suggestion if they clear the title', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
  await fireEvent.update(component.getByLabelText('Title'), '')
  await delay(1000) // wait for input debounce
  expect(component.queryByRole('loading')).toBe(null)
  expect(component.queryByAltText('thumbnail')).toBe(null)
  expect(component.queryByText('Is this your book?')).toBe(null)
})

test('search for thumbnail after typing in ISBN', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Title'), 'bear')
  await fireEvent.update(component.getByLabelText('Author(s)'), 'm')
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
  await fireEvent.click(component.getByText('No'))
  await fireEvent.update(component.getByLabelText('Okay, please enter the ISBN:'), '1452171912')
  await fireEvent.click(component.getByText('Search'))
  expect(component.queryByText('Okay, please enter the ISBN:')).toBe(null)
  expect(await component.findByRole('loading', {}, { timeout: 1000 }))
  expect(await component.findByText('Is this your book?', {}, { timeout: 5000 }))
  expect(component.getByAltText('thumbnail'))
    .not.toHaveStyle({ visibility: 'hidden' })
})
