import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import NewBlog from './components/NewBlog'
import Togglable from './components/Togglable'

import Login from './components/Login'
import blogService from './services/blogs'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [loggedInUser, _setLoggedInUser] = useState(null)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState('')
  const [_notificationTimeout, _setNotificationTimeout] = useState(null)
  const newBlogRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const savedUser = window.localStorage.getItem('loggedInUser')
    if (savedUser) {
      _setLoggedInUser(JSON.parse(savedUser))
    }
  }, [])

  const showNotification = (message, type = 'info') => {
    setNotificationMessage(message)
    setNotificationType(type)
    clearTimeout(_notificationTimeout)
    _setNotificationTimeout(setTimeout(() => {
      setNotificationMessage(null)
    }, 5000))
  }

  const setLoggedInUser = (user) => {
    if (user === null) {
      window.localStorage.removeItem('loggedInUser')
    } else {
      window.localStorage.setItem('loggedInUser', JSON.stringify(user))
    }
    _setLoggedInUser(user)
  }

  if (loggedInUser === null) {
    return (
      <div>
        <Notification message={notificationMessage} type={notificationType} />
        <Login setLoggedInUser={setLoggedInUser} showNotification={showNotification} />
      </div>
    )
  }

  const onNewBlog = async (blog) => {
    let newBlog = null
    try {
      newBlog = await blogService.create(blog, loggedInUser.token)
      showNotification(`new blog ${newBlog.title} by ${newBlog.author} added`)
    } catch (error) {
      console.error(error)
      showNotification(`Error when creating new blog: ${error.response.data.error}`, 'error')
      return
    }
    setBlogs(blogs.concat(newBlog))
    newBlogRef.current.toggleVisibility()
  }

  const onBlogChange = async (blog) => {
    const updatedBlog = { ...blog }
    if (updatedBlog.user) updatedBlog.user = updatedBlog.user.id
    const finalBlog = await blogService.update(updatedBlog)

    const newBlogs = [...blogs]
    const index = newBlogs.findIndex(b => b.id === finalBlog.id)
    newBlogs[index] = finalBlog
    setBlogs(newBlogs)
  }

  const onBlogDelete = async (blog) => {
    await blogService.remove(blog, loggedInUser.token)
    setBlogs(blogs.filter(b => b.id !== blog.id))
  }

  return (
    <div>
      <Notification message={notificationMessage} type={notificationType} />
      <Togglable buttonLabel="new blog" ref={newBlogRef}>
        <NewBlog onNewBlog={onNewBlog} />
      </Togglable>
      <h2>blogs</h2>
      <div data-testid='blogs'>
        {blogs.sort((a, b) => b.likes - a.likes).map(blog => (
          <Blog key={blog.id} blog={blog} onChange={onBlogChange} onDelete={onBlogDelete} loggedInUser={loggedInUser} />
        ))}
      </div>
      <p>
        logged in as {loggedInUser.name} ({loggedInUser.username})
        <button onClick={() => setLoggedInUser(null)}>logout</button>
      </p>
    </div>
  )
}

export default App