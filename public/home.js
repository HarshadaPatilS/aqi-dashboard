// home.js - Home page functionality

// Major cities for global summary
const MAJOR_CITIES = [
    { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US' },
    { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB' },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090, country: 'IN' },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'CN' },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU' }
];

// Initialize home page
document.addEventListener('DOMContentLoaded', () => {
    setupSearchFunctionality();
    loadGlobalSummary();
    loadFavoriteCities();
});

// Setup search with autocomplete
function setupSearchFunctionality() {
    setupAutocomplete('citySearch', 'autocompleteResults', (city) => {
        // Navigate to city dashboard
        window.location.href = `city.html?lat=${city.lat}&lon=${city.lon}&name=${encodeURIComponent(city.name)}&country=${city.country}`;
    });
    
    // Search button click
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('citySearch');
    
    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (query.length < 2) return;
        
        const cities = await searchCities(query);
        if (cities.length > 0) {
            const city = cities[0];
            window.location.href = `city.html?lat=${city.lat}&lon=${city.lon}&name=${encodeURIComponent(city.name)}&country=${city.country}`;
        }
    });
    
    // Enter key to search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// Load global AQI summary
async function loadGlobalSummary() {
    const summaryGrid = document.getElementById('summaryGrid');
    summaryGrid.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        // Fetch AQI for major cities
        const promises = MAJOR_CITIES.map(city => getCurrentAirPollution(city.lat, city.lon));
        const results = await Promise.all(promises);
        
        summaryGrid.innerHTML = '';
        
        results.forEach((data, index) => {
            if (data && data.list && data.list.length > 0) {
                const city = MAJOR_CITIES[index];
                const aqi = data.list[0].main.aqi;
                const aqiInfo = getAQIInfo(aqi);
                
                const card = document.createElement('div');
                card.className = 'summary-card';
                card.innerHTML = `
                    <div class="summary-card-title">${city.name}, ${city.country}</div>
                    <div class="summary-card-value" style="color: ${aqiInfo.color}">
                        ${aqi}
                    </div>
                    <div class="summary-card-label" style="color: ${aqiInfo.color}">
                        ${aqiInfo.label}
                    </div>
                `;
                
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    window.location.href = `city.html?lat=${city.lat}&lon=${city.lon}&name=${encodeURIComponent(city.name)}&country=${city.country}`;
                });
                
                summaryGrid.appendChild(card);
            }
        });
    } catch (error) {
        console.error('Failed to load global summary:', error);
        summaryGrid.innerHTML = '<div class="empty-state"><p>Failed to load global data</p></div>';
    }
}

// Load favorite cities
function loadFavoriteCities() {
    const recentGrid = document.getElementById('recentGrid');
    const favorites = getFavoriteCities();
    
    if (favorites.length === 0) {
        recentGrid.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⭐</span>
                <p>No favorite cities yet. Search for a city to get started!</p>
            </div>
        `;
        return;
    }
    
    recentGrid.innerHTML = '';
    
    // Load AQI for each favorite
    favorites.forEach(async (city) => {
        const data = await getCurrentAirPollution(city.lat, city.lon);
        
        if (data && data.list && data.list.length > 0) {
            const aqi = data.list[0].main.aqi;
            const aqiInfo = getAQIInfo(aqi);
            
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `
                <div class="summary-card-title">${city.name}, ${city.country}</div>
                <div class="summary-card-value" style="color: ${aqiInfo.color}">
                    ${aqi}
                </div>
                <div class="summary-card-label" style="color: ${aqiInfo.color}">
                    ${aqiInfo.label}
                </div>
            `;
            
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                window.location.href = `city.html?lat=${city.lat}&lon=${city.lon}&name=${encodeURIComponent(city.name)}&country=${city.country}`;
            });
            
            recentGrid.appendChild(card);
        }
    });
}