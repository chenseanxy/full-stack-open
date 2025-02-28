const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const mockData = require('./mock_data')

test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
})

describe('total likes', () => {
    const { blogs, blogsTotalLikes } = mockData
    const listWithOneBlog = [blogs[0]]
  
    test('of empty list is zero', () => {
        const result = listHelper.totalLikes([])
        assert.strictEqual(result, 0)
    })
    test('when list has only one blog, equals the likes of that', () => {
        const result = listHelper.totalLikes(listWithOneBlog)
        assert.strictEqual(result, listWithOneBlog[0].likes)
    })
    test('when list has multiple blogs, equals the sum of all likes', () => {
        const result = listHelper.totalLikes(blogs)
        assert.strictEqual(result, blogsTotalLikes)
    })
})

describe('favorite blog', () => {
    const { blogs, blogsMostLiked } = mockData
    const listWithOneBlog = [blogs[0]]

    test('of empty list is null', () => {
        const result = listHelper.favoriteBlog([])
        assert.strictEqual(result, null)
    })
    test('when list has only one blog, equals the blog', () => {
        const result = listHelper.favoriteBlog(listWithOneBlog)
        assert.deepStrictEqual(result, listWithOneBlog[0])
    })
    test('of multiple blogs returns the one with most likes', () => {
        const result = listHelper.favoriteBlog(blogs)
        assert.deepStrictEqual(result, blogsMostLiked)
    })
})

describe('most blogs', () => {
    const { blogs, blogsMostBlogsAuthor } = mockData
    const listWithOneBlog = [blogs[0]]

    test('of empty list is null', () => {
        const result = listHelper.mostBlogs([])
        assert.strictEqual(result, null)
    })
    test('when list has only one blog, equals the author of that', () => {
        const result = listHelper.mostBlogs(listWithOneBlog)
        assert.deepStrictEqual(result, { author: listWithOneBlog[0].author, blogs: 1 })
    })
    test('of multiple blogs returns the author with most blogs', () => {
        const result = listHelper.mostBlogs(blogs)
        assert.deepStrictEqual(result, blogsMostBlogsAuthor)
    })
})

describe('most likes', () => {
    const { blogs, blogsMostLikedAuthor } = mockData
    const listWithOneBlog = [blogs[0]]

    test('of empty list is null', () => {
        const result = listHelper.mostLikes([])
        assert.strictEqual(result, null)
    })
    test('when list has only one blog, equals the author of that', () => {
        const result = listHelper.mostLikes(listWithOneBlog)
        assert.deepStrictEqual(result, { author: listWithOneBlog[0].author, likes: listWithOneBlog[0].likes })
    })
    test('of multiple blogs returns the author with most likes', () => {
        const result = listHelper.mostLikes(blogs)
        assert.deepStrictEqual(result, blogsMostLikedAuthor)
    })
})
        
