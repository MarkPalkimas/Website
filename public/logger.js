/* public/logger.js
 * Logs { page, ip, location, provider, ts } ➜ /visits
 */

import { initializeApp }           from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push,
         set, serverTimestamp }    from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

/* ---- Firebase config (public) ---- */
export const firebaseConfig = {
  apiKey:            "AIzaSyDds9UCMOcaoGT753uMNcT0y9847jN0oEI",
  authDomain:        "mark-palkimas-visits.firebaseapp.com",
  databaseURL:       "https://mark-palkimas-visits-default-rtdb.firebaseio.com",
  projectId:         "mark-palkimas-visits",
  storageBucket:     "mark-palkimas-visits.appspot.com",
  messagingSenderId: "1062485579247",
  appId:             "1:1062485579247:web:91d1322a90f1e875a0521a"
};
/* ---------------------------------- */

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

/* public-IP lookup */
async function getIp () {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    return (await r.json()).ip ?? "?";
  } catch { return "?"; }
}

/* geo + provider */
async function getInfo (ip) {
  if (ip === "?") return { location:"—", provider:"—" };
  try {
    const r    = await fetch(`https://ipapi.co/${ip}/json/`);
    const d    = await r.json();
    if (d.error) return { location:"—", provider:"—" };

    const locParts = [d.city, d.region, d.country_name].filter(Boolean);
    return {
      location : locParts.join(", ") || d.country_name || "—",
      provider : d.org || d.asn || "—"
    };
  } catch { return { location:"—", provider:"—" }; }
}

/* write one visit */
export async function logVisit (page) {
  const ip         = await getIp();
  const { location, provider } = await getInfo(ip);
  await set(push(ref(db, "visits")), {
    page, ip, location, provider, ts: serverTimestamp()
  });
}

/* auto-log */
logVisit(document.body.dataset.page || "unknown");
