import { useState, useEffect } from 'react'
import loginService from '../services/login'

const Login = ({ setLoggedInUser, showNotification }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const onLogin = async (event) => {
    event.preventDefault()
    let user = null
    try {
      user = await loginService.login({ username, password })
    } catch (error) {
      showNotification(`Error when logging in: ${error.response.data.error}`, 'error')
    }
    setLoggedInUser(user)
    setUsername('')
    setPassword('')
  }
  return (
    <div>
      <h2>log in to application</h2>
      <form onSubmit={onLogin}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default Login
