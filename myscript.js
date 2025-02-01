
// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// API Keys
var apiKey = '0a3ca98b38e84a407ded4d891b605c50'; // OpenWeatherMap
var tomtomApiKey = 'a3QDSH5n7djQK1sLSjglAJVZPNNxOjH6'; // TomTom Traffic
var geoApiKey = 'b210b7b34c19429891fe3554d9a60476'; // IPGeolocation

// Function to update weather and traffic
function updateWeatherAndTraffic(city, lat, lon) {
    // Update weather information
    $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .done(function (data) {
            document.getElementById('weatherCity').textContent = city;
            document.getElementById('weatherTemp').textContent = `Temperature: ${data.main.temp} °C`;
            document.getElementById('weatherFeelsLike').textContent = `Feels Like: ${data.main.feels_like} °C`;
            document.getElementById('weatherCondition').textContent = `Weather: ${data.weather[0].description}`;
        })
        .fail(function () {
            console.error("Failed to fetch weather data");
        });

    // Get traffic conditions
    $.getJSON(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${tomtomApiKey}`)
        .done(function (data) {
            var traffic = data.flowSegmentData.currentSpeed / data.flowSegmentData.freeFlowSpeed;
            var condition = traffic <= 0.7 ? "Light" : traffic <= 0.9 ? "Medium" : "Heavy";
            document.getElementById('trafficCondition').textContent = `Traffic Condition: ${condition}`;
        })
        .fail(function () {
            document.getElementById('trafficCondition').textContent = 'Traffic Condition: N/A';
        });

    // Update map
    map.setView([lat, lon], 10);
    L.marker([lat, lon]).addTo(map).bindPopup("You are here!").openPopup();
}

// Get user's precise location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;
                updateWeatherAndTraffic("Your Location", lat, lon);
            },
            function (error) {
                console.warn("Geolocation error:", error);
                fallbackToIPGeolocation(); // Fallback if denied
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
        fallbackToIPGeolocation();
    }
}

// Get location using IP (fallback)
function fallbackToIPGeolocation() {
    $.getJSON(`https://api.ipgeolocation.io/ipgeo?apiKey=${geoApiKey}`)
        .done(function (data) {
            updateWeatherAndTraffic(data.city || "Unknown Location", data.latitude, data.longitude);
        })
        .fail(function () {
            alert("Failed to get location data.");
        });
}

// Search city functionality
document.getElementById('searchButton').addEventListener('click', function () {
    var city = document.getElementById('citySearch').value;
    if (city) {
        $.getJSON(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
            .done(function (data) {
                if (data.length > 0) {
                    updateWeatherAndTraffic(city, data[0].lat, data[0].lon);
                } else {
                    alert("City not found. Please try another city.");
                }
            })
            .fail(function () {
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
        cardContent.style.display = (cardContent.style.display === 'block') ? 'none' : 'block';
        this.textContent = (cardContent.style.display === 'block') ? 'Show Less' : 'Read More';
    });
});

// Navigation button functionality
document.getElementById('navigateButton').addEventListener('click', function () {
    window.location.href = 'anotherpage.html';
});

// Toggle navigation menu on mobile
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });

    // Forecast Navigation
    let currentIndex = 0;
    const forecastContainer = document.querySelector('.forecast-container');
    const cards = document.querySelectorAll('.forecast-cards .card1');

    if (forecastContainer && cards.length) {
        const cardWidth = cards[0].offsetWidth + 15;

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
    }
});

// Smooth Header Scroll Effect
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
