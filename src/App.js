// App.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  const setBackground = (weatherType, weatherDescription, iconCode) => {
    const body = document.querySelector("body");
    const isNight = iconCode.includes("n");

    if (weatherType === "Clouds" && weatherDescription === "few clouds") {
      body.style.backgroundImage = isNight
        ? "url('/images/fewclouds-night.jpg')"
        : "url('/images/fewclouds.jpg')";
    } else {
      switch (weatherType) {
        case "Clear":
          body.style.backgroundImage = isNight
            ? "url('/images/clear-sky-night.jpg')"
            : "url('/images/clear-sky.jpg')";
          break;
        case "Rain":
          body.style.backgroundImage = isNight
            ? "url('/images/rain-night.jpg')"
            : "url('/images/rain.jpg')";
          break;
        case "Clouds":
          body.style.backgroundImage = isNight
            ? "url('/images/cloudy-night.jpg')"
            : "url('/images/cloudy.jpg')";
          break;
        case "Snow":
          body.style.backgroundImage = isNight
            ? "url('/images/snow-night.jpg')"
            : "url('/images/snow.jpg')";
          break;
        case "Thunderstorm":
          body.style.backgroundImage = isNight
            ? "url('/images/thunderstorm-night.jpg')"
            : "url('/images/thunderstorm.jpg')";
          break;
        case "Drizzle":
          body.style.backgroundImage = isNight
            ? "url('/images/drizzle-night.jpg')"
            : "url('/images/drizzle.jpg')";
          break;
        default:
          body.style.backgroundImage = "url('/images/default.jpg')";
      }
    }

    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center center";
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        setWeather(weatherRes.data);

        const weatherType = weatherRes.data.weather[0].main;
        const weatherDescription = weatherRes.data.weather[0].description;
        const iconCode = weatherRes.data.weather[0].icon;
        setBackground(weatherType, weatherDescription, iconCode);

        const forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        const forecastData = forecastRes.data.list;

        // Agrupar pronóstico por fecha y calcular las temperaturas máxima y mínima para cada día
        const groupedForecast = forecastData.reduce((acc, curr) => {
          const date = curr.dt_txt.split(' ')[0]; // Obtener solo la fecha

          if (!acc[date]) {
            acc[date] = {
              tempMax: curr.main.temp,
              tempMin: curr.main.temp,
              weather: curr.weather[0].description,
              icon: curr.weather[0].icon
            };
          } else {
            // Actualizar la temperatura máxima y mínima
            if (curr.main.temp > acc[date].tempMax) {
              acc[date].tempMax = curr.main.temp;
            }
            if (curr.main.temp < acc[date].tempMin) {
              acc[date].tempMin = curr.main.temp;
            }
          }
          return acc;
        }, {});

        // Crear un array con los datos del pronóstico
        const forecastArray = Object.keys(groupedForecast).map((date) => {
          const day = groupedForecast[date];
          return {
            date,
            tempMax: day.tempMax.toFixed(1), // Mostrar la temperatura máxima
            tempMin: day.tempMin.toFixed(1), // Mostrar la temperatura mínima
            description: day.weather,
            icon: day.icon
          };
        });

        setForecast(forecastArray);

      }, () => {
        setError('Could not get location');
      });
    } else {
      setError('Geolocation not available');
    }
  };

  const fetchWeather = async () => {
    if (city) {
      try {
        setError('');
        const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        setWeather(weatherRes.data);

        const weatherType = weatherRes.data.weather[0].main;
        const weatherDescription = weatherRes.data.weather[0].description;
        const iconCode = weatherRes.data.weather[0].icon;
        setBackground(weatherType, weatherDescription, iconCode);

        const forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );

        const forecastData = forecastRes.data.list;

        // Agrupar pronóstico por fecha y calcular las temperaturas máxima y mínima para cada día
        const groupedForecast = forecastData.reduce((acc, curr) => {
          const date = curr.dt_txt.split(' ')[0]; // Obtener solo la fecha

          if (!acc[date]) {
            acc[date] = {
              tempMax: curr.main.temp,
              tempMin: curr.main.temp,
              weather: curr.weather[0].description,
              icon: curr.weather[0].icon
            };
          } else {
            // Actualizar la temperatura máxima y mínima
            if (curr.main.temp > acc[date].tempMax) {
              acc[date].tempMax = curr.main.temp;
            }
            if (curr.main.temp < acc[date].tempMin) {
              acc[date].tempMin = curr.main.temp;
            }
          }
          return acc;
        }, {});

        // Crear un array con los datos del pronóstico
        const forecastArray = Object.keys(groupedForecast).map((date) => {
          const day = groupedForecast[date];
          return {
            date,
            tempMax: day.tempMax.toFixed(1), // Mostrar la temperatura máxima
            tempMin: day.tempMin.toFixed(1), // Mostrar la temperatura mínima
            description: day.weather,
            icon: day.icon
          };
        });

        setForecast(forecastArray);
      } catch (err) {
        setWeather(null);
        setForecast(null);
        setError('City not found or API error');
      }
    } else {
      getLocation();
    }
  };

  return (
    <div className="app">
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        placeholder="City..."
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={fetchWeather}>Search</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {weather && (
        <div className="weather-box">
          <h2>{weather.name}</h2>
          <p>{weather.weather[0].main}</p>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind: {weather.wind.speed} m/s</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="weather icon"
          />
        </div>
      )}

      {forecast && (
        <div className="forecast">
          <h3>5-day forecast:</h3>
          <div className="forecast-list">
            {forecast.map((forecastItem, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(forecastItem.date).toLocaleDateString()}</p>
                <p>Max: {forecastItem.tempMax}°C</p> 
                <p>Min: {forecastItem.tempMin}°C</p> 
                <p>{forecastItem.description}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${forecastItem.icon}@2x.png`}
                  alt="weather icon"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
