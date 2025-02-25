require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())

// Override default .json() method -> json_body
const respJsonMiddleware = (request, response, next) => {
  const oldJSON = response.json
  response.json = (data) => {
    // Only support sync calls
    response.json_body = data
    return oldJSON.call(response, data)
  }
  next()
}
app.use(respJsonMiddleware)

morgan.token('res-body', function (req, res) { return JSON.stringify(res.json_body) })
const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms :res-body')
app.use(morganMiddleware)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response, next) => {
  const date = new Date()
  Person.find({}).then(persons => {
    const text = (
      `<p>Phonebook has info for ${persons.length} people</p>
            <p>${date}</p>`
    )
    response.send(text)
  }).catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({
      error: 'name is missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => {
    response.status(400).json({
      error: error.message
    })
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(
    id, person, { new: true, runValidators: true }
  ).then(updatedPerson => {
    if (updatedPerson) {
      response.json(updatedPerson)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error)) 
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
