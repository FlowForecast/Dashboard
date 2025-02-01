// script.js
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const searchButton = document.getElementById('searchButton');
    const locationButton = document.getElementById('locationButton');
    const citySearch = document.getElementById('citySearch');
    const eventsSection = document.getElementById('eventsSection');

    const PREDICTHQ_API_KEY = '1ldqhPu6RpIRUzydhxXsE8eVs2ZplPNmlO-ySSK_'; // Replace with your PredictHQ API key
    const PREDICTHQ_API_URL = 'https://api.predicthq.com/v1/events/?text=';
    const IPGEOLOCATION_API_KEY = 'b210b7b34c19429891fe3554d9a60476'; // Replace with your IPGeolocation API key
    const IPGEOLOCATION_API_URL = 'https://api.ipgeolocation.io/ipgeo';

    function fetchEvents(query) {
        fetch(`${PREDICTHQ_API_URL}${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${PREDICTHQ_API_KEY}`
            }
        })
            .then(response => response.json())
            .then(data => {
                displayEvents(data.results);
            })
            .catch(error => console.error('Error fetching events:', error));
    }

    function fetchLocation() {
        fetch(`${IPGEOLOCATION_API_URL}?apiKey=${IPGEOLOCATION_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const city = data.city;
                fetchEvents(city);
            })
            .catch(error => console.error('Error fetching location:', error));
    }

    function displayEvents(events) {
        eventsSection.innerHTML = ''; // Clear previous events
        if (events.length === 0) {
            eventsSection.innerHTML = '<p>No events found.</p>';
            return;
        }

        events.slice(0, 3).forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${new Date(event.start).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${event.location ? event.location.address : 'N/A'}</p>
                <p class="event-details"><strong>Description:</strong> ${event.description || 'No description available.'}</p>
                <p class="event-details"><strong>More Info:</strong> <a href="${event.url}" target="_blank">Click here</a></p>
            `;
            eventsSection.appendChild(card);
        });
    }

    function handleSearch() {
        const city = citySearch.value;
        fetchEvents(city);
    }

    function handleLocation() {
        fetchLocation();
    }

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });

    searchButton.addEventListener('click', handleSearch);

    locationButton.addEventListener('click', handleLocation);
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