(() => {
  function mount(target, options = {}) {
    if (!target) {
      return () => {};
    }

    const reducedMotion = Boolean(options.reducedMotion);
    if (reducedMotion) {
      return () => {};
    }

    const canvas = document.createElement("canvas");
    canvas.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.4;
      z-index: 0;
    `;
    target.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let animationId = null;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = target.clientWidth;
      canvas.height = target.clientHeight;
    };

    const onMouseMove = (e) => {
      const rect = target.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 40;
      const time = Date.now() * 0.001;

      // Get theme
      const isDark = document.documentElement.getAttribute("data-theme") !== "light";
      const lineColor = isDark ? "rgba(96, 165, 250, 0.15)" : "rgba(30, 94, 255, 0.1)";
      const glowColor = isDark ? "rgba(96, 165, 250, 0.3)" : "rgba(30, 94, 255, 0.2)";

      // Draw grid
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const dx = mouseX - x;
          const dy = mouseY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 200;

          if (distance < maxDistance) {
            const intensity = 1 - distance / maxDistance;
            const wave = Math.sin(time + distance * 0.01) * 0.5 + 0.5;
            
            ctx.beginPath();
            ctx.arc(x, y, 2 * intensity * wave, 0, Math.PI * 2);
            ctx.fillStyle = glowColor;
            ctx.fill();

            // Draw connecting lines
            if (x + gridSize < canvas.width) {
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + gridSize, y);
              ctx.strokeStyle = `rgba(96, 165, 250, ${0.1 * intensity})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
            if (y + gridSize < canvas.height) {
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x, y + gridSize);
              ctx.strokeStyle = `rgba(96, 165, 250, ${0.1 * intensity})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          } else {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = lineColor;
            ctx.fill();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    target.addEventListener("mousemove", onMouseMove);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener("resize", resize);
      target.removeEventListener("mousemove", onMouseMove);
      canvas.remove();
    };
  }

  window.ReactBitsAnimatedGrid = { mount };
})();
