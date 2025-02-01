// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// OpenWeatherMap API key
var apiKey = '0a3ca98b38e84a407ded4d891b605c50';

// TomTom Traffic API key
var tomtomApiKey = 'a3QDSH5n7djQK1sLSjglAJVZPNNxOjH6';

// IPGeolocation API key (for fallback)
var geoApiKey = 'b210b7b34c19429891fe3554d9a60476';

// Function to update weather and traffic
function updateWeatherAndTraffic(city, lat, lon) {
    // Update weather information
    $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, function (data) {
        document.getElementById('weatherCity').textContent = city;
        document.getElementById('weatherTemp').textContent = `Temperature: ${data.main.temp} °C`;
        document.getElementById('weatherFeelsLike').textContent = `Feels Like: ${data.main.feels_like} °C`;
        document.getElementById('weatherCondition').textContent = `Weather: ${data.weather[0].description}`;
    });

    // Get traffic conditions
    $.getJSON(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${tomtomApiKey}`, function (data) {
        var traffic = data.flowSegmentData.currentSpeed / data.flowSegmentData.freeFlowSpeed;
        var condition = traffic >= 0.9 ? "Light" : traffic >= 0.7 ? "Medium" : "Heavy";
        document.getElementById('trafficCondition').textContent = `Traffic Condition: ${condition}`;
    }).fail(function () {
        document.getElementById('trafficCondition').textContent = 'Traffic Condition: N/A';
    });

    // Update map
    map.setView([lat, lon], 10);
    L.marker([lat, lon]).addTo(map).bindPopup("You are here!").openPopup();
}

// Function to get user's precise location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;
                updateWeatherAndTraffic("Your Location", lat, lon);
            },
            function (error) {
                console.warn("Geolocation permission denied or error occurred:", error);
                fallbackToIPGeolocation(); // Use IP-based location as fallback
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // High accuracy settings
        );
    } else {
        alert("Geolocation is not supported by your browser.");
        fallbackToIPGeolocation();
    }
}

// Function to get location using IP (fallback)
function fallbackToIPGeolocation() {
    $.getJSON(`https://api.ipgeolocation.io/ipgeo?apiKey=${geoApiKey}`, function (data) {
        var lat = data.latitude;
        var lon = data.longitude;
        var city = data.city || "Unknown Location";
        updateWeatherAndTraffic(city, lat, lon);
    }).fail(function () {
        alert("Failed to get location data.");
    });
}

// Use My Location button
document.getElementById('locationButton').addEventListener('click', getUserLocation);

// Search city functionality
document.getElementById('searchButton').addEventListener('click', function () {
    var city = document.getElementById('citySearch').value;
    if (city) {
        $.getJSON(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`, function (data) {
            if (data && data.length > 0) {
                var lat = data[0].lat;
                var lon = data[0].lon;
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
