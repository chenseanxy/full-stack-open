require('dotenv').config()

const mongoose = require('mongoose')

// We're passing everything through .env instead
// Stdin for password can be a security risk
const MONGO_ENDPOINT = process.env.MONGO_ENDPOINT
if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}
// const password = process.argv[2]

mongoose.set('strictQuery', false)
mongoose.connect(MONGO_ENDPOINT)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

function printEntries() {
  return Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(entry => {
      console.log(`${entry.name} ${entry.number}`)
    })
  }).finally(() => {
    mongoose.connection.close()
  })
}

function addEntry(name, number) {
  const newEntry = new Person({
    name: name,
    number: number,
  })
  return newEntry.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    return result
  }).finally(result => {
    mongoose.connection.close()
    return result
  })
}

if (process.argv.length === 3) {
  printEntries()
} else if (process.argv.length === 5) {
  addEntry(process.argv[3], process.argv[4])
} else {
  console.log('invalid number of arguments')
  process.exit(1)
}
