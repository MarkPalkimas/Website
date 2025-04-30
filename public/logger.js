/* public/logger.js
 * Logs { page, ip, ts } to Realtime DB  ➜  /visits
 * Add once per page:   <script type="module" src="./logger.js"></script>
 * and put  data-page="index"  (or "mobile") on <body>.
 */

import { initializeApp }           from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push,
         set, serverTimestamp }    from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

/* ───── Your Firebase web-app credentials (public) ───── */
export const firebaseConfig = {
  apiKey:            "AIzaSyDds9UCMOcaoGT753uMNcT0y9847jN0oEI",
  authDomain:        "mark-palkimas-visits.firebaseapp.com",
  databaseURL:       "https://mark-palkimas-visits-default-rtdb.firebaseio.com",
  projectId:         "mark-palkimas-visits",
  storageBucket:     "mark-palkimas-visits.appspot.com",   // ← correct domain
  messagingSenderId: "1062485579247",
  appId:             "1:1062485579247:web:91d1322a90f1e875a0521a",
  measurementId:     "G-GGQ2FN1HY1"
};
/* ─────────────────────────────────────────────────────── */

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

/* best-effort public IP lookup */
async function getIp () {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const { ip } = await r.json();
    return ip ?? "?";
  } catch { return "?"; }
}

/* write one visit */
export async function logVisit (page) {
  const ip  = await getIp();
  const row = push(ref(db, "visits"));
  await set(row, { page, ip, ts: serverTimestamp() });
}

/* auto-log */
const pageName = document.body.dataset.page || "unknown";
logVisit(pageName);
