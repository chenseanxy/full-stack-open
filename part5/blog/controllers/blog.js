const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')
const { authenticatedUser } = require('../middlewares')
const blogRouter = require('express').Router()

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', '-blogs')
    response.json(blogs)
})

blogRouter.post('/', authenticatedUser, async (request, response) => {
    const user = request.authenticated
    const blog = new Blog({...request.body, user: user._id})

    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()
    response.status(201).json(result)
})

blogRouter.delete('/:id', authenticatedUser, async (request, response) => {
    const user = request.authenticated
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
        return response.status(404).json({ error: 'Blog not found' })
    }
    if (blog.user.toString() !== user._id.toString()) {
        return response.status(401).json({ error: 'unauthorized' })
    }
    await blog.deleteOne()
    response.status(204).end()
})

blogRouter.put('/:id', async (request, response, next) => {
    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id, request.body, { new: true, runValidators: true })
    if (!updatedBlog) {
        return response.status(404).json({ error: 'Blog not found' })
    }
    response.json(updatedBlog)
})

module.exports = blogRouter
