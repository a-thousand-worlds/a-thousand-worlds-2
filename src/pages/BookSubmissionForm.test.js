import BookSubmissionForm from '@/pages/BookSubmissionForm.vue'
import { render } from '@/test-helpers'
import { fireEvent } from '@testing-library/vue'
import { within } from '@testing-library/dom'
import '@testing-library/jest-dom'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test('show loader after typing in title and author', async () => {
  const component = render(BookSubmissionForm)
  const titleInput = within(component.getByLabelText('Title')).getByRole('input')
  await fireEvent.update(titleInput, 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Author(s)'), 'Matthew Burgess')
  await component.findByRole('loading', {}, { timeout: 1000 })
})

test('show loader after typing in title and illustrator', async () => {
  const component = render(BookSubmissionForm)
  const titleInput = within(component.getByLabelText('Title')).getByRole('input')
  await fireEvent.update(titleInput, 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  await component.findByRole('loading', {}, { timeout: 1000 })
})

test('search for isbn after typing in title and author', async () => {
  const component = render(BookSubmissionForm)
  const titleInput = within(component.getByLabelText('Title')).getByRole('input')
  await fireEvent.update(titleInput, 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Author(s)'), 'Matthew Burgess')
  await component.findByText('Is this your book?', {}, { timeout: 5000 })
})

test('search for isbn after typing in title and illustrator', async () => {
  const component = render(BookSubmissionForm)
  const titleInput = within(component.getByLabelText('Title')).getByRole('input')
  await fireEvent.update(titleInput, 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Author(s)'), 'Catia Chien')
  await component.findByText('Is this your book?', {}, { timeout: 5000 })
})

test('do not search for isbn after typing in author and illustrator', async () => {
  const component = render(BookSubmissionForm)
  await fireEvent.update(component.getByLabelText('Author(s)'), 'Matthew Burgess')
  await fireEvent.update(component.getByLabelText('Illustrator(s)'), 'Catia Chien')
  await delay(1000) // wait for input debounce
  expect(component.queryByRole('loading'))
    .toBe(null)
})

test('do not search for isbn after typing in only title', async () => {
  const component = render(BookSubmissionForm)
  const titleInput = within(component.getByLabelText('Title')).getByRole('input')
  await fireEvent.update(titleInput, 'The Bear and the Moon')
  await delay(1000) // wait for input debounce
  expect(component.queryByRole('loading'))
    .toBe(null)
})

test('do not search for isbn after typing in only author', async () => {
  const component = render(BookSubmissionForm)
  const titleInput = within(component.getByLabelText('Title')).getByRole('input')
  await fireEvent.update(titleInput, 'The Bear and the Moon')
  await delay(1000) // wait for input debounce
  expect(component.queryByRole('loading'))
    .toBe(null)
})

test('do not search for isbn after typing in only illustrator', async () => {
  const component = render(BookSubmissionForm)
  const titleInput = within(component.getByLabelText('Title')).getByRole('input')
  await fireEvent.update(titleInput, 'The Bear and the Moon')
  await delay(1000) // wait for input debounce
  expect(component.queryByRole('loading'))
    .toBe(null)
})

test('thank the user if they confirm it is their book', async () => {
  const component = render(BookSubmissionForm)
  const titleInput = within(component.getByLabelText('Title')).getByRole('input')
  await fireEvent.update(titleInput, 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Author(s)'), 'Catia Chien')
  await component.findByText('Is this your book?', {}, { timeout: 5000 })
  await fireEvent.click(component.getByText('Yes'))
  component.getByText('Great - Thanks!')
})

test('ask for the isbn if the user says the book is not theirs', async () => {
  const component = render(BookSubmissionForm)
  const titleInput = within(component.getByLabelText('Title')).getByRole('input')
  await fireEvent.update(titleInput, 'The Bear and the Moon')
  await fireEvent.update(component.getByLabelText('Author(s)'), 'Catia Chien')
  await component.findByText('Is this your book?', {}, { timeout: 5000 })
  await fireEvent.click(component.getByText('No'))
  component.getByText('Okay, please enter the ISBN:')
})
