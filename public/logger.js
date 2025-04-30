/*  public/logger.js
 *  Records a page-view (IP, timestamp, page) in Realtime DB → /visits
 *  Drop one <script type="module" src="public/logger.js"></script>
 *  into ANY page and give <body> a data-page="…" attribute.
 */
import { initializeApp }     from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref,
         push, set, serverTimestamp }
        from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

//–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// 🚨  KEEP THE REAL VALUES **OUT** OF THE REPO  🚨
/* public/logger.js */
export const firebaseConfig = {
  apiKey:            "AIzaSyDds9UCMOcaoGT753uMNcT0y9847jN0oEI",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
//–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

/** Fetch visitor’s public IP (best-effort, falls back to “?”). */
async function getIp() {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const { ip } = await r.json();
    return ip ?? "?";
  } catch { return "?"; }
}

/** Log the visit immediately */
export async function logVisit(page) {
  const ip = await getIp();
  const entryRef = push(ref(db, "visits"));
  await set(entryRef, {
    page,
    ip,
    ts: serverTimestamp()
  });
}

/* ── auto-log for any page that includes this file ──────────────── */
const pageName = document.body.dataset.page || "unknown";
logVisit(pageName);

