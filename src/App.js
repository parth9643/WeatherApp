// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import TempGraph from './TempGraph';

function App() {
  // State to hold the input value
  const [city, setCity] = useState('');

  // State to hold the list of cities and their weather information
  const [citiesWeather, setCitiesWeather] = useState([]);

  // State to toggle between Celsius and Fahrenheit
  const [isCelsius, setIsCelsius] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const citiesPerPage = 3;

  const [temperatureData, setTemperatureData] = useState([]);

  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for API error



  // Function to handle input change
  const handleInputChange = (event) => {
    setCity(event.target.value);
  };

  // Function to make an API request to get weather data
  const fetchWeatherData = async (cityName) => {
    const unit = isCelsius ? 'metric' : 'imperial'; // Use 'metric' for Celsius and 'imperial' for Fahrenheit

    const options = {
      method: 'GET',
      url: 'https://weather-api99.p.rapidapi.com/weather',
      params: { city: cityName, units: unit },
      headers: {
        'X-RapidAPI-Key': '46481381d4mshd1d608ac1924b6ap1d9935jsnd47d000016c9',
        'X-RapidAPI-Host': 'weather-api99.p.rapidapi.com',
      },
    };
    setLoading(true); 

    try {
      // Make an API request to get weather data for the entered city
      const response = await axios.request(options);

      // Extract the relevant weather data from the response
      const weatherData = response.data;

      // Convert temperature to Fahrenheit if needed
      const temperature = isCelsius
        ? weatherData.main.temp
        : (weatherData.main.temp * 9) / 5 + 32;

      // Create a new city object with the weather data
      const newCityWeather = {
        city: cityName,
        temperature: temperature,
        humidity: weatherData.main.humidity,
      };

      // Update the state with the new city weather information
      setCitiesWeather((prevCitiesWeather) => [ newCityWeather,...prevCitiesWeather]);

      // Clear the input field
      setCity('');
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('An error occurred while fetching data. Please try again.'); // Set the error message
    } finally {
      setLoading(false); // Stop loading, whether successful or not
    }
  };


  // Function to handle the form submission when searching for a city's weather
  const handleSearch = (event) => {
    event.preventDefault();

    if (city.trim() !== '') {
      fetchWeatherData(city);
    }
  };


  // Function to handle the deletion of a city's weather card
  const handleDelete = (index) => {
    const updatedCitiesWeather = [...citiesWeather];
    updatedCitiesWeather.splice(index, 1);
    setCitiesWeather(updatedCitiesWeather);
  };


  // Function to toggle between Celsius and Fahrenheit
  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);

    const updatedCitiesWeather = citiesWeather.map((cityWeather) => {
      const temperature = isCelsius
        ? cityWeather.temperature
        : (cityWeather.temperature - 32) * (5 / 9); // Convert Fahrenheit to Celsius
      return { ...cityWeather, temperature };
    });

    setCitiesWeather(updatedCitiesWeather);
  };

  useEffect(() => {
    // Load weather data for initial cities when the website is opened
    fetchInitialWeatherData();
  }, [isCelsius]); // Run only on initial render


  // Function to fetch weather data for initial cities
  const fetchInitialWeatherData = () => {
    const initialCities = ['London', 'New York', 'Paris'];

    initialCities.forEach(async (cityName) => {
      await fetchWeatherData(cityName);
    });
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

const startIndex = (currentPage - 1) * citiesPerPage;
const endIndex = startIndex + citiesPerPage;

const displayedCities = citiesWeather.slice(startIndex, endIndex);
  

return (

  <div className="App">
    <h1>Weather Dashboard</h1>
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={handleInputChange}
      />
      <button type="submit">Search</button>
    </form>
    {loading ? ( // Show loading spinner while fetching data
    <div className="loading-spinner">Loading...</div>
  ) : error ? ( // Display error message if there's an error
    <div className="error-message">{error}</div>
  ) : (
    <div className="city-cards">
      {displayedCities.map((cityWeather, index) => ( 
        <div className="city-card" key={index}>
          <button onClick={() => handleDelete(index + startIndex)} className="delete-button">
            Delete
          </button>
          <h2>{cityWeather.city}</h2>
          <p>
            Temperature: {cityWeather.temperature.toFixed(2)}°{isCelsius ? 'C' : 'F'}
          </p>
          <p>Humidity: {cityWeather.humidity}%</p>
        </div>
      ))}
    </div>
  )}

    <TempGraph temperatureData={temperatureData} />

    <div className="pagination">
    <div>
    <button onClick={toggleTemperatureUnit}>
      Unit Change({isCelsius ? 'Celsius' : 'Fahrenheit'})
    </button>
  </div>
      <button onClick={handlePrevPage} disabled={currentPage === 1}>
        Previous Page
      </button>
      <button onClick={handleNextPage} disabled={endIndex >= citiesWeather.length}>
        Next Page
      </button>
    </div>
  </div>
);
}

export default App;
