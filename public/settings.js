// settings.js - Settings page functionality

// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupThemeToggle();
    setupUnitToggle();
    displayFavoriteCities();
    setupActions();
});

// Load current settings
function loadSettings() {
    const theme = getTheme();
    const unit = getUnit();
    
    // Highlight active theme button
    document.querySelectorAll('[data-theme]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    // Highlight active unit button
    document.querySelectorAll('[data-unit]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === unit);
    });
}

// Setup theme toggle
function setupThemeToggle() {
    document.querySelectorAll('[data-theme]').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
            
            // Update active state
            document.querySelectorAll('[data-theme]').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    });
}

// Setup unit toggle
function setupUnitToggle() {
    document.querySelectorAll('[data-unit]').forEach(btn => {
        btn.addEventListener('click', () => {
            const unit = btn.dataset.unit;
            setUnit(unit);
            
            // Update active state
            document.querySelectorAll('[data-unit]').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    });
}

// Display favorite cities
function displayFavoriteCities() {
    const favoritesDiv = document.getElementById('favoriteCities');
    const clearBtn = document.getElementById('clearFavorites');
    const favorites = getFavoriteCities();
    
    if (favorites.length === 0) {
        favoritesDiv.innerHTML = `
            <div class="empty-state">
                <p>No favorite cities saved</p>
            </div>
        `;
        clearBtn.style.display = 'none';
        return;
    }
    
    favoritesDiv.innerHTML = favorites.map(city => `
        <div class="favorite-item">
            <div>
                <strong>${city.name}</strong>
                <span style="color: var(--text-muted); font-size: 0.875rem; margin-left: 0.5rem;">
                    ${city.state ? city.state + ', ' : ''}${city.country}
                </span>
            </div>
            <button class="favorite-remove" onclick="removeFavorite(${city.lat}, ${city.lon})">
                ×
            </button>
        </div>
    `).join('');
    
    clearBtn.style.display = 'block';
}

// Remove single favorite
function removeFavorite(lat, lon) {
    removeFavoriteCity(lat, lon);
    displayFavoriteCities();
}

// Setup action buttons
function setupActions() {
    // Clear favorites button
    document.getElementById('clearFavorites').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all favorite cities?')) {
            clearAllFavorites();
            displayFavoriteCities();
        }
    });
    
    // Export favorites
    document.getElementById('exportData').addEventListener('click', () => {
        const favorites = getFavoriteCities();
        if (favorites.length === 0) {
            alert('No favorites to export');
            return;
        }
        
        const dataStr = JSON.stringify(favorites, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aqi-favorites.json';
        a.click();
        
        URL.revokeObjectURL(url);
        alert('Favorites exported successfully!');
    });
    
    // Clear cache
    document.getElementById('clearCache').addEventListener('click', () => {
        if (confirm('This will clear all stored preferences except favorites. Continue?')) {
            // Clear everything except favorites
            const favorites = getFavoriteCities();
            localStorage.clear();
            localStorage.setItem('favoriteCities', JSON.stringify(favorites));
            
            // Reset to defaults
            setTheme('dark');
            setUnit('ugm3');
            
            alert('Cache cleared! Reloading page...');
            location.reload();
        }
    });
    
    // Notifications toggle (placeholder)
    document.getElementById('notificationsToggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            alert('Notifications feature coming soon!');
            e.target.checked = false;
        }
    });
}

// Make removeFavorite available globally
window.removeFavorite = removeFavorite;