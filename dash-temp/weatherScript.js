document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });

    // Initialize map
    const map = L.map('map').setView([51.505, -0.09], 5); // Default view

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Layer groups for different weather data
    const precipitationLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=0a3ca98b38e84a407ded4d891b605c50`);
    const cloudsLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=0a3ca98b38e84a407ded4d891b605c50`);
    const pressureLayer = L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=0a3ca98b38e84a407ded4d891b605c50`);
    const tempLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=0a3ca98b38e84a407ded4d891b605c50`);
    const windLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=0a3ca98b38e84a407ded4d891b605c50`);

    // Add layers to map with control toggle
    L.control.layers(null, {
        'Precipitation': precipitationLayer,
        'Clouds': cloudsLayer,
        'Pressure': pressureLayer,
        'Temperature': tempLayer,
        'Wind': windLayer
    }).addTo(map);

    function updateWeatherDetails(city, weatherData) {
        document.getElementById('cityName').textContent = city;
        document.getElementById('temperature').textContent = `Temperature: ${weatherData.main.temp} C`;
        document.getElementById('feelsLike').textContent = `Feels Like: ${weatherData.main.feels_like} C`;
        document.getElementById('description').textContent = `Weather Description: ${weatherData.weather[0].description}`;
        document.getElementById('highTemperature').textContent = `High Temperature: ${weatherData.main.temp_max} C`;
        document.getElementById('lowTemperature').textContent = `Low Temperature: ${weatherData.main.temp_min} C`;

        // Update wind speed to km/h
        const windSpeedKmh = (weatherData.wind.speed * 3.6).toFixed(2); // Convert from m/s to km/h
        document.getElementById('windSpeed').querySelector('p').textContent = `${windSpeedKmh} km/h`;

        // Update sunrise and sunset with icons
        const sunriseTime = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString();
        const sunsetTime = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString();
        document.getElementById('sunrise').querySelector('p').textContent = sunriseTime;
        document.getElementById('sunset').querySelector('p').textContent = sunsetTime;

        // Update humidity indicator
        const humidity = weatherData.main.humidity;
        let humidityIndicator = 'Normal';
        if (humidity > 70) {
            humidityIndicator = 'High';
        } else if (humidity < 30) {
            humidityIndicator = 'Low';
        }
        document.getElementById('humidity').querySelector('p').textContent = `${humidity}% (${humidityIndicator})`;

        // Update visibility indicator
        const visibilityKm = (weatherData.visibility / 1000).toFixed(2); // Convert from meters to km
        let visibilityIndicator = 'Normal';
        if (visibilityKm > 10) {
            visibilityIndicator = 'High';
        } else if (visibilityKm < 1) {
            visibilityIndicator = 'Low';
        }
        document.getElementById('visibility').querySelector('p').textContent = `${visibilityKm} km (${visibilityIndicator})`;

        // Update pressure indicator
        const pressure = weatherData.main.pressure;
        let pressureIndicator = 'Normal';
        if (pressure > 1015) {
            pressureIndicator = 'High';
        } else if (pressure < 1000) {
            pressureIndicator = 'Low';
        }
        document.getElementById('pressure').querySelector('p').textContent = `${pressure} hPa (${pressureIndicator})`;
    }

    document.getElementById('searchButton').addEventListener('click', () => {
        const city = document.getElementById('citySearch').value;
        if (city) {
            fetchWeatherData(city);
        }
    });

    document.getElementById('locationButton').addEventListener('click', () => {
        fetch('https://api.ipgeolocation.io/ipgeo?apiKey=b210b7b34c19429891fe3554d9a60476')
            .then(response => response.json())
            .then(data => {
                const city = data.city;
                fetchWeatherData(city);
            });
    });

    function fetchWeatherData(city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=0a3ca98b38e84a407ded4d891b605c50`)
            .then(response => response.json())
            .then(data => {
                updateWeatherDetails(city, data);
                map.setView([data.coord.lat, data.coord.lon], 10); // Center map to the city
            });
    }

    // Function to get weather data based on coordinates
    async function getWeather(lat, lon, city = '') {
        const apiKey = '0a3ca98b38e84a407ded4d891b605c50';
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        updateWeatherDetails(city || data.name, data);

        // Update the forecast after fetching weather data
        updateForecast(city || data.name);
    }

    // Function to handle location button click
    document.getElementById('locationButton').addEventListener('click', async () => {
        const apiKey = 'b210b7b34c19429891fe3554d9a60476';
        const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`);
        const data = await response.json();
        const lat = data.latitude;
        const lon = data.longitude;

        // Update map and weather data
        map.setView([lat, lon], 10);
        L.marker([lat, lon]).addTo(map).bindPopup('You are here').openPopup();
        getWeather(lat, lon, data.city);
    });

    // Function to handle search button click
    document.getElementById('searchButton').addEventListener('click', async () => {
        const city = document.getElementById('citySearch').value;
        const apiKey = '0a3ca98b38e84a407ded4d891b605c50';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        const lat = data.coord.lat;
        const lon = data.coord.lon;

        // Update map and weather data
        map.setView([lat, lon], 10);
        L.marker([lat, lon]).addTo(map).bindPopup(city).openPopup();
        updateWeatherDetails(city, data);

        // Update the forecast after fetching weather data
        updateForecast(city);
    });
});

// Function to fetch and display the 5-day forecast
function updateForecast(city) {
    const apiKey = '0a3ca98b38e84a407ded4d891b605c50'; // Replace with your API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const forecastContainer = document.getElementById('forecastContainer');
            forecastContainer.innerHTML = '';

            // Process and display forecast data
            for (let i = 0; i < data.list.length; i += 8) { // Show one forecast every 24 hours
                const dayData = data.list[i];
                const date = new Date(dayData.dt * 1000);
                const dateString = date.toLocaleDateString();
                const temp = dayData.main.temp;
                const description = dayData.weather[0].description;
                const icon = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png`;

                const forecastCard = document.createElement('div');
                forecastCard.className = 'forecast-card';
                forecastCard.innerHTML = `
                    <h4>${dateString}</h4>
                    <img src="${icon}" alt="${description}">
                    <p>Temp: ${temp} C</p>
                    <p>Description: ${description}</p>
                `;
                forecastContainer.appendChild(forecastCard);
            }
        })
        .catch(error => console.error('Error fetching the forecast:', error));
}

// JavaScript to toggle the .scrolled class on the header
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) { // Adjust the scroll position threshold as needed
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});