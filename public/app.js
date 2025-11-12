// app.js - Core application utilities and API functions
// This file contains shared functions used across all pages

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// AQI Level Definitions
const AQI_LEVELS = {
    1: { label: 'Good', color: '#00e400', description: 'Air quality is satisfactory' },
    2: { label: 'Fair', color: '#ffff00', description: 'Air quality is acceptable' },
    3: { label: 'Moderate', color: '#ff7e00', description: 'Sensitive groups may experience effects' },
    4: { label: 'Poor', color: '#ff0000', description: 'Everyone may begin to experience effects' },
    5: { label: 'Very Poor', color: '#8f3f97', description: 'Health alert: everyone may experience serious effects' }
};

// Health Recommendations by AQI Level
const HEALTH_RECOMMENDATIONS = {
    1: [
        { icon: '✅', title: 'Outdoor Activities', text: 'Ideal conditions for outdoor activities' },
        { icon: '🏃', title: 'Exercise', text: 'Perfect for all outdoor exercise' }
    ],
    2: [
        { icon: '⚠️', title: 'Sensitive Groups', text: 'Unusually sensitive people should consider reducing prolonged outdoor exertion' },
        { icon: '🏃', title: 'General Public', text: 'Enjoy outdoor activities as normal' }
    ],
    3: [
        { icon: '🚨', title: 'Sensitive Groups', text: 'Reduce prolonged or heavy outdoor exertion' },
        { icon: '👥', title: 'General Public', text: 'Consider reducing intense outdoor activities' }
    ],
    4: [
        { icon: '🛑', title: 'Everyone', text: 'Avoid prolonged outdoor exertion' },
        { icon: '🏠', title: 'Stay Indoors', text: 'Keep windows closed and use air purifiers' },
        { icon: '😷', title: 'Mask Up', text: 'Wear N95 masks if you must go outside' }
    ],
    5: [
        { icon: '⛔', title: 'Emergency Conditions', text: 'Everyone should avoid all outdoor activities' },
        { icon: '🏥', title: 'Seek Medical Help', text: 'Consult doctor if experiencing symptoms' },
        { icon: '🚪', title: 'Stay Indoors', text: 'Keep all windows and doors closed' }
    ]
};

// Pollutant Information
const POLLUTANTS = {
    pm2_5: { name: 'PM2.5', unit: 'µg/m³', color: '#ef4444' },
    pm10: { name: 'PM10', unit: 'µg/m³', color: '#f59e0b' },
    o3: { name: 'O₃', unit: 'µg/m³', color: '#3b82f6' },
    no2: { name: 'NO₂', unit: 'µg/m³', color: '#8b5cf6' },
    co: { name: 'CO', unit: 'µg/m³', color: '#10b981' },
    so2: { name: 'SO₂', unit: 'µg/m³', color: '#ec4899' },
    nh3: { name: 'NH₃', unit: 'µg/m³', color: '#06b6d4' }
};

// ========== API Functions ==========

// Geocoding - Search for cities
async function searchCities(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/geocode?q=${encodeURIComponent(query)}&limit=5`);
        if (!response.ok) throw new Error('Failed to fetch cities');
        return await response.json();
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
}

// Get current air pollution data
async function getCurrentAirPollution(lat, lon) {
    try {
        const response = await fetch(`${API_BASE_URL}/air-pollution?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('Failed to fetch air pollution data');
        return await response.json();
    } catch (error) {
        console.error('Air pollution error:', error);
        return null;
    }
}

// Get air pollution forecast
async function getAirPollutionForecast(lat, lon) {
    try {
        const response = await fetch(`${API_BASE_URL}/air-pollution/forecast?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('Failed to fetch forecast');
        return await response.json();
    } catch (error) {
        console.error('Forecast error:', error);
        return null;
    }
}

// Get historical air pollution data
async function getAirPollutionHistory(lat, lon, start, end) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/air-pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}`
        );
        if (!response.ok) throw new Error('Failed to fetch historical data');
        return await response.json();
    } catch (error) {
        console.error('History error:', error);
        return null;
    }
}

// ========== Utility Functions ==========

// Get AQI information (color, label, etc.)
function getAQIInfo(aqi) {
    return AQI_LEVELS[aqi] || AQI_LEVELS[1];
}

// Get health recommendations for AQI level
function getHealthRecommendations(aqi) {
    return HEALTH_RECOMMENDATIONS[aqi] || HEALTH_RECOMMENDATIONS[1];
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date only
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// ========== Local Storage Functions ==========

// Save favorite city
function saveFavoriteCity(city) {
    const favorites = getFavoriteCities();
    // Check if already exists
    const exists = favorites.some(fav => 
        fav.lat === city.lat && fav.lon === city.lon
    );
    if (!exists) {
        favorites.push(city);
        localStorage.setItem('favoriteCities', JSON.stringify(favorites));
        return true;
    }
    return false;
}

// Remove favorite city
function removeFavoriteCity(lat, lon) {
    const favorites = getFavoriteCities();
    const filtered = favorites.filter(city => 
        !(city.lat === lat && city.lon === lon)
    );
    localStorage.setItem('favoriteCities', JSON.stringify(filtered));
}

// Get all favorite cities
function getFavoriteCities() {
    const stored = localStorage.getItem('favoriteCities');
    return stored ? JSON.parse(stored) : [];
}

// Check if city is favorited
function isCityFavorited(lat, lon) {
    const favorites = getFavoriteCities();
    return favorites.some(city => city.lat === lat && city.lon === lon);
}

// Clear all favorites
function clearAllFavorites() {
    localStorage.removeItem('favoriteCities');
}

// ========== Theme Functions ==========

// Get current theme
function getTheme() {
    return localStorage.getItem('theme') || 'dark';
}

// Set theme
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.body.classList.toggle('light-theme', theme === 'light');
}

// Initialize theme on page load
function initializeTheme() {
    const theme = getTheme();
    document.body.classList.toggle('light-theme', theme === 'light');
}

// ========== Units Functions ==========

// Get current unit preference
function getUnit() {
    return localStorage.getItem('unit') || 'ugm3';
}

// Set unit preference
function setUnit(unit) {
    localStorage.setItem('unit', unit);
}

// ========== Autocomplete Setup ==========

let autocompleteTimeout;

function setupAutocomplete(inputId, resultsId, onSelect) {
    const input = document.getElementById(inputId);
    const resultsDiv = document.getElementById(resultsId);
    
    if (!input || !resultsDiv) return;
    
    input.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        clearTimeout(autocompleteTimeout);
        
        if (query.length < 2) {
            resultsDiv.classList.remove('active');
            return;
        }
        
        // Debounce search
        autocompleteTimeout = setTimeout(async () => {
            const cities = await searchCities(query);
            displayAutocompleteResults(cities, resultsDiv, onSelect);
        }, 300);
    });
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !resultsDiv.contains(e.target)) {
            resultsDiv.classList.remove('active');
        }
    });
}

function displayAutocompleteResults(cities, resultsDiv, onSelect) {
    if (cities.length === 0) {
        resultsDiv.innerHTML = '<div class="autocomplete-item">No cities found</div>';
        resultsDiv.classList.add('active');
        return;
    }
    
    resultsDiv.innerHTML = cities.map(city => `
        <div class="autocomplete-item" data-city='${JSON.stringify(city)}'>
            <div class="autocomplete-item-name">${city.name}</div>
            <div class="autocomplete-item-details">
                ${city.state ? city.state + ', ' : ''}${city.country}
            </div>
        </div>
    `).join('');
    
    resultsDiv.classList.add('active');
    
    // Add click handlers
    resultsDiv.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const cityData = JSON.parse(item.getAttribute('data-city'));
            onSelect(cityData);
            resultsDiv.classList.remove('active');
        });
    });
}

// ========== Chart Utilities ==========

// Create doughnut gauge chart for AQI
function createAQIGauge(canvasId, aqi, maxValue = 5) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    const aqiInfo = getAQIInfo(aqi);
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [aqi, maxValue - aqi],
                backgroundColor: [aqiInfo.color, 'rgba(200, 200, 200, 0.2)'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '75%',
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

// Create bar chart for pollutants
function createPollutantsChart(canvasId, components) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    const pollutantKeys = Object.keys(POLLUTANTS);
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: pollutantKeys.map(key => POLLUTANTS[key].name),
            datasets: [{
                label: 'Concentration (µg/m³)',
                data: pollutantKeys.map(key => components[key] || 0),
                backgroundColor: pollutantKeys.map(key => POLLUTANTS[key].color),
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.parsed.y.toFixed(2)} µg/m³`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') }
                }
            }
        }
    });
}

// Initialize theme on all pages
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
});