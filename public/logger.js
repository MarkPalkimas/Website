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
// - inject them at build time, read from a secure <script> block,
//   or import from an env-only file that’s git-ignored.
export const firebaseConfig = {
  apiKey:          import.meta.env.VITE_FB_API_KEY,
  authDomain:      import.meta.env.VITE_FB_AUTH_DOMAIN,
  databaseURL:     import.meta.env.VITE_FB_DATABASE_URL,
  projectId:       import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:   import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER,
  appId:           import.meta.env.VITE_FB_APP_ID
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

