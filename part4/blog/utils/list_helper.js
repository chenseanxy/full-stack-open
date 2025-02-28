const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((favorite, blog) => {
        if (favorite === null) {
            return blog
        }
        if (blog.likes > favorite.likes) {
            return blog
        }
        return favorite
    }, null)
}

const mostBlogs = (blogs) => {
    const blogsByAuthor = blogs.reduce((author, blog) => {
        if (author[blog.author]) {
            author[blog.author]++
        } else {
            author[blog.author] = 1
        }
        return author
    }, {})

    return Object.keys(blogsByAuthor).reduce((most, author) => {
        if (most === null) {
            return { author, blogs: blogsByAuthor[author] }
        }
        if (blogsByAuthor[author] > most.blogs) {
            return { author, blogs: blogsByAuthor[author] }
        }
        return most
    }, null)
}

const mostLikes = (blogs) => {
    const likesByAuthor = blogs.reduce((author, blog) => {
        if (author[blog.author]) {
            author[blog.author] += blog.likes
        } else {
            author[blog.author] = blog.likes
        }
        return author
    }, {})

    return Object.keys(likesByAuthor).reduce((most, author) => {
        if (most === null) {
            return { author, likes: likesByAuthor[author] }
        }
        if (likesByAuthor[author] > most.likes) {
            return { author, likes: likesByAuthor[author] }
        }
        return most
    }, null)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}