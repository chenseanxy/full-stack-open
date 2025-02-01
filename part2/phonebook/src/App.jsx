import { useState, useEffect } from 'react'
import personService from './services/persons'

const Notification = ({ message }) => {
  const style_ = {
    background: 'lightgrey',
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
  }
  if (message === null) {
    return null
  }
  return (
    <div style={style_}>
      {message}
    </div>
  )
}

const Filter = ({ value, onChange }) => (
  <div>
    filter shown with <input value={value} onChange={onChange} />
  </div>
)

const PersonForm = ({ onSubmit, newNameState, newNumberState }) => {
  const [ newName, setNewName ] = newNameState
  const [ newNumber, setNewNumber ] = newNumberState
  return (
    <form onSubmit={onSubmit}>
      <div>
        <div>
          name: <input value={newName} onChange={setNewName}/>
        </div>
        <div>
          number: <input value={newNumber} onChange={setNewNumber}/>
        </div>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, onDelete, filter }) => {
  const filtered = () => persons.filter(
    person => person.name.toLowerCase().includes(filter)
  )

  const onDeleteClick = (id) => () => onDelete(id)

  return (
    <div>
      {filtered().map(
        person => (
          <div key={person.id}>
            {person.name} : {person.number}
            <button onClick={onDeleteClick(person.id)}>delete</button>
          </div>
        )
      )}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, _setNotification] = useState(null)
  const [notificationTimer, setNotificationTimer] = useState(null)

  const onNewNameChange = (e) => setNewName(e.target.value)
  const onNewNumberChange = (e) => setNewNumber(e.target.value)
  const onFilterChange = (e) => setFilter(e.target.value.toLowerCase())

  const reSync = () => {
    personService
      .getAll()
      .then(resp => setPersons(resp.data))
  }

  useEffect(reSync, [])

  const displayNotification = (message) => {
    clearTimeout(notificationTimer)
    _setNotification(message)
    setNotificationTimer(
      setTimeout(() => _setNotification(null), 5000)
    )
  }

  function onSubmit(e) {
    e.preventDefault()
    const person = { name: newName, number: newNumber }
    const prev = persons.find(p => p.name === newName)
    if (prev) {
      if(window.confirm(
        `${prev.name} is already in the phonebook, ` +
        `replace old number (${prev.number}) with new one?`
      )) {
        personService
          .update(prev.id, person)
          .then(
            (resp) => {
              const newPersons = [...persons]
              newPersons[newPersons.indexOf(prev)] = resp.data
              setPersons(newPersons)
            }
          ).then(
            () => displayNotification(`Updated ${person.name}`)
          )
      }
    } else {
      personService
        .create(person)
        .then(
          resp => setPersons(persons.concat(resp.data))
        ).then(
          () => displayNotification(`Added ${person.name}`)
        )
    }
    setNewName('')
    setNewNumber('')
  }

  const onDelete = (id) => {
    const person = persons.find(person => person.id === id)
    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .delete(id)
        .then(() => setPersons(persons.filter(person => person.id !== id)))
        .then(() => displayNotification(`Removed ${person.name}`))
        .catch(
          error => {
            console.log(`Error when removing ${person.name}`, error)
            displayNotification(
              `Error when removing ${person.name}: `+
              `${error.response.data}`
            )
            reSync()
          }
        )
    }
  }

  return (
    <div>
      <Notification message={notification}/>
      <h2>Phonebook</h2>
      <Filter value={filter} onChange={onFilterChange}/>
      <h2>Add new</h2>
      <PersonForm 
        onSubmit={onSubmit}
        newNameState={[newName, onNewNameChange]}
        newNumberState={[newNumber, onNewNumberChange]}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} filter={filter} onDelete={onDelete}/>
    </div>
  )
}

export default App