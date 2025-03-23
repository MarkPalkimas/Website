document.addEventListener("DOMContentLoaded", function () {
  // --- Neon Glow Effect ---
  const neonContainer = document.getElementById("neon-container");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  const glowColors = ["#00d084", "#3498db", "#8e44ad", "#f39c12"];
  let glowIndex = 0;
  
  function updateNeonBackground() {
    neonContainer.style.background = `radial-gradient(circle at ${mouseX}px ${mouseY}px, ${glowColors[glowIndex]}, transparent 70%)`;
  }
  updateNeonBackground();
  
  document.addEventListener("mousemove", function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    updateNeonBackground();
  });
  
  setInterval(() => {
    glowIndex = (glowIndex + 1) % glowColors.length;
    updateNeonBackground();
  }, 4000);
  
  // --- Example: Ball Physics (simplified) ---
  const gravityBtn = document.querySelector(".gravity-btn");
  const resetBtn = document.querySelector(".reset-btn");
  const balls = [];
  const GRAVITY = 0.3;
  const RESTITUTION = 0.8;
  
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
      
      // Use footer if available; else, use window.innerHeight
      const footer = document.querySelector(".footer");
      const ground = footer ? footer.getBoundingClientRect().top + window.scrollY : window.innerHeight;
      if (newTop + ball.radius * 2 >= ground) {
        newTop = ground - ball.radius * 2;
        ball.velocityY = -ball.velocityY * RESTITUTION;
        ball.velocityX *= RESTITUTION;
      }
      
      ball.style.top = newTop + "px";
      ball.style.left = newLeft + "px";
    });
    
    requestAnimationFrame(updateBalls);
  }
  
  updateBalls();
  
  // --- Additional interactive features can be added here (popups, falling quotes, etc.) ---
});
