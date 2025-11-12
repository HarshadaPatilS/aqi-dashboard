// city.js - City dashboard page functionality

let currentCity = null;
let aqiChart = null;
let pollutantsChart = null;
let forecastChart = null;

// Initialize city dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Get city data from URL parameters
    const params = new URLSearchParams(window.location.search);
    currentCity = {
        lat: parseFloat(params.get('lat')),
        lon: parseFloat(params.get('lon')),
        name: params.get('name'),
        country: params.get('country')
    };
    
    if (!currentCity.lat || !currentCity.lon) {
        alert('Invalid city data');
        window.location.href = 'index.html';
        return;
    }
    
    // Update city header
    document.getElementById('cityName').textContent = `${currentCity.name}, ${currentCity.country}`;
    document.getElementById('cityCoords').textContent = `${currentCity.lat.toFixed(4)}°, ${currentCity.lon.toFixed(4)}°`;
    
    // Setup favorite button
    setupFavoriteButton();
    
    // Load all data
    loadCurrentAQI();
    loadForecast();
});

// Setup favorite button
function setupFavoriteButton() {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const isFavorited = isCityFavorited(currentCity.lat, currentCity.lon);
    
    if (isFavorited) {
        favoriteBtn.classList.add('active');
        favoriteBtn.textContent = '★ Remove from Favorites';
    }
    
    favoriteBtn.addEventListener('click', () => {
        if (isCityFavorited(currentCity.lat, currentCity.lon)) {
            removeFavoriteCity(currentCity.lat, currentCity.lon);
            favoriteBtn.classList.remove('active');
            favoriteBtn.textContent = '⭐ Add to Favorites';
        } else {
            saveFavoriteCity(currentCity);
            favoriteBtn.classList.add('active');
            favoriteBtn.textContent = '★ Remove from Favorites';
        }
    });
}

// Load current AQI data
async function loadCurrentAQI() {
    try {
        const data = await getCurrentAirPollution(currentCity.lat, currentCity.lon);
        
        if (!data || !data.list || data.list.length === 0) {
            throw new Error('No data available');
        }
        
        const pollution = data.list[0];
        const aqi = pollution.main.aqi;
        const components = pollution.components;
        const aqiInfo = getAQIInfo(aqi);
        
        // Update AQI display
        document.getElementById('aqiValue').textContent = aqi;
        document.getElementById('aqiValue').style.color = aqiInfo.color;
        document.getElementById('aqiLabel').textContent = aqiInfo.label;
        document.getElementById('aqiLabel').style.color = aqiInfo.color;
        document.getElementById('aqiTimestamp').textContent = `Updated: ${formatTimestamp(pollution.dt)}`;
        
        // Create AQI gauge
        if (aqiChart) aqiChart.destroy();
        aqiChart = createAQIGauge('aqiGauge', aqi);
        
        // Create pollutants chart
        if (pollutantsChart) pollutantsChart.destroy();
        pollutantsChart = createPollutantsChart('pollutantsChart', components);
        
        // Display health recommendations
        displayHealthRecommendations(aqi);
        
    } catch (error) {
        console.error('Failed to load AQI data:', error);
        document.getElementById('aqiValue').textContent = 'Error';
        document.getElementById('aqiLabel').textContent = 'Failed to load data';
    }
}

// Display health recommendations
function displayHealthRecommendations(aqi) {
    const healthContent = document.getElementById('healthContent');
    const recommendations = getHealthRecommendations(aqi);
    
    healthContent.innerHTML = recommendations.map(rec => `
        <div class="health-item">
            <div class="health-item-title">
                <span>${rec.icon}</span>
                <span>${rec.title}</span>
            </div>
            <div class="health-item-text">${rec.text}</div>
        </div>
    `).join('');
}

// Load forecast data
async function loadForecast() {
    try {
        const data = await getAirPollutionForecast(currentCity.lat, currentCity.lon);
        
        if (!data || !data.list || data.list.length === 0) {
            throw new Error('No forecast data available');
        }
        
        // Take first 24 hours of forecast
        const forecastData = data.list.slice(0, 24);
        
        const labels = forecastData.map(item => {
            const date = new Date(item.dt * 1000);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        });
        
        const aqiData = forecastData.map(item => item.main.aqi);
        
        // Create forecast chart
        if (forecastChart) forecastChart.destroy();
        
        const canvas = document.getElementById('forecastChart');
        const ctx = canvas.getContext('2d');
        
        forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'AQI Forecast',
                    data: aqiData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
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
                                const aqi = context.parsed.y;
                                const aqiInfo = getAQIInfo(aqi);
                                return `AQI: ${aqi} (${aqiInfo.label})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                            callback: function(value) {
                                const aqiInfo = getAQIInfo(value);
                                return aqiInfo.label;
                            }
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Failed to load forecast:', error);
    }
}