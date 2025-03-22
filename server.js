// server.js
const express = require('express');
const fetch = require('node-fetch'); // Ensure this package is installed

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory storage for demonstration purposes (use a real database in production)
const visitorLogs = [];

// Default route to prevent "Cannot GET /" error
app.get('/', (req, res) => {
  res.send('Server is running. Use /api/logVisitor to log visitors.');
});

// Endpoint to log a visitor with IP geolocation and additional device info
app.post('/api/logVisitor', async (req, res) => {
  try {
    const { userAgent, deviceId, platform, latitude, longitude } = req.body;

    // Get the client's IP address
    let ipHeader = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let ipArray = ipHeader ? ipHeader.split(',').map(ip => ip.trim()) : [];
    let ip = ipArray.length > 0 ? ipArray[0] : 'Unknown';

    // Get the remote port (if available)
    let portNumber = req.connection.remotePort;

    // Determine location using browser geolocation if provided; otherwise, use an IP lookup
    let location = 'Unknown';
    if (latitude && longitude) {
      location = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
    } else if (ip !== 'Unknown') {
      try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        if (data.status === 'success') {
          location = `${data.city}, ${data.regionName}, ${data.country}`;
        }
      } catch (error) {
        console.error('IP Geolocation lookup failed:', error);
      }
    }

    // Create the log entry
    const logEntry = {
      timestamp: new Date(),
      ip,
      ips: ipArray,
      port: portNumber,
      userAgent,
      deviceId: deviceId || 'unknown',
      platform: platform || 'unknown',
      location,
    };

    // Save the log entry (use persistent storage in production)
    visitorLogs.push(logEntry);

    res.json({ message: 'Visitor logged', log: logEntry });
  } catch (error) {
    console.error('Error logging visitor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
