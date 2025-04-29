const path = require("path");
const express = require("express");
const cors = require("cors");
const adminSDK = require("firebase-admin");

const app = express();
const port = process.env.PORT || 3000;

// ——— Initialize Firebase Admin SDK ———————————————————————
const serviceAccount = require("./secrets/firebase-sa.json"); // do NOT commit this file
adminSDK.initializeApp({
  credential: adminSDK.credential.cert(serviceAccount),
  databaseURL: "https://mark-palkimas-visits-default-rtdb.firebaseio.com"
});
const dbRef = adminSDK.database().ref("visits");

// ——— Middleware ————————————————————————————————————————
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ——— Log visitor —————————————————————————————————————————
app.post("/api/logVisitor", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
  const userAgent = req.headers["user-agent"] || "Unknown";
  const timestamp = Date.now();

  dbRef.push({ ip, userAgent, timestamp })
    .then(() => res.json({ message: "Logged successfully" }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// ——— Return raw visitor logs ———————————————————————————
app.get("/api/getVisitorLogs", async (req, res) => {
  const snapshot = await dbRef.once("value");
  const raw = snapshot.val() || {};

  const logs = Object.entries(raw).map(([_, { ip, userAgent, timestamp }]) => ({
    ip,
    userAgent,
    timestamp
  }));

  // Sort by latest first
  logs.sort((a, b) => b.timestamp - a.timestamp);
  res.json(logs);
});

// ——— Start server ——————————————————————————————————————
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
