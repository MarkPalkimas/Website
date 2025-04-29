document.addEventListener("DOMContentLoaded", function () {
  // --- Neon Glow Effect (Subtle, outward‐ripple leaving new color behind) ---
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

  // Helpers to parse and mix colors
  function parseHexColor(hex) {
    const num = parseInt(hex.slice(1), 16);
    return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
  }
  function lerpRGB(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }
  function rgbString(c)   { return `rgb(${c[0]},${c[1]},${c[2]})`; }
  function rgbaString(c,a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

  // Track mouse for ripple center
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let startTime = null;
  function animateNeon(time) {
    if (startTime === null) startTime = time;
    const elapsed = time - startTime;

    // Color interpolation
    const segMs   = 2000;
    const cycleMs = segMs * glowColors.length;
    const prog    = (elapsed % cycleMs) / segMs;
    const idx     = Math.floor(prog);
    const frac    = prog - idx;

    const cA     = parseHexColor(glowColors[idx]);
    const cB     = parseHexColor(glowColors[(idx + 1) % glowColors.length]);
    const currRGB = lerpRGB(cA, cB, frac);
    const currColor = rgbString(currRGB);
    const nextRGB   = parseHexColor(glowColors[(idx + 1) % glowColors.length]);

    // Ripple parameters
    const ripplePeriod = 3000;                 // 3 seconds per wave
    const rippleProg   = (elapsed % ripplePeriod) / ripplePeriod;
    const radiusPct    = 40 + rippleProg * 80; // 40%→120%
    const thickness    = 1;                    // 1% ring
    const ringColor    = rgbaString(nextRGB, 0.1);

    // Base fill: currentColor inside circle
    const baseGlow =
      `radial-gradient(circle at ${mouseX}px ${mouseY}px, ` +
      `${currColor} 0%, ${currColor} 60%, transparent 100%)`;

    // Ripple ring of nextColor
    const ringGlow =
      `radial-gradient(circle at ${mouseX}px ${mouseY}px, ` +
      `transparent ${radiusPct - thickness}%, ` +
      `${ringColor} ${radiusPct}%, transparent ${radiusPct + thickness}%)`;

    neonContainer.style.background = `${baseGlow}, ${ringGlow}`;

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

  // Popups
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
    document.getElementById("admin-error").style.display     = "none";
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

  // 🔒 SHA-256 check for “M@rk2005”
  const storedHash = "dd59dcfa4c076c4923715ba712abbb5cc1458152809a444674f571a4638c0345";
  async function hashPassword(str) {
    const buf     = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2,"0")).join("");
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
    if (!quotesStarted) { startFallingQuotes(); quotesStarted = true; }
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
    ball.radius = diameter / 2;
    ball.mass   = Math.pow(ball.radius, 2);
    ball.velocityX = Math.random() * 2 - 1;
    ball.velocityY = Math.random() * 4 + 1;
    document.body.appendChild(ball);
    balls.push(ball);
  }

  function resetBalls() {
    balls.forEach(b => b.remove());
    balls.length = 0;
  }

  function getRandomColor() {
    const letters = "89ABCDEF", len = letters.length;
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * len)];
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
    const text = quotes[Math.floor(Math.random() * quotes.length)];
    const q = document.createElement("div");
    q.className = "falling-quote";
    q.innerText = text;
    const initLeft = Math.random() * (window.innerWidth - 300);
    q.dataset.initialLeft = initLeft;
    q.dataset.amp = Math.random() * 20 + 10;
    q.dataset.phase = Math.random() * 2 * Math.PI;
    q.style.left = initLeft + "px";
    q.style.top  = "-50px";
    q.style.animation = "fall 20s linear forwards";
    quoteContainer.appendChild(q);
    setTimeout(() => {
      if (q.parentElement) q.parentElement.removeChild(q);
    }, 21000);
  }
  function updateQuotes() {
    const now = Date.now();
    document.querySelectorAll(".falling-quote").forEach(q => {
      const initLeft = parseFloat(q.dataset.initialLeft) || 0;
      const amp      = parseFloat(q.dataset.amp) || 0;
      const phase    = parseFloat(q.dataset.phase) || 0;
      const t        = (now - quoteStartTime) / 1000;
      q.style.left = initLeft + amp * Math.sin(t + phase) + "px";
    });
    requestAnimationFrame(updateQuotes);
  }

  function updateBalls() {
    balls.forEach(ball => {
      ball.velocityY += GRAVITY;
      let top  = parseFloat(ball.style.top),
          left = parseFloat(ball.style.left),
          newTop  = top  + ball.velocityY,
          newLeft = left + ball.velocityX;

      if (newLeft <= 0) {
        newLeft = 0;
        ball.velocityX = -ball.velocityX * RESTITUTION;
      }
      if (newLeft + ball.radius*2 >= window.innerWidth) {
        newLeft = window.innerWidth - ball.radius*2;
        ball.velocityX = -ball.velocityX * RESTITUTION;
      }

      const footerRect = document.querySelector(".footer").getBoundingClientRect();
      const footerTop  = footerRect.top + window.scrollY;
      if (newTop + ball.radius*2 >= footerTop) {
        newTop = footerTop - ball.radius*2;
        ball.velocityY = -ball.velocityY * RESTITUTION;
        ball.velocityX *= RESTITUTION;
      }

      ball.style.top  = newTop  + "px";
      ball.style.left = newLeft + "px";
    });

    handleBallCollisions();
    handleBallQuoteCollisions();
    requestAnimationFrame(updateBalls);
  }

  function handleBallCollisions() {
    for (let i = 0; i < balls.length; i++) {
      const A = balls[i];
      const xA = parseFloat(A.style.left) + A.radius;
      const yA = parseFloat(A.style.top ) + A.radius;
      for (let j = i+1; j < balls.length; j++) {
        const B = balls[j];
        const xB = parseFloat(B.style.left) + B.radius;
        const yB = parseFloat(B.style.top ) + B.radius;
        const dx = xB-xA, dy = yB-yA, dist=Math.hypot(dx,dy);
        if (dist < A.radius+B.radius && dist>0) {
          const nx=dx/dist, ny=dy/dist, tx=-ny, ty=nx;
          const vA_n = A.velocityX*nx + A.velocityY*ny;
          const vB_n = B.velocityX*nx + B.velocityY*ny;
          const v_n2A = (vA_n*(A.mass-B.mass)+2*B.mass*vB_n)/(A.mass+B.mass);
          const v_n2B = (vB_n*(B.mass-A.mass)+2*A.mass*vA_n)/(A.mass+B.mass);
          const vA_t = A.velocityX*tx + A.velocityY*ty;
          const vB_t = B.velocityX*tx + B.velocityY*ty;
          A.velocityX = v_n2A*nx + vA_t*tx;
          A.velocityY = v_n2A*ny + vA_t*ty;
          B.velocityX = v_n2B*nx + vB_t*tx;
          B.velocityY = v_n2B*ny + vB_t*ty;
          const overlap = A.radius+B.radius-dist;
          const sepX = nx*(overlap/2), sepY = ny*(overlap/2);
          A.style.left = parseFloat(A.style.left)-sepX + "px";
          A.style.top  = parseFloat(A.style.top)-sepY + "px";
          B.style.left = parseFloat(B.style.left)+sepX + "px";
          B.style.top  = parseFloat(B.style.top)+sepY + "px";
        }
      }
    }
  }

  function handleBallQuoteCollisions() {
    document.querySelectorAll(".falling-quote").forEach(q => {
      balls.forEach(ball => {
        const r  = ball.radius,
              x  = parseFloat(ball.style.left)+r,
              y  = parseFloat(ball.style.top )+r;
        const rect = q.getBoundingClientRect(),
              qx   = rect.left,
              qy   = rect.top+window.scrollY,
              qw   = rect.width,
              qh   = rect.height;
        if (ball.velocityY>0 && y<qy) {
          const cx=Math.max(qx,Math.min(x,qx+qw)),
                cy=Math.max(qy,Math.min(y,qy+qh)),
                d = Math.hypot(x-cx,y-cy);
          if (d<r) {
            ball.velocityX*=-RESTITUTION;
            ball.velocityY*=-RESTITUTION;
            q.style.transform="scale(1.2)";
            setTimeout(()=>q.style.transform="scale(1)",200);
          }
        }
      });
    });
  }

  // Start simulation
  updateBalls();
  startFallingQuotes();

  // ────────────────────────────────────────────────────────────
  // 🚀 Visitor Tracking via localStorage
  async function logVisitor() {
    try {
      const res  = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      const ip       = data.ip;
      const location = `${data.city}, ${data.region}, ${data.country_name}`;
      const now      = new Date().toISOString();
      const logs     = JSON.parse(localStorage.getItem("visitorLogs")||"{}");
      if (logs[ip]) {
        logs[ip].count++;
        logs[ip].latestTime = now;
      } else {
        logs[ip] = { count:1, latestTime:now, location };
      }
      localStorage.setItem("visitorLogs", JSON.stringify(logs));
    } catch(e){ console.error("logVisitor error:",e); }
  }
  logVisitor();
});
