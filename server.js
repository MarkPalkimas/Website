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

// ——— Log visitor (to be called from your client) ——————————
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
    // Normalize IPv4-mapped IPv6
    let lookupIP = ip;
    if (ip.startsWith("::ffff:")) {
      lookupIP = ip.split(":").pop();
    } else if (ip === "::1") {
      lookupIP = "127.0.0.1";
    }

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

    // ASN lookup (ISP/Provider)
    let provider = "Unknown";
    try {
      const asn = asnReader.asn(lookupIP);
      if (asn.autonomous_system_organization) {
        provider = asn.autonomous_system_organization;
      }
    } catch {}

    // Device determination
    const agents = Array.from(userAgents);
    const device = agents.some(ua => /Android|iPhone|Mobile/i.test(ua))
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
