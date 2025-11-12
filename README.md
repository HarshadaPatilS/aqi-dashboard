# AQI Dashboard - Air Quality Index Monitoring System

A comprehensive, multi-page air quality monitoring dashboard with real-time data from the OpenWeather Air Pollution API. Features secure API key handling, interactive maps, city comparisons, and historical trends analysis.

## 🌟 Features

- **Real-time AQI Monitoring**: Track air quality index and pollutant levels
- **Interactive Map**: Visualize air quality across multiple cities on an interactive map
- **City Comparison**: Compare air quality between up to 4 cities
- **Historical Trends**: Analyze air quality patterns over time
- **Favorites System**: Save and quickly access your favorite cities
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Theme Support**: Light and dark mode themes
- **Secure Architecture**: API keys never exposed to frontend

## 📁 Folder Structure

```
aqi-dashboard/
├── server.js                 # Backend proxy server (Node.js/Express)
├── package.json             # Node.js dependencies
├── .env                     # Environment variables (API key)
├── .env.example             # Example environment file
├── public/                  # Frontend files (served by Express)
│   ├── index.html          # Home page
│   ├── city.html           # City dashboard
│   ├── compare.html        # Compare cities
│   ├── map.html            # Interactive map view
│   ├── insights.html       # Historical trends
│   ├── settings.html       # User settings
│   ├── styles.css          # Main stylesheet
│   ├── app.js              # Core utilities & API functions
│   ├── home.js             # Home page script
│   ├── city.js             # City dashboard script
│   ├── compare.js          # Compare cities script
│   ├── map.js              # Map view script
│   ├── insights.js         # Insights page script
│   └── settings.js         # Settings page script
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- OpenWeather API key (free tier available)

### Installation

1. **Get OpenWeather API Key**
   - Visit: https://openweathermap.org/api
   - Sign up for a free account
   - Navigate to API Keys section
   - Generate a new API key

2. **Clone/Download the Project**
   ```bash
   mkdir aqi-dashboard
   cd aqi-dashboard
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your API key:
   ```
   OPENWEATHER_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

5. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Open Browser**
   - Navigate to: `http://localhost:3000`
   - Start exploring air quality data!

## 📖 Usage Guide

### Home Page
- **Search Cities**: Type city names to get autocomplete suggestions
- **Global Summary**: View AQI for major cities worldwide
- **Favorites**: Quick access to your saved cities

### City Dashboard
- View detailed AQI information with color-coded gauge
- See pollutant breakdown (PM2.5, PM10, O₃, NO₂, CO, SO₂, NH₃)
- Check 24-hour forecast
- Get health recommendations based on air quality
- Add cities to favorites

### Compare Cities
- Add up to 4 cities for comparison
- View radar chart comparing pollutant levels
- See side-by-side AQI gauges
- Grouped bar chart for easy comparison

### Map View
- Interactive world map with AQI markers
- Color-coded markers based on air quality
- Click markers to see city details
- Search and jump to specific locations

### Insights & Trends
- Select a city to analyze
- Choose time range (24h, 7d, 30d)
- View AQI trends over time
- Analyze individual pollutant trends
- See statistics: average AQI, best/worst days

### Settings
- Toggle between light and dark themes
- Switch between µg/m³ and AQI units
- Manage favorite cities
- Export/import data
- Clear cache

## 🎨 AQI Scale

| AQI | Level | Color | Description |
|-----|-------|-------|-------------|
| 1 | Good | 🟢 Green | Air quality is satisfactory |
| 2 | Fair | 🟡 Yellow | Air quality is acceptable |
| 3 | Moderate | 🟠 Orange | Sensitive groups may be affected |
| 4 | Poor | 🔴 Red | Everyone may experience effects |
| 5 | Very Poor | 🟣 Purple | Health alert: serious effects |

## 🔒 Security Features

- **API Key Protection**: Backend proxy ensures API keys never reach the client
- **CORS Configuration**: Controlled access to backend endpoints
- **Environment Variables**: Sensitive data stored in `.env` file
- **No Client-Side Secrets**: All API calls routed through secure backend

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web server framework
- **Axios**: HTTP client for API requests
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript**: No frameworks required
- **Chart.js**: Beautiful, responsive charts
- **Leaflet.js**: Interactive maps
- **CSS3**: Modern styling with animations
- **LocalStorage**: Client-side data persistence

### APIs
- **OpenWeather Air Pollution API**: Real-time air quality data
- **OpenWeather Geocoding API**: City search and coordinates

## 📊 API Endpoints

### Backend Proxy Endpoints

```
GET /api/geocode?q=cityname&limit=5
- Search for cities by name

GET /api/air-pollution?lat=XX&lon=YY
- Get current air pollution data

GET /api/air-pollution/forecast?lat=XX&lon=YY
- Get air pollution forecast

GET /api/air-pollution/history?lat=XX&lon=YY&start=TIMESTAMP&end=TIMESTAMP
- Get historical air pollution data
```

## 🎯 Features Breakdown

### Charts & Visualizations
- **Doughnut Gauge**: AQI level indicator
- **Bar Charts**: Pollutant concentrations
- **Line Charts**: Time-series forecasts and trends
- **Radar Charts**: Multi-city pollutant comparison
- **Interactive Map**: Geographic AQI visualization

### Data Management
- **Favorites**: Save cities with localStorage
- **Theme Persistence**: Remember user preferences
- **Unit Preferences**: µg/m³ or AQI display
- **Export/Import**: Backup favorite cities

### User Experience
- **Autocomplete Search**: Smart city suggestions
- **Responsive Design**: Mobile-first approach
- **Loading States**: Visual feedback during data fetch
- **Error Handling**: Graceful error messages
- **Smooth Animations**: Professional transitions

## 🔧 Customization

### Adding More Cities to Map
Edit `map.js` and add cities to `SAMPLE_CITIES` array:
```javascript
const SAMPLE_CITIES = [
    { name: 'YourCity', lat: XX.XXXX, lon: YY.YYYY, country: 'CC' },
    // ... more cities
];
```

### Changing Theme Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #6366f1;
    --secondary: #8b5cf6;
    /* ... more colors */
}
```

### Adjusting Time Ranges
Modify options in `insights.html`:
```html
<select id="timeRange">
    <option value="24h">Last 24 Hours</option>
    <option value="7d">Last 7 Days</option>
    <!-- Add more options -->
</select>
```

## 🐛 Troubleshooting

### API Key Issues
- Ensure `.env` file is in root directory
- Verify API key is valid and active
- Check OpenWeather account has Air Pollution API enabled
- Wait 10-15 minutes after creating new API key

### Server Not Starting
- Check if port 3000 is available
- Verify Node.js is installed: `node --version`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for errors in console output

### Map Not Loading
- Verify internet connection
- Check browser console for errors
- Ensure Leaflet CSS/JS are loading
- Clear browser cache

### Charts Not Displaying
- Ensure Chart.js is loaded
- Check browser console for errors
- Verify canvas elements have proper IDs
- Try refreshing the page

## 📝 Development Notes

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Tips
- Historical data is sampled for large datasets
- Map markers limited to prevent lag
- Charts use canvas for better performance
- LocalStorage used for quick favorites access

### API Rate Limits
- Free tier: 60 calls/minute, 1M calls/month
- Cache responses when possible
- Implement request throttling if needed

## 🤝 Contributing

Feel free to fork, modify, and improve this dashboard! Some ideas:
- Add more pollutant information
- Implement air quality alerts
- Add weather data integration
- Create printable reports
- Add more map layers
- Implement user accounts

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- OpenWeather for providing the Air Pollution API
- Chart.js for beautiful charts
- Leaflet for interactive maps
- All contributors and users

## 📞 Support

For issues, questions, or suggestions:
- Check the troubleshooting section
- Review OpenWeather API documentation
- Inspect browser console for errors
- Ensure all files are properly structured

## 🎉 Enjoy Your AQI Dashboard!

Monitor air quality, stay healthy, and breathe easy! 🌍💚