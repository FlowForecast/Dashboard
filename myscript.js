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

// Function to update weather and traffic information
function updateWeatherAndTraffic(city, lat, lon) {
    // Update weather information
    $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, function (data) {
        document.getElementById('weatherCity').textContent = city;
        document.getElementById('weatherTemp').textContent = `Temperature: ${data.main.temp} C`;
        document.getElementById('weatherFeelsLike').textContent = `Feels Like: ${data.main.feels_like} C`;
        document.getElementById('weatherCondition').textContent = `Weather: ${data.weather[0].description}`;
    });

    // Get traffic conditions
    getTrafficConditions(lat, lon);
}

// Use My Location button functionality with Geolocation API
document.getElementById('locationButton').addEventListener('click', function () {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            // Reverse geocoding to get the city name
            $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, function (data) {
                var city = data.name || "Your Location";

                // Update the map to the user's location
                map.setView([lat, lon], 10);
                L.marker([lat, lon]).addTo(map)
                    .bindPopup("You are here!")
                    .openPopup();

                // Update weather and traffic information
                updateWeatherAndTraffic(city, lat, lon);
            });
        }, function (error) {
            alert("Unable to retrieve your location. Please allow location access.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

// Search button functionality with weather and traffic update
document.getElementById('searchButton').addEventListener('click', function () {
    var city = document.getElementById('citySearch').value;

    if (city) {
        $.getJSON(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`, function (data) {
            if (data && data.length > 0) {
                var lat = data[0].lat;
                var lon = data[0].lon;

                // Update the map to the searched city's location
                map.setView([lat, lon], 10);
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(`${city}`)
                    .openPopup();

                // Update weather and traffic information
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
