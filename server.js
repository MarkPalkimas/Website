// server.js
// ------------------------------------------------------------
const fs       = require("fs");
const path     = require("path");
const express  = require("express");
const cors     = require("cors");
const adminSDK = require("firebase-admin");
const { Reader } = require("@maxmind/geoip2-node");

const app  = express();
const port = process.env.PORT || 3000;

// ——— Initialize Firebase Admin SDK —————————————————————————
// Read service account from base64 env variable
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8")
);

adminSDK.initializeApp({
  credential: adminSDK.credential.cert(serviceAccount),
  databaseURL: "https://mark-palkimas-visits-default-rtdb.firebaseio.com"
});
const dbRef = adminSDK.database().ref("visits");

// ——— Load GeoLite2 MMDBs —————————————————————————————
const cityBuffer = fs.readFileSync(path.join(__dirname, "db/GeoLite2-City.mmdb"));
const asnBuffer  = fs.readFileSync(path.join(__dirname, "db/GeoLite2-ASN.mmdb"));
const cityReader = Reader.openBuffer(cityBuffer);
const asnReader  = Reader.openBuffer(asnBuffer);

// ——— Middleware ———————————————————————————————————————
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ——— Log visitor ———————————————————————————————————————
app.post("/api/logVisitor", (req, res) => {
  const ip        = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
  const userAgent = req.headers["user-agent"] || "Unknown";
  const timestamp = Date.now();

  dbRef.push({ ip, userAgent, timestamp })
    .then(() => res.json({ message: "Logged successfully" }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// ——— Return aggregated & enriched logs —————————————————————
app.get("/api/getVisitorLogs", async (req, res) => {
  // 1) Fetch raw logs from Firebase
  const snapshot = await dbRef.once("value");
  const raw = snapshot.val() || {};

  // 2) Aggregate by IP
  const agg = {};
  Object.values(raw).forEach(({ ip, userAgent, timestamp }) => {
    if (!agg[ip]) {
      agg[ip] = { count: 0, latestTime: 0, userAgents: new Set() };
    }
    agg[ip].count++;
    agg[ip].latestTime = Math.max(agg[ip].latestTime, timestamp);
    agg[ip].userAgents.add(userAgent);
  });

  // 3) Enrich each entry
  const enriched = Object.entries(agg).map(([ip, { count, latestTime, userAgents }]) => {
    // Normalize IPv4-mapped IPv6
    let lookupIP = ip;
    if (ip.startsWith("::ffff:")) lookupIP = ip.split(":").pop();
    else if (ip === "::1") lookupIP = "127.0.0.1";

    // Geo lookup
    let location = "Unknown";
    try {
      const geo = cityReader.city(lookupIP);
      const parts = [
        geo.city?.names?.en,
        geo.subdivisions?.[0]?.names?.en,
        geo.country?.names?.en
      ].filter(Boolean);
      if (parts.length) location = parts.join(", ");
    } catch {}

    // ASN lookup (ISP)
    let provider = "Unknown";
    try {
      const asn = asnReader.asn(lookupIP);
      if (asn.autonomous_system_organization) {
        provider = asn.autonomous_system_organization;
      }
    } catch {}

    // Device detection
    const device = Array.from(userAgents).some(ua =>
      /Android|iPhone|Mobile/i.test(ua)
    ) ? "Mobile" : "Desktop";

    return { ip, count, latestTime, location, provider, device };
  });

  // 4) Sort newest-first and respond
  enriched.sort((a, b) => b.latestTime - a.latestTime);
  res.json(enriched);
});

// ——— Start server ————————————————————————————————————
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
