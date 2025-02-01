import axios from 'axios'

const baseUrl = 'https://api.openweathermap.org/data'
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

const getCurrentWeather = (lat, lon) => {
    return axios.get(
        `${baseUrl}/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    )
}

export default { getCurrentWeather }
