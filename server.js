import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import fetch from 'node-fetch';
import requestIp from 'request-ip';
import useragent from 'express-useragent';

const app = express();
app.use(cors());
app.use(express.json());
app.use(useragent.express());

// Decode and parse the service account from base64
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8')
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mark-palkimas-visits-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

// Root route (for Render health check or confirmation)
app.get('/', (req, res) => {
  res.send('✅ MarkPalkimas Visit Logger is running. Use POST /log-visit to track.');
});

// POST /log-visit — Logs user IP, device, and geolocation
app.post('/log-visit', async (req, res) => {
  const ip = requestIp.getClientIp(req);
  const ua = req.useragent;
  const deviceType = ua.isMobile ? 'Mobile' : 'Desktop';

  let location = {};
  try {
    const geo = await fetch(`https://ipapi.co/${ip}/json/`);
    location = await geo.json();
  } catch (err) {
    location = { error: 'Geo lookup failed', detail: err.message };
  }

  try {
    await db.collection("visitors").add({
      ip,
      userAgent: ua.source,
      deviceType,
      location,
      timestamp: new Date().toISOString()
    });

    res.json({ status: "logged", ip, deviceType, location });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to log visit", error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
