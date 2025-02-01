const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

// Override default .json() method -> json_body
const respJsonMiddleware = (request, response, next) => {
    const oldJSON = response.json
    response.json = (data) => {
        // Only support sync calls
        response.json_body = data;
        return oldJSON.call(response, data);
    }
    next()
}
app.use(respJsonMiddleware)

morgan.token('res-body', function (req, res) { return JSON.stringify(res.json_body) })
const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms :res-body')
app.use(morganMiddleware)

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    const date = new Date()
    const text = (
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>`
    )
    response.send(text)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        persons = persons.filter(person => person.id !== id)
        response.status(204).end()
    } else {
        response.status(404).end()
    }
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
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    const person = {
        id: String(Math.floor(Math.random() * 1000)),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
