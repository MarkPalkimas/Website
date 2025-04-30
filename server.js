import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import fetch from 'node-fetch';
import requestIp from 'request-ip';
import useragent from 'express-useragent';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());
app.use(useragent.express());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Decode and parse your base64 service account JSON
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8')
);

// Initialize Admin SDK for **Realtime Database**
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mark-palkimas-visits-default-rtdb.firebaseio.com"
});

const db = admin.database();

// Log visit
app.post('/log-visit', async (req, res) => {
  const ip = requestIp.getClientIp(req) || 'unknown';
  const ua = req.useragent || {};
  const deviceType = ua.isMobile ? 'Mobile' : 'Desktop';

  let location = {};
  try {
    const r = await fetch(`https://ipapi.co/${ip}/json/`);
    location = await r.json();
  } catch {
    location = { error: 'Geo lookup failed' };
  }

  try {
    // Push a new visitor record
    await db.ref('visitors').push({
      ip,
      userAgent: ua.source || '',
      deviceType,
      location,
      timestamp: Date.now()
    });
    res.json({ status: 'logged' });
  } catch (err) {
    console.error('RTDB write failed:', err);
    res.status(500).json({ status: 'error' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
