import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

 
  const setBackground = (weatherType) => {
    const body = document.querySelector("body");

    switch (weatherType) {
      case "Clear":
        body.style.backgroundImage = "url('/images/clear-sky.jpg')";
        break;
      case "Rain":
        body.style.backgroundImage = "url('/images/Rain.jpg')";
        break;
      case "Clouds":
        body.style.backgroundImage = "url('/images/cloudy.jpg')";
        break;
      case "Snow":
        body.style.backgroundImage = "url('/images/snow.jpg')";
        break;
      case "Thunderstorm":
        body.style.backgroundImage = "url('/images/thunderstorm.jpg')";
        break;
      case "Drizzle":
        body.style.backgroundImage = "url('/images/drizzle.jpg')";
        break;
      default:
        body.style.backgroundImage = "url('/images/default.jpg')";
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
        setBackground(weatherType);

        
        const forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        const forecastData = forecastRes.data.list;
        
        
        const groupedForecast = forecastData.reduce((acc, curr) => {
          const date = curr.dt_txt.split(' ')[0]; 
          if (!acc[date]) {
            acc[date] = {
              tempSum: 0,
              count: 0,
              weather: curr.weather[0].description,
              icon: curr.weather[0].icon
            };
          }
          acc[date].tempSum += curr.main.temp;
          acc[date].count += 1;
          return acc;
        }, {});

       
        const forecastArray = Object.keys(groupedForecast).map((date) => {
          const day = groupedForecast[date];
          return {
            date,
            tempAvg: (day.tempSum / day.count).toFixed(1), 
            description: day.weather,
            icon: day.icon
          };
        });

        setForecast(forecastArray); 

      }, (error) => {
        setError('No se pudo obtener la ubicación');
      });
    } else {
      setError('Geolocalización no disponible');
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
        setBackground(weatherType);

       
        const forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );

        const forecastData = forecastRes.data.list;
        
       
        const groupedForecast = forecastData.reduce((acc, curr) => {
          const date = curr.dt_txt.split(' ')[0]; 
          if (!acc[date]) {
            acc[date] = {
              tempSum: 0,
              count: 0,
              weather: curr.weather[0].description,
              icon: curr.weather[0].icon
            };
          }
          acc[date].tempSum += curr.main.temp;
          acc[date].count += 1;
          return acc;
        }, {});

      
        const forecastArray = Object.keys(groupedForecast).map((date) => {
          const day = groupedForecast[date];
          return {
            date,
            tempAvg: (day.tempSum / day.count).toFixed(1), 
            description: day.weather,
            icon: day.icon
          };
        });

        setForecast(forecastArray);
      } catch (err) {
        setWeather(null);
        setForecast(null);
        setError('Ciudad no encontrada o error en la API');
      }
    } else {
      
      getLocation();
    }
  };

  return (
    <div className="app">
      <h1>App del Clima</h1>
      <input
        type="text"
        value={city}
        placeholder="Escribe una ciudad..."
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={fetchWeather}>Buscar</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {weather && (
        <div className="weather-box">
          <h2>{weather.name}</h2>
          <p>{weather.weather[0].main}</p>
          <p>Temperatura: {weather.main.temp}°C</p>
          <p>Humedad: {weather.main.humidity}%</p>
          <p>Viento: {weather.wind.speed} m/s</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="icono clima"
          />
        </div>
      )}

      {forecast && (
        <div className="forecast">
          <h3>Pronóstico de los próximos 5 días:</h3>
          <div className="forecast-list">
            {forecast.map((forecastItem, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(forecastItem.date).toLocaleDateString()}</p>
                <p>{forecastItem.tempAvg}°C</p>
                <p>{forecastItem.description}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${forecastItem.icon}@2x.png`}
                  alt="icono clima"
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
