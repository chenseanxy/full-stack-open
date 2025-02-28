require('dotenv').config()

const PORT = process.env.PORT || 3003
const ENV = process.env.NODE_ENV || 'production'
const MONGODB_URI = ENV === 'test'
    // Reusing the 'prod' database in this particular instance
    // Because it's not really a production database
    // And a new instance in Atlas costs extra
    ? process.env.MONGODB_URI
    : process.env.MONGODB_URI

module.exports = {
    MONGODB_URI,
    PORT,
    ENV,
}
