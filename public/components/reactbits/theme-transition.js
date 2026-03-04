(() => {
  function createTransition(x, y, theme) {
    const overlay = document.createElement("div");
    overlay.className = "theme-transition-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: ${theme === "dark" ? "#0a0e1a" : "#f4f6f8"};
      clip-path: circle(0% at ${x}px ${y}px);
      transition: clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;
      });
    });
    
    setTimeout(() => {
      overlay.remove();
    }, 800);
  }

  window.ReactBitsThemeTransition = { createTransition };
})();
