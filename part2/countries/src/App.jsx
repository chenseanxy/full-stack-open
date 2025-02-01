import { useState, useEffect } from 'react'
import countryService from './services/countries'
import weatherService from './services/weather'

const Filter = ({ filterState, messageState }) => {
  const [filter, setFilter] = filterState
  const [message, setMessage] = messageState

  return (
    <div>
      find countries <input value={filter} onChange={setFilter} />
      <div>{message}</div>
    </div>
  )
}

const CountryList = ({ countries, setSelectedCountries }) => {
  const onClick = (country) => () => setSelectedCountries([country])

  return (
    <div>
      {countries.map(country => (
        <div key={country.cca2}>
          {country.name.common}
          <button onClick={onClick(country)}>show</button>
        </div>
      ))}
    </div>
  )
}

const OneCountryView = ({ country }) => {
  const [weather, setWeather] = useState(null)
  
  useEffect(() => {
    const [lat, lon] = country.capitalInfo.latlng
    weatherService.getCurrentWeather(lat, lon).then(resp => {
      setWeather(resp.data)
    })
  }, [])

  return (
    <div>
      <h1>{country.name.common}</h1>
      <div>capital {country.capital[0]}</div>
      <div>population {country.population}</div>
      <h2>languages</h2>
      <ul>
        {Object.keys(country.languages).map(key => (
          <li key={key}>{country.languages[key]}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt="flag" width="100" />
      <h2>Weather in {country.capital[0]}</h2>
      {weather === null ? (
        <div>loading...</div>
      ) : (
        <div>
          <div><b>temperature:</b> {weather.main.temp} Celsius</div>
          <div><img src={`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`} alt="weather" /></div>
          <div><b>wind:</b> {weather.wind.speed} m/s</div>
        </div>
      )}
    </div>
  )
}

const App = () => {
  const [filter, setFilter] = useState('')
  const [filterMessage, setFilterMessage] = useState('')
  const [allCountries, setAllCountries] = useState([])
  const [selectedCountries, setSelectedCountries] = useState([])

  useEffect(() => {
    countryService.getAll().then(resp => {
      setAllCountries(resp.data)})
  }, [])

  const onFilterChange = (event) => {
    setFilterMessage('')
    setFilter(event.target.value.toLowerCase())
    const filteredCountries = allCountries.filter(
      country => country.name.common.toLowerCase().includes(filter)
    )
    if (filteredCountries.length > 10) {
      setFilterMessage('Too many matches, specify another filter')
      return
    }
    setSelectedCountries(filteredCountries)
  }

  const filterComponent = <Filter
    filterState={[filter, onFilterChange]}
    messageState={[filterMessage, setFilterMessage]}
  />

  if (selectedCountries.length === 1) {
    const country = selectedCountries[0]
    return (
      <div>
        {filterComponent}
        <OneCountryView country={country} />
      </div>
    )
  }

  return (
    <div>
      {filterComponent}
      <CountryList
        countries={selectedCountries}
        setSelectedCountries={setSelectedCountries}
      />
    </div>
  )
}

export default App
