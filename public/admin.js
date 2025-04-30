/* public/admin.js
 * Streams /visits and lists them newest-first in <tbody id="visits">
 */
import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, query, orderByChild }
        from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { firebaseConfig } from "./logger.js";

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

const tbody = document.getElementById("visits");

const q = query(ref(db, "visits"), orderByChild("ts"));
onValue(q, snap => {
  const rows = [];
  snap.forEach(c => {
    const { page, ip, location = "—", ts = 0 } = c.val();
    rows.push({ page, ip, location, ts });
  });
  rows.sort((a,b) => b.ts - a.ts);

  tbody.innerHTML = "";
  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.page}</td>
      <td>${r.ip}</td>
      <td>${r.location}</td>
      <td>${new Date(r.ts).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  }
});
