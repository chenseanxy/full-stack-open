import { useState } from 'react'
import blogService from '../services/blogs'

const NewBlog = ({ loggedInUser, appendBlog, showNotification }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const onNewBlog = async (event) => {
    event.preventDefault()
    let newBlog = null
    try {
      newBlog = await blogService.create({ title, author, url }, loggedInUser.token)
    } catch (error) {
      showNotification(`Error when creating new blog: ${error.response.data.error}`, 'error')
    }
    appendBlog(newBlog)
    showNotification(`new blog ${newBlog.title} by ${newBlog.author} added`)
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={onNewBlog}>
        <div>
          title:
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author:
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          url:
          <input
            value={url}
            onChange={({ target }) => setUrl(target.value)}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}
export default NewBlog