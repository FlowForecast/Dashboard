document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const searchButton = document.getElementById('searchButton');
    const locationButton = document.getElementById('locationButton');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });

    // Initialize HERE map
    const platform = new H.service.Platform({
        apikey: 'l-OcGaQKoaKs9agOb-wT9abIvsHicYlN9y_4kVdwGIg' // Replace with your HERE API key
    });

    const defaultLayers = platform.createDefaultLayers();

    const map = new H.Map(
        document.getElementById('map'),
        defaultLayers.vector.normal.map,  // Default map layer
        {
            zoom: 13,
            center: { lat: 51.505, lng: -0.09 }  // Default center
        }
    );

    // Enable traffic flow layer
    const trafficLayer = platform.getMapTileService({ type: 'base' }).createTileLayer('maptile', 'traffictile', 256, 'png8', { ppi: 320 });
    map.addLayer(trafficLayer);

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    const ui = H.ui.UI.createDefault(map, defaultLayers);

    // Search City Function
    searchButton.addEventListener('click', () => {
        const city = document.getElementById('citySearch').value;
        if (city) {
            searchCity(city);
        }
    });

    // Use My Location Button with IPGeolocation
    locationButton.addEventListener('click', () => {
        fetch('https://api.ipgeolocation.io/ipgeo?apiKey=b210b7b34c19429891fe3554d9a60476')  // Replace with your IPGeolocation API key
            .then(response => response.json())
            .then(data => {
                const { latitude, longitude } = data;
                map.setCenter({ lat: latitude, lng: longitude });
                map.setZoom(13);
                updateTrafficInfo(latitude, longitude);
            });
    });

    // Function to search for a city using OpenWeatherMap (or other geocoding API)
    function searchCity(city) {
        // Replace with your OpenWeatherMap city search logic and geolocation
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=0a3ca98b38e84a407ded4d891b605c50`)  // Replace with your OpenWeatherMap API key
            .then(response => response.json())
            .then(data => {
                const { lat, lon } = data.coord;
                map.setCenter({ lat, lng: lon });
                map.setZoom(13);
                updateTrafficInfo(lat, lon);
            });
    }

    // Function to get traffic data from TomTom API
    function updateTrafficInfo(lat, lon) {
        const tomtomApiKey = 'a3QDSH5n7djQK1sLSjglAJVZPNNxOjH6';  // Replace with your TomTom API key
        const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${tomtomApiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const { currentSpeed, freeFlowSpeed, confidence, roadClosure } = data.flowSegmentData;
                document.getElementById('currentSpeed').textContent = `${currentSpeed} km/h`;
                document.getElementById('freeFlowSpeed').textContent = `${freeFlowSpeed} km/h`;
                document.getElementById('confidence').textContent = `${confidence * 100} %`;

                const trafficCondition = roadClosure ? 'Closed' : currentSpeed < freeFlowSpeed / 2 ? 'Heavy Traffic' : currentSpeed < freeFlowSpeed ? 'Moderate Traffic' : 'Light Traffic';
                document.getElementById('trafficCondition').textContent = trafficCondition;
            })
            .catch(error => console.error('Error fetching traffic data:', error));
    }
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