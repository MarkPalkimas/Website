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

// Allow __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Serve static site files from the /public folder
app.use(express.static(path.join(__dirname, 'public')));

// 🔄 Redirect root route to your homepage (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Firebase service account from Render secret (base64)
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mark-palkimas-visits-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

// 🔐 Visitor tracking endpoint
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

// 🚀 Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
