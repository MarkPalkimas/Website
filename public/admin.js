/* public/admin.js
 * Shows one row per IP:
 *   IP • Device (desktop/mobile) • Location • Latest visit • Visits (count)
 */
import { initializeApp }       from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref,
         onValue, orderByChild, query }
       from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { firebaseConfig }      from "./logger.js";   // reuse full config

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

const tbody = document.getElementById("visits");

/* Stream /visits ordered by timestamp, then aggregate */
const q = query(ref(db, "visits"), orderByChild("ts"));
onValue(q, snap => {
  // aggregate by IP
  const byIp = new Map();   // ip => { latestTs, count, device, location }
  snap.forEach(c => {
    const { page = "index", ip = "?", location = "—", ts = 0 } = c.val();
    const dev = page === "mobile" ? "mobile" : "desktop";
    if (!byIp.has(ip)) {
      byIp.set(ip, { latestTs: ts, count: 1, device: dev, location });
    } else {
      const rec = byIp.get(ip);
      rec.count += 1;
      if (ts > rec.latestTs) {           // keep most-recent visit details
        rec.latestTs = ts;
        rec.device   = dev;
        rec.location = location;
      }
    }
  });

  // convert to array & sort newest-first
  const rows = Array.from(byIp.entries())
                    .map(([ip,data]) => ({ ip, ...data }))
                    .sort((a,b) => b.latestTs - a.latestTs);

  // render table
  tbody.innerHTML = "";
  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.ip}</td>
      <td>${r.device}</td>
      <td>${r.location}</td>
      <td>${new Date(r.latestTs).toLocaleString()}</td>
      <td>${r.count}</td>`;
    tbody.appendChild(tr);
  }
});
