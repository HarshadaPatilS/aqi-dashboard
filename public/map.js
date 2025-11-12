// map.js - Interactive map page functionality

let map = null;
let markers = [];
let selectedCity = null;

// Sample cities for initial map markers
const SAMPLE_CITIES = [
    { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US' },
    { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB' },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR' },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090, country: 'IN' },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'CN' },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU' },
    { name: 'Moscow', lat: 55.7558, lon: 37.6173, country: 'RU' },
    { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'EG' },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'BR' },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'US' },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'IN' }
];

// Initialize map page
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    setupSearchFunctionality();
    loadCityMarkers();
});

// Initialize Leaflet map
function initializeMap() {
    // Create map centered on world view
    map = L.map('map').setView([20, 0], 2);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
}

// Setup search functionality
function setupSearchFunctionality() {
    setupAutocomplete('mapSearch', 'mapAutocomplete', async (city) => {
        // Fly to city location
        map.flyTo([city.lat, city.lon], 10);
        
        // Load and display city AQI
        const data = await getCurrentAirPollution(city.lat, city.lon);
        if (data && data.list && data.list.length > 0) {
            addCityMarker({
                ...city,
                aqi: data.list[0].main.aqi,
                components: data.list[0].components
            });
        }
        
        // Clear input
        document.getElementById('mapSearch').value = '';
    });
}

// Load markers for sample cities
async function loadCityMarkers() {
    for (const city of SAMPLE_CITIES) {
        const data = await getCurrentAirPollution(city.lat, city.lon);
        if (data && data.list && data.list.length > 0) {
            addCityMarker({
                ...city,
                aqi: data.list[0].main.aqi,
                components: data.list[0].components
            });
        }
    }
}

// Add marker to map
function addCityMarker(city) {
    const aqiInfo = getAQIInfo(city.aqi);
    
    // Create custom marker icon
    const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${aqiInfo.color};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                color: ${city.aqi >= 3 ? 'white' : 'black'};
            ">
                ${city.aqi}
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    // Create marker
    const marker = L.marker([city.lat, city.lon], { icon: markerIcon })
        .addTo(map)
        .on('click', () => {
            showCityPanel(city);
        });
    
    // Add popup
    marker.bindPopup(`
        <div style="text-align: center;">
            <h3 style="margin: 0 0 0.5rem 0;">${city.name}</h3>
            <div style="font-size: 1.5rem; font-weight: bold; color: ${aqiInfo.color};">
                ${city.aqi}
            </div>
            <div style="color: ${aqiInfo.color}; font-weight: 600;">
                ${aqiInfo.label}
            </div>
        </div>
    `);
    
    markers.push(marker);
}

// Show city detail panel
function showCityPanel(city) {
    selectedCity = city;
    const panel = document.getElementById('cityPanel');
    const aqiInfo = getAQIInfo(city.aqi);
    
    document.getElementById('panelCityName').textContent = `${city.name}, ${city.country}`;
    document.getElementById('panelAQI').textContent = city.aqi;
    document.getElementById('panelAQI').style.color = aqiInfo.color;
    document.getElementById('panelLabel').textContent = aqiInfo.label;
    document.getElementById('panelLabel').style.color = aqiInfo.color;
    
    // Display pollutants
    const pollutantsDiv = document.getElementById('panelPollutants');
    const pollutantKeys = ['pm2_5', 'pm10', 'o3', 'no2', 'co', 'so2'];
    
    pollutantsDiv.innerHTML = pollutantKeys.map(key => {
        const pollutant = POLLUTANTS[key];
        const value = city.components[key] || 0;
        return `
            <div class="panel-pollutant">
                <span>${pollutant.name}</span>
                <span style="font-weight: 600;">${value.toFixed(2)} ${pollutant.unit}</span>
            </div>
        `;
    }).join('');
    
    panel.style.display = 'block';
}

// Close city panel
function closeCityPanel() {
    document.getElementById('cityPanel').style.display = 'none';
    selectedCity = null;
}

// View full city details
function viewCityDetails() {
    if (selectedCity) {
        window.location.href = `city.html?lat=${selectedCity.lat}&lon=${selectedCity.lon}&name=${encodeURIComponent(selectedCity.name)}&country=${selectedCity.country}`;
    }
}

// Make functions available globally
window.closeCityPanel = closeCityPanel;
window.viewCityDetails = viewCityDetails;