document.addEventListener('DOMContentLoaded', () => {
  const isMobile = 'ontouchstart' in window;
  const neon = document.getElementById('neon-container');
  neon.style.background = 'none';

  // Neon follow
  function updateNeon(x, y) {
    neon.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0,208,132,0.5), transparent 60%)`;
  }
  if (isMobile) {
    document.body.addEventListener('touchmove', e => {
      updateNeon(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  } else {
    document.body.addEventListener('mousemove', e => {
      updateNeon(e.clientX, e.clientY);
    });
  }

  // Slide‐out menu toggle
  const menuBtn = document.querySelector('.menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  menuBtn.addEventListener('click', () => navMenu.classList.toggle('open'));

  // Pop-ups
  const dimmed = document.querySelector('.dimmed');
  const aboutPopup = document.getElementById('about-popup');
  const contactPopup = document.getElementById('contact-popup');
  const adminPopup = document.getElementById('admin-popup');
  document.querySelector('.about-link').addEventListener('click', e => {
    e.preventDefault();
    dimmed.style.display = 'block';
    aboutPopup.style.display = 'block';
  });
  document.querySelector('.contact-link').addEventListener('click', e => {
    e.preventDefault();
    dimmed.style.display = 'block';
    contactPopup.style.display = 'block';
  });
  document.querySelector('.admin-btn').addEventListener('click', () => {
    dimmed.style.display = 'block';
    adminPopup.style.display = 'block';
  });
  dimmed.addEventListener('click', () => {
    dimmed.style.display = 'none';
    [aboutPopup, contactPopup, adminPopup].forEach(p => p.style.display = 'none');
  });

  // Admin password toggle & submit
  const pwd = document.getElementById('admin-password');
  document.getElementById('toggle-password').addEventListener('click', () => {
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('submit-password').addEventListener('click', () => {
    if (pwd.value === 'admin123') {
      window.location.href = 'admin.html';
    } else {
      document.getElementById('admin-error').style.display = 'block';
    }
  });
  document.getElementById('cancel-password').addEventListener('click', () => {
    document.getElementById('admin-error').style.display = 'none';
  });

  // Overscroll lock & show neon on first touch
  neon.style.display = 'none';
  document.addEventListener('touchstart', () => neon.style.display = 'block', { once: true });
  document.documentElement.style.overscrollBehavior = 'none';
  document.body.style.overflow = 'hidden';

  // Ball physics + touch-drag
  const balls = [], GRAVITY = 0.3, REST = 0.8;
  const dropBtn = document.querySelector('.gravity-btn');
  const resetBtn = document.querySelector('.reset-btn');

  dropBtn.addEventListener('click', () => {
    const ball = document.createElement('div');
    ball.className = 'ball';
    const d = Math.random() * 30 + 30;
    ball.style.width = ball.style.height = d + 'px';
    ball.radius = d / 2;
    ball.mass = Math.pow(ball.radius, 2);
    ball.style.left = Math.random() * (window.innerWidth - d) + 'px';
    ball.style.top = '0px';
    ball.velocityX = Math.random() * 2 - 1;
    ball.velocityY = Math.random() * 4 + 1;
    document.body.appendChild(ball);
    balls.push(ball);
    resetBtn.style.display = 'block';

    // Touch-drag support
    if (isMobile) {
      let ox, oy, dragging;
      ball.addEventListener('touchstart', e => {
        dragging = true;
        ox = e.touches[0].clientX - parseFloat(ball.style.left);
        oy = e.touches[0].clientY - parseFloat(ball.style.top);
        ball.velocityX = ball.velocityY = 0;
      }, { passive: false });
      ball.addEventListener('touchmove', e => {
        if (dragging) {
          ball.style.left = e.touches[0].clientX - ox + 'px';
          ball.style.top = e.touches[0].clientY - oy + 'px';
        }
      }, { passive: false });
      ball.addEventListener('touchend', () => dragging = false);
    }
  });

  resetBtn.addEventListener('click', () => {
    balls.forEach(b => b.remove());
    balls.length = 0;
    resetBtn.style.display = 'none';
  });

  function update() {
    balls.forEach(b => {
      if (!b.isDragging) b.velocityY += GRAVITY;
      let top = parseFloat(b.style.top),
          left = parseFloat(b.style.left);
      let newTop = top + b.velocityY,
          newLeft = left + b.velocityX;
      const footerY = document.querySelector('.footer').getBoundingClientRect().top;
      if (newLeft <= 0 || newLeft + 2 * b.radius >= window.innerWidth) {
        b.velocityX *= -REST;
      }
      if (newTop + 2 * b.radius >= footerY) {
        b.velocityY *= -REST;
        newTop = footerY - 2 * b.radius;
      }
      b.style.left = newLeft + 'px';
      b.style.top = newTop + 'px';
    });
    handleCollisions();
    requestAnimationFrame(update);
  }

  function handleCollisions() {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const A = balls[i], B = balls[j];
        const dx = (parseFloat(B.style.left) + B.radius) - (parseFloat(A.style.left) + A.radius);
        const dy = (parseFloat(B.style.top) + B.radius) - (parseFloat(A.style.top) + A.radius);
        const dist = Math.hypot(dx, dy);
        if (dist < A.radius + B.radius) {
          const nx = dx / dist, ny = dy / dist;
          const p = (2 * (A.velocityX * nx + A.velocityY * ny - B.velocityX * nx - B.velocityY * ny)) / (A.mass + B.mass);
          A.velocityX -= p * B.mass * nx;
          A.velocityY -= p * B.mass * ny;
          B.velocityX += p * A.mass * nx;
          B.velocityY += p * A.mass * ny;
        }
      }
    }
  }

  update();
});
