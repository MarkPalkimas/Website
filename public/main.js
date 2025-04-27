// main.js
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = 'ontouchstart' in window;
  const neon = document.getElementById('neon-container');
  neon.style.display = 'none';

  // — NEON MOUSE-GLOW ON DESKTOP —
  if (!isMobile) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    const glowColors = ['#00d084', '#3498db', '#8e44ad', '#f39c12'];
    let glowIndex = 0;

    const updateNeon = () => {
      neon.style.background = `radial-gradient(circle at ${mouseX}px ${mouseY}px, ${glowColors[glowIndex]}, transparent 70%)`;
    };
    updateNeon();

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updateNeon();
    });

    setInterval(() => {
      glowIndex = (glowIndex + 1) % glowColors.length;
      updateNeon();
    }, 4000);
  }

  // — OVERLAY & POPUP LOGIC —
  const dimmed       = document.querySelector('.dimmed');
  const aboutPopup   = document.getElementById('about-popup');
  const contactPopup = document.getElementById('contact-popup');
  const adminPopup   = document.getElementById('admin-popup');

  function showPopup(popup) {
    dimmed.classList.add('show');
    popup.classList.add('show');
  }
  function hidePopups() {
    dimmed.classList.remove('show');
    [aboutPopup, contactPopup, adminPopup].forEach(p => p.classList.remove('show'));
  }

  document.querySelector('.about-link').addEventListener('click', e => {
    e.preventDefault();
    showPopup(aboutPopup);
  });

  document.querySelector('.contact-link').addEventListener('click', e => {
    e.preventDefault();
    showPopup(contactPopup);
  });

  document.querySelector('.admin-btn').addEventListener('click', () => {
    // reset admin fields
    const pwd = document.getElementById('admin-password');
    pwd.value = '';
    pwd.type = 'password';
    document.getElementById('toggle-password').textContent = 'Show';
    document.getElementById('admin-error').style.display = 'none';
    showPopup(adminPopup);
  });

  // click outside to close
  dimmed.addEventListener('click', hidePopups);

  // — ADMIN FORM CONTROLS —
  document.getElementById('toggle-password').addEventListener('click', () => {
    const pwd = document.getElementById('admin-password');
    if (pwd.type === 'password') {
      pwd.type = 'text';
      this.textContent = 'Hide';
    } else {
      pwd.type = 'password';
      this.textContent = 'Show';
    }
  });

  document.getElementById('submit-password').addEventListener('click', () => {
    const pwd = document.getElementById('admin-password');
    if (pwd.value === 'admin123') {
      window.location.href = 'admin.html';
    } else {
      pwd.value = '';
      document.getElementById('admin-error').style.display = 'block';
    }
  });

  document.getElementById('cancel-password').addEventListener('click', () => {
    document.getElementById('admin-error').style.display = 'none';
  });

  // — PREVENT OVERSCROLL ON MOBILE —
  document.documentElement.style.overscrollBehavior = 'none';
  document.body.style.overflow = 'hidden';

  // — BALL PHYSICS & DRAG —
  const balls   = [];
  const GRAVITY = 0.3;
  const REST    = 0.8;
  const dropBtn = document.querySelector('.gravity-btn');
  const resetBtn = document.querySelector('.reset-btn');

  function updateBalls() {
    balls.forEach(b => {
      if (!b.isDragging) b.velocityY += GRAVITY;

      let x = parseFloat(b.style.left);
      let y = parseFloat(b.style.top);
      let nx = x + b.velocityX;
      let ny = y + b.velocityY;
      const footerY = document.querySelector('.footer').getBoundingClientRect().top;

      // bounce off walls
      if (nx <= 0 || nx + 2 * b.radius >= window.innerWidth) {
        b.velocityX *= -REST;
      }
      // bounce off floor (footer)
      if (ny + 2 * b.radius >= footerY) {
        b.velocityY *= -REST;
        ny = footerY - 2 * b.radius;
      }

      b.style.left = `${nx}px`;
      b.style.top  = `${ny}px`;
    });
    requestAnimationFrame(updateBalls);
  }

  dropBtn.addEventListener('click', () => {
    const ball = document.createElement('div');
    ball.className = 'ball';
    const d = Math.random() * 30 + 40;
    ball.style.width = ball.style.height = `${d}px`;
    ball.radius = d / 2;
    ball.style.left = `${Math.random() * (window.innerWidth - d)}px`;
    ball.style.top  = '0px';
    ball.velocityX = Math.random() * 2 - 1;
    ball.velocityY = Math.random() * 4 + 1;
    document.body.appendChild(ball);
    balls.push(ball);
    resetBtn.style.display = 'inline-block';

    if (!isMobile) {
      // desktop drag
      ball.addEventListener('mousedown', e => {
        ball.isDragging   = true;
        ball.velocityX    = ball.velocityY = 0;
        ball.dragOffsetX = e.clientX - parseFloat(ball.style.left);
        ball.dragOffsetY = e.clientY - parseFloat(ball.style.top);
      });
      document.addEventListener('mousemove', e => {
        balls.forEach(b => {
          if (b.isDragging) {
            b.style.left = `${e.clientX - b.dragOffsetX}px`;
            b.style.top  = `${e.clientY - b.dragOffsetY}px`;
          }
        });
      });
      document.addEventListener('mouseup', () => {
        balls.forEach(b => b.isDragging = false);
      });
    } else {
      // mobile drag
      ball.addEventListener('touchstart', e => {
        ball.isDragging   = true;
        ball.velocityX    = ball.velocityY = 0;
        ball.dragOffsetX = e.touches[0].clientX - parseFloat(ball.style.left);
        ball.dragOffsetY = e.touches[0].clientY - parseFloat(ball.style.top);
      }, { passive: false });
      ball.addEventListener('touchmove', e => {
        if (ball.isDragging) {
          ball.style.left = `${e.touches[0].clientX - ball.dragOffsetX}px`;
          ball.style.top  = `${e.touches[0].clientY - ball.dragOffsetY}px`;
        }
      }, { passive: false });
      ball.addEventListener('touchend', () => {
        ball.isDragging = false;
      });
    }
  });

  resetBtn.addEventListener('click', () => {
    balls.forEach(b => b.remove());
    balls.length = 0;
    resetBtn.style.display = 'none';
  });

  // start the animation loop
  updateBalls();
});
