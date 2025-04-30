import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import fetch from 'node-fetch';
import requestIp from 'request-ip';
import useragent from 'express-useragent';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(useragent.express());
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 Decode service account from secure environment variable
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8')
);

// ✅ Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mark-palkimas-visits-default-rtdb.firebaseio.com"
});
const db = admin.database();

// ✅ Log visitor data to /visits
app.post('/log-visit', async (req, res) => {
  const ip = requestIp.getClientIp(req) || 'unknown';
  const ua = req.useragent || {};
  const deviceType = ua.isMobile ? 'Mobile' : 'Desktop';

  let location = {};
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    location = await response.json();
  } catch {
    location = { error: 'Location lookup failed' };
  }

  try {
    await db.ref('visits').push({
      ip,
      page: req.headers.referer || '/',
      timestamp: Date.now(),
      deviceType,
      location,
      userAgent: ua.source || ''
    });
    res.json({ status: 'logged' });
  } catch (err) {
    console.error("🔥 Firebase write error:", err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Logging server running on port ${PORT}`));
