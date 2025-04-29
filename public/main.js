// public/main.js
// Improved physics to prevent balls sticking together by resolving overlaps

document.addEventListener("DOMContentLoaded", function () {
  // --- Neon Glow Effect (Smooth multi-color ripple) ---
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // Waves only active when you press the drop-ball button:
  let wavesActive = false;
  let waveData = { centerX: 0, centerY: 0, radiusPx: 0, thicknessPx: 0 };
  const glowColors = [
    "#5EBD3E",
    "#FFB900",
    "#F78200",
    "#E23838",
    "#973999",
    "#009CDF"
  ];
  const maxDim = () => Math.max(window.innerWidth, window.innerHeight);

  // Parse hex to [r,g,b]
  function parseHexColor(hex) {
    const num = parseInt(hex.slice(1), 16);
    return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
  }
  // Interpolate between two [r,g,b]
  function lerpColor(a, b, t) {
    const r  = Math.round(a[0] + (b[0] - a[0]) * t);
    const g  = Math.round(a[1] + (b[1] - a[1]) * t);
    const bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return `rgb(${r},${g},${bl})`;
  }

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let startTime = null;
  function animateNeon(time) {
    if (startTime === null) startTime = time;
    const elapsed   = time - startTime;

    // Color cycling
    const segmentMs = 2000;
    const cycleMs   = segmentMs * glowColors.length;
    const progress  = (elapsed % cycleMs) / segmentMs;
    const idx       = Math.floor(progress);
    const frac      = progress - idx;
    const colA      = parseHexColor(glowColors[idx]);
    const colB      = parseHexColor(glowColors[(idx + 1) % glowColors.length]);
    const baseColor = lerpColor(colA, colB, frac);
    const ringColor = baseColor.replace("rgb", "rgba").replace(")", ",0.5)");

    // Ripple timing & size
    const ringPeriod  = 3000;              // faster ripple
    const ringProg    = (elapsed % ringPeriod) / ringPeriod;
    const ringRadiusP = ringProg * 100;    // percent for CSS
    const ringWidthP  = 3;                 // percent thickness
    // convert to pixels for physics
    const ringRadiusPx = (ringRadiusP / 100) * maxDim();
    const ringWidthPx  = (ringWidthP  / 100) * maxDim();

    // Record wave data if active
    if (wavesActive) {
      waveData = {
        centerX: mouseX,
        centerY: mouseY,
        radiusPx: ringRadiusPx,
        thicknessPx: ringWidthPx
      };
    }

    // Base glow: fades out by 35%
    const baseGlow = `radial-gradient(
      circle at ${mouseX}px ${mouseY}px,
      ${baseColor} 0%,
      transparent 35%
    )`;

    let background = baseGlow;

    // Only draw the ripple ring when waves are active
    if (wavesActive) {
      const ringGlow = `radial-gradient(
        circle at ${mouseX}px ${mouseY}px,
        transparent ${ringRadiusP}%,
        ${ringColor} ${ringRadiusP + ringWidthP}%,
        transparent ${ringRadiusP + ringWidthP}%
      )`;
      background += `, ${ringGlow}`;
    }

    neonContainer.style.background = background;
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
  function openPopup(popup) {
    dimmedOverlay.style.display = "block";
    popup.style.display = "block";
  }
  function closeAllPopups() {
    dimmedOverlay.style.display = "none";
    aboutPopup.style.display = contactPopup.style.display = adminPopup.style.display = "none";
  }

  profilePic.addEventListener("click", () => openPopup(aboutPopup));
  aboutLink.addEventListener("click", e => { e.preventDefault(); openPopup(aboutPopup); });
  contactLink.addEventListener("click", e => { e.preventDefault(); openPopup(contactPopup); });
  adminBtn.addEventListener("click", () => {
    openPopup(adminPopup);
    const pw = document.getElementById("admin-password"); pw.value = ""; pw.type = "password";
    document.getElementById("toggle-password").textContent = "Show";
    document.getElementById("admin-error").style.display = "none";
  });
  dimmedOverlay.addEventListener("click", closeAllPopups);

  // --- Admin Popup Controls ---
  document.getElementById("toggle-password").addEventListener("click", () => {
    const input = document.getElementById("admin-password");
    if (input.type === "password") { input.type = "text"; this.textContent = "Hide"; }
    else { input.type = "password"; this.textContent = "Show"; }
  });
  document.getElementById("submit-password").addEventListener("click", async () => {
    const buf     = new TextEncoder().encode(document.getElementById("admin-password").value);
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    const hash    = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,"0")).join("");
    const storedHash = "dd59dcfa4c076c4923715ba712abbb5cc1458152809a444674f571a4638c0345";
    if (hash === storedHash) window.location.href = "admin.html";
    else {
      document.getElementById("admin-password").value = "";
      document.getElementById("admin-error").style.display = "block";
    }
  });
  document.getElementById("cancel-password").addEventListener("click", () => {
    document.getElementById("admin-password").value = "";
    document.getElementById("admin-error").style.display = "none";
  });

  // --- Ball Physics & Collision ---
  const balls = [];
  const GRAVITY = 0.3;
  const RESTITUTION = 0.8;
  const WAVE_FORCE = 0.5;

  gravityBtn.addEventListener("click", () => {
    wavesActive = true;
    dropBall();
    resetBtn.style.display = "block";
    if (!quotesStarted) { startFallingQuotes(); quotesStarted = true; }
  });
  resetBtn.addEventListener("click", () => {
    wavesActive = false;
    resetBalls();
    resetBtn.style.display = "none";
  });

  function dropBall() {
    const ball = document.createElement("div");
    ball.className = "ball";
    const diameter = Math.random() * 30 + 40;

    // Initialize state
    ball.radius = diameter / 2;
    ball.mass   = Math.pow(ball.radius, 2);
    ball.x = Math.random() * (window.innerWidth - diameter);
    ball.y = 0;
    ball.vx = Math.random() * 2 - 1;
    ball.vy = Math.random() * 4 + 1;

    // Style
    ball.style.width  = diameter + "px";
    ball.style.height = diameter + "px";
    ball.style.left   = ball.x + "px";
    ball.style.top    = ball.y + "px";
    ball.style.backgroundColor = getRandomColor();

    document.body.appendChild(ball);
    balls.push(ball);
  }

  function resetBalls() {
    balls.forEach(b => b.remove());
    balls.length = 0;
  }

  function getRandomColor() {
    const letters = "89ABCDEF";
    return "#" + Array.from({length:6}, () => letters[Math.floor(Math.random()*letters.length)]).join("");
  }

  // --- Falling Quotes ---
  let quotesStarted = false;
  let quoteStartTime = Date.now();

  function startFallingQuotes() {
    setInterval(createFallingQuote, 10000);
    requestAnimationFrame(updateQuotes);
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
    const text = quotes[Math.floor(Math.random()*quotes.length)];
    const elem = document.createElement("div");
    elem.className = "falling-quote";
    elem.innerText = text;
    Object.assign(elem.style, {
      position: "absolute",
      color: "#eee",
      fontSize: "1.5rem",
      opacity: "0.9",
      pointerEvents: "none",
      zIndex: "11",
      left: (Math.random()*(window.innerWidth-300)) + "px",
      top: "-50px",
      animation: "fall 20s linear forwards"
    });
    quoteContainer.appendChild(elem);
    setTimeout(() => elem.remove(), 21000);
  }

  function updateQuotes() {
    const t = (Date.now() - quoteStartTime) / 1000;
    document.querySelectorAll(".falling-quote").forEach(q => {
      const init = parseFloat(q.dataset.initialLeft) || parseFloat(q.style.left);
      const amp = parseFloat(q.dataset.amp) || (Math.random()*20+10);
      const phase = parseFloat(q.dataset.phase) || (Math.random()*Math.PI*2);
      q.style.left = init + amp * Math.sin(t + phase) + "px";
    });
    requestAnimationFrame(updateQuotes);
  }

  function updateBalls() {
    const footerTop = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY;
    balls.forEach(b => {
      // gravity
      b.vy += GRAVITY;
      // position update
      b.x += b.vx;
      b.y += b.vy;

      // wall collisions
      if (b.x <= 0 || b.x + b.radius*2 >= window.innerWidth) {
        b.vx *= -RESTITUTION;
        b.x = Math.min(Math.max(b.x, 0), window.innerWidth - b.radius*2);
      }
      // floor
      if (b.y + b.radius*2 >= footerTop) {
        b.vy *= -RESTITUTION;
        b.vx *= RESTITUTION;
        b.y = footerTop - b.radius*2;
      }

      // wave push
      if (wavesActive) {
        const dx = (b.x + b.radius) - waveData.centerX;
        const dy = (b.y + b.radius) - waveData.centerY;
        const dist = Math.hypot(dx, dy);
        if (Math.abs(dist - waveData.radiusPx) < waveData.thicknessPx/2) {
          b.vx += (dx/dist) * WAVE_FORCE;
          b.vy += (dy/dist) * WAVE_FORCE;
        }
      }

      // apply to DOM
      b.style.left = b.x + "px";
      b.style.top  = b.y + "px";
    });
    handleBallCollisions();
    handleBallQuoteCollisions();
    requestAnimationFrame(updateBalls);
  }

  function handleBallCollisions() {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i+1; j < balls.length; j++) {
        const a = balls[i], b = balls[j];
        const dx = (b.x + b.radius) - (a.x + a.radius);
        const dy = (b.y + b.radius) - (a.y + a.radius);
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;
        if (dist < minDist) {
          // resolve overlap
          const overlap = (minDist - dist) / 2;
          const nx = dx/dist, ny = dy/dist;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          // update velocities
          const p = 2 * ((a.vx*nx + a.vy*ny) - (b.vx*nx + b.vy*ny)) / (a.mass + b.mass);
          a.vx -= p * b.mass * nx;
          a.vy -= p * b.mass * ny;
          b.vx += p * a.mass * nx;
          b.vy += p * a.mass * ny;
        }
      }
    }
  }

  function handleBallQuoteCollisions() {
    document.querySelectorAll(".falling-quote").forEach(q => {
      const rect = q.getBoundingClientRect();
      balls.forEach(b => {
        const bx = b.x + b.radius;
        const by = b.y + b.radius;
        const cx = Math.max(rect.left, Math.min(bx, rect.left + rect.width));
        const cy = Math.max(rect.top,  Math.min(by, rect.top + rect.height));
        const d = Math.hypot(bx - cx, by - cy);
        if (d < b.radius && b.vy > 0) {
          b.vy *= -RESTITUTION;
          q.style.transform = "scale(1.2)";
          setTimeout(() => q.style.transform = "scale(1)", 200);
        }
      });
    });
  }

  window.addEventListener("scroll", () => {
    const dir = window.scrollY > (this.lastScroll||0) ? 1 : -1;
    this.lastScroll = window.scrollY;
    balls.forEach(b => b.vy += dir * 0.5);
  });

  updateBalls();

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
