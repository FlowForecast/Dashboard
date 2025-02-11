document.addEventListener('DOMContentLoaded', () => {
    /* ==================== Menu Toggle ==================== */
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });

    /* ==================== Leaflet Weather Map ==================== */
    const weatherMap = L.map('weatherMap').setView([51.505, -0.09], 5); // Default view

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(weatherMap);

    // Layer groups for different weather data
    const apiKeyOWM = '0a3ca98b38e84a407ded4d891b605c50'; // Replace with your OpenWeatherMap API key

    const precipitationLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKeyOWM}`);
    const cloudsLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKeyOWM}`);
    const pressureLayer = L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${apiKeyOWM}`);
    const tempLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKeyOWM}`);
    const windLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKeyOWM}`);

    const weatherLayers = {
        'Precipitation': precipitationLayer,
        'Clouds': cloudsLayer,
        'Pressure': pressureLayer,
        'Temperature': tempLayer,
        'Wind': windLayer,
    };

    L.control.layers(null, weatherLayers).addTo(weatherMap);

    let weatherMarker = null;

    /* ==================== Weather Functions ==================== */
    function updateWeatherDetails(city, weatherData) {
        document.getElementById('cityName').textContent = city;
        document.getElementById('temperature').textContent = `Temperature: ${weatherData.main.temp} C`;
        document.getElementById('feelsLike').textContent = `Feels Like: ${weatherData.main.feels_like} C`;
        document.getElementById('description').textContent = `Weather Description: ${weatherData.weather[0].description}`;

        document.getElementById('highTemperature').textContent = `High Temperature: ${weatherData.main.temp_max} C`;
        document.getElementById('lowTemperature').textContent = `Low Temperature: ${weatherData.main.temp_min} C`;

        // Update wind speed to km/h
        const windSpeedKmh = (weatherData.wind.speed * 3.6).toFixed(2); // Convert from m/s to km/h
        document.querySelector('#windSpeed p').textContent = `${windSpeedKmh} km/h`;

        // Update sunrise and sunset times
        const sunriseTime = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString();
        const sunsetTime = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString();
        document.querySelector('#sunrise p').textContent = sunriseTime;
        document.querySelector('#sunset p').textContent = sunsetTime;

        // Update humidity
        const humidity = weatherData.main.humidity;
        let humidityIndicator = 'Normal';
        if (humidity > 70) {
            humidityIndicator = 'High';
        } else if (humidity < 30) {
            humidityIndicator = 'Low';
        }
        document.querySelector('#humidity p').textContent = `${humidity}% (${humidityIndicator})`;

        // Update visibility
        const visibilityKm = weatherData.visibility ? (weatherData.visibility / 1000).toFixed(2) : 'N/A'; // Handle cases where visibility might be undefined
        let visibilityIndicator = 'Normal';
        if (visibilityKm !== 'N/A') {
            if (visibilityKm > 10) {
                visibilityIndicator = 'High';
            } else if (visibilityKm < 1) {
                visibilityIndicator = 'Low';
            }
        }
        document.querySelector('#visibility p').textContent = `${visibilityKm} km (${visibilityIndicator})`;

        // Update pressure
        const pressure = weatherData.main.pressure;
        let pressureIndicator = 'Normal';
        if (pressure > 1015) {
            pressureIndicator = 'High';
        } else if (pressure < 1000) {
            pressureIndicator = 'Low';
        }
        document.querySelector('#pressure p').textContent = `${pressure} hPa (${pressureIndicator})`;
    }

    function fetchWeatherData(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKeyOWM}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`City "${city}" not found`);
                }
                return response.json();
            })
            .then(data => {
                updateWeatherDetails(city, data);
                weatherMap.setView([data.coord.lat, data.coord.lon], 10); // Center map to the city

                // Remove existing marker if any
                if (weatherMarker) {
                    weatherMap.removeLayer(weatherMarker);
                }

                // Add new marker
                weatherMarker = L.marker([data.coord.lat, data.coord.lon]).addTo(weatherMap)
                    .bindPopup(`${city}`)
                    .openPopup();
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert(error.message);
            });
    }

    async function getWeather(lat, lon, city = '') {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKeyOWM}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            const data = await response.json();
            updateWeatherDetails(city || data.name, data);
            weatherMap.setView([data.coord.lat, data.coord.lon], 10);

            // Remove existing marker if any
            if (weatherMarker) {
                weatherMap.removeLayer(weatherMarker);
            }

            // Add new marker
            weatherMarker = L.marker([data.coord.lat, data.coord.lon]).addTo(weatherMap)
                .bindPopup(city || data.name)
                .openPopup();
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again.');
        }
    }

    /* ==================== Forecast Function ==================== */
    function updateForecast(city) {
        const apiKeyOWM = '0a3ca98b38e84a407ded4d891b605c50'; // Ensure this matches above
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKeyOWM}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch forecast data');
                }
                return response.json();
            })
            .then(data => {
                const forecastContainer = document.getElementById('forecastContainer');
                forecastContainer.innerHTML = ''; // Clear existing forecast

                // Process and display forecast data
                for (let i = 0; i < data.list.length; i += 8) { // Show one forecast every 24 hours
                    const dayData = data.list[i];
                    const date = new Date(dayData.dt * 1000);
                    const dateString = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                    const temp = dayData.main.temp;
                    const description = dayData.weather[0].description;
                    const icon = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png`;

                    const forecastCard = document.createElement('div');
                    forecastCard.className = 'forecast-card';
                    forecastCard.innerHTML = `
                        <h4>${dateString}</h4>
                        <img src="${icon}" alt="${description}" class="forecast-icon">
                        <p>Temp: ${temp}C</p>
                        <p>Description: ${description}</p>
                    `;
                    forecastContainer.appendChild(forecastCard);
                }
            })
            .catch(error => {
                console.error('Error fetching the forecast:', error);
                alert('Failed to fetch forecast data. Please try again.');
            });
    }

    /* ==================== Search and Location Button Event Listeners ==================== */
    const searchButton = document.getElementById('searchButton');
    const locationButton = document.getElementById('locationButton');

    searchButton.addEventListener('click', () => {
        const city = document.getElementById('citySearch').value.trim();
        if (city) {
            fetchWeatherData(city);
            updateForecast(city);
            updateTrafficMap(city);
            fetchLocalEvents(city);
        } else {
            alert('Please enter a city name.');
        }
    });

    locationButton.addEventListener('click', () => {
        // Fetch location using IPGeolocation API
        fetch('https://api.ipgeolocation.io/ipgeo?apiKey=b210b7b34c19429891fe3554d9a60476')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch location data.');
                }
                return response.json();
            })
            .then(data => {
                const lat = parseFloat(data.latitude);
                const lon = parseFloat(data.longitude);

                // Perform reverse geocoding to get accurate city name
                const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKeyOWM}`;

                return fetch(reverseGeoUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to perform reverse geocoding.');
                        }
                        return response.json();
                    })
                    .then(geoData => {
                        const city = geoData[0]?.name || data.city || 'Your Location';
                        // Update weather, forecast, and traffic data
                        getWeather(lat, lon, city);
                        updateForecast(city);
                        trafficMap.setCenter({ lat, lng: lon });
                        trafficMap.setZoom(13);
                        updateTrafficInfo(lat, lon);

                        document.querySelector(".dashboard").scrollIntoView({ behavior: "smooth" });
                    });
                    
            })
            
            .catch(error => {
                console.error('Error during location retrieval:', error);
                alert('Failed to retrieve your location.');
            });
    });

    /* ==================== HERE Traffic Map ==================== */
    // Initialize HERE platform with your API key
    const platform = new H.service.Platform({
        apikey: 'l-OcGaQKoaKs9agOb-wT9abIvsHicYlN9y_4kVdwGIg' // Replace with your HERE API key
    });

    const defaultLayers = platform.createDefaultLayers();

    // Initialize HERE map on 'trafficMap' div
    const trafficMap = new H.Map(
        document.getElementById('trafficMap'),
        defaultLayers.vector.normal.map, // Default map layer
        {
            zoom: 10,
            center: { lat: 51.505, lng: -0.09 } // Default center
        }
    );

    // Enable map events and behavior
    const mapEvents = new H.mapevents.MapEvents(trafficMap);
    const behavior = new H.mapevents.Behavior(mapEvents);
    const ui = H.ui.UI.createDefault(trafficMap, defaultLayers);

    // Variable to hold the current traffic marker
    let trafficMarker = null;

    /* ==================== Traffic Functions ==================== */
    function updateTrafficInfo(lat, lon) {
        const tomtomApiKey = 'a3QDSH5n7djQK1sLSjglAJVZPNNxOjH6'; // Replace with your TomTom API key
        const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${tomtomApiKey}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch traffic data');
                }
                return response.json();
            })
            .then(data => {
                const flowData = data.flowSegmentData;
                const currentSpeed = flowData.currentSpeed;
                const freeFlowSpeed = flowData.freeFlowSpeed;
                const confidence = flowData.confidence;
                const roadClosure = flowData.roadClosure;

                document.getElementById('currentSpeed').textContent = `${currentSpeed} km/h`;
                document.getElementById('freeFlowSpeed').textContent = `${freeFlowSpeed} km/h`;
                document.getElementById('confidence').textContent = `${(confidence * 100).toFixed(2)} %`;

                let trafficCondition = '';
                if (roadClosure) {
                    trafficCondition = 'Closed';
                } else if (currentSpeed < freeFlowSpeed / 2) {
                    trafficCondition = 'Heavy Traffic';
                } else if (currentSpeed < freeFlowSpeed) {
                    trafficCondition = 'Moderate Traffic';
                } else {
                    trafficCondition = 'Light Traffic';
                }
                document.getElementById('trafficCondition').textContent = trafficCondition;
            })
            .catch(error => {
                console.error('Error fetching traffic data:', error);
                alert('Failed to fetch traffic data. Please try again.');
            });
    }

    function searchCityTraffic(city) {
        const apiKey = '0a3ca98b38e84a407ded4d891b605c50';
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`City "${city}" not found`);
                }
                return response.json();
            })
            .then(data => {
                const lat = data.coord.lat;
                const lon = data.coord.lon;
                trafficMap.setCenter({ lat, lng: lon });
                trafficMap.setZoom(13);
                updateTrafficInfo(lat, lon);
            })
            .catch(error => {
                console.error('Error fetching city data for traffic map:', error);
                alert(error.message);
            });
    }

    function updateTrafficMap(city) {
        if (city) {
            searchCityTraffic(city);
        }
    }

    /* ==================== PredictHQ Local Events Integration ==================== */
    const predicthqApiKey = 'F34y6UH863pf_gDGT9h33DF69xz4zdZtwiFji3Pi'; // Replace with your PredictHQ API key

    // Function to fetch and display local events
    function fetchLocalEvents(city) {
        const url = `https://api.predicthq.com/v1/events/?q=${encodeURIComponent(city)}`;

        fetch(url, {
            headers: {
                Authorization: `Bearer ${predicthqApiKey}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch local events for ${city}`);
                }
                return response.json();
            })
            .then(data => {
                displayEvents(data.results);
            })
            .catch(error => {
                console.error('Error fetching local events:', error);
                document.getElementById('eventsDescription').textContent =
                    'Could not fetch events. Please try again later.';
            });
    }

    // Function to display events in the events section
    function displayEvents(events) {
        const eventsSection = document.getElementById('eventsSection');
        eventsSection.innerHTML = `
        <div class="event-card">
            <h2>Local Events</h2>
            <p>Here are the events happening near you:</p>
        </div>`;

        const eventsCard = document.createElement('div');
        eventsCard.className = 'event-card';

        if (events.length === 0) {
            eventsCard.innerHTML = `<p>No events found for this location.</p>`;
        } else {
            const eventsList = document.createElement('ul'); // Create a list to hold events

            events.forEach(event => {
                const venue = event.entities && event.entities.length > 0 ? event.entities[0].formatted_address : 'Venue not available';
                const eventItem = document.createElement('li'); // Create list item for each event
                eventItem.innerHTML = `
                <strong>${event.title}</strong> <br>
                Date: ${new Date(event.start).toLocaleDateString()} <br>
                Venue: ${venue} <br><br>
            `;
                eventsList.appendChild(eventItem);
            });

            eventsCard.appendChild(eventsList); // Add the list to the card
        }

        eventsSection.appendChild(eventsCard); // Add the single card to the events section
    }

    // Add functionality to location and search buttons
    searchButton.addEventListener('click', () => {
        const city = document.getElementById('citySearch').value.trim();
        if (city) {
            fetchLocalEvents(city);
        }
    });

    locationButton.addEventListener('click', () => {
        fetch('https://api.ipgeolocation.io/ipgeo?apiKey=b210b7b34c19429891fe3554d9a60476')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch location data.');
                }
                return response.json();
            })
            .then(data => {
                const city = data.city || 'Your Location';
                fetchLocalEvents(city);
            })
            .catch(error => {
                console.error('Error fetching location:', error);
                document.getElementById('eventsDescription').textContent =
                    'Could not determine your location. Please try again later.';
            });
    });

    /* ==================== Initial Load ==================== */
    // Optionally, load default weather and traffic data
    // For example, load data for a default city
    const defaultCity = 'General Santos City';
    fetchWeatherData(defaultCity);
    updateForecast(defaultCity);
    updateTrafficMap(defaultCity);
    fetchLocalEvents(defaultCity);

    const citySearchInput = document.getElementById("citySearch");
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.classList.add("suggestions-container");
    citySearchInput.parentNode.style.position = "relative"; 
    citySearchInput.parentNode.appendChild(suggestionsContainer);

    var apiKey = '0a3ca98b38e84a407ded4d891b605c50';

    function searchCity(city) {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
    
                    // Fix map variable reference
                    weatherMap.setView([lat, lon], 10);
                    L.marker([lat, lon]).addTo(weatherMap)
                        .bindPopup(`${city}`)
                        .openPopup();
    
                    // Call functions correctly
                    fetchWeatherData(city);
                    updateForecast(city);
                    updateTrafficMap(city);
                    fetchLocalEvents(city);
    
                    // Scroll to results
                    document.querySelector(".dashboard").scrollIntoView({ behavior: "smooth" });
                } else {
                    alert("City not found. Please try another city.");
                }
            })
            .catch(error => {
                console.error("Error fetching city data:", error);
                
            });
    }
    

    citySearchInput.addEventListener("input", function () {
        const query = citySearchInput.value.trim();
        if (query.length > 2) {
            fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    suggestionsContainer.innerHTML = "";
                    if (data.length > 0) {
                        data.forEach(city => {
                            const suggestion = document.createElement("div");
                            suggestion.classList.add("suggestion-item");
                            suggestion.textContent = `${city.name}, ${city.country}`;
                            suggestion.addEventListener("click", function () {
                                citySearchInput.value = city.name;
                                suggestionsContainer.innerHTML = "";
                                searchCity(city.name);
                            });
                            suggestionsContainer.appendChild(suggestion);
                        });
                    }
                })
                .catch(error => console.error("Error fetching city suggestions:", error));
        } else {
            suggestionsContainer.innerHTML = "";
        }
    });

    searchButton.addEventListener("click", function () {
        const city = citySearchInput.value.trim();
        if (city) {
            searchCity(city);
        } else {
            alert("Please enter a city.");
        }
    });
});


/* ==================== Header Scroll Effect ==================== */
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) { // Adjust the scroll position threshold as needed
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.menu a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});