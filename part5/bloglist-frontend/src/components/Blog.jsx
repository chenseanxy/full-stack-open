import { useState } from 'react'
import PropTypes from 'prop-types'

import blogService from '../services/blogs'

const Blog = ({ blog, onChange, onDelete, loggedInUser }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [detailsVisible, setDetailsVisible] = useState(false)

  if (!detailsVisible) return (
    <div style={blogStyle}>
      {blog.title} {blog.author} <button onClick={() => setDetailsVisible(true)}>view</button>
    </div>
  )

  const handleLike = async () => {
    let updatedBlog = { ...blog, likes: blog.likes + 1 }
    if (updatedBlog.user) updatedBlog.user = updatedBlog.user.id
    const finalBlog = await blogService.update(updatedBlog)
    onChange(finalBlog)
  }


  const handleDelete = async () => {
    if (!window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      return
    }
    await blogService.remove(blog, loggedInUser.token)
    onDelete(blog)
  }

  const deleteButton = blog.user && loggedInUser.username === blog.user.username
    ? <button onClick={handleDelete}>remove</button>
    : null

  return (
    <div style={blogStyle}>
      {blog.title} {blog.author} <button onClick={() => setDetailsVisible(false)}>hide</button>
      <br />
      url: {blog.url} <br />
      likes: {blog.likes} <button onClick={handleLike}>like</button> <br />
      added by: {
        blog.user
          ? blog.user.username === loggedInUser.username
            ? 'You': blog.user.name
          : 'unknown'
      } <br />
      {deleteButton}
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loggedInUser: PropTypes.object.isRequired
}

export default Blog