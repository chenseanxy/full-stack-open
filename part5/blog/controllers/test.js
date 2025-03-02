const testRouter = require('express').Router()

const mockData = require('../tests/mock_data')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = mockData.blogs
const initialUsers = mockData.users
const userPromise = Promise.all(initialUsers.map(User.prepareInsert))

testRouter.post('/populate', async (req, res) => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    await Blog.insertMany(initialBlogs)
    await User.insertMany(await userPromise)
    res.status(200).send({ message: 'Database populated successfully' })
})

testRouter.post('/reset', async (req, res) => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    res.status(200).send({ message: 'Database reset successfully' })
})

testRouter.post('/withuser', async (req, res) => {
    const user = req.body
    if (!user.username || !user.name || !user.password) {
        return res.status(400).send({ error: 'username, name, and password are required' })
    }
    const userObj = await new User(await User.prepareInsert(user)).save()
    const token = userObj.issueToken()
    res.status(200).send({ message: 'Database reset with user successfully', token })
})

module.exports = testRouter