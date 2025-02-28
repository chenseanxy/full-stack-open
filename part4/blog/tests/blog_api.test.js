const { test, after, beforeEach, before, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const mockData = require('./mock_data')
const { isUnique } = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

let authenticatedAs = null
let authenticatedToken = null

before(async () => {
    await User.deleteMany({})
    const preparedUser = await User.prepareInsert(mockData.users[0])
    authenticatedAs = await new User(preparedUser).save()
    authenticatedToken = await authenticatedAs.issueToken()
})

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(mockData.blogs)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('the correct amount of blogs is returned', async () => {
    const resp = await api.get('/api/blogs')
    assert.strictEqual(resp.body.length, mockData.blogs.length)
})

test('the unique identifier property of the blog posts is named id', async () => {
    const resp = await api.get('/api/blogs')
    const ids = resp.body.map(blog => blog.id)
    assert(ids.every(id => id !== null))
    assert(isUnique(ids))
})

describe('adding blogs', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'New Blog',
            author: 'Author Name',
            url: 'http://example.com',
            likes: 0
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${authenticatedToken}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const finalBlogs = await api.get('/api/blogs')
        assert.strictEqual(finalBlogs.body.length, mockData.blogs.length + 1)
        const matchedBlog = finalBlogs.body.find(blog => blog.title === newBlog.title)
        assert(matchedBlog)
        assert.strictEqual(matchedBlog.title, newBlog.title)
        assert.strictEqual(matchedBlog.author, newBlog.author)
        assert.strictEqual(matchedBlog.url, newBlog.url)
        assert.strictEqual(matchedBlog.likes, newBlog.likes)
    
        assert.strictEqual(matchedBlog.user.id, authenticatedAs.id)
    })

    test('if token is missing, respond with 401 Unauthorized', async () => {
        const newBlog = {
            title: 'New Blog',
            author: 'Author Name',
            url: 'http://example.com',
            likes: 0
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })

    test('if likes property is missing, it will default to 0', async () => {
        const newBlog = {
            title: 'New Blog',
            author: 'Author Name',
            url: 'http://example.com'
        }
    
        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${authenticatedToken}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const addedBlog = response.body
        assert.strictEqual(addedBlog.likes, 0)
    })
    
    test('if title property is missing, respond with 400 Bad Request', async () => {
        const newBlog = {
            author: 'Author Name',
            url: 'http://example.com'
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${authenticatedToken}`)
            .send(newBlog)
            .expect(400)
    })
    
    test('if author property is missing, respond with 400 Bad Request', async () => {
        const newBlog = {
            title: 'New Blog',
            url: 'http://example.com'
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${authenticatedToken}`)
            .send(newBlog)
            .expect(400)
    })
    
})


test('deleting a blog post', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${authenticatedToken}`)
        .send()
        .expect(204)

    const finalBlogs = await api.get('/api/blogs')
    assert.strictEqual(finalBlogs.body.length, mockData.blogs.length - 1)
    assert(!finalBlogs.body.find(blog => blog.id === blogToDelete.id))
})

test('updating a blog post', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]
    const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${authenticatedToken}`)
        .send(updatedBlog)
        .expect(200)

    const finalBlogs = await api.get('/api/blogs')
    assert.strictEqual(finalBlogs.body.length, mockData.blogs.length)
    const updated = finalBlogs.body.find(blog => blog.id === blogToUpdate.id)
    assert.strictEqual(updated.likes, updatedBlog.likes)
})

after(async () => {
    await mongoose.connection.close()
})