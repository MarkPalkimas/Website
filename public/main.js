document.addEventListener("DOMContentLoaded", function () {
  // Inject CSS for hidden quotes
  const style = document.createElement("style");
  style.innerHTML = `
    .hidden-quote {
      position: absolute;
      color: #fff;
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      z-index: 1;
    }
  `;
  document.head.appendChild(style);

  // --- Neon Glow Effect & Waves ---
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let wavesActive = false;
  let waveData = { centerX: 0, centerY: 0, radiusPx: 0, thicknessPx: 0 };
  const glowColors = ["#5EBD3E","#FFB900","#F78200","#E23838","#973999","#009CDF"];
  const maxDim = () => Math.max(window.innerWidth, window.innerHeight);

  function parseHex(hex) {
    const n = parseInt(hex.slice(1),16);
    return [(n>>16)&255,(n>>8)&255,n&255];
  }
  function lerpColor(a,b,t) {
    const r = Math.round(a[0]+(b[0]-a[0])*t);
    const g = Math.round(a[1]+(b[1]-a[1])*t);
    const bl= Math.round(a[2]+(b[2]-a[2])*t);
    return `rgb(${r},${g},${bl})`;
  }

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX; mouseY = e.clientY;
  });

  let startTime = null;
  function animateNeon(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;

    // Color cycle
    const seg = 2000, cycle = seg*glowColors.length;
    const p = (elapsed % cycle)/seg;
    const i = Math.floor(p), f = p - i;
    const colA = parseHex(glowColors[i]);
    const colB = parseHex(glowColors[(i+1)%glowColors.length]);
    const baseCol = lerpColor(colA,colB,f);
    const ringCol = baseCol.replace("rgb","rgba").replace(")"," ,0.5)");

    // Ripple timing & size
    const ringPeriodPct  = 100;
    const ringPeriodMs   = 3000;
    const rp = (elapsed % ringPeriodMs)/ringPeriodMs * ringPeriodPct;
    const rwPct = 3;
    const rPx = (rp/100)*maxDim(), wPx = (rwPct/100)*maxDim();

    if (wavesActive) {
      waveData = { centerX: mouseX, centerY: mouseY, radiusPx: rPx, thicknessPx: wPx };
    }

    // Base glow stops at 35%
    const baseGlow = `radial-gradient(circle at ${mouseX}px ${mouseY}px,
                       ${baseCol} 0%, transparent 35%)`;
    let bg = baseGlow;

    if (wavesActive) {
      const ringGlow = `radial-gradient(circle at ${mouseX}px ${mouseY}px,
                         transparent ${rp}%, ${ringCol} ${rp+rwPct}%,
                         transparent ${rp+rwPct}%)`;
      bg += `, ${ringGlow}`;
    }

    neonContainer.style.background = bg;

    // Reveal quotes under glow radius (35%)
    const revealR = maxDim()*0.35;
    hiddenQuotes.forEach(q => {
      const rect = q.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top  + rect.height/2;
      const d = Math.hypot(cx-mouseX, cy-mouseY);
      q.style.opacity = d <= revealR ? "1" : "0";
    });

    requestAnimationFrame(animateNeon);
  }
  requestAnimationFrame(animateNeon);

  // --- Static Hidden Quotes Generation ---
  const quotes = [
    "Life isn’t about what you know, It’s about what you’re able to figure out.",
    "The best time to plant a tree is 20 years ago, the second best time is today.",
    "The rich get richer because the poor see every opportunity as a scam",
    "Money is not the key to happiness, it is the key to pursuing opportunities.",
    "Cold water feels warm when your hands are freezing.",
    "Regret is proof you cared. But growth is proof you learned."
  ];
  const hiddenQuotes = [];
  quotes.forEach(text => {
    const el = document.createElement("div");
    el.className = "hidden-quote";
    el.innerText = text;
    // random position across the page
    el.style.left = Math.random()*(window.innerWidth - 200) + "px";
    el.style.top  = Math.random()*(window.innerHeight - 50) + "px";
    neonContainer.appendChild(el);
    hiddenQuotes.push(el);
  });

  // --- Elements & Buttons ---
  const profilePic  = document.querySelector(".profile-photo");
  const aboutLink   = document.querySelector(".about-link");
  const contactLink = document.querySelector(".contact-link");
  const adminBtn    = document.querySelector(".admin-btn");
  const dropBtn     = document.querySelector(".gravity-btn");
  const resetBtn    = document.querySelector(".reset-btn");
  const dimmed      = document.querySelector(".dimmed");
  const aboutPop    = document.getElementById("about-popup");
  const contactPop  = document.getElementById("contact-popup");
  const adminPop    = document.getElementById("admin-popup");

  profilePic.addEventListener("click", () => {
    dimmed.style.display = "block";
    aboutPop.style.display = "block";
  });
  aboutLink.addEventListener("click", e => {
    e.preventDefault();
    dimmed.style.display = "block";
    aboutPop.style.display = "block";
  });
  contactLink.addEventListener("click", e => {
    e.preventDefault();
    dimmed.style.display = "block";
    contactPop.style.display = "block";
  });
  adminBtn.addEventListener("click", () => {
    dimmed.style.display = "block";
    adminPop.style.display = "block";
    const pw = document.getElementById("admin-password");
    pw.value=""; pw.type="password";
    document.getElementById("toggle-password").textContent="Show";
    document.getElementById("admin-error").style.display="none";
  });
  dimmed.addEventListener("click", () => {
    [aboutPop,contactPop,adminPop].forEach(p=>p.style.display="none");
    dimmed.style.display="none";
  });

  // --- Admin Logic ---
  const pwInput = document.getElementById("admin-password");
  const togglePw = document.getElementById("toggle-password");
  const submitPw = document.getElementById("submit-password");
  const cancelPw = document.getElementById("cancel-password");
  const errMsg   = document.getElementById("admin-error");
  const storedHash = "dd59dcfa4c076c4923715ba712abbb5cc1458152809a444674f571a4638c0345";

  togglePw.addEventListener("click", () => {
    if (pwInput.type==="password") {
      pwInput.type="text"; togglePw.textContent="Hide";
    } else {
      pwInput.type="password"; togglePw.textContent="Show";
    }
  });
  async function hashPwd(s) {
    const buf = new TextEncoder().encode(s);
    const hb = await crypto.subtle.digest("SHA-256",buf);
    return Array.from(new Uint8Array(hb))
      .map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  submitPw.addEventListener("click", async () => {
    const h = await hashPwd(pwInput.value);
    if (h===storedHash) {
      errMsg.style.display="none";
      window.location.href="admin.html";
    } else {
      pwInput.value="";
      errMsg.style.display="block";
    }
  });
  cancelPw.addEventListener("click", () => {
    pwInput.value=""; errMsg.style.display="none";
  });

  // --- Ball Physics & Wave Interaction ---
  const balls = [];
  const GRAVITY = 0.3, REST = 0.8, WAVE_FORCE = 0.5 * 1.8;

  dropBtn.addEventListener("click", () => {
    wavesActive = true;
    spawnBall();
    resetBtn.style.display = "block";
  });
  resetBtn.addEventListener("click", () => {
    wavesActive = false;
    removeBalls();
    resetBtn.style.display = "none";
  });

  function spawnBall() {
    const ball = document.createElement("div");
    ball.className = "ball";
    ball.style.backgroundColor = getRandColor();
    const d = Math.random()*30+40;
    ball.style.width=d+"px"; ball.style.height=d+"px";
    ball.style.left=Math.random()*(window.innerWidth-d)+"px";
    ball.style.top="0px";
    ball.radius=d/2; ball.mass=Math.pow(d/2,2);
    ball.velocityX=Math.random()*2-1;
    ball.velocityY=Math.random()*4+1;
    document.body.appendChild(ball);
    balls.push(ball);
  }
  function removeBalls() {
    balls.forEach(b=>b.remove());
    balls.length=0;
  }
  function getRandColor() {
    const L="89ABCDEF", C="#";
    for (let i=0;i<6;i++) C+=L[Math.floor(Math.random()*L.length)];
    return C;
  }

  function updateBalls() {
    balls.forEach(ball => {
      ball.velocityY += GRAVITY;
      let nx = parseFloat(ball.style.left) + ball.velocityX;
      let ny = parseFloat(ball.style.top)  + ball.velocityY;

      // wall bounce
      if (nx <= 0 || nx + ball.radius*2 >= window.innerWidth) {
        ball.velocityX *= -REST;
        nx = Math.min(Math.max(nx,0), window.innerWidth-ball.radius*2);
      }
      // footer bounce
      const footerY = document.querySelector(".footer").getBoundingClientRect().top + window.scrollY;
      if (ny + ball.radius*2 >= footerY) {
        ball.velocityY *= -REST;
        ball.velocityX *= REST;
        ny = footerY - ball.radius*2;
      }

      // wave push
      if (wavesActive) {
        const bx = nx + ball.radius, by = ny + ball.radius;
        const dx = bx - waveData.centerX, dy = by - waveData.centerY;
        const d = Math.hypot(dx,dy);
        if (Math.abs(d - waveData.radiusPx) < waveData.thicknessPx/2) {
          ball.velocityX += (dx/d)*WAVE_FORCE;
          ball.velocityY += (dy/d)*WAVE_FORCE;
        }
      }

      ball.style.left = nx+"px";
      ball.style.top  = ny+"px";
    });

    handleCollisions();
    requestAnimationFrame(updateBalls);
  }
  function handleCollisions() {
    for (let i=0;i<balls.length;i++){
      for (let j=i+1;j<balls.length;j++){
        const a=balls[i], b=balls[j];
        const dx=(parseFloat(b.style.left)+b.radius)-(parseFloat(a.style.left)+a.radius);
        const dy=(parseFloat(b.style.top)+b.radius)-(parseFloat(a.style.top)+a.radius);
        const dist = Math.hypot(dx,dy);
        if (dist < a.radius + b.radius) {
          const nx=dx/dist, ny=dy/dist;
          const p=2*(a.velocityX*nx + a.velocityY*ny - b.velocityX*nx - b.velocityY*ny)/(a.mass+b.mass);
          a.velocityX -= p*b.mass*nx;
          a.velocityY -= p*b.mass*ny;
          b.velocityX += p*a.mass*nx;
          b.velocityY += p*a.mass*ny;
        }
      }
    }
  }
  window.addEventListener("scroll", () => {
    const dir = window.scrollY > (this._ls||0) ? 1 : -1;
    this._ls = window.scrollY;
    balls.forEach(b=>b.velocityY += dir*0.5);
  });

  requestAnimationFrame(updateBalls);

  // --- Visitor Tracking ---
  async function logVisitor() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const d = await res.json();
      const ip = d.ip;
      const loc= `${d.city}, ${d.region}, ${d.country_name}`;
      const now = new Date().toISOString();
      const logs = JSON.parse(localStorage.getItem("visitorLogs")||"{}");
      if (logs[ip]) {
        logs[ip].count++; logs[ip].latestTime=now;
      } else {
        logs[ip] = { count:1, latestTime:now, location:loc };
      }
      localStorage.setItem("visitorLogs",JSON.stringify(logs));
    } catch(e) { console.error(e); }
  }
  logVisitor();
});
