// server.js
const express = require('express');
const fetch = require('node-fetch'); // Install with: npm install node-fetch
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory storage for demonstration purposes; for production, use a database.
const visitorLogs = [];

// Endpoint to log a visitor with IP geolocation and additional device info
app.post('/api/logVisitor', async (req, res) => {
  try {
    const {
      userAgent,
      deviceId,
      platform,
      language,
      screenWidth,
      screenHeight,
      latitude,
      longitude
    } = req.body;

    // Get the client's IP address
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    let location = 'Unknown';
    // If browser geolocation provided, use it (you could integrate reverse geocoding here)
    if (latitude && longitude) {
      location = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
    } else {
      // Otherwise, use an IP geolocation API (example using ip-api.com)
      try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        if (data.status === 'success') {
          location = `${data.city}, ${data.regionName}, ${data.country}`;
        }
      } catch (err) {
        console.error('IP Geolocation lookup failed:', err);
      }
    }

    // Create the log entry
    const logEntry = {
      timestamp: new Date(),
      ip,
      userAgent,
      deviceId: deviceId || 'unknown',
      platform: platform || 'unknown',
      language: language || 'unknown',
      screen: screenWidth && screenHeight ? `${screenWidth}x${screenHeight}` : 'unknown',
      location
    };

    // Save the log entry (for production, save to persistent storage)
    visitorLogs.push(logEntry);

    res.json({ message: 'Visitor logged', log: logEntry });
  } catch (err) {
    console.error('Error logging visitor:', err);
    res.status(500).json({ error: 'Failed to log visitor' });
  }
});

// Endpoint to retrieve visitor logs
app.get('/api/getVisitorLogs', (req, res) => {
  res.json(visitorLogs);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
