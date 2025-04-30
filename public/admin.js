/* public/admin.js
 * Dashboard: one row/IP, link to map if coords exist.
 */

import { initializeApp, getApps, getApp }
        from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue,
         query, orderByChild }
        from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { firebaseConfig } from "./logger.js";   // reuse same config

// ✅ use existing Firebase app if already initialised
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getDatabase(app);

const tbody = document.getElementById("visits");

const q = query(ref(db, "visits"), orderByChild("ts"));
onValue(q, snap => {
  const byIp = new Map();   // ip → aggregate record
  snap.forEach(c => {
    const {
      page="index", ip="?", location="—", provider="—",
      lat=null, lon=null, ts=0
    } = c.val();
    const device = page === "mobile" ? "mobile" : "desktop";
    if (!byIp.has(ip)) {
      byIp.set(ip,{ latestTs:ts,count:1,device,location,provider,lat,lon });
    } else {
      const r = byIp.get(ip);
      r.count += 1;
      if (ts > r.latestTs) Object.assign(r,{ latestTs:ts,device,location,provider,lat,lon });
    }
  });

  const rows = Array.from(byIp.entries())
                    .map(([ip,d]) => ({ ip, ...d }))
                    .sort((a,b) => b.latestTs - a.latestTs);

  tbody.innerHTML = "";
  for (const r of rows) {
    const ipCell = (r.lat!==null && r.lon!==null)
      ? `<a href="https://maps.google.com/?q=${r.lat},${r.lon}"
            target="_blank" rel="noopener">${r.ip}</a>`
      : r.ip;
    tbody.innerHTML += `
      <tr>
        <td>${ipCell}</td>
        <td>${r.device}</td>
        <td>${r.provider}</td>
        <td>${r.location}</td>
        <td>${new Date(r.latestTs).toLocaleString()}</td>
        <td>${r.count}</td>
      </tr>`;
  }
});
