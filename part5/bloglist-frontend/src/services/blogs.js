import axios from 'axios'
const baseUrl = '/api/blogs'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = async (blog, token) => {
  const response = await axios.post(baseUrl, blog, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}

const update = async (blog) => {
  const response = await axios.put(`${baseUrl}/${blog.id}`, blog)
  return response.data
}

const remove = async (blog, token) => {
  await axios.delete(`${baseUrl}/${blog.id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export default { getAll, create, update, remove }