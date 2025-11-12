// insights.js - Insights and trends page functionality

let selectedCity = null;
let aqiTrendChart = null;
let pollutantsTrendChart = null;

// Initialize insights page
document.addEventListener('DOMContentLoaded', () => {
    setupSearchFunctionality();
    setupControls();
});

// Setup search with autocomplete
function setupSearchFunctionality() {
    setupAutocomplete('citySearch', 'autocompleteResults', async (city) => {
        selectedCity = city;
        
        // Update selected city display
        document.getElementById('selectedCityName').textContent = `${city.name}, ${city.country}`;
        document.getElementById('selectedCity').style.display = 'flex';
        
        // Clear search input
        document.getElementById('citySearch').value = '';
        
        // Load historical data
        loadHistoricalData();
    });
}

// Setup control listeners
function setupControls() {
    document.getElementById('timeRange').addEventListener('change', () => {
        if (selectedCity) loadHistoricalData();
    });
    
    document.getElementById('pollutantSelect').addEventListener('change', () => {
        if (selectedCity) loadHistoricalData();
    });
}

// Clear selected city
function clearCity() {
    selectedCity = null;
    document.getElementById('selectedCity').style.display = 'none';
    document.getElementById('trendsContent').innerHTML = `
        <div class="empty-state-large">
            <span class="empty-icon">📊</span>
            <h3>Select a City</h3>
            <p>Choose a city above to view historical air quality trends</p>
        </div>
    `;
    document.getElementById('chartsContainer').style.display = 'none';
}

// Load historical data
async function loadHistoricalData() {
    const timeRange = document.getElementById('timeRange').value;
    
    // Calculate time range
    const endTime = Math.floor(Date.now() / 1000);
    let startTime;
    
    switch(timeRange) {
        case '24h':
            startTime = endTime - (24 * 60 * 60);
            break;
        case '7d':
            startTime = endTime - (7 * 24 * 60 * 60);
            break;
        case '30d':
            startTime = endTime - (30 * 24 * 60 * 60);
            break;
        default:
            startTime = endTime - (7 * 24 * 60 * 60);
    }
    
    // Show loading
    document.getElementById('trendsContent').innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const data = await getAirPollutionHistory(selectedCity.lat, selectedCity.lon, startTime, endTime);
        
        if (!data || !data.list || data.list.length === 0) {
            throw new Error('No historical data available');
        }
        
        // Hide empty state, show charts
        document.getElementById('trendsContent').style.display = 'none';
        document.getElementById('chartsContainer').style.display = 'block';
        
        // Process and display data
        displayTrendCharts(data.list);
        calculateStatistics(data.list);
        
    } catch (error) {
        console.error('Failed to load historical data:', error);
        document.getElementById('trendsContent').innerHTML = `
            <div class="empty-state-large">
                <span class="empty-icon">⚠️</span>
                <h3>Error Loading Data</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Display trend charts
function displayTrendCharts(dataList) {
    // Sample data if too many points (for better performance)
    let sampledData = dataList;
    if (dataList.length > 100) {
        const step = Math.ceil(dataList.length / 100);
        sampledData = dataList.filter((_, index) => index % step === 0);
    }
    
    const labels = sampledData.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    });
    
    const aqiData = sampledData.map(item => item.main.aqi);
    
    // AQI Trend Chart
    if (aqiTrendChart) aqiTrendChart.destroy();
    
    const aqiCanvas = document.getElementById('aqiTrendChart');
    const aqiCtx = aqiCanvas.getContext('2d');
    
    aqiTrendChart = new Chart(aqiCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'AQI',
                data: aqiData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5
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
                        minRotation: 45,
                        maxTicksLimit: 10
                    }
                }
            }
        }
    });
    
    // Pollutants Trend Chart
    const selectedPollutant = document.getElementById('pollutantSelect').value;
    
    if (pollutantsTrendChart) pollutantsTrendChart.destroy();
    
    const pollutantsCanvas = document.getElementById('pollutantsTrendChart');
    const pollutantsCtx = pollutantsCanvas.getContext('2d');
    
    if (selectedPollutant === 'all') {
        // Show all pollutants
        const pollutantKeys = ['pm2_5', 'pm10', 'o3', 'no2', 'co', 'so2'];
        const datasets = pollutantKeys.map(key => {
            const pollutant = POLLUTANTS[key];
            return {
                label: pollutant.name,
                data: sampledData.map(item => item.components[key] || 0),
                borderColor: pollutant.color,
                backgroundColor: pollutant.color + '33',
                fill: false,
                tension: 0.4,
                pointRadius: 1,
                pointHoverRadius: 4
            };
        });
        
        pollutantsTrendChart = new Chart(pollutantsCtx, {
            type: 'line',
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
                            padding: 10,
                            font: { size: 11 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
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
                            minRotation: 45,
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    } else {
        // Show single pollutant
        const pollutant = POLLUTANTS[selectedPollutant];
        
        pollutantsTrendChart = new Chart(pollutantsCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: pollutant.name,
                    data: sampledData.map(item => item.components[selectedPollutant] || 0),
                    borderColor: pollutant.color,
                    backgroundColor: pollutant.color + '33',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                            callback: function(value) {
                                return value + ' µg/m³';
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
                            minRotation: 45,
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    }
}

// Calculate and display statistics
function calculateStatistics(dataList) {
    const aqiValues = dataList.map(item => item.main.aqi);
    
    // Average AQI
    const avgAQI = (aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length).toFixed(1);
    const avgAQIInfo = getAQIInfo(Math.round(avgAQI));
    document.getElementById('avgAQI').textContent = avgAQI;
    document.getElementById('avgAQI').style.color = avgAQIInfo.color;
    
    // Best day
    const minAQI = Math.min(...aqiValues);
    const bestIndex = aqiValues.indexOf(minAQI);
    const bestDate = formatDate(dataList[bestIndex].dt);
    document.getElementById('bestDay').textContent = `${bestDate} (${minAQI})`;
    document.getElementById('bestDay').style.color = getAQIInfo(minAQI).color;
    
    // Worst day
    const maxAQI = Math.max(...aqiValues);
    const worstIndex = aqiValues.indexOf(maxAQI);
    const worstDate = formatDate(dataList[worstIndex].dt);
    document.getElementById('worstDay').textContent = `${worstDate} (${maxAQI})`;
    document.getElementById('worstDay').style.color = getAQIInfo(maxAQI).color;
    
    // Good quality days
    const goodDays = aqiValues.filter(aqi => aqi <= 2).length;
    const totalDays = aqiValues.length;
    const percentage = ((goodDays / totalDays) * 100).toFixed(0);
    document.getElementById('goodDays').textContent = `${percentage}% (${goodDays}/${totalDays})`;
}

// Make clearCity available globally
window.clearCity = clearCity;