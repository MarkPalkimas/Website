// server.js
 const express = require('express');
 const cors = require('cors');
 const path = require('path');
 const fetch = require('node-fetch'); // Make sure to install this package
 const app = express();
 const port = process.env.PORT || 3000;
 
 // Enable CORS if needed and JSON parsing for POST requests
 app.use(cors());
 app.use(express.json());
 
 // In-memory store for visitor logs (for production, consider using a database)
 let visitorLogs = [];
 // In-memory storage for demonstration purposes; use a database for production
 const visitorLogs = [];
 
 // Endpoint to return visitor logs for admin.html
 app.get('/api/getVisitorLogs', (req, res) => {
   res.json(visitorLogs);
 });
 // Endpoint to log a visitor with IP geolocation lookup
 app.post('/api/logVisitor', async (req, res) => {
   try {
     const { userAgent, latitude, longitude } = req.body;
     // Get the client's IP address
     let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
     // If IP is a comma-separated list, take the first one
     if (ip && ip.includes(',')) {
       ip = ip.split(',')[0].trim();
     }
 
     let location = 'Unknown';
     
     // If browser geolocation is provided, you could use reverse geocoding here
     if (latitude && longitude) {
       location = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
     } else {
       // Otherwise, use an IP geolocation API (example using ip-api.com)
       const response = await fetch(`http://ip-api.com/json/${ip}`);
       const data = await response.json();
       if (data.status === 'success') {
         location = `${data.city}, ${data.regionName}, ${data.country}`;
       }
     }
 
     const logEntry = {
       timestamp: new Date(),
       ip,
       userAgent,
       location
     };
 
 // Endpoint to log visitor data
 app.post('/api/logVisitor', (req, res) => {
   // Get client IP from x-forwarded-for header (if behind a proxy) or socket.remoteAddress
   const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
   const userAgent = req.headers['user-agent'] || 'Unknown';
   const timestamp = new Date().toISOString();
   
   const newLog = { timestamp, ip, userAgent };
   visitorLogs.push(newLog);
   
   res.json({ message: 'Logged successfully', log: newLog });
     // Save the log entry
     visitorLogs.push(logEntry);
 
     res.json({ message: 'Visitor logged', log: logEntry });
   } catch (err) {
     console.error('Error logging visitor:', err);
     res.status(500).json({ error: 'Failed to log visitor' });
   }
 });
 
 // Serve static files from the "public" folder
 app.use(express.static(path.join(__dirname, 'public')));
 // Endpoint to retrieve visitor logs
 app.get('/api/getVisitorLogs', (req, res) => {
   res.json(visitorLogs);
 });
 
 app.listen(port, () => {
   console.log(`Server running on port ${port}`);
