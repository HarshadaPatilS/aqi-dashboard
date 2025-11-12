// compare.js - Compare cities page functionality

let comparedCities = [];
let radarChart = null;
let barChart = null;
const MAX_CITIES = 4;

// Initialize compare page
document.addEventListener('DOMContentLoaded', () => {
    setupSearchFunctionality();
    updateDisplay();
});

// Setup search with autocomplete
function setupSearchFunctionality() {
    setupAutocomplete('citySearch', 'autocompleteResults', async (city) => {
        if (comparedCities.length >= MAX_CITIES) {
            alert(`Maximum ${MAX_CITIES} cities can be compared at once`);
            return;
        }
        
        // Check if city already added
        const exists = comparedCities.some(c => c.lat === city.lat && c.lon === city.lon);
        if (exists) {
            alert('City already added to comparison');
            return;
        }
        
        // Fetch AQI data
        const data = await getCurrentAirPollution(city.lat, city.lon);
        if (data && data.list && data.list.length > 0) {
            comparedCities.push({
                ...city,
                aqi: data.list[0].main.aqi,
                components: data.list[0].components
            });
            
            // Clear input
            document.getElementById('citySearch').value = '';
            
            updateDisplay();
        }
    });
}

// Update display with compared cities
function updateDisplay() {
    const cityCards = document.getElementById('cityCards');
    const chartsContainer = document.getElementById('chartsContainer');
    
    if (comparedCities.length === 0) {
        cityCards.innerHTML = `
            <div class="empty-state-large">
                <span class="empty-icon">🏙️</span>
                <h3>No Cities Added</h3>
                <p>Search and add cities above to start comparing</p>
            </div>
        `;
        chartsContainer.style.display = 'none';
        return;
    }
    
    // Display city cards
    cityCards.innerHTML = comparedCities.map((city, index) => {
        const aqiInfo = getAQIInfo(city.aqi);
        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h3 style="margin-bottom: 0.5rem;">${city.name}</h3>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">
                            ${city.state ? city.state + ', ' : ''}${city.country}
                        </p>
                    </div>
                    <button onclick="removeCity(${index})" style="background: transparent; border: none; color: var(--aqi-poor); cursor: pointer; font-size: 1.5rem;">
                        ×
                    </button>
                </div>
                <div style="text-align: center; padding: 1rem;">
                    <div style="font-size: 3rem; font-weight: 800; color: ${aqiInfo.color};">
                        ${city.aqi}
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 600; color: ${aqiInfo.color};">
                        ${aqiInfo.label}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Show charts
    chartsContainer.style.display = 'block';
    updateCharts();
}

// Remove city from comparison
function removeCity(index) {
    comparedCities.splice(index, 1);
    updateDisplay();
}

// Update comparison charts
function updateCharts() {
    updateRadarChart();
    updateBarChart();
}

// Update radar chart
function updateRadarChart() {
    const canvas = document.getElementById('radarChart');
    const ctx = canvas.getContext('2d');
    
    if (radarChart) radarChart.destroy();
    
    const pollutantKeys = ['pm2_5', 'pm10', 'o3', 'no2', 'co', 'so2'];
    const labels = pollutantKeys.map(key => POLLUTANTS[key].name);
    
    const datasets = comparedCities.map((city, index) => {
        const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];
        const color = colors[index % colors.length];
        
        return {
            label: city.name,
            data: pollutantKeys.map(key => city.components[key] || 0),
            borderColor: color,
            backgroundColor: color + '33',
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: color
        };
    });
    
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-muted')
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.2)'
                    },
                    pointLabels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

// Update grouped bar chart
function updateBarChart() {
    const canvas = document.getElementById('barChart');
    const ctx = canvas.getContext('2d');
    
    if (barChart) barChart.destroy();
    
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];
    
    const datasets = comparedCities.map((city, index) => ({
        label: city.name,
        data: [city.aqi],
        backgroundColor: colors[index % colors.length],
        borderRadius: 8
    }));
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Air Quality Index'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const aqi = context.parsed.y;
                            const aqiInfo = getAQIInfo(aqi);
                            return `${context.dataset.label}: ${aqi} (${aqiInfo.label})`;
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
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    }
                }
            }
        }
    });
}

// Make removeCity available globally
window.removeCity = removeCity;