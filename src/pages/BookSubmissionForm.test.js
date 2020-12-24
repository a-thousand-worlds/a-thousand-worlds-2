import BookSubmissionForm from '@/pages/BookSubmissionForm.vue'
import { render } from '@/test-helpers'

test('title input', async () => {
  const { getByLabelText } = render(BookSubmissionForm)
  getByLabelText('Title')
})
