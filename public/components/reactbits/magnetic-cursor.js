(() => {
  function mount(options = {}) {
    const reducedMotion = Boolean(options.reducedMotion);
    if (reducedMotion || "ontouchstart" in window) {
      return () => {};
    }

    const cursor = document.createElement("div");
    cursor.className = "magnetic-cursor";
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(96, 165, 250, 0.5);
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: screen;
      transition: transform 0.15s ease-out, width 0.2s ease, height 0.2s ease;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursor);

    const cursorDot = document.createElement("div");
    cursorDot.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      pointer-events: none;
      z-index: 10000;
      transition: transform 0.1s ease-out;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursorDot);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      cursorX += dx * 0.1;
      cursorY += dy * 0.1;

      const dotDx = mouseX - dotX;
      const dotDy = mouseY - dotY;
      dotX += dotDx * 0.15;
      dotY += dotDy * 0.15;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;

      requestAnimationFrame(animate);
    };

    const onMouseEnterInteractive = () => {
      cursor.style.width = "40px";
      cursor.style.height = "40px";
      cursor.style.background = "rgba(96, 165, 250, 0.3)";
    };

    const onMouseLeaveInteractive = () => {
      cursor.style.width = "20px";
      cursor.style.height = "20px";
      cursor.style.background = "rgba(96, 165, 250, 0.5)";
    };

    document.addEventListener("mousemove", onMouseMove);
    animate();

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll("a, button, .showcase-card");
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnterInteractive);
      el.addEventListener("mouseleave", onMouseLeaveInteractive);
    });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cursor.remove();
      cursorDot.remove();
    };
  }

  window.ReactBitsMagneticCursor = { mount };
})();
