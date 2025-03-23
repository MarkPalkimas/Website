// server.js
const express = require('express');
const fetch = require('node-fetch'); // Make sure this package is installed
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static('public'));

// In-memory storage for visitor logs (for production, use a database)
const visitorLogs = [];

// Default route
app.get('/', (req, res) => {
  res.send('Server is running. Visit /index.html, /mobile.html, /projects.html or /admin.html as needed.');
});

// POST endpoint to log visitor data
app.post('/api/logVisitor', async (req, res) => {
  try {
    // Data may include: userAgent, deviceId, platform, language, screenWidth, screenHeight,
    // latitude, longitude, and an optional client-provided public IP.
    const { userAgent, deviceId, platform, latitude, longitude, language, screenWidth, screenHeight, ip: clientIP } = req.body;

    // Get client's IP address (use the client IP if provided, else from headers)
    let ipHeader = clientIP || (req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    let ipArray = ipHeader ? ipHeader.split(',').map(ip => ip.trim()) : [];
    let ip = ipArray.length > 0 ? ipArray[0] : 'Unknown';

    // Get remote port (if available)
    let portNumber = req.connection.remotePort;

    // Determine location: use lat/long if available; otherwise, perform an IP lookup.
    let location = 'Unknown';
    if (latitude && longitude) {
      location = `Lat: ${parseFloat(latitude).toFixed(2)}, Lon: ${parseFloat(longitude).toFixed(2)}`;
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

    // Create a log entry
    const logEntry = {
      timestamp: new Date(),
      ip,
      ips: ipArray,
      port: portNumber,
      userAgent: userAgent || 'unknown',
      deviceId: deviceId || 'unknown',
      platform: platform || 'unknown',
      language: language || 'unknown',
      screenWidth: screenWidth || 'unknown',
      screenHeight: screenHeight || 'unknown',
      location
    };

    visitorLogs.push(logEntry);
    res.json({ message: 'Visitor logged', log: logEntry });
  } catch (error) {
    console.error('Error logging visitor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET endpoint to retrieve all visitor logs for the admin dashboard
app.get('/api/getVisitorLogs', (req, res) => {
  res.json(visitorLogs);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
