// public/main.js
document.addEventListener("DOMContentLoaded", async function () {
  // ────────────────────────────────────────────────────────────
  // --- Neon Glow & Pulse‐on‐Click Setup (outward‐only ripple) ---
  // ────────────────────────────────────────────────────────────
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
  const RING_PERIOD = 3000;      // ms per pulse
  const RING_WIDTHP = 3;         // thickness as % of maxDim
  const segmentMs  = 2000;       // time per color segment

  function maxDim() {
    return Math.max(window.innerWidth, window.innerHeight);
  }
  function parseHexColor(hex) {
    const num = parseInt(hex.slice(1), 16);
    return [ (num >> 16)&255, (num >> 8)&255, num&255 ];
  }
  function lerpColor(a, b, t) {
    const r = Math.round(a[0] + (b[0]-a[0])*t);
    const g = Math.round(a[1] + (b[1]-a[1])*t);
    const bl= Math.round(a[2] + (b[2]-a[2])*t);
    return `rgb(${r},${g},${bl})`;
  }

  let pulses = [];
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  document.body.addEventListener("click", e => {
    if (!e.target.closest(".footer")) {
      pulses.push({ x:e.clientX, y:e.clientY, start:performance.now() });
    }
  });

  let neonStart = null;
  function animateNeon(ts) {
    if (!neonStart) neonStart = ts;
    const elapsed = ts - neonStart;

    // color cycling
    const cycleMs  = segmentMs * glowColors.length;
    const prog     = (elapsed % cycleMs)/segmentMs;
    const idx      = Math.floor(prog);
    const frac     = prog - idx;
    const cA       = parseHexColor(glowColors[idx]);
    const cB       = parseHexColor(glowColors[(idx+1)%glowColors.length]);
    const baseColor= lerpColor(cA, cB, frac);
    const ringColor= baseColor.replace("rgb","rgba").replace(")"," ,0.5)");

    // base glow
    let bg = `radial-gradient(circle at ${mouseX}px ${mouseY}px, ${baseColor} 0%, transparent 35%)`;

    // pulses
    pulses.forEach(p => {
      const dt = ts - p.start;
      if (dt <= RING_PERIOD) {
        const pct = (dt/RING_PERIOD)*100;
        const thickness = (RING_WIDTHP/100)*maxDim();
        bg += `, radial-gradient(circle at ${p.x}px ${p.y}px, transparent ${pct}%, ${ringColor} ${pct+RING_WIDTHP}%, transparent ${pct+RING_WIDTHP}%)`;
      }
    });

    neonContainer.style.background = bg;
    pulses = pulses.filter(p => (ts - p.start) <= RING_PERIOD);
    requestAnimationFrame(animateNeon);
  }
  requestAnimationFrame(animateNeon);

  // ────────────────────────────────────────────────────────────
  // --- UI Elements & Popup Controls --------------------------
  // ────────────────────────────────────────────────────────────
  const profilePic     = document.querySelector(".profile-photo");
  const aboutLink      = document.querySelector(".about-link");
  const contactLink    = document.querySelector(".contact-link");
  const adminBtn       = document.querySelector(".admin-btn");
  const gravityBtn     = document.querySelector(".gravity-btn");
  const resetBtn       = document.querySelector(".reset-btn");
  const dimmed         = document.querySelector(".dimmed");
  const quoteContainer = document.getElementById("quote-container");

  const aboutPopup   = document.getElementById("about-popup");
  const contactPopup = document.getElementById("contact-popup");
  const adminPopup   = document.getElementById("admin-popup");

  function openPopup(popup) {
    dimmed.style.display = "block";
    popup.style.display  = "block";
  }
  function closeAllPopups() {
    [aboutPopup, contactPopup, adminPopup].forEach(p => p.style.display="none");
    dimmed.style.display = "none";
  }

  profilePic.addEventListener("click", () => openPopup(aboutPopup));
  aboutLink.addEventListener("click", e => { e.preventDefault(); openPopup(aboutPopup); });
  contactLink.addEventListener("click", e => { e.preventDefault(); openPopup(contactPopup); });
  adminBtn.addEventListener("click", () => {
    openPopup(adminPopup);
    const pw = document.getElementById("admin-password");
    pw.value = ""; pw.type = "password";
    document.getElementById("toggle-password").textContent = "Show";
    document.getElementById("admin-error").style.display = "none";
  });
  dimmed.addEventListener("click", closeAllPopups);

  // ────────────────────────────────────────────────────────────
  // --- Admin SHA-256 Login ------------------------------------
  // ────────────────────────────────────────────────────────────
  const adminPasswordInput = document.getElementById("admin-password");
  const togglePasswordBtn  = document.getElementById("toggle-password");
  const submitPasswordBtn  = document.getElementById("submit-password");
  const cancelPasswordBtn  = document.getElementById("cancel-password");
  const errorMessage       = document.getElementById("admin-error");
  const storedHash         = "dd59dcfa4c076c4923715ba712abbb5cc1458152809a444674f571a4638c0345";

  togglePasswordBtn.addEventListener("click", () => {
    if (adminPasswordInput.type === "password") {
      adminPasswordInput.type = "text";
      togglePasswordBtn.textContent = "Hide";
    } else {
      adminPasswordInput.type = "password";
      togglePasswordBtn.textContent = "Show";
    }
  });

  async function hashPassword(str) {
    const buf     = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2,"0")).join("");
  }

  submitPasswordBtn.addEventListener("click", async () => {
    const hash = await hashPassword(adminPasswordInput.value);
    if (hash === storedHash) {
      closeAllPopups();
      window.location.href = "admin.html";
    } else {
      adminPasswordInput.value = "";
      errorMessage.style.display = "block";
    }
  });
  cancelPasswordBtn.addEventListener("click", () => {
    adminPasswordInput.value = "";
    errorMessage.style.display = "none";
  });

  // ────────────────────────────────────────────────────────────
  // --- Ball Physics & Interaction -----------------------------
  // ────────────────────────────────────────────────────────────
  const balls = [];
  const GRAVITY     = 0.3;
  const RESTITUTION = 0.8;
  const WAVE_FORCE  = 1.8;
  const SLEEP_THRESH= 0.05;

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

  function getRandomColor() {
    const letters = "89ABCDEF";
    let color = "#";
    for (let i=0; i<6; i++) color += letters[Math.floor(Math.random()*letters.length)];
    return color;
  }

  function dropBall() {
    const ball = document.createElement("div");
    ball.className = "ball";
    const d = Math.random()*30+40;
    ball.style.width  = d+"px";
    ball.style.height = d+"px";
    ball.style.backgroundColor = getRandomColor();
    ball.x  = Math.random()*(window.innerWidth-d);
    ball.y  = 0;
    ball.vx = Math.random()*2-1;
    ball.vy = Math.random()*4+1;
    ball.radius = d/2;
    ball.mass   = Math.PI*ball.radius*ball.radius;
    document.body.appendChild(ball);
    balls.push(ball);
  }

  function resetBalls() {
    balls.forEach(b=>b.remove());
    balls.length = 0;
  }

  function updateBalls() {
    const footerTop = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY;
    balls.forEach(b=>{
      // gravity
      b.vy += GRAVITY;
      // wave impulses
      pulses.forEach(p=>{
        const dt = performance.now() - p.start;
        if (dt<=RING_PERIOD) {
          const R = (dt/RING_PERIOD)*maxDim();
          const T = (RING_WIDTHP/100)*maxDim();
          const dx = (b.x+b.radius)-p.x;
          const dy = (b.y+b.radius)-p.y;
          const dist = Math.hypot(dx,dy);
          if (Math.abs(dist-R) < T/2) {
            b.vx += (dx/dist)*WAVE_FORCE;
            b.vy += (dy/dist)*WAVE_FORCE;
          }
        }
      });

      // integrate
      b.x += b.vx;
      b.y += b.vy;

      // wall collisions
      if (b.x<=0) {
        b.x=0; b.vx=-b.vx*RESTITUTION;
      } else if (b.x+2*b.radius>=window.innerWidth) {
        b.x=window.innerWidth-2*b.radius; b.vx=-b.vx*RESTITUTION;
      }
      // floor collision
      if (b.y+2*b.radius>=footerTop) {
        b.y=footerTop-2*b.radius;
        b.vy=-b.vy*RESTITUTION;
        if (Math.abs(b.vy)<SLEEP_THRESH) b.vy=0;
        if (Math.abs(b.vx)<SLEEP_THRESH) b.vx=0;
      }
      // apply positions
      b.style.left = b.x+"px";
      b.style.top  = b.y+"px";
    });

    handleBallCollisions();
    requestAnimationFrame(updateBalls);
  }

  function handleBallCollisions() {
    for (let i=0; i<balls.length; i++) {
      for (let j=i+1; j<balls.length; j++) {
        const A=balls[i], B=balls[j];
        const dx=(B.x-A.x), dy=(B.y-A.y);
        const dist=Math.hypot(dx,dy), minD=A.radius+B.radius;
        if (dist<minD && dist>0) {
          // normalize
          const nx=dx/dist, ny=dy/dist;
          // overlap resolve
          const overlap=(minD-dist)/2;
          A.x -= nx*overlap; A.y -= ny*overlap;
          B.x += nx*overlap; B.y += ny*overlap;
          // velocities along normal
          const vA=A.vx*nx + A.vy*ny;
          const vB=B.vx*nx + B.vy*ny;
          const mSum = A.mass + B.mass;
          const imp = (2*(vB-vA))/mSum;
          A.vx += imp*B.mass*nx; A.vy += imp*B.mass*ny;
          B.vx -= imp*A.mass*nx; B.vy -= imp*A.mass*ny;
        }
      }
    }
  }

  requestAnimationFrame(updateBalls);

  // ────────────────────────────────────────────────────────────
  // --- Falling Quotes (sine‐wave path + remove) -------------
  // ────────────────────────────────────────────────────────────
  let quotesStarted = false;
  let quoteStartTime= Date.now();

  function startFallingQuotes() {
    createFallingQuote();
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
    const text = quotes[Math.floor(Math.random()*quotes.length)];
    const el = document.createElement("div");
    el.className = "falling-quote";
    el.innerText = text;
    const initLeft = Math.random()*(window.innerWidth-300);
    el.dataset.initialLeft = initLeft;
    el.dataset.amp = Math.random()*20+10;
    el.dataset.phase= Math.random()*Math.PI*2;
    el.style.left = initLeft+"px";
    el.style.top  = "-50px";
    el.style.animation = "fall 20s linear forwards";
    quoteContainer.appendChild(el);
    setTimeout(()=>el.remove(),21000);
    if (!quotesStarted) {
      quotesStarted = true;
      startFallingQuotes();
    }
  }

  function updateQuotes() {
    const now = Date.now();
    document.querySelectorAll(".falling-quote").forEach(q => {
      const t = (now - quoteStartTime)/1000;
      const x0= parseFloat(q.dataset.initialLeft)||0;
      const amp= parseFloat(q.dataset.amp)||0;
      const ph= parseFloat(q.dataset.phase)||0;
      q.style.left = (x0 + amp*Math.sin(t+ph))+"px";
    });
    requestAnimationFrame(updateQuotes);
  }

  // ────────────────────────────────────────────────────────────
  // --- Visitor Tracking (localStorage via ipapi.co) ----------
  // ────────────────────────────────────────────────────────────
  async function logVisitor() {
    try {
      const res  = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      const ip       = data.ip;
      const location = `${data.city||'N/A'}, ${data.region||'N/A'}, ${data.country_name||'N/A'}`;
      const isp      = data.org||"Unknown ISP";
      const now      = new Date().toISOString();
      const logs     = JSON.parse(localStorage.getItem("visitorLogs")||"{}");
      if (!logs[ip]) {
        logs[ip] = { firstSeen:now, lastSeen:now, visits:1, location, isp };
      } else {
        logs[ip].visits++;
        logs[ip].lastSeen = now;
      }
      localStorage.setItem("visitorLogs", JSON.stringify(logs));
    } catch(e) {
      console.error("logVisitor error", e);
    }
  }
  logVisitor();

});```

This single file now contains:

- **Neon‐ripple** glow with multi‐color cycle and click pulses  
- **Full popup logic** (About, Contact, Admin)  
- **SHA‐256 admin login** as before  
- **Ball physics**: gravity, wall/floor collisions, inter‐ball collisions, click/drop/reset controls  
- **Falling quotes** on sine‐wave paths  
- **Visitor logging** to `localStorage` via ipapi.co  

Let me know if any section still needs adjustment or if you’d like me to extract particular parts!
