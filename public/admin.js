/* public/admin.js
 * Dashboard: one row per IP with latest info and visit count 
 */
import { initializeApp }       from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, query, orderByChild }
       from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { firebaseConfig }      from "./logger.js";   // reuse same config

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

const tbody = document.getElementById("visits");

const q = query(ref(db, "visits"), orderByChild("ts"));
onValue(q, snap => {
  const byIp = new Map(); // ip → {latestTs,count,device,location,provider}
  snap.forEach(c => {
    const { page="index", ip="?", location="—", provider="—", ts=0 } = c.val();
    const device = page === "mobile" ? "mobile" : "desktop";
    if (!byIp.has(ip)) {
      byIp.set(ip,{ latestTs:ts, count:1, device, location, provider });
    } else {
      const rec = byIp.get(ip);
      rec.count += 1;
      if (ts > rec.latestTs) {
        Object.assign(rec,{ latestTs:ts, device, location, provider });
      }
    }
  });

  const rows = Array.from(byIp.entries())
                    .map(([ip,data])=>({ ip, ...data }))
                    .sort((a,b)=> b.latestTs - a.latestTs);

  tbody.innerHTML = "";
  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.ip}</td>
      <td>${r.device}</td>
      <td>${r.provider}</td>
      <td>${r.location}</td>
      <td>${new Date(r.latestTs).toLocaleString()}</td>
      <td>${r.count}</td>`;
    tbody.appendChild(tr);
  }
});
