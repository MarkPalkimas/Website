document.addEventListener('DOMContentLoaded', () => {
  const isMobile = 'ontouchstart' in window;
  const dimmed = document.querySelector('.dimmed');
  const menuBtn = document.querySelector('.menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  const aboutPopup = document.getElementById('about-popup');
  const contactPopup = document.getElementById('contact-popup');
  const adminPopup = document.getElementById('admin-popup');

  // Menu toggle
  menuBtn.addEventListener('click', () => navMenu.classList.toggle('open'));

  // Popups
  document.querySelector('.about-link').addEventListener('click', e => {
    e.preventDefault(); dimmed.style.display='block'; aboutPopup.style.display='block';
  });
  document.querySelector('.contact-link').addEventListener('click', e => {
    e.preventDefault(); dimmed.style.display='block'; contactPopup.style.display='block';
  });
  document.querySelector('.admin-btn').addEventListener('click', () => {
    dimmed.style.display='block'; adminPopup.style.display='block';
    const pwd = document.getElementById('admin-password');
    pwd.value = ''; pwd.type = 'password';
    document.getElementById('toggle-password').textContent = 'Show';
    document.getElementById('admin-error').style.display = 'none';
  });
  dimmed.addEventListener('click', () => {
    [aboutPopup, contactPopup, adminPopup].forEach(p => p.style.display = 'none');
    dimmed.style.display = 'none';
  });

  // Admin controls
  document.getElementById('toggle-password').addEventListener('click', () => {
    const pwd = document.getElementById('admin-password');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('submit-password').addEventListener('click', () => {
    const pwd = document.getElementById('admin-password');
    if (pwd.value === 'admin123') window.location.href = 'admin.html';
    else { pwd.value = ''; document.getElementById('admin-error').style.display = 'block'; }
  });
  document.getElementById('cancel-password').addEventListener('click', () => {
    document.getElementById('admin-error').style.display = 'none';
  });

  // Prevent overscroll
  document.documentElement.style.overscrollBehavior = 'none';
  document.body.style.overflow = 'hidden';

  // Ball Physics & Drag
  const balls = [], GRAVITY = 0.3, REST = 0.8;
  const dropBtn = document.querySelector('.gravity-btn'),
        resetBtn = document.querySelector('.reset-btn');

  function update() {
    balls.forEach(b => {
      if (!b.isDragging) b.velocityY += GRAVITY;
      let x = parseFloat(b.style.left), y = parseFloat(b.style.top);
      let nx = x + b.velocityX, ny = y + b.velocityY;
      const footerY = document.querySelector('.footer').getBoundingClientRect().top;
      if (nx <= 0 || nx + 2*b.radius >= window.innerWidth) b.velocityX *= -REST;
      if (ny + 2*b.radius >= footerY) {
        b.velocityY *= -REST;
        ny = footerY - 2*b.radius;
      }
      b.style.left = nx + 'px';
      b.style.top  = ny + 'px';
    });
    requestAnimationFrame(update);
  }

  dropBtn.addEventListener('click', () => {
    const ball = document.createElement('div');
    ball.className = 'ball';
    const d = Math.random()*30 + 40;
    ball.style.width = ball.style.height = d + 'px';
    ball.radius = d/2; ball.mass = d*d;
    ball.style.left = Math.random()*(window.innerWidth - d) + 'px';
    ball.style.top = '0px';
    ball.velocityX = Math.random()*2 - 1;
    ball.velocityY = Math.random()*4 + 1;
    document.body.appendChild(ball);
    balls.push(ball);
    resetBtn.style.display = 'inline-block';

    // Desktop drag
    if (!isMobile) {
      ball.addEventListener('mousedown', e => {
        ball.isDragging = true;
        ball.velocityX = ball.velocityY = 0;
        ball.dragOffsetX = e.clientX - parseFloat(ball.style.left);
        ball.dragOffsetY = e.clientY - parseFloat(ball.style.top);
      });
      document.addEventListener('mousemove', e => {
        balls.forEach(b => {
          if (b.isDragging) {
            b.style.left = (e.clientX - b.dragOffsetX) + 'px';
            b.style.top  = (e.clientY - b.dragOffsetY) + 'px';
          }
        });
      });
      document.addEventListener('mouseup', () => balls.forEach(b => b.isDragging = false));
    }
    // Mobile drag
    else {
      ball.addEventListener('touchstart', e => {
        ball.isDragging = true;
        ball.velocityX = ball.velocityY = 0;
        ball.dragOffsetX = e.touches[0].clientX - parseFloat(ball.style.left);
        ball.dragOffsetY = e.touches[0].clientY - parseFloat(ball.style.top);
      }, { passive:false });
      ball.addEventListener('touchmove', e => {
        if (ball.isDragging) {
          ball.style.left = (e.touches[0].clientX - ball.dragOffsetX) + 'px';
          ball.style.top  = (e.touches[0].clientY - ball.dragOffsetY) + 'px';
        }
      }, { passive:false });
      ball.addEventListener('touchend', () => ball.isDragging = false);
    }
  });

  resetBtn.addEventListener('click', () => {
    balls.forEach(b => b.remove());
    balls.length = 0;
    resetBtn.style.display = 'none';
  });

  update();
});
