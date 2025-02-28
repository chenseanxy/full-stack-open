const jwt = require('jsonwebtoken')

const User = require('./models/user')

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'invalid token' })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ error: 'token expired' })
    }
    next(error)
}

const getTokenFrom = request => { 
    const authorization = request.get('authorization')  
    if (authorization && authorization.startsWith('Bearer ')) { 
        return authorization.replace('Bearer ', '') 
    } 
    return null 
}

// We didn't use a tokenExtractor, instead we went straight for user fetching
// This is used on a per-route basis for all routes that require authentication
// Therefore we stop the request if the token is missing or invalid
const authenticatedUser = (req, resp, next) => {
    const token = getTokenFrom(req)
    if (!token) {
        return resp.status(401).json({ error: 'token missing or invalid' })
    }
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
        return resp.status(401).json({ error: 'invalid token' })
    }
    User.findById(decodedToken.id)
        .then(user => {
            req.authenticated = user
            next()
        })
        .catch(error => {
            next(error)
        })
}

module.exports = {
    errorHandler,
    authenticatedUser,
}
