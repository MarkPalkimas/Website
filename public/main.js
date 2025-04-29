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
      adminPasswordInput.type         = "text";
      togglePasswordBtn.textContent = "Hide";
    } else {
      adminPasswordInput.type         = "password";
      togglePasswordBtn.textContent = "Show";
    }
  });

  const storedHash = "dd59dcfa4c076c4923715ba712abbb5cc1458152809a444674f571a4638c0345";
  async function hashPassword(str) {
    const buf     = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  submitPasswordBtn.addEventListener("click", async () => {
    const hash = await hashPassword(adminPasswordInput.value);
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

  // --- Ball Physics & Collision ---
  const balls = [];
  const GRAVITY = 0.3;
  const RESTITUTION = 0.8;
  const WAVE_FORCE = 0.5;

  gravityBtn.addEventListener("click", () => {
    wavesActive = true;
    dropBall();
    resetBtn.style.display = "block";
    if (!quotesStarted) {
      startFallingQuotes();
      quotesStarted = true;
    }
  });
  resetBtn.addEventListener("click", () => {
    wavesActive = false;
    resetBalls();
    resetBtn.style.display = "none";
  });

  function dropBall() {
    const ball = document.createElement("div");
    ball.className = "ball";
    ball.style.backgroundColor = getRandomColor();
    const diameter = Math.random() * 30 + 40;
    ball.style.width = diameter + "px";
    ball.style.height = diameter + "px";
    ball.style.left = Math.random() * (window.innerWidth - diameter) + "px";
    ball.style.top = "0px";
    ball.radius = diameter / 2;
    ball.mass = Math.pow(ball.radius, 2);
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

  // --- Falling Quotes ---
  let quotesStarted = false;
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
    const quoteText = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteElem = document.createElement("div");
    quoteElem.className = "falling-quote";
    quoteElem.innerText = quoteText;
    const initLeft = Math.random() * (window.innerWidth - 300);
    quoteElem.dataset.initialLeft = initLeft;
    quoteElem.dataset.amp = Math.random() * 20 + 10;
    quoteElem.dataset.phase = Math.random() * 2 * Math.PI;
    quoteElem.style.left = initLeft + "px";
    quoteElem.style.top = "-50px";
    quoteElem.style.animation = "fall 20s linear forwards";
    quoteContainer.appendChild(quoteElem);
    setTimeout(() => {
      if (quoteElem.parentElement) quoteElem.remove();
    }, 21000);
  }

  function updateQuotes() {
    const now = Date.now();
    document.querySelectorAll(".falling-quote").forEach(quote => {
      const initLeft = parseFloat(quote.dataset.initialLeft) || 0;
      const amp = parseFloat(quote.dataset.amp) || 0;
      const phase = parseFloat(quote.dataset.phase) || 0;
      const t = (now - quoteStartTime) / 1000;
      quote.style.left = initLeft + amp * Math.sin(t + phase) + "px";
    });
    requestAnimationFrame(updateQuotes);
  }

  function updateBalls() {
    balls.forEach(ball => {
      // apply gravity
      ball.velocityY += GRAVITY;

      // update positions
      let newTop  = parseFloat(ball.style.top) + ball.velocityY;
      let newLeft = parseFloat(ball.style.left) + ball.velocityX;

      // wall collisions
      if (newLeft <= 0 || newLeft + ball.radius * 2 >= window.innerWidth) {
        ball.velocityX *= -RESTITUTION;
        newLeft = Math.min(Math.max(newLeft, 0), window.innerWidth - ball.radius * 2);
      }

      // floor collision at footer
      const footerTop = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY;
      if (newTop + ball.radius * 2 >= footerTop) {
        ball.velocityY *= -RESTITUTION;
        ball.velocityX *= RESTITUTION;
        newTop = footerTop - ball.radius * 2;
      }

      // wave push
      if (wavesActive) {
        const bx = newLeft + ball.radius;
        const by = newTop  + ball.radius;
        const dx = bx - waveData.centerX;
        const dy = by - waveData.centerY;
        const dist = Math.hypot(dx, dy);
        if (Math.abs(dist - waveData.radiusPx) < waveData.thicknessPx / 2) {
          // push outward
          ball.velocityX += (dx / dist) * WAVE_FORCE;
          ball.velocityY += (dy / dist) * WAVE_FORCE;
        }
      }

      ball.style.top  = newTop + "px";
      ball.style.left = newLeft + "px";
    });

    handleBallCollisions();
    handleBallQuoteCollisions();
    requestAnimationFrame(updateBalls);
  }

  function handleBallCollisions() {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j];
        const dx = (parseFloat(b.style.left) + b.radius) - (parseFloat(a.style.left) + a.radius);
        const dy = (parseFloat(b.style.top)  + b.radius) - (parseFloat(a.style.top)  + a.radius);
        const dist = Math.hypot(dx, dy);
        if (dist < a.radius + b.radius) {
          const nx = dx / dist, ny = dy / dist;
          const p  = 2 * (a.velocityX * nx + a.velocityY * ny - b.velocityX * nx - b.velocityY * ny) /
                     (a.mass + b.mass);
          a.velocityX -= p * b.mass * nx;
          a.velocityY -= p * b.mass * ny;
          b.velocityX += p * a.mass * nx;
          b.velocityY += p * a.mass * ny;
        }
      }
    }
  }

  function handleBallQuoteCollisions() {
    document.querySelectorAll(".falling-quote").forEach(quote => {
      const rect = quote.getBoundingClientRect();
      balls.forEach(ball => {
        const bx = parseFloat(ball.style.left) + ball.radius;
        const by = parseFloat(ball.style.top)  + ball.radius;
        const closestX = Math.max(rect.left, Math.min(bx, rect.left + rect.width));
        const closestY = Math.max(rect.top,  Math.min(by, rect.top  + rect.height));
        const d = Math.hypot(bx - closestX, by - closestY);
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
