// public/main.js
document.addEventListener("DOMContentLoaded", function () {
  // --- Neon Glow & Pulse-on-Click Setup ---
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // store multiple pulses
  let pulses = [];

  const glowColors = [
    "#5EBD3E",
    "#FFB900",
    "#F78200",
    "#E23838",
    "#973999",
    "#009CDF"
  ];
  const maxDim = () => Math.max(window.innerWidth, window.innerHeight);

  // Physics constants
  const GRAVITY      = 0.3;
  const RESTITUTION  = 0.8;
  const WAVE_FORCE   = 1.8;
  const SLEEP_THRESH = 0.05;   // threshold below which velocities zero out

  // ring parameters
  const RING_PERIOD = 3000;    // ms per pulse
  const RING_WIDTHP = 3;       // 3% thickness of maxDim

  // --- Color Utilities ---
  function parseHexColor(hex) {
    const num = parseInt(hex.slice(1), 16);
    return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
  }
  function lerpColor(a, b, t) {
    const r  = Math.round(a[0] + (b[0] - a[0]) * t);
    const g  = Math.round(a[1] + (b[1] - a[1]) * t);
    const bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return `rgb(${r},${g},${bl})`;
  }

  // track mouse for glow
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // trigger a pulse on click, but ignore clicks in the footer
  document.body.addEventListener("click", e => {
    if (e.target.closest(".footer")) return;
    pulses.push({
      x: e.clientX,
      y: e.clientY,
      start: performance.now()
    });
  });

  // --- Animation Loop for Neon Glow & Pulses ---
  let neonStart = null;
  function animateNeon(ts) {
    if (neonStart === null) neonStart = ts;
    const elapsed = ts - neonStart;

    // color cycling
    const segmentMs = 2000;
    const cycleMs   = segmentMs * glowColors.length;
    const progress  = (elapsed % cycleMs) / segmentMs;
    const idx       = Math.floor(progress);
    const frac      = progress - idx;
    const colA      = parseHexColor(glowColors[idx]);
    const colB      = parseHexColor(glowColors[(idx + 1) % glowColors.length]);
    const baseColor = lerpColor(colA, colB, frac);
    const ringColor = baseColor.replace("rgb", "rgba").replace(")", ",0.5)");

    // base glow at mouse
    const baseGlow = `radial-gradient(
      circle at ${mouseX}px ${mouseY}px,
      ${baseColor} 0%,
      transparent 35%
    )`;
    let background = baseGlow;

    // draw all active pulses
    pulses.forEach(p => {
      const dt = ts - p.start;
      if (dt <= RING_PERIOD) {
        const ringProg    = dt / RING_PERIOD;
        const ringRadiusP = ringProg * 100;
        const ringGlow = `radial-gradient(
          circle at ${p.x}px ${p.y}px,
          transparent ${ringRadiusP}%,
          ${ringColor} ${ringRadiusP + RING_WIDTHP}%,
          transparent ${ringRadiusP + RING_WIDTHP}%
        )`;
        background += `, ${ringGlow}`;
      }
    });

    // apply background
    neonContainer.style.background = background;

    // remove expired pulses
    pulses = pulses.filter(p => (ts - p.start) <= RING_PERIOD);

    requestAnimationFrame(animateNeon);
  }
  requestAnimationFrame(animateNeon);

  // --- Elements & UI Variables ---
  const profilePic     = document.querySelector(".profile-photo");
  const aboutLink      = document.querySelector(".about-link");
  const contactLink    = document.querySelector(".contact-link");
  const adminBtn       = document.querySelector(".admin-btn");
  const gravityBtn     = document.querySelector(".gravity-btn");
  const resetBtn       = document.querySelector(".reset-btn");
  const dimmedOverlay  = document.querySelector(".dimmed");
  const quoteContainer = document.getElementById("quote-container");

  const aboutPopup   = document.getElementById("about-popup");
  const contactPopup = document.getElementById("contact-popup");
  const adminPopup   = document.getElementById("admin-popup");

  // --- Popup Controls ---
  profilePic.addEventListener("click", () => {
    dimmedOverlay.style.display = "block";
    aboutPopup.style.display    = "block";
  });
  aboutLink.addEventListener("click", e => {
    e.preventDefault();
    dimmedOverlay.style.display = "block";
    aboutPopup.style.display    = "block";
  });
  contactLink.addEventListener("click", e => {
    e.preventDefault();
    dimmedOverlay.style.display = "block";
    contactPopup.style.display  = "block";
  });
  adminBtn.addEventListener("click", () => {
    dimmedOverlay.style.display = "block";
    adminPopup.style.display    = "block";
    const pw = document.getElementById("admin-password");
    pw.value = ""; pw.type = "password";
    document.getElementById("toggle-password").textContent = "Show";
    document.getElementById("admin-error").style.display = "none";
  });
  dimmedOverlay.addEventListener("click", () => {
    aboutPopup.style.display    = "none";
    contactPopup.style.display  = "none";
    adminPopup.style.display    = "none";
    dimmedOverlay.style.display = "none";
  });

  // --- Admin Popup Controls ---
  const adminPasswordInput = document.getElementById("admin-password");
  const togglePasswordBtn  = document.getElementById("toggle-password");
  const submitPasswordBtn  = document.getElementById("submit-password");
  const cancelPasswordBtn  = document.getElementById("cancel-password");
  const errorMessage       = document.getElementById("admin-error");

  togglePasswordBtn.addEventListener("click", () => {
    if (adminPasswordInput.type === "password") {
      adminPasswordInput.type       = "text";
      togglePasswordBtn.textContent = "Hide";
    } else {
      adminPasswordInput.type       = "password";
      togglePasswordBtn.textContent = "Show";
    }
  });

  submitPasswordBtn.addEventListener("click", async () => {
    const buf     = new TextEncoder().encode(adminPasswordInput.value);
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    const hash    = Array.from(new Uint8Array(hashBuf))
                         .map(b => b.toString(16).padStart(2,"0"))
                         .join("");
    const storedHash = "dd59dcfa4c076c4923715ba712abbb5cc1458152809a444674f571a4638c0345";
    if (hash === storedHash) {
      errorMessage.style.display = "none";
      window.location.href       = "admin.html";
    } else {
      adminPasswordInput.value   = "";
      errorMessage.style.display = "block";
    }
  });
  cancelPasswordBtn.addEventListener("click", () => {
    adminPasswordInput.value   = "";
    errorMessage.style.display = "none";
  });

  // --- Ball Physics & Interaction ---
  const balls = [];

  gravityBtn.addEventListener("click", () => {
    dropBall();
    resetBtn.style.display = "block";
  });
  resetBtn.addEventListener("click", () => {
    resetBalls();
    resetBtn.style.display = "none";
  });

  function dropBall() {
    const ball = document.createElement("div");
    ball.className = "ball";
    ball.style.backgroundColor = getRandomColor();
    const diameter = Math.random() * 30 + 40;
    ball.style.width  = diameter + "px";
    ball.style.height = diameter + "px";

    // numeric state
    ball.x  = Math.random() * (window.innerWidth - diameter);
    ball.y  = 0;
    ball.vx = Math.random() * 2 - 1;
    ball.vy = Math.random() * 4 + 1;
    ball.radius = diameter / 2;
    ball.mass   = Math.PI * ball.radius * ball.radius;

    document.body.appendChild(ball);
    balls.push(ball);
  }

  function resetBalls() {
    balls.forEach(ball => ball.remove());
    balls.length = 0;
  }

  function getRandomColor() {
    const letters = "89ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  }

  // --- Main Physics Loop ---
  function updateBalls() {
    // 1) gravity + wave pushes
    balls.forEach(b => {
      b.vy += GRAVITY;

      // apply each pulse's push
      pulses.forEach(p => {
        const dt = performance.now() - p.start;
        if (dt <= RING_PERIOD) {
          const ringRadiusPx  = (dt / RING_PERIOD) * maxDim();
          const thicknessPx   = (RING_WIDTHP / 100) * maxDim();
          const bx = b.x + b.radius;
          const by = b.y + b.radius;
          const dx = bx - p.x;
          const dy = by - p.y;
          const dist = Math.hypot(dx, dy);
          if (Math.abs(dist - ringRadiusPx) < thicknessPx / 2) {
            b.vx += (dx / dist) * WAVE_FORCE;
            b.vy += (dy / dist) * WAVE_FORCE;
          }
        }
      });
    });

    // 2) integrate
    balls.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
    });

    // 3) wall & floor collisions
    const footerTop = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY;
    balls.forEach(b => {
      // walls
      if (b.x <= 0) {
        b.x = 0;
        b.vx = -b.vx * RESTITUTION;
      } else if (b.x + 2 * b.radius >= window.innerWidth) {
        b.x = window.innerWidth - 2 * b.radius;
        b.vx = -b.vx * RESTITUTION;
      }

      // floor
      if (b.y + 2 * b.radius >= footerTop) {
        b.y = footerTop - 2 * b.radius;
        b.vy = -b.vy * RESTITUTION;
        // settle small bounces
        if (Math.abs(b.vy) < SLEEP_THRESH) b.vy = 0;
        if (Math.abs(b.vx) < SLEEP_THRESH) b.vx = 0;
      }
    });

    // 4) ball–ball collisions
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const A = balls[i], B = balls[j];
        const dx = (B.x - A.x), dy = (B.y - A.y);
        const dist = Math.hypot(dx, dy);
        const minD = A.radius + B.radius;
        if (dist < minD) {
          // separate
          const ux = dx / dist, uy = dy / dist;
          const overlap = (minD - dist) / 2;
          A.x -= ux * overlap;
          A.y -= uy * overlap;
          B.x += ux * overlap;
          B.y += uy * overlap;
          // elastic impulse
          const vA = A.vx * ux + A.vy * uy;
          const vB = B.vx * ux + B.vy * uy;
          const mSum = A.mass + B.mass;
          const imp = (2 * (vB - vA)) / mSum;
          A.vx += imp * B.mass * ux;
          A.vy += imp * B.mass * uy;
          B.vx -= imp * A.mass * ux;
          B.vy -= imp * A.mass * uy;
        }
      }
    }

    // 5) write CSS
    balls.forEach(b => {
      b.style.left = b.x + "px";
      b.style.top  = b.y + "px";
    });

    requestAnimationFrame(updateBalls);
  }
  requestAnimationFrame(updateBalls);

  // --- Falling Quotes ---
  let quotesStarted   = false;
  let quoteStartTime  = Date.now();

  function startFallingQuotes() {
    setInterval(createFallingQuote, 10000);
    updateQuotes();
  }

  function createFallingQuote() {
    const quotes = [
      "Life isn’t about what you know, It’s about what you’re able to figure out.",
      "The best time to plant a tree is 20 years ago, the second best time is today.",
      "The rich get richer because the poor see every opportunity as a scam",
      "Money is not the key to happiness, it is the key to pursuing opportunities.",
      "Cold water feels warm when your hands are freezing.",
      "Regret is proof you cared. But growth is proof you learned."
    ];
    const text = quotes[Math.floor(Math.random() * quotes.length)];
    const elem = document.createElement("div");
    elem.className = "falling-quote";
    elem.innerText = text;
    Object.assign(elem.style, {
      position:      "absolute",
      color:         "#eee",
      fontSize:      "1.5rem",
      opacity:       "0.9",
      pointerEvents: "none",
      zIndex:        "11",
      left:          (elem.dataset.initialLeft = Math.random() * (window.innerWidth - 300)) + "px",
      top:           "-50px",
      animation:     "fall 20s linear forwards"
    });
    elem.dataset.amp   = Math.random() * 20 + 10;
    elem.dataset.phase = Math.random() * Math.PI * 2;
    quoteContainer.appendChild(elem);
    setTimeout(() => elem.remove(), 21000);

    if (!quotesStarted) {
      quotesStarted = true;
      startFallingQuotes();
    }
  }

  function updateQuotes() {
    const now = Date.now();
    document.querySelectorAll(".falling-quote").forEach(q => {
      const initLeft = parseFloat(q.dataset.initialLeft) || 0;
      const amp      = parseFloat(q.dataset.amp)         || 0;
      const phase    = parseFloat(q.dataset.phase)       || 0;
      const t        = (now - quoteStartTime) / 1000;
      q.style.left   = initLeft + amp * Math.sin(t + phase) + "px";
    });
    requestAnimationFrame(updateQuotes);
  }

  // --- Visitor Tracking via localStorage ---
  async function logVisitor() {
    try {
      const res  = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      const ip       = data.ip;
      const location = `${data.city}, ${data.region}, ${data.country_name}`;
      const now      = new Date().toISOString();
      const logs     = JSON.parse(localStorage.getItem("visitorLogs") || "{}");
      if (logs[ip]) {
        logs[ip].count++;
        logs[ip].latestTime = now;
      } else {
        logs[ip] = { count: 1, latestTime: now, location };
      }
      localStorage.setItem("visitorLogs", JSON.stringify(logs));
    } catch (e) {
      console.error("logVisitor error:", e);
    }
  }
  logVisitor();
});
