// public/main.js
document.addEventListener("DOMContentLoaded", function () {
  // --- Neon Glow & Pulse-on-Click Setup ---
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let clickPending = false;
  let pulseStart   = null;
  let pulseCenter  = { x: 0, y: 0 };
  let wavesActive  = false;
  let waveData     = { centerX: 0, centerY: 0, radiusPx: 0, thicknessPx: 0 };

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
  const DAMPING      = 1.0;    // no global damping to preserve bounciness
  const SLEEP_THRESH = 0.05;   // threshold below which velocities zero out
  const COLLISION_EPS= 0.5;    // ignore tiny overlaps to prevent jitter

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

  // track mouse for glow position
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;    
    mouseY = e.clientY;
  });

  // trigger a pulse on any click (falls through UI clicks too)
  document.body.addEventListener("click", e => {
    clickPending = true;
    pulseCenter.x = e.clientX;
    pulseCenter.y = e.clientY;
  });

  // --- Animation Loop for Neon Glow & Pulse ---
  let startTime = null;
  function animateNeon(time) {
    if (startTime === null) startTime = time;
    const elapsed = time - startTime;

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

    // handle pending click to start a pulse
    if (clickPending) {
      wavesActive  = true;
      pulseStart   = elapsed;
      clickPending = false;
    }

    // always show base glow at mouse
    const baseGlow = `radial-gradient(
      circle at ${mouseX}px ${mouseY}px,
      ${baseColor} 0%,
      transparent 35%
    )`;
    let background = baseGlow;

    // if pulse active, draw one expanding ring
    const ringPeriod = 3000;
    const ringWidthP = 3;
    if (wavesActive && pulseStart !== null) {
      const pulseElapsed = elapsed - pulseStart;
      if (pulseElapsed <= ringPeriod) {
        const ringProg    = pulseElapsed / ringPeriod;
        const ringRadiusP = ringProg * 100;
        const ringGlow    = `radial-gradient(
          circle at ${pulseCenter.x}px ${pulseCenter.y}px,
          transparent ${ringRadiusP}%,
          ${ringColor} ${ringRadiusP + ringWidthP}%,
          transparent ${ringRadiusP + ringWidthP}%
        )`;
        background += `, ${ringGlow}`;

        // update wave data for physics
        waveData = {
          centerX:    pulseCenter.x,
          centerY:    pulseCenter.y,
          radiusPx:   (ringRadiusP  / 100) * maxDim(),
          thicknessPx:(ringWidthP   / 100) * maxDim()
        };
      } else {
        // end of pulse
        wavesActive = false;
        pulseStart  = null;
      }
    }

    neonContainer.style.background = background;
    requestAnimationFrame(animateNeon);
  }
  requestAnimationFrame(animateNeon);

  // --- UI & Popup Controls ---
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
    ball.style.left   = Math.random() * (window.innerWidth - diameter) + "px";
    ball.style.top    = "0px";
    ball.radius    = diameter / 2;
    ball.mass      = Math.pow(ball.radius, 2);
    ball.velocityX = Math.random() * 2 - 1;
    ball.velocityY = Math.random() * 4 + 1;
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

  function updateBalls() {
    balls.forEach(ball => {
      // apply gravity
      ball.velocityY += GRAVITY;

      // apply (or skip) damping
      ball.velocityX *= DAMPING;
      ball.velocityY *= DAMPING;

      // zero small velocities
      if (Math.abs(ball.velocityX) < SLEEP_THRESH) ball.velocityX = 0;
      if (Math.abs(ball.velocityY) < SLEEP_THRESH) ball.velocityY = 0;

      // compute next pos
      let newLeft = parseFloat(ball.style.left) + ball.velocityX;
      let newTop  = parseFloat(ball.style.top ) + ball.velocityY;

      // wall collision
      if (newLeft <= 0 || newLeft + ball.radius * 2 >= window.innerWidth) {
        ball.velocityX = -ball.velocityX * RESTITUTION;
        newLeft = Math.min(Math.max(newLeft, 0), window.innerWidth - ball.radius * 2);
      }

      // floor collision
      const footerTop = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY;
      if (newTop + ball.radius*2 >= footerTop) {
        // bounce
        ball.velocityY = -ball.velocityY * RESTITUTION;
        ball.velocityX *= RESTITUTION;
        newTop = footerTop - ball.radius*2;
        // if nearly at rest on floor, lock it
        if (Math.abs(ball.velocityY) < SLEEP_THRESH && Math.abs(ball.velocityX) < SLEEP_THRESH) {
          ball.velocityY = 0;
          ball.velocityX = 0;
        }
      }

      // wave push
      if (wavesActive) {
        const bx = newLeft + ball.radius;
        const by = newTop  + ball.radius;
        const dx = bx - waveData.centerX;
        const dy = by - waveData.centerY;
        const dist = Math.hypot(dx, dy);
        if (Math.abs(dist - waveData.radiusPx) < waveData.thicknessPx / 2) {
          ball.velocityX += (dx / dist) * WAVE_FORCE;
          ball.velocityY += (dy / dist) * WAVE_FORCE;
        }
      }

      // apply
      ball.style.left = newLeft + "px";
      ball.style.top  = newTop  + "px";
    });

    handleBallCollisions();
    handleBallQuoteCollisions();
    requestAnimationFrame(updateBalls);
  }

  function handleBallCollisions() {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j];
        const ax = parseFloat(a.style.left) + a.radius;
        const ay = parseFloat(a.style.top ) + a.radius;
        const bx = parseFloat(b.style.left) + b.radius;
        const by = parseFloat(b.style.top ) + b.radius;
        const dx = bx - ax;
        const dy = by - ay;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;
        const overlap = minDist - dist;
        // only resolve significant overlaps
        if (overlap > COLLISION_EPS) {
          // push apart
          const ux = dx / dist;
          const uy = dy / dist;
          a.style.left = (ax - ux * overlap/2 - a.radius) + "px";
          a.style.top  = (ay - uy * overlap/2 - a.radius) + "px";
          b.style.left = (bx + ux * overlap/2 - b.radius) + "px";
          b.style.top  = (by + uy * overlap/2 - b.radius) + "px";

          // elastic collision
          const p = 2 * (a.velocityX*ux + a.velocityY*uy - b.velocityX*ux - b.velocityY*uy)
                    / (a.mass + b.mass);
          a.velocityX -= p * b.mass * ux;
          a.velocityY -= p * b.mass * uy;
          b.velocityX += p * a.mass * ux;
          b.velocityY += p * a.mass * uy;
        }
      }
    }
  }

  function handleBallQuoteCollisions() {
    document.querySelectorAll(".falling-quote").forEach(quote => {
      const rect = quote.getBoundingClientRect();
      balls.forEach(ball => {
        const bx = parseFloat(ball.style.left) + ball.radius;
        const by = parseFloat(ball.style.top ) + ball.radius;
        const cx = Math.max(rect.left, Math.min(bx, rect.left + rect.width));
        const cy = Math.max(rect.top,  Math.min(by, rect.top  + rect.height));
        const d  = Math.hypot(bx - cx, by - cy);
        if (d < ball.radius && ball.velocityY > 0) {
          ball.velocityY *= -RESTITUTION;
          quote.style.transform = "scale(1.2)";
          setTimeout(() => quote.style.transform = "scale(1)", 200);
        }
      });
    });
  }

  window.addEventListener("scroll", () => {
    const dir = window.scrollY > (this.lastScroll || 0) ? 1 : -1;
    this.lastScroll = window.scrollY;
    balls.forEach(b => b.velocityY += dir * 0.5);
  });

  updateBalls();

  // --- Falling Quotes ---
  let quotesStarted  = false;
  let quoteStartTime = Date.now();

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

  // --- Visitor Logging ---
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
