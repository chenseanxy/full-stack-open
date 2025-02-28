const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        minlength: 3,
    },
    name: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
        }
    ],
}, {
    statics: {
        async hashPassword(password) {
            const saltRounds = 10
            return await bcrypt.hash(password, saltRounds)
        },
        async prepareInsert({ username, name, password }) {
            const passwordHash = await this.hashPassword(password)
            return {
                username,
                name,
                passwordHash,
            }
        }
    },
    methods: {
        async validatePassword(password) {
            return await bcrypt.compare(password, this.passwordHash)
        },
        issueToken() {
            const tokenContent = {
                username: this.username,
                id: this._id,
            }
            return jwt.sign(tokenContent, process.env.SECRET)
        }
    }
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // the passwordHash should not be revealed
        delete returnedObject.passwordHash
    }
})


const User = mongoose.model('User', userSchema)


module.exports = User
