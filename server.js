// server.js
const express = require('express');
const fetch = require('node-fetch'); // Install this package if needed
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory storage for demonstration purposes (use a real database in production)
const visitorLogs = [];

// Endpoint to log a visitor with IP details and additional device info
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

    // Get the client's IP address from x-forwarded-for header or connection details
    let ipHeader = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let ipArray = [];
    if (ipHeader) {
      ipArray = ipHeader.split(',').map(ip => ip.trim());
    }
    // Get the remote port (if available)
    let portNumber = req.connection.remotePort;

    // Determine location using browser geolocation if provided; otherwise use an IP lookup on the first IP.
    let location = 'Unknown';
    if (latitude && longitude) {
      // You could add reverse geocoding here for a more readable location.
      location = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
    } else if (ipArray.length > 0) {
      try {
        const response = await fetch(`http://ip-api.com/json/${ipArray[0]}`);
        const data = await response.json();
        if (data.status === 'success') {
          location = `${data.city}, ${data.regionName}, ${data.country}`;
        }
      } catch (e) {
        console.error('IP Geolocation lookup failed:', e);
      }
    }

    // Create the log entry with all collected details
    const logEntry = {
      timestamp: new Date(),
      ips: ipArray,            // All IP addresses seen in the request
      port: portNumber,        // The remote port
      userAgent,
      deviceId: deviceId || 'unknown',
      platform: platform || 'unknown',
      language: language || 'unknown',
      screen: screenWidth && screenHeight ? `${screenWidth}x${screenHeight}` : 'unknown',
      location
    };

    // Save the log entry (use persistent storage in production)
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
