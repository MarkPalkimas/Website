// server.js
// ------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { Reader } = require("@maxmind/geoip2-node");

const app = express();
const port = process.env.PORT || 3000;

// ——— Load MMDBs into memory —————————————————————————————
const cityBuffer = fs.readFileSync(path.join(__dirname, "db/GeoLite2-City.mmdb"));
const asnBuffer  = fs.readFileSync(path.join(__dirname, "db/GeoLite2-ASN.mmdb"));

const cityReader = Reader.openBuffer(cityBuffer);
const asnReader  = Reader.openBuffer(asnBuffer);

// ——— In-memory visitor store ——————————————————————————
let visitorLogs = [];

// ——— Middleware ———————————————————————————————————————
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ——— Log visitor (can be called from your client code) —————————
app.post("/api/logVisitor", (req, res) => {
  const ip        = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
  const userAgent = req.headers["user-agent"] || "Unknown";
  const timestamp = new Date().toISOString();

  visitorLogs.push({ ip, userAgent, timestamp });
  res.json({ message: "Logged successfully" });
});

// ——— Return aggregated & enriched logs —————————————————————
app.get("/api/getVisitorLogs", (req, res) => {
  // 1) Aggregate by IP
  const agg = {};
  visitorLogs.forEach(({ ip, userAgent, timestamp }) => {
    if (!agg[ip]) {
      agg[ip] = { count: 0, latestTime: "", userAgents: new Set() };
    }
    agg[ip].count++;
    agg[ip].latestTime = agg[ip].latestTime < timestamp ? timestamp : agg[ip].latestTime;
    agg[ip].userAgents.add(userAgent);
  });

  // 2) Build enriched array
  const enriched = Object.entries(agg).map(([ip, { count, latestTime, userAgents }]) => {
    // Geo lookup
    let location = "Unknown";
    try {
      const geo = cityReader.city(ip);
      const city = geo.city?.names?.en;
      const region = geo.subdivisions?.[0]?.names?.en;
      const country = geo.country?.names?.en;
      if (city || region || country) {
        location = [city, region, country].filter(Boolean).join(", ");
      }
    } catch {}

    // ASN lookup (ISP/Provider)
    let provider = "Unknown";
    try {
      const asn = asnReader.asn(ip);
      if (asn.autonomous_system_organization) {
        provider = asn.autonomous_system_organization;
      }
    } catch {}

    // Device determination (rough)
    const agents = Array.from(userAgents);
    const device = agents.some(ua =>
      /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
    )
      ? "Mobile"
      : "Desktop";

    return {
      ip,
      count,
      latestTime,
      location,
      provider,
      device,
    };
  });

  // 3) Sort by most recent
  enriched.sort((a, b) => new Date(b.latestTime) - new Date(a.latestTime));

  res.json(enriched);
});

// ——— Start server ————————————————————————————————————
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
