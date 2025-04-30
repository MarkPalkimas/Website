// server.js
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const maxmind  = require('@maxmind/geoip2-node');        // ← NEW

const app  = express();
const port = process.env.PORT || 3000;

/* ── GeoLite2 database: loaded once at startup ───────────────────────── */
const DB_PATH = path.join(
  __dirname,
  'node_modules',
  'geolite2',
  'db',
  'GeoLite2-City.mmdb'
);                                             // adjust only if you
                                               // move the .mmdb file
let cityReader;
maxmind.Reader.open(DB_PATH).then(r => (cityReader = r));

/* ── Middleware ──────────────────────────────────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── In-memory log indexed by IP ─────────────────────────────────────── */
const visitorLogs = {};   // { ip: { latestTime, userAgent, location, count } }

/* ── API: record a visit ─────────────────────────────────────────────── */
app.post('/api/logVisitor', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
               .split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();

  // best-effort geo lookup
  let location = 'Unknown';
  if (cityReader) {
    try {
      const g = cityReader.city(ip);
      location = [g?.city?.names?.en, g?.country?.names?.en]
                   .filter(Boolean).join(', ');
    } catch { /* private / unroutable IPs */ }
  }

  if (!visitorLogs[ip]) {
    visitorLogs[ip] = { latestTime: timestamp, userAgent, location, count: 1 };
  } else {
    visitorLogs[ip].latestTime = timestamp;
    visitorLogs[ip].count += 1;
  }

  res.json({ message: 'Logged', log: visitorLogs[ip] });
});

/* ── API: return logs (newest first) ─────────────────────────────────── */
app.get('/api/getVisitorLogs', (_, res) => {
  const data = Object.entries(visitorLogs)
    .map(([ip, d]) => ({ ip, ...d }))
    .sort((a, b) => new Date(b.latestTime) - new Date(a.latestTime));
  res.json(data);
});

/* ── Boot ────────────────────────────────────────────────────────────── */
app.listen(port, () => console.log(`Server running on port ${port}`));
