document.addEventListener("DOMContentLoaded", function () {
  // --- Neon Glow Effect (Subtle ocean-wave ripple) ---
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  const glowColors = [
    "#5EBD3E",
    "#FFB900",
    "#F78200",
    "#E23838",
    "#973999",
    "#009CDF"
  ];

  // Parse a hex string like "#FF5733" into [r,g,b]
  function parseHexColor(hex) {
    const num = parseInt(hex.slice(1), 16);
    return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
  }
  // Linearly interpolate two [r,g,b] at fraction t
  function lerpRGB(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }
  // Convert [r,g,b] to "rgb(r,g,b)"
  function rgbToString(c) {
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }
  // Convert [r,g,b] to "rgba(r,g,b,a)"
  function rgbaString(c, a) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }

  // Track mouse for gradient center
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let startTime = null;
  function animateNeon(time) {
    if (startTime === null) startTime = time;
    const elapsed   = time - startTime;

    // ─── Color interpolation ───
    const segMs   = 2000;
    const cycleMs = segMs * glowColors.length;
    const prog    = (elapsed % cycleMs) / segMs;
    const idx     = Math.floor(prog);
    const frac    = prog - idx;

    const cA = parseHexColor(glowColors[idx]);
    const cB = parseHexColor(glowColors[(idx + 1) % glowColors.length]);
    const currRGB = lerpRGB(cA, cB, frac);
    const currColor = rgbToString(currRGB);

    // ─── Gentle outward wave ring ───
    const ringPeriod = 4000;                          // 4s per wave
    const ringProg   = (elapsed % ringPeriod) / ringPeriod;
    const ringRadius = 50 + ringProg * 50;            // 50% → 100%
    const ringWidth  = 2;                             // 2% thickness
    const ringColor  = rgbaString(currRGB, 0.25);     // 25% opacity

    // Base soft glow + thin translucent ring
    neonContainer.style.background =
      `radial-gradient(circle at ${mouseX}px ${mouseY}px, ${currColor} 0%, transparent 70%),` +
      `radial-gradient(circle at ${mouseX}px ${mouseY}px, transparent ${ringRadius - ringWidth}%, ` +
        `${ringColor} ${ringRadius}%, transparent ${ringRadius + ringWidth}%)`;

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

  // Select popups by their IDs from the popups container
  const aboutPopup   = document.getElementById("about-popup");
  const contactPopup = document.getElementById("contact-popup");
  const adminPopup   = document.getElementById("admin-popup");

  // --- Popup Controls ---
  profilePic.addEventListener("click", () => {
    dimmedOverlay.style.display = "block";
    aboutPopup.style.display    = "block";
  });
  aboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    dimmedOverlay.style.display = "block";
    aboutPopup.style.display    = "block";
  });
  contactLink.addEventListener("click", (e) => {
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
    aboutPopup.style.display   =
    contactPopup.style.display =
    adminPopup.style.display   = "none";
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

  // ────────────────────────────────────────────────────────────
  // 🔒 SHA-256 check for “M@rk2005”
  // ────────────────────────────────────────────────────────────
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

  gravityBtn.addEventListener("click", () => {
    dropBall();
    resetBtn.style.display = "block";
    if (!quotesStarted) {
      startFallingQuotes();
      quotesStarted = true;
    }
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
    setInterval(() => {
      createFallingQuote();
    }, 10000);
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
      if (quoteElem.parentElement) quoteElem.parentElement.removeChild(quoteElem);
    }, 21000);
  }

  function updateQuotes() {
    const now = Date.now();
    const quotes = document.querySelectorAll(".falling-quote");
    quotes.forEach(quote => {
      const initLeft = parseFloat(quote.dataset.initialLeft) || 0;
      const amp = parseFloat(quote.dataset.amp) || 0;
      const phase = parseFloat(quote.dataset.phase) || 0;
      const t = (now - quoteStartTime) / 1000;
      const offset = amp * Math.sin(t + phase);
      quote.style.left = (initLeft + offset) + "px");
    });
    requestAnimationFrame(updateQuotes);
  }

  function updateBalls() {
    balls.forEach(ball => {
      ball.velocityY += GRAVITY;

      let currentTop = parseFloat(ball.style.top);
      let currentLeft = parseFloat(ball.style.left);
      let newTop = currentTop + ball.velocityY;
      let newLeft = currentLeft + ball.velocityX;

      if (newLeft <= 0) {
        newLeft = 0;
        ball.velocityX = -ball.velocityX * RESTITUTION;
      }
      if (newLeft + ball.radius * 2 >= window.innerWidth) {
        newLeft = window.innerWidth - ball.radius * 2;
        ball.velocityX = -ball.velocityX * RESTITUTION;
      }

      const footerTop = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY);
      if (newTop + ball.radius * 2 >= footerTop) {
        newTop = footerTop - ball.radius * 2;
        ball.velocityY = -ball.velocityY * RESTITUTION);
        ball.velocityX *= RESTITUTION);
      }

      ball.style.top = newTop + "px";
      ball.style.left = newLeft + "px";
    });

    handleBallCollisions();
    handleBallQuoteCollisions();

    requestAnimationFrame(updateBalls);
  }

  function handleBallCollisions() {
    for (let i = 0; i < balls.length; i++) {
      const ballA = balls[i];
      const xA = parseFloat(ballA.style.left) + ballA.radius;
      const yA = parseFloat(ballA.style.top) + ballA.radius;
      for (let j = i + 1; j < balls.length; j++) {
        const ballB = balls[j];
        const xB = parseFloat(ballB.style.left) + ballB.radius;
        const yB = parseFloat(ballB.style.top) + ballB.radius;
        const dx = xB - xA;
        const dy = yB - yA;
        const dist = Math.hypot(dx, dy);
        if (dist < ballA.radius + ballB.radius && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const tx = -ny;
          const ty = nx;

          const vA_n = ballA.velocityX * nx + ballA.velocityY * ny;
          const vA_t = ballA.velocityX * tx + ballA.velocityY * ty;
          const vB_n = ballB.velocityX * nx + ballB.velocityY * ny;
          const vB_t = ballB.velocityX * tx + ballB.velocityY * ty;

          const vA_n_after = (
            (vA_n * (ballA.mass - ballB.mass) + 2 * ballB.mass * vB_n) /
            (ballA.mass + ballB.mass)
          );
          const vB_n_after = (
            (vB_n * (ballB.mass - ballA.mass) + 2 * ballA.mass * vA_n) /
            (ballA.mass + ballB.mass)
          );

          ballA.velocityX = vA_n_after * nx + vA_t * tx;
          ballA.velocityY = vA_n_after * ny + vA_t * ty;
          ballB.velocityX = vB_n_after * nx + vB_t * tx;
          ballB.velocityY = vB_n_after * ny + vB_t * ty;

          const overlap = ballA.radius + ballB.radius - dist;
          const sepX = nx * (overlap / 2);
          const sepY = ny * (overlap / 2);
          ballA.style.left = (parseFloat(ballA.style.left) - sepX) + "px");
          ballA.style.top = (parseFloat(ballA.style.top) - sepY) + "px");
          ballB.style.left = (parseFloat(ballB.style.left) + sepX) + "px");
          ballB.style.top = (parseFloat(ballB.style.top) + sepY) + "px");
        }
      }
    }
  }

  function handleBallQuoteCollisions() {
    const quoteElems = document.querySelectorAll(".falling-quote");
    balls.forEach(ball => {
      const r = ball.radius;
      const x = parseFloat(ball.style.left) + r;
      const y = parseFloat(ball.style.top) + r;
      quoteElems.forEach(q => {
        const rect = q.getBoundingClientRect();
        const qx = rect.left;
        const qy = rect.top + window.scrollY);
        const qw = rect.width;
        const qh = rect.height;
        if (ball.velocityY > 0 && y < qy) {
          const cx = Math.max(qx, Math.min(x, qx + qw));
          const cy = Math.max(qy, Math.min(y, qy + qh));
          const d = Math.hypot(x - cx, y - cy);
          if (d < r) {
            ball.velocityX = -ball.velocityX * RESTITUTION);
            ball.velocityY = -ball.velocityY * RESTITUTION);
            q.style.transform = "scale(1.2)";
            setTimeout(()=> q.style.transform = "scale(1)", 200);
          }
        }
      });
    });
  }

  let lastScrollTop = window.scrollY;
  window.addEventListener("scroll", () => {
    const st = window.scrollY;
    const dir = st > lastScrollTop ? 1 : -1;
    lastScrollTop = st;
    balls.forEach(b => b.velocityY += dir * 0.5);
  });

  updateBalls();

  // ────────────────────────────────────────────────────────────
  // 🚀 Visitor Tracking via localStorage (IP → count, latestTime, location)
  // ────────────────────────────────────────────────────────────
  async function logVisitor() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      const ip = data.ip;
      const location = `${data.city}, ${data.region}, ${data.country_name}`;
      const now = new Date().toISOString();

      const logs = JSON.parse(localStorage.getItem("visitorLogs") || "{}");
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
