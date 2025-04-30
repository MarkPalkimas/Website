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

// 1) Serve your static site:
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2) Decode Base64 service account JSON from Render:
const serviceAccountJson = Buffer
  .from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64')
  .toString('utf-8');
const serviceAccount = JSON.parse(serviceAccountJson);

// 3) Initialize Admin SDK (Firestore only):
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 4) Log visits to Firestore:
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
    await db.collection('visitors').add({
      ip,
      deviceType,
      userAgent: ua.source || 'unknown',
      location,
      timestamp: new Date().toISOString()
    });
    res.json({ status: 'logged' });
  } catch (err) {
    console.error('Firestore write failed:', err);
    res.status(500).json({ status: 'error' });
  }
});

// 5) Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
