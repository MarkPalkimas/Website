// server.js
import fs from "fs";
import { Reader } from "@maxmind/geoip2-node";

// ● Load the MMDB files into memory once
const cityBuffer = fs.readFileSync("./db/GeoLite2-City.mmdb");
const asnBuffer  = fs.readFileSync("./db/GeoLite2-ASN.mmdb");

const cityReader = Reader.openBuffer(cityBuffer);
const asnReader  = Reader.openBuffer(asnBuffer);
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS if needed and JSON parsing for POST requests
app.use(cors());
app.use(express.json());

// In-memory store for visitor logs (for production, consider using a database)
let visitorLogs = [];

// Endpoint to return visitor logs for admin.html
app.get('/api/getVisitorLogs', (req, res) => {
  res.json(visitorLogs);
});

// Endpoint to log visitor data
app.post('/api/logVisitor', (req, res) => {
  // Get client IP from x-forwarded-for header (if behind a proxy) or socket.remoteAddress
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();
  
  const newLog = { timestamp, ip, userAgent };
  visitorLogs.push(newLog);
  
  res.json({ message: 'Logged successfully', log: newLog });
});

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
