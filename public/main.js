document.addEventListener("DOMContentLoaded", function () {
  // --- Neon Glow Effect (Orb Following the Cursor) ---
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  const glowColors = ["#00d084", "#3498db", "#8e44ad", "#f39c12"];
  let glowIndex = 0;
  function updateNeonBackground() {
    neonContainer.style.background = `radial-gradient(circle at ${mouseX}px ${mouseY}px, ${glowColors[glowIndex]}, transparent 70%)`;
  }
  updateNeonBackground();
  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    updateNeonBackground();
  });
  setInterval(() => {
    glowIndex = (glowIndex + 1) % glowColors.length;
    updateNeonBackground();
  }, 4000);

  // --- Elements & UI Variables ---
  const profilePic    = document.querySelector(".profile-photo");
  const aboutLink     = document.querySelector(".about-link");
  const contactLink   = document.querySelector(".contact-link");
  const adminBtn      = document.querySelector(".admin-btn");
  const gravityBtn    = document.querySelector(".gravity-btn");
  const resetBtn      = document.querySelector(".reset-btn");
  const dimmedOverlay = document.querySelector(".dimmed");
  const quoteContainer= document.getElementById("quote-container");

  // Popups
  const aboutPopup   = document.getElementById("about-popup");
  const contactPopup = document.getElementById("contact-popup");
  const adminPopup   = document.getElementById("admin-popup");

  // --- Popup Controls ---
  profilePic.addEventListener("click", () => {
    dimmedOverlay.style.display = "block";
    aboutPopup.style.display = "block";
  });
  aboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    dimmedOverlay.style.display = "block";
    aboutPopup.style.display = "block";
  });
  contactLink.addEventListener("click", (e) => {
    e.preventDefault();
    dimmedOverlay.style.display = "block";
    contactPopup.style.display = "block";
  });
  adminBtn.addEventListener("click", () => {
    dimmedOverlay.style.display = "block";
    adminPopup.style.display = "block";
    const pwd = document.getElementById("admin-password");
    pwd.value = "";
    pwd.type  = "password";
    document.getElementById("toggle-password").textContent = "Show";
    document.getElementById("admin-error").style.display = "none";
  });
  dimmedOverlay.addEventListener("click", () => {
    aboutPopup.style.display   = "none";
    contactPopup.style.display = "none";
    adminPopup.style.display   = "none";
    dimmedOverlay.style.display= "none";
  });

  // --- Admin Popup Logic ---
  const adminPasswordInput = document.getElementById("admin-password");
  const togglePasswordBtn  = document.getElementById("toggle-password");
  const submitPasswordBtn  = document.getElementById("submit-password");
  const cancelPasswordBtn  = document.getElementById("cancel-password");
  const errorMessage       = document.getElementById("admin-error");

  togglePasswordBtn.addEventListener("click", () => {
    if (adminPasswordInput.type === "password") {
      adminPasswordInput.type = "text";
      togglePasswordBtn.textContent = "Hide";
    } else {
      adminPasswordInput.type = "password";
      togglePasswordBtn.textContent = "Show";
    }
  });
  submitPasswordBtn.addEventListener("click", () => {
    if (adminPasswordInput.value === "admin123") {
      errorMessage.style.display = "none";
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

  // --- Ball Physics & Collision (Desktop) ---
  const balls        = [];
  const GRAVITY      = 0.3;
  const RESTITUTION  = 0.8;
  let   quotesStarted= false;

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
    const ball     = document.createElement("div");
    ball.className = "ball";
    ball.style.backgroundColor = getRandomColor();
    const diameter = Math.random() * 30 + 40;
    ball.style.width   = diameter + "px";
    ball.style.height  = diameter + "px";
    ball.style.left    = Math.random() * (window.innerWidth - diameter) + "px";
    ball.style.top     = "0px";
    ball.radius        = diameter / 2;
    ball.mass          = Math.pow(ball.radius, 2);
    ball.velocityX     = Math.random() * 2 - 1;
    ball.velocityY     = Math.random() * 4 + 1;
    document.body.appendChild(ball);
    balls.push(ball);
  }
  function resetBalls() {
    balls.forEach(b => b.remove());
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
    const text     = quotes[Math.floor(Math.random() * quotes.length)];
    const elem     = document.createElement("div");
    elem.className = "falling-quote";
    elem.innerText= text;
    const initLeft= Math.random() * (window.innerWidth - 300);
    elem.dataset.initialLeft = initLeft;
    elem.dataset.amp         = Math.random() * 20 + 10;
    elem.dataset.phase       = Math.random() * 2 * Math.PI;
    elem.style.left          = initLeft + "px";
    elem.style.top           = "-50px";
    elem.style.animation     = "fall 20s linear forwards";
    quoteContainer.appendChild(elem);
    setTimeout(() => {
      if (elem.parentElement) elem.parentElement.removeChild(elem);
    }, 21000);
  }
  function updateQuotes() {
    const now = Date.now();
    document.querySelectorAll(".falling-quote").forEach(q => {
      const initLeft = parseFloat(q.dataset.initialLeft) || 0;
      const amp      = parseFloat(q.dataset.amp) || 0;
      const phase    = parseFloat(q.dataset.phase) || 0;
      const t        = (now - quoteStartTime) / 1000;
      const offset   = amp * Math.sin(t + phase);
      q.style.left   = initLeft + offset + "px";
    });
    requestAnimationFrame(updateQuotes);
  }

  // --- Update Balls & Handle Collisions ---
  function updateBalls() {
    balls.forEach(ball => {
      ball.velocityY += GRAVITY;
      let top  = parseFloat(ball.style.top),
          left = parseFloat(ball.style.left);
      let newTop  = top  + ball.velocityY,
          newLeft = left + ball.velocityX;

      // horizontal walls
      if (newLeft <= 0) {
        newLeft = 0;
        ball.velocityX = -ball.velocityX * RESTITUTION;
      }
      if (newLeft + ball.radius*2 >= window.innerWidth) {
        newLeft = window.innerWidth - ball.radius*2;
        ball.velocityX = -ball.velocityX * RESTITUTION;
      }
      // floor (footer)
      const footerTop = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY;
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
      const A = balls[i],
            xA = parseFloat(A.style.left) + A.radius,
            yA = parseFloat(A.style.top)  + A.radius;
      for (let j = i+1; j < balls.length; j++) {
        const B = balls[j],
              xB = parseFloat(B.style.left) + B.radius,
              yB = parseFloat(B.style.top)  + B.radius;
        const dx = xB - xA, dy = yB - yA, dist = Math.hypot(dx,dy);
        if (dist < A.radius + B.radius && dist > 0) {
          // collision math...
          const nx = dx/dist, ny = dy/dist,
                tx = -ny,     ty = nx,
                vAn = A.velocityX*nx + A.velocityY*ny,
                vAt = A.velocityX*tx + A.velocityY*ty,
                vBn = B.velocityX*nx + B.velocityY*ny,
                vBt = B.velocityX*tx + B.velocityY*ty;
          const vAnAfter = (vAn*(A.mass - B.mass) + 2*B.mass*vBn)/(A.mass+B.mass),
                vBnAfter = (vBn*(B.mass - A.mass) + 2*A.mass*vAn)/(A.mass+B.mass);
          A.velocityX = vAnAfter*nx + vAt*tx;
          A.velocityY = vAnAfter*ny + vAt*ty;
          B.velocityX = vBnAfter*nx + vBt*tx;
          B.velocityY = vBnAfter*ny + vBt*ty;
          // separate overlapping
          const overlap = A.radius + B.radius - dist,
                sepX    = nx*(overlap/2),
                sepY    = ny*(overlap/2);
          A.style.left  = (parseFloat(A.style.left) - sepX) + "px";
          A.style.top   = (parseFloat(A.style.top)  - sepY) + "px";
          B.style.left  = (parseFloat(B.style.left) + sepX) + "px";
          B.style.top   = (parseFloat(B.style.top)  + sepY) + "px";
        }
      }
    }
  }
  function handleBallQuoteCollisions() {
    document.querySelectorAll(".falling-quote").forEach(q => {
      const rect = q.getBoundingClientRect(),
            qX   = rect.left,
            qY   = rect.top + window.scrollY,
            qW   = rect.width,
            qH   = rect.height;
      balls.forEach(ball => {
        const bX = parseFloat(ball.style.left) + ball.radius,
              bY = parseFloat(ball.style.top)  + ball.radius;
        if (ball.velocityY > 0 && bY < qY) {
          const cx = Math.max(qX, Math.min(bX, qX+qW)),
                cy = Math.max(qY, Math.min(bY, qY+qH)),
                d  = Math.hypot(bX-cx, bY-cy);
          if (d < ball.radius) {
            ball.velocityX = -ball.velocityX * RESTITUTION;
            ball.velocityY = -ball.velocityY * RESTITUTION;
            q.style.transform = "scale(1.2)";
            setTimeout(() => { q.style.transform = "scale(1)"; }, 200);
          }
        }
      });
    });
  }
  let lastScrollTop = window.scrollY;
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY,
          dir       = scrollTop > lastScrollTop ? 1 : -1;
    lastScrollTop = scrollTop;
    balls.forEach(b => b.velocityY += dir * 0.5);
  });
  updateBalls();

  // --- Visitor Tracking (unchanged) ---
  function logVisitor() {
    const userAgent = navigator.userAgent;
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => {
        const ip = data.ip;
        const send = (loc) => fetch('/api/logVisitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip, userAgent, ...loc, timestamp: new Date().toISOString() })
        });
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => send({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            ()   => send({ location: "Denied" })
          );
        } else {
          send({});
        }
      })
      .catch(err => console.error('Error fetching IP:', err));
  }
  logVisitor();

  // --- MOBILE DROP-BALL BUTTON & DRAGGING ---
  const dropBallBtn         = document.querySelector('.drop-ball-btn');
  const mobileBallsContainer= document.querySelector('.balls-container');
  if (dropBallBtn && mobileBallsContainer) {
    dropBallBtn.addEventListener('click', () => {
      const ball = document.createElement('div');
      ball.className = 'drop-ball';
      const diameter = 36;
      ball.style.width  = diameter + 'px';
      ball.style.height = diameter + 'px';
      const rect = dropBallBtn.getBoundingClientRect();
      ball.style.left = rect.left + rect.width/2 - diameter/2 + 'px';
      ball.style.top  = rect.top - diameter + 'px';
      mobileBallsContainer.appendChild(ball);
      setupMobileDrag(ball);
    });
  }

  function setupMobileDrag(ball) {
    let dragging = false, offsetX = 0, offsetY = 0;
    const onDown = e => {
      dragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const r = ball.getBoundingClientRect();
      offsetX = clientX - r.left;
      offsetY = clientY - r.top;
      ball.style.cursor = 'grabbing';
    };
    const onMove = e => {
      if (!dragging) return;
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      ball.style.left = clientX - offsetX + 'px';
      ball.style.top  = clientY - offsetY + 'px';
    };
    const onUp = () => {
      dragging = false;
      ball.style.cursor = 'grab';
    };
    ball.addEventListener('mousedown', onDown);
    ball.addEventListener('touchstart', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }
});
