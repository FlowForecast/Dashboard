// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// OpenWeatherMap API key
var apiKey = '0a3ca98b38e84a407ded4d891b605c50';

// Layers for precipitation, clouds, pressure, temperature, and wind
var precipitationLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`);
var cloudsLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`);
var pressureLayer = L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${apiKey}`);
var temperatureLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`);
var windLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`);

// Layer control
var overlayMaps = {
    "Precipitation": precipitationLayer,
    "Clouds": cloudsLayer,
    "Pressure": pressureLayer,
    "Temperature": temperatureLayer,
    "Wind": windLayer
};

L.control.layers(null, overlayMaps).addTo(map);

// Set default layers
precipitationLayer.addTo(map);

// TomTom Traffic API key
var tomtomApiKey = 'a3QDSH5n7djQK1sLSjglAJVZPNNxOjH6';

// Function to get traffic conditions
function getTrafficConditions(lat, lon) {
    $.getJSON(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${tomtomApiKey}`, function (data) {
        var traffic = data.flowSegmentData.currentSpeed / data.flowSegmentData.freeFlowSpeed;
        var condition = "Unknown";

        if (traffic >= 0.9) {
            condition = "Light";
        } else if (traffic >= 0.7) {
            condition = "Medium";
        } else {
            condition = "Heavy";
        }

        document.getElementById('trafficCondition').textContent = `Traffic Condition: ${condition}`;
    }).fail(function () {
        document.getElementById('trafficCondition').textContent = 'Traffic Condition: N/A';
    });
}

// Function to get the weather information based on latitude and longitude
function getWeatherData(lat, lon) {
    $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, function (data) {
        var cityName = data.name; // Get the city name from the API response
        var weatherCondition = data.weather[0].description;
        var weatherTemp = data.main.temp;
        var weatherFeelsLike = data.main.feels_like;

        // Update the city name and weather details in the HTML
        document.getElementById('weatherCity').textContent = `City: ${cityName}`;
        document.getElementById('weatherCondition').textContent = `Weather: ${weatherCondition}`;
        document.getElementById('weatherTemp').textContent = `Temperature: ${weatherTemp} °C`;
        document.getElementById('weatherFeelsLike').textContent = `Feels Like: ${weatherFeelsLike} °C`;

        // Get traffic information for the city
        getTrafficConditions(lat, lon);
    }).fail(function () {
        document.getElementById('weatherCity').textContent = 'City: N/A';
        document.getElementById('weatherCondition').textContent = 'Weather: N/A';
        document.getElementById('weatherTemp').textContent = 'Temperature: N/A';
        document.getElementById('weatherFeelsLike').textContent = 'Feels Like: N/A';
    });
}

// Function to handle geolocation and update the map
function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            // Update the map with the user's location
            map.setView([lat, lon], 13); // Zoom in closer to the user's location
            L.marker([lat, lon]).addTo(map)
                .bindPopup('You are here!')
                .openPopup();

            // Fetch weather and traffic data based on user's location
            getWeatherData(lat, lon);
        }, function (error) {
            alert("Geolocation failed: " + error.message);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Add event listener to the "Use My Location" button
document.getElementById('locationButton').addEventListener('click', useCurrentLocation);


// Search button functionality with weather and traffic update
function updateWeatherAndTraffic(city, lat, lon) {
    // Get the weather data for the city
    getWeatherData(lat, lon);

    // Update the map with the city's location
    map.setView([lat, lon], 10);
    L.marker([lat, lon]).addTo(map)
        .bindPopup(city)
        .openPopup();
}

document.getElementById('searchButton').addEventListener('click', function () {
    var city = document.getElementById('citySearch').value;

    if (city) {
        $.getJSON(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`, function (data) {
            if (data && data.length > 0) {
                var lat = data[0].lat;
                var lon = data[0].lon;

                // Update the weather and traffic information for the city
                updateWeatherAndTraffic(city, lat, lon);
            } else {
                alert("City not found. Please try another city.");
            }
        }).fail(function () {
            alert("Failed to retrieve city data.");
        });
    } else {
        alert("Please enter a city.");
    }
});



// Card functionality
document.querySelectorAll('.read-more').forEach(button => {
    button.addEventListener('click', function () {
        const cardContent = this.previousElementSibling;
        if (cardContent.style.display === 'block') {
            cardContent.style.display = 'none';
            this.textContent = 'Read More';
        } else {
            cardContent.style.display = 'block';
            this.textContent = 'Show Less';
        }
    });
});

// Navigation button functionality
document.getElementById('navigateButton').addEventListener('click', function () {
    window.location.href = 'anotherpage.html'; // Change to the URL of the page you want to navigate to
});

// Toggle navigation menu on mobile
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });
});

function updateForecastCard(city, lat, lon, cardId) {
    // OpenWeatherMap API request
    $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, function (data) {
        var temperature = data.main.temp;
        var weather = data.weather[0].description;

        // TomTom Traffic API request
        $.getJSON(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${tomtomApiKey}`, function (trafficData) {
            var traffic = trafficData.flowSegmentData.currentSpeed / trafficData.flowSegmentData.freeFlowSpeed;
            var trafficCondition = traffic >= 0.9 ? "Light" : (traffic >= 0.7 ? "Medium" : "Heavy");

            // Update the card with data
            document.querySelector(`#${cardId} p:nth-child(2)`).textContent = `Temperature: ${temperature} C`;
            document.querySelector(`#${cardId} p:nth-child(3)`).textContent = `Weather: ${weather}`;
            document.querySelector(`#${cardId} p:nth-child(4)`).textContent = `Traffic: ${trafficCondition}`;
        }).fail(function () {
            document.querySelector(`#${cardId} p:nth-child(4)`).textContent = 'Traffic: N/A';
        });
    }).fail(function () {
        document.querySelector(`#${cardId} p:nth-child(2)`).textContent = 'Temperature: N/A';
        document.querySelector(`#${cardId} p:nth-child(3)`).textContent = 'Weather: N/A';
    });
}

// Update forecast cards for major cities
function updateMajorCitiesForecast() {
    // Define cities and their coordinates
    var cities = {
        'Manila': { lat: 14.5995, lon: 120.9842 },
        'New York': { lat: 40.7128, lon: -74.0060 },
        'Hong Kong': { lat: 22.3193, lon: 114.1694 },
        'Paris': { lat: 48.8575, lon: 2.3514 },
        'Mexico': { lat: 19.4326, lon: -99.1332 },
        'Mumbai': { lat: 19.0760, lon: 72.8777 },
        'Cairo': { lat: 30.0444, lon: 31.2357 },
        'London': { lat: 51.5072, lon: 0.1276 },
        'Buenos Aires': { lat: -34.6037, lon: -58.3816 },
        'Istanbul': { lat: 41.0082, lon: 28.9784 },
        'Rio De Janeiro': { lat: -22.9068, lon: -43.1729 },
        'Moscow': { lat: 55.7558, lon: 37.6173 },
        // Add more cities here
    };

    // Update each city's card
    for (var city in cities) {
        if (cities.hasOwnProperty(city)) {
            var cardId = `card-${city.replace(/ /g, '')}`;
            var lat = cities[city].lat;
            var lon = cities[city].lon;
            updateForecastCard(city, lat, lon, cardId);
        }
    }
}

// Call this function to update the forecast cards when the page loads
$(document).ready(function () {
    updateMajorCitiesForecast();
});

// JavaScript to toggle the .scrolled class on the header
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) { // Adjust the scroll position threshold as needed
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

let currentIndex = 0;
const forecastContainer = document.querySelector('.forecast-container');
const cards = document.querySelectorAll('.forecast-cards .card1');
const cardWidth = cards[0].offsetWidth + 15; // Including the gap between cards

document.querySelector('.next').addEventListener('click', () => {
    if (currentIndex < cards.length - 1) {
        currentIndex++;
        forecastContainer.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
    }
});

document.querySelector('.prev').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        forecastContainer.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
    }
});
