// server.js - Backend proxy for OpenWeather API
// Keeps API key secure on the server side

const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Your OpenWeather API key - store this in .env file
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files

// Geocoding endpoint - search cities by name
app.get('/api/geocode', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'City name required' });
    }

    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct`,
      {
        params: {
          q,
          limit,
          appid: API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

// Current air pollution data
app.get('/api/air-pollution', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution`,
      {
        params: {
          lat,
          lon,
          appid: API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Air pollution error:', error.message);
    res.status(500).json({ error: 'Failed to fetch air pollution data' });
  }
});

// Air pollution forecast
app.get('/api/air-pollution/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution/forecast`,
      {
        params: {
          lat,
          lon,
          appid: API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Forecast error:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Historical air pollution data
app.get('/api/air-pollution/history', async (req, res) => {
  try {
    const { lat, lon, start, end } = req.query;
    
    if (!lat || !lon || !start || !end) {
      return res.status(400).json({ error: 'Latitude, longitude, start and end timestamps required' });
    }

    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution/history`,
      {
        params: {
          lat,
          lon,
          start,
          end,
          appid: API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

app.listen(PORT, () => {
  console.log(`AQI Backend running on http://localhost:${PORT}`);
  console.log('Make sure to create a .env file with OPENWEATHER_API_KEY=your_key_here');
});

module.exports = app;