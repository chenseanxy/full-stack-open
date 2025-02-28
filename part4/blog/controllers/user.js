const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', '-user')
    response.json(users)
})

userRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    if (!password || password.length < 3) {
        return response.status(400).json({
            error: 'password must be at least 3 characters long',
        })
    }

    const user = new User(await User.prepareInsert({ username, name, password }))

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

module.exports = userRouter