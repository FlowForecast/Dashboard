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
        // Fetch location using browser's geolocation API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    // Perform reverse geocoding to get the city name
                    const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKeyOWM}`;

                    fetch(reverseGeoUrl)
                        .then(response => response.json())
                        .then(geoData => {
                            const city = geoData[0]?.name || 'Your Location';
                            // Update weather, forecast, and traffic data
                            getWeather(lat, lon, city);
                            updateForecast(city);
                            trafficMap.setCenter({ lat, lng: lon });
                            trafficMap.setZoom(13);
                            updateTrafficInfo(lat, lon);
                        })
                        .catch(error => {
                            console.error('Error during reverse geocoding:', error);
                            alert('Failed to retrieve location data.');
                        });
                },
                error => {
                    console.error('Error getting location:', error);
                    alert('Location permission denied or error fetching location.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    /* ==================== HERE Traffic Map ==================== */
    // Initialize HERE platform with your API key
    const platform = new H.service.Platform({
        apikey: 'l-OcGaQKoaKs9agOb-wT9abIvsHicYlN9y_4kVdwGIg' // Replace with your HERE API key
    });

    const defaultLayers = platform.createDefaultLayers();
    const trafficMap = new H.Map(document.getElementById('trafficMap'), defaultLayers.vector.normal.map, {
        center: { lat: 52.5200, lng: 13.4050 },
        zoom: 10
    });

    const ui = H.ui.UI.createDefault(trafficMap, defaultLayers);
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(trafficMap));

    function updateTrafficInfo(lat, lon) {
        const trafficUrl = `https://traffic.ls.hereapi.com/traffic/6.2/incidents.json?apiKey=YOUR_HERE_API_KEY&bbox=${lat},${lon},${lat},${lon}`;
        fetch(trafficUrl)
            .then(response => response.json())
            .then(data => {
                // Process traffic data and display on map
                console.log(data);
            })
            .catch(error => console.error('Traffic data fetch error:', error));
    }

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
