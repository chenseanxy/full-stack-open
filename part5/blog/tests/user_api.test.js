const { test, after, beforeEach, describe, before } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const mockData = require('./mock_data')

const api = supertest(app)

let preparedUsers = null

before(async () => {
    preparedUsers = await Promise.all(mockData.users.map(user => User.prepareInsert(user)))
})

beforeEach(async () => {
    await User.deleteMany({})
    await User.insertMany(preparedUsers)
})

test('users are returned as json', async () => {
    await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('the correct amount of users is returned', async () => {
    const resp = await api.get('/api/users')
    assert.strictEqual(resp.body.length, mockData.users.length)
})

test('password hashes are not returned', async () => {
    const resp = await api.get('/api/users')
    assert(resp.body.every(user => !user.passwordHash))
})

test('a valid user can be added', async () => {
    const newUser = {
        username: 'newuser',
        name: 'New User',
        password: 'password'
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const finalUsers = await api.get('/api/users')
    assert.strictEqual(finalUsers.body.length, mockData.users.length + 1)
    const matchedUser = finalUsers.body.find(user => user.username === newUser.username)
    assert(matchedUser)
    assert.strictEqual(matchedUser.username, newUser.username)
    assert.strictEqual(matchedUser.name, newUser.name)
})

describe('invalid users', () => {
    function expectInvalidUser(newUser) {
        return api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    }

    test('if password is missing, it will return 400', async () => {
        await expectInvalidUser({
            username: 'newuser',
            name: 'New User',
        })
    })

    test('if password is less than 3 characters, it will return 400', async () => {
        await expectInvalidUser({
            username: 'newuser',
            name: 'New User',
            password: '12'
        })
    })

    test('if username is missing, it will return 400', async () => {
        await expectInvalidUser({
            name: 'New User',
            password: 'password'
        })
    })

    test('if username is less than 3 characters, it will return 400', async () => {
        await expectInvalidUser({
            username: 'ne',
            name: 'New User',
            password: 'password'
        })
    })
})

after(() => {
    mongoose.connection.close()
})
