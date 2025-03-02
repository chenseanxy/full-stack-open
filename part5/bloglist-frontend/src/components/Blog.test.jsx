import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

const defaultBlog = {
  title: 'Component testing is done with react-testing-library',
  author: 'Test Author',
  url: 'http://url.to.blog',
  likes: 0,
}

const defaultOnChange = () => {}
const defaultOnDelete = () => {}
const defaultLoggedInUser = {}

test('renders brief info by default', async () => {
  const blog = defaultBlog

  render(
    <Blog
      blog={blog}
      onChange={defaultOnChange}
      onDelete={defaultOnDelete}
      loggedInUser={defaultLoggedInUser} />
  )

  expect(screen.getByText(blog.title, {"exact": false})).toBeInTheDocument()
  expect(screen.getByText(blog.author, {"exact": false})).toBeInTheDocument()

  expect(screen.queryByText(blog.url)).not.toBeInTheDocument()
  expect(screen.queryByText(`likes: ${blog.likes}`)).not.toBeInTheDocument()
})

test('renders full info when view button is clicked', async () => {
  const blog = defaultBlog
  const user = userEvent.setup()

  render(
    <Blog
      blog={blog}
      onChange={defaultOnChange}
      onDelete={defaultOnDelete}
      loggedInUser={defaultLoggedInUser} />
  )

  const viewButton = screen.getByText('view')
  await user.click(viewButton)

  expect(screen.getByText(blog.url, {"exact": false})).toBeInTheDocument()
  expect(screen.getByText(`likes: ${blog.likes}`, {"exact": false})).toBeInTheDocument()
})

test('like button is clicked twice', async () => {
  const blog = defaultBlog
  const user = userEvent.setup()
  const onChange = vi.fn()

  render(
    <Blog
      blog={blog}
      onChange={onChange}
      onDelete={defaultOnDelete}
      loggedInUser={defaultLoggedInUser} />
  )

  const viewButton = screen.getByText('view')
  await user.click(viewButton)

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(onChange).toHaveBeenCalledTimes(2)
})