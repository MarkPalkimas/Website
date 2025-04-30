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
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Load and decode Firebase Admin credentials
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Log visit
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
    console.log("Logging visit from", ip); // ✅ Debug log
    await db.collection("visitors").add({
      ip,
      userAgent: ua.source,
      deviceType,
      location,
      timestamp: new Date().toISOString()
    });

    res.json({ status: "logged", ip, deviceType, location });
  } catch (err) {
    console.error("Error logging visit:", err);
    res.status(500).json({ status: "error", message: "Failed to log visit", error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
