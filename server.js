// server.js
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const https   = require('https');
const maxmind = require('@maxmind/geoip2-node');

const app  = express();
const port = process.env.PORT || 3000;

// where we'll store the DB at runtime
const DB_PATH = path.join('/tmp', 'GeoLite2-City.mmdb');

let cityReader;

// 1) download the DB if missing, then open it
async function setupGeoDB() {
  if (!fs.existsSync(DB_PATH)) {
    console.log('Downloading GeoLite2 database...');
    await new Promise((resolve, reject) => {
      const auth = `${process.env.MAXMIND_ACCOUNT_ID}:${process.env.MAXMIND_LICENSE_KEY}`;
      const url  = 'https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&suffix=mmdb';
      const req  = https.get(url, { auth }, res => {
        if (res.statusCode !== 200) {
          return reject(new Error(`GeoDB download failed: ${res.statusCode}`));
        }
        const file = fs.createWriteStream(DB_PATH);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      });
      req.on('error', reject);
    });
    console.log('GeoLite2 database downloaded.');
  }
  cityReader = await maxmind.Reader.open(DB_PATH);
  console.log('GeoLite2 database loaded.');
}

// Immediately start DB setup, then the server
setupGeoDB().catch(err => {
  console.error('Error setting up GeoDB:', err);
  process.exit(1);
});

/* ── Middleware ──────────────────────────────────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── In-memory log indexed by IP ────────────────────────────────────── */
const visitorLogs = {};   // { ip: { latestTime, userAgent, location, count } }

/* ── API: record a visit ────────────────────────────────────────────── */
app.post('/api/logVisitor', (req, res) => {
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ip    = ipRaw.split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();

  // geo lookup
  let location = 'Unknown';
  if (cityReader) {
    try {
      const g = cityReader.city(ip);
      location = [g?.city?.names?.en, g?.country?.names?.en]
                   .filter(Boolean)
                   .join(', ');
    } catch { /* ignore private/unroutable IPs */ }
  }

  // aggregate stats
  if (!visitorLogs[ip]) {
    visitorLogs[ip] = { latestTime: timestamp, userAgent, location, count: 1 };
  } else {
    visitorLogs[ip].latestTime = timestamp;
    visitorLogs[ip].count     += 1;
  }

  res.json({ message: 'Logged', log: visitorLogs[ip] });
});

/* ── API: get all logs (newest first) ───────────────────────────────── */
app.get('/api/getVisitorLogs', (_, res) => {
  const data = Object.entries(visitorLogs)
    .map(([ip, d]) => ({ ip, ...d }))
    .sort((a, b) => new Date(b.latestTime) - new Date(a.latestTime));
  res.json(data);
});

/* ── Boot ───────────────────────────────────────────────────────────── */
app.listen(port, () => console.log(`Server running on port ${port}`));
