import { render, screen } from '@testing-library/react'
import { CreateBlog } from './CreateBlog'
import userEvent from '@testing-library/user-event'

test('<CreateBlog /> updates parent state and calls onSubmit', async () => {
  const handleCreate = vi.fn()
  const user = userEvent.setup()

  const { container } = render(<CreateBlog handleCreate={handleCreate} />)

  const inputTitle = container.querySelector('input[name="title"]')
  const inputAuthor = container.querySelector('input[name="author"]')
  const inputURL = container.querySelector('input[name="url"]')
  const createButton = container.querySelector('button[type="submit"]')

  await user.type(inputTitle, 'La odisea')
  await user.type(inputAuthor, 'Diiego chiri')
  await user.type(inputURL, 'www.google.com')
  await user.click(createButton)

  expect(handleCreate.mock.calls).toHaveLength(1)
  expect(handleCreate.mock.calls[0][0].title).toBe('La odisea')
})