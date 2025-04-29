// public/main.js
document.addEventListener("DOMContentLoaded", function () {
  // --- Neon “Shadow” Overlay (cuts a circular “light” hole) ---
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  const LIGHT_RADIUS_PCT = 0.35;        // 35% of the larger screen dim
  const OVERLAY_OPACITY = 0.8;          // darkness outside the light

  const maxDim = () => Math.max(window.innerWidth, window.innerHeight);

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateShadow(time) {
    // Compute radius in percent
    const radiusPct = LIGHT_RADIUS_PCT * 100;
    // Draw a dark overlay with a transparent circle at mouse
    neonContainer.style.background = `
      radial-gradient(
        circle at ${mouseX}px ${mouseY}px,
        transparent ${radiusPct}%,
        rgba(0,0,0,${OVERLAY_OPACITY}) ${radiusPct}%,
        rgba(0,0,0,${OVERLAY_OPACITY}) 100%
      )
    `;
    requestAnimationFrame(animateShadow);
  }
  requestAnimationFrame(animateShadow);

  // --- Static Background Quotes (always in fixed positions) ---
  const quoteContainer = document.getElementById("quote-container");
  const bgQuotes = [
    { text: "Life isn’t about what you know, it’s about what you’re able to figure out.",    x: 10,  y: 20 },
    { text: "The best time to plant a tree is 20 years ago; the second best time is today.", x: 60,  y: 15 },
    { text: "The rich get richer because the poor see every opportunity as a scam.",         x: 20,  y: 70 },
    { text: "Money is not the key to happiness; it is the key to pursuing opportunities.",  x: 75,  y: 55 },
    { text: "Cold water feels warm when your hands are freezing.",                           x: 40,  y: 40 },
    { text: "Regret is proof you cared. But growth is proof you learned.",                   x: 15,  y: 85 }
  ];
  bgQuotes.forEach(q => {
    const el = document.createElement("div");
    el.className = "background-quote";
    el.innerText = q.text;
    el.style.left = q.x + "%";
    el.style.top  = q.y + "%";
    quoteContainer.appendChild(el);
  });

  // --- Ball Physics & “Neon” Repulsion ---
  const balls = [];
  const GRAVITY       = 0.3;
  const RESTITUTION   = 0.8;
  const REPULSION_STR = 0.5;

  // on-click, drop a ball
  document.querySelector(".gravity-btn").addEventListener("click", () => {
    dropBall();
    document.querySelector(".reset-btn").style.display = "block";
  });

  document.querySelector(".reset-btn").addEventListener("click", () => {
    balls.forEach(b => b.remove());
    balls.length = 0;
    document.querySelector(".reset-btn").style.display = "none";
  });

  function dropBall() {
    const ball = document.createElement("div");
    ball.className = "ball";
    const diameter = Math.random() * 30 + 40;
    ball.style.width  = diameter + "px";
    ball.style.height = diameter + "px";
    ball.style.left   = Math.random() * (window.innerWidth - diameter) + "px";
    ball.style.top    = "0px";
    ball.radius       = diameter / 2;
    ball.mass         = Math.pow(ball.radius, 2);
    ball.velocityX    = (Math.random() * 2 - 1);
    ball.velocityY    = (Math.random() * 4 + 1);
    ball.style.backgroundColor = getRandomColor();
    document.body.appendChild(ball);
    balls.push(ball);
  }

  function getRandomColor() {
    const letters = "89ABCDEF";
    let c = "#";
    for (let i = 0; i < 6; i++) c += letters[Math.floor(Math.random() * letters.length)];
    return c;
  }

  function updateBalls() {
    const repulseRadiusPx = LIGHT_RADIUS_PCT * maxDim();

    balls.forEach(ball => {
      // gravity
      ball.velocityY += GRAVITY;

      // repulsion from neon “light”
      const bx = parseFloat(ball.style.left) + ball.radius;
      const by = parseFloat(ball.style.top)  + ball.radius;
      const dx = bx - mouseX;
      const dy = by - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < repulseRadiusPx) {
        const strength = (1 - dist / repulseRadiusPx) * REPULSION_STR;
        ball.velocityX += (dx / dist) * strength;
        ball.velocityY += (dy / dist) * strength;
      }

      // integrate
      let newTop  = parseFloat(ball.style.top) + ball.velocityY;
      let newLeft = parseFloat(ball.style.left) + ball.velocityX;

      // wall collisions
      if (newLeft <= 0 || newLeft + ball.radius*2 >= window.innerWidth) {
        ball.velocityX *= -RESTITUTION;
        newLeft = Math.min(Math.max(newLeft, 0), window.innerWidth - ball.radius*2);
      }

      // floor collision
      const footerTop = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY;
      if (newTop + ball.radius*2 >= footerTop) {
        ball.velocityY *= -RESTITUTION;
        ball.velocityX *= RESTITUTION;
        newTop = footerTop - ball.radius*2;
      }

      ball.style.top  = newTop  + "px";
      ball.style.left = newLeft + "px";
    });

    handleBallCollisions();
    requestAnimationFrame(updateBalls);
  }
  updateBalls();

  function handleBallCollisions() {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i+1; j < balls.length; j++) {
        const a = balls[i], b = balls[j];
        const dx = (parseFloat(b.style.left)+b.radius) - (parseFloat(a.style.left)+a.radius);
        const dy = (parseFloat(b.style.top) +b.radius) - (parseFloat(a.style.top) +a.radius);
        const dist = Math.hypot(dx, dy);
        if (dist < a.radius + b.radius) {
          const nx = dx/dist, ny = dy/dist;
          const p  = 2*(a.velocityX*nx + a.velocityY*ny - b.velocityX*nx - b.velocityY*ny)/(a.mass + b.mass);
          a.velocityX -= p * b.mass * nx;
          a.velocityY -= p * b.mass * ny;
          b.velocityX += p * a.mass * nx;
          b.velocityY += p * a.mass * ny;
        }
      }
    }
  }

  // --- Popup & Admin code left unchanged ---
  const profilePic     = document.querySelector(".profile-photo");
  const aboutLink      = document.querySelector(".about-link");
  const contactLink    = document.querySelector(".contact-link");
  const adminBtn       = document.querySelector(".admin-btn");
  const resetBtn       = document.querySelector(".reset-btn");
  const dimmedOverlay  = document.querySelector(".dimmed");
  const aboutPopup     = document.getElementById("about-popup");
  const contactPopup   = document.getElementById("contact-popup");
  const adminPopup     = document.getElementById("admin-popup");
  const adminPasswordInput = document.getElementById("admin-password");
  const togglePasswordBtn  = document.getElementById("toggle-password");
  const submitPasswordBtn  = document.getElementById("submit-password");
  const cancelPasswordBtn  = document.getElementById("cancel-password");
  const errorMessage       = document.getElementById("admin-error");
  const storedHash         = "dd59dcfa4c076c4923715ba712abbb5cc1458152809a444674f571a4638c0345";

  // Popup controls...
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
    [aboutPopup, contactPopup, adminPopup].forEach(p => p.style.display = "none");
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
                         .map(b => b.toString(16).padStart(2, "0"))
                         .join("");
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

  // --- Visitor Tracking (unchanged) ---
  async function logVisitor() {
    try {
      const res  = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      const ip       = data.ip;
      const loc      = `${data.city}, ${data.region}, ${data.country_name}`;
      const now      = new Date().toISOString();
      const logs     = JSON.parse(localStorage.getItem("visitorLogs") || "{}");
      if (logs[ip]) {
        logs[ip].count++;
        logs[ip].latestTime = now;
      } else {
        logs[ip] = { count: 1, latestTime: now, location: loc };
      }
      localStorage.setItem("visitorLogs", JSON.stringify(logs));
    } catch (e) {
      console.error("logVisitor error:", e);
    }
  }
  logVisitor();
});
