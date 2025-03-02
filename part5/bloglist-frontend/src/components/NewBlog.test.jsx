import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import NewBlog from './NewBlog'

const defaultOnNewBlog = () => {}

test('new blog form calls onNewBlog with correct data', async () => {
  const onNewBlog = vi.fn()
  const user = userEvent.setup()

  render(<NewBlog onNewBlog={onNewBlog} />)

  const title = 'Test Title'
  const author = 'Test Author'
  const url = 'http://test.url'

  const titleInput = screen.getByTestId('title-input')
  const authorInput = screen.getByTestId('author-input')
  const urlInput = screen.getByTestId('url-input')

  await user.type(titleInput, title)
  await user.type(authorInput, author)
  await user.type(urlInput, url)

  const createButton = screen.getByText('create')
  await user.click(createButton)

  expect(onNewBlog).toHaveBeenCalledWith({ title, author, url })
})