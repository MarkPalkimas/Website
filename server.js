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

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mark-palkimas-visits-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

app.post('/log-visit', async (req, res) => {
  const ip = requestIp.getClientIp(req);
  const ua = req.useragent;
  const deviceType = ua.isMobile ? 'Mobile' : 'Desktop';

  let location = {};
  try {
    const geo = await fetch(`https://ipapi.co/${ip}/json/`);
    location = await geo.json();
  } catch {
    location.error = 'Geo lookup failed';
  }

  await db.collection("visitors").add({
    ip,
    userAgent: ua.source,
    deviceType,
    location,
    timestamp: new Date().toISOString()
  });

  res.json({ status: "logged" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
