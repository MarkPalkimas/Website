/* public/admin.js
 * One row per IP, newest-first.  The IP cell is always a link:
 *   •  with coords  → https://maps.google.com/?q=lat,lon
 *   •  without      → https://maps.google.com/?q=<ip>
 */

import { initializeApp, getApps, getApp }
        from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue,
         query, orderByChild }
        from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { firebaseConfig }      from "./logger.js";

/* reuse existing Firebase app */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getDatabase(app);

const tbody = document.getElementById("visits");

const q = query(ref(db, "visits"), orderByChild("ts"));
onValue(q, snap => {
  const byIp = new Map();   // ip → {latestTs,count,device,location,provider,lat,lon}

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
      if (ts > r.latestTs) {
        Object.assign(r,{ latestTs:ts,device,location,provider,lat,lon });
      }
    }
  });

  const rows = Array.from(byIp.entries())
                    .map(([ip,r]) => ({ ip, ...r }))
                    .sort((a,b) => b.latestTs - a.latestTs);

  tbody.innerHTML = "";
  for (const r of rows) {
    /* build target URL */
    const target = (r.lat !== null && r.lon !== null)
      ? `https://maps.google.com/?q=${r.lat},${r.lon}`
      : `https://maps.google.com/?q=${r.ip}`;

    tbody.innerHTML += `
      <tr>
        <td><a class="ip-link" href="${target}" target="_blank" rel="noopener">${r.ip}</a></td>
        <td>${r.device}</td>
        <td>${r.provider}</td>
        <td>${r.location}</td>
        <td>${new Date(r.latestTs).toLocaleString()}</td>
        <td>${r.count}</td>
      </tr>`;
  }
});
