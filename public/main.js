// public/main.js
// —————————————————————————————————————————————————————————————————————————
// Uses Matter.js for smooth circle physics + multi-click neon pulses,
// plus your existing popups, falling quotes, and visitor logging.
// —————————————————————————————————————————————————————————————————————————

document.addEventListener("DOMContentLoaded", () => {
  // —————————————————————————————————————
  // 1) Matter.js setup
  // —————————————————————————————————————
  const { Engine, Render, Runner, World, Bodies, Body, Composite } = Matter;

  // create engine + world
  const engine = Engine.create();
  const world  = engine.world;

  // create renderer (transparent background so our neon shows)
  const render = Render.create({
    element: document.body,
    engine,
    options: {
      width:  window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
      background: 'transparent',
    }
  });
  Render.run(render);
  Runner.run(Runner.create(), engine);

  // helper to (re)build static walls & floor
  function buildBounds() {
    const thickness = 100;
    const w = window.innerWidth, h = window.innerHeight;
    const footerTop = document.querySelector('.footer').getBoundingClientRect().top + window.scrollY;

    // remove existing static bodies
    Composite.allBodies(world)
      .filter(b => b.isStatic)
      .forEach(b => World.remove(world, b));

    // add four walls + floor at footerTop
    World.add(world, [
      Bodies.rectangle(w/2, -thickness/2, w, thickness,       { isStatic: true }),
      Bodies.rectangle(-thickness/2, h/2, thickness, h,       { isStatic: true }),
      Bodies.rectangle(w+thickness/2, h/2, thickness, h,      { isStatic: true }),
      Bodies.rectangle(w/2, footerTop + thickness/2, w, thickness, { isStatic: true })
    ]);
  }
  buildBounds();
  window.addEventListener("resize", buildBounds);

  // —————————————————————————————————————
  // 2) Neon glow & multi-click pulses
  // —————————————————————————————————————
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
  let pulses = [];

  const glowColors      = ["#5EBD3E","#FFB900","#F78200","#E23838","#973999","#009CDF"];
  const PULSE_DURATION  = 2000;  // ms
  const PULSE_THICKNESS =   3;   // percent
  const WAVE_FORCE      = 0.02;  // Matter.js force scale

  // track mouse for base glow
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // register pulses on click _outside_ the footer
  document.body.addEventListener("click", e => {
    if (!e.target.closest(".footer")) {
      pulses.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
    }
  });

  // color helpers
  function parseHex(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n>>16)&255, (n>>8)&255, n&255];
  }
  function lerp(a,b,t) {
    const r = Math.round(a[0]+(b[0]-a[0])*t),
          g = Math.round(a[1]+(b[1]-a[1])*t),
          bl= Math.round(a[2]+(b[2]-a[2])*t);
    return `rgb(${r},${g},${bl})`;
  }
  function maxDim() {
    return Math.max(window.innerWidth, window.innerHeight);
  }

  // neon & pulse render loop
  let neonStart = null;
  (function animateNeon(ts) {
    if (!neonStart) neonStart = ts;
    const elapsed = ts - neonStart;

    // cycle base color
    const seg    = 2000,
          cycle  = seg * glowColors.length;
    const prog   = (elapsed % cycle)/seg,
          idx    = Math.floor(prog),
          frac   = prog - idx;
    const colA   = parseHex(glowColors[idx]),
          colB   = parseHex(glowColors[(idx+1)%glowColors.length]),
          baseC  = lerp(colA, colB, frac),
          ringC  = baseC.replace('rgb','rgba').replace(')',',0.4)');

    // start background as base glow at mouse
    let bg = `radial-gradient(circle at ${mouseX}px ${mouseY}px, ${baseC} 0%, transparent 40%)`;

    // overlay all active pulses
    pulses.forEach(p => {
      const dt = ts - p.t0;
      if (dt <= PULSE_DURATION) {
        const rp = (dt/PULSE_DURATION)*100;
        bg += `, radial-gradient(circle at ${p.x}px ${p.y}px,
               transparent ${rp}%,
               ${ringC} ${rp+PULSE_THICKNESS}%,
               transparent ${rp+PULSE_THICKNESS}%)`;

        // apply wave force to bodies in that ring
        const ringPx = (rp/100)*maxDim(),
              thickPx= (PULSE_THICKNESS/100)*maxDim();
        Composite.allBodies(world).forEach(body => {
          if (body.isStatic) return;
          const dx = body.position.x - p.x,
                dy = body.position.y - p.y,
                d  = Math.hypot(dx,dy);
          if (Math.abs(d - ringPx) < thickPx/2) {
            Body.applyForce(body, body.position, {
              x: (dx/d)*WAVE_FORCE,
              y: (dy/d)*WAVE_FORCE
            });
          }
        });
      }
    });

    // cull old pulses
    pulses = pulses.filter(p => (ts - p.t0) < PULSE_DURATION);

    neonContainer.style.background = bg;
    requestAnimationFrame(animateNeon);
  })();

  // —————————————————————————————————————
  // 3) Ball drop & reset (uses Matter.js)
  // —————————————————————————————————————
  function getRandomColor() {
    return '#'+Math.floor(0x888888 + Math.random()*0x777777).toString(16);
  }

  function dropBall() {
    const r = Math.random()*20 + 20;
    const x = Math.random()*(window.innerWidth - 2*r) + r;
    const ball = Bodies.circle(x, 0, r, {
      restitution: 0.8,
      frictionAir: 0.02,
      render: { fillStyle: getRandomColor() }
    });
    World.add(world, ball);
  }

  function resetBalls() {
    Composite.allBodies(world)
      .filter(b => !b.isStatic)
      .forEach(b => World.remove(world, b));
  }

  document.querySelector(".gravity-btn").addEventListener("click", () => {
    dropBall();
    resetBtn.style.display = "block";
  });
  document.querySelector(".reset-btn").addEventListener("click", () => {
    resetBalls();
    resetBtn.style.display = "none";
  });

  // —————————————————————————————————————
  // 4) Popups (unchanged)
  // —————————————————————————————————————
  const profilePic     = document.querySelector(".profile-photo");
  const aboutLink      = document.querySelector(".about-link");
  const contactLink    = document.querySelector(".contact-link");
  const adminBtn       = document.querySelector(".admin-btn");
  const dimmedOverlay  = document.querySelector(".dimmed");
  const aboutPopup     = document.getElementById("about-popup");
  const contactPopup   = document.getElementById("contact-popup");
  const adminPopup     = document.getElementById("admin-popup");
  const adminPasswordInput = document.getElementById("admin-password");
  const togglePasswordBtn  = document.getElementById("toggle-password");
  const submitPasswordBtn  = document.getElementById("submit-password");
  const cancelPasswordBtn  = document.getElementById("cancel-password");
  const errorMessage       = document.getElementById("admin-error");

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
    adminPasswordInput.value    = "";
    adminPasswordInput.type     = "password";
    togglePasswordBtn.textContent = "Show";
    errorMessage.style.display  = "none";
  });
  dimmedOverlay.addEventListener("click", () => {
    aboutPopup.style.display   =
    contactPopup.style.display =
    adminPopup.style.display   = "none";
    dimmedOverlay.style.display = "none";
  });

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

  // —————————————————————————————————————
  // 5) Falling Quotes (unchanged)
  // —————————————————————————————————————
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

  // —————————————————————————————————————
  // 6) Visitor Logging (unchanged)
  // —————————————————————————————————————
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
