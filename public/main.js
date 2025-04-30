// public/main.js
// Fully integrated main.js: neon glow, UI, popups, admin auth, physics, quotes, IP logging

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  // Neon glow + ripple on click
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  const glowColors = ["#5EBD3E", "#FFB900", "#F78200", "#E23838", "#973999", "#009CDF"];
  const RING_PERIOD = 3000, RING_WIDTHP = 3;

  let pulses = [];
  document.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; });
  document.body.addEventListener("click", e => {
    if (!e.target.closest(".footer")) {
      pulses.push({ x: e.clientX, y: e.clientY, start: performance.now() });
    }
  });

  function maxDim() {
    return Math.max(window.innerWidth, window.innerHeight);
  }
  function parseHexColor(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lerpColor(a, b, t) {
    const r = Math.round(a[0] + (b[0] - a[0]) * t),
          g = Math.round(a[1] + (b[1] - a[1]) * t),
          bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return `rgb(${r},${g},${bl})`;
  }

  let startTs = null;
  function animateNeon(ts) {
    if (!startTs) startTs = ts;
    const elapsed = ts - startTs,
          seg = 2000,
          cycle = seg * glowColors.length,
          p = (elapsed % cycle) / seg,
          idx = Math.floor(p),
          f = p - idx;
    const cA = parseHexColor(glowColors[idx]),
          cB = parseHexColor(glowColors[(idx + 1) % glowColors.length]);
    const base = lerpColor(cA, cB, f),
          ringCol = base.replace("rgb", "rgba").replace(")", ",0.5)");
    let bg = `radial-gradient(circle at ${mouseX}px ${mouseY}px, ${base} 0%, transparent 35%)`;
    pulses.forEach(p => {
      const dt = ts - p.start;
      if (dt <= RING_PERIOD) {
        const pct = (dt / RING_PERIOD) * 100;
        bg += `, radial-gradient(circle at ${p.x}px ${p.y}px, transparent ${pct}%, ${ringCol} ${pct + RING_WIDTHP}%, transparent ${pct + RING_WIDTHP}%)`;
      }
    });
    neonContainer.style.background = bg;
    pulses = pulses.filter(p => ts - p.start <= RING_PERIOD);
    requestAnimationFrame(animateNeon);
  }
  requestAnimationFrame(animateNeon);

  // DOM refs
  const profilePic = document.querySelector(".profile-photo"),
        aboutLink = document.querySelector(".about-link"),
        contactLink = document.querySelector(".contact-link"),
        adminBtn = document.querySelector(".admin-btn"),
        gravityBtn = document.querySelector(".gravity-btn"),
        resetBtn = document.querySelector(".reset-btn"),
        dimmed = document.querySelector(".dimmed"),
        aboutPopup = document.getElementById("about-popup"),
        contactPopup = document.getElementById("contact-popup"),
        adminPopup = document.getElementById("admin-popup");

  function openPop(p) {
    dimmed.style.display = "block";
    p.style.display = "block";
  }
  function closeAll() {
    [aboutPopup, contactPopup, adminPopup].forEach(p => p.style.display = "none");
    dimmed.style.display = "none";
  }
  profilePic.addEventListener("click", () => openPop(aboutPopup));
  aboutLink.addEventListener("click", e => { e.preventDefault(); openPop(aboutPopup); });
  contactLink.addEventListener("click", e => { e.preventDefault(); openPop(contactPopup); });
  adminBtn.addEventListener("click", () => {
    openPop(adminPopup);
    document.getElementById("admin-password").value = "";
    document.getElementById("toggle-password").textContent = "Show";
    document.getElementById("admin-error").style.display = "none";
  });
  dimmed.addEventListener("click", closeAll);

  // Admin auth
  const pwInput = document.getElementById("admin-password"),
        toggleBtn = document.getElementById("toggle-password"),
        submitBtn = document.getElementById("submit-password"),
        cancelBtn = document.getElementById("cancel-password"),
        errMsg = document.getElementById("admin-error"),
        storedHash = "dd59dcfa4c076c4923715ba712abbb5cc1458152809a444674f571a4638c0345";

  toggleBtn.addEventListener("click", () => {
    if (pwInput.type === "password") {
      pwInput.type = "text";
      toggleBtn.textContent = "Hide";
    } else {
      pwInput.type = "password";
      toggleBtn.textContent = "Show";
    }
  });

  async function hashPass(s) {
    const buf = new TextEncoder().encode(s),
          h = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  submitBtn.addEventListener("click", async () => {
    const h = await hashPass(pwInput.value);
    if (h === storedHash) {
      closeAll();
      window.location.href = "admin.html";
    } else {
      pwInput.value = "";
      errMsg.style.display = "block";
    }
  });
  cancelBtn.addEventListener("click", () => {
    pwInput.value = "";
    errMsg.style.display = "none";
  });

  // Ball physics
  const balls = [];
  const GRAV = 0.3, REST = 0.8, WFORCE = 1.8, SLEEP = 0.05;

  gravityBtn.addEventListener("click", () => {
    dropBall();
    resetBtn.style.display = "block";
  });
  resetBtn.addEventListener("click", () => {
    balls.forEach(b => b.remove());
    balls.length = 0;
    resetBtn.style.display = "none";
  });

  function getRandomColor() {
    const L = "89ABCDEF", c = "#";
    let o = "";
    for (let i = 0; i < 6; i++) o += L[Math.floor(Math.random() * L.length)];
    return c + o;
  }

  function dropBall() {
    const b = document.createElement("div");
    b.className = "ball";
    const d = Math.random() * 30 + 40;
    b.style.width = b.style.height = d + "px";
    b.style.backgroundColor = getRandomColor();
    b.x = Math.random() * (window.innerWidth - d);
    b.y = 0;
    b.vx = Math.random() * 2 - 1;
    b.vy = Math.random() * 4 + 1;
    b.radius = d / 2;
    b.mass = Math.PI * b.radius * b.radius;
    document.body.appendChild(b);
    balls.push(b);
  }

  function updateBalls() {
    const footTop = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY;
    balls.forEach(b => {
      b.vy += GRAV;
      pulses.forEach(p => {
        const dt = performance.now() - p.start;
        if (dt <= RING_PERIOD) {
          const R = (dt / RING_PERIOD) * maxDim(),
                T = (RING_WIDTHP / 100) * maxDim(),
                dx = (b.x + b.radius) - p.x,
                dy = (b.y + b.radius) - p.y,
                dist = Math.hypot(dx, dy);
          if (Math.abs(dist - R) < T / 2) {
            b.vx += (dx / dist) * WFORCE;
            b.vy += (dy / dist) * WFORCE;
          }
        }
      });
      b.x += b.vx;
      b.y += b.vy;
      if (b.x <= 0) { b.x = 0; b.vx *= -REST; }
      else if (b.x + 2 * b.radius >= window.innerWidth) { b.x = window.innerWidth - 2 * b.radius; b.vx *= -REST; }
      if (b.y + 2 * b.radius >= footTop) {
        b.y = footTop - 2 * b.radius;
        b.vy *= -REST;
        if (Math.abs(b.vy) < SLEEP) b.vy = 0;
        if (Math.abs(b.vx) < SLEEP) b.vx = 0;
      }
      b.style.left = b.x + "px";
      b.style.top = b.y + "px";
    });
    requestAnimationFrame(updateBalls);
  }
  requestAnimationFrame(updateBalls);

  // Visitor logging
  async function logVisitor() {
    try {
      const res = await fetch("https://ipapi.co/json/"), d = await res.json();
      const ip = d.ip,
            loc = `${d.city || 'N/A'}, ${d.region || 'N/A'}, ${d.country_name || 'N/A'}`,
            isp = d.org || "Unknown ISP",
            now = new Date().toISOString(),
            logs = JSON.parse(localStorage.getItem("visitorLogs") || "{}");
      if (!logs[ip]) logs[ip] = { firstSeen: now, lastSeen: now, visits: 1, location: loc, isp: isp };
      else {
        logs[ip].visits++;
        logs[ip].lastSeen = now;
      }
      localStorage.setItem("visitorLogs", JSON.stringify(logs));
    } catch (e) {
      console.error("logVisitor error", e);
    }
  }
  logVisitor();
});
