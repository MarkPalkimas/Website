(() => {
  // Apple-level smooth theme transition with optimized performance
  function createTransition(x, y, theme) {
    // Prevent multiple transitions
    const existing = document.querySelector(".theme-transition-overlay");
    if (existing) return;
    
    const overlay = document.createElement("div");
    overlay.className = "theme-transition-overlay";
    
    // Calculate optimal circle size for smooth coverage
    const maxDimension = Math.max(window.innerWidth, window.innerHeight);
    const diagonal = Math.sqrt(Math.pow(maxDimension, 2) * 2);
    const finalRadius = Math.ceil(diagonal * 1.2);
    
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: ${theme === "dark" ? "#0a0e1a" : "#f4f6f8"};
      clip-path: circle(0px at ${x}px ${y}px);
      transition: clip-path 0.72s cubic-bezier(0.28, 0.11, 0.32, 1);
      will-change: clip-path;
    `;
    
    document.body.appendChild(overlay);
    
    // Force reflow for smooth animation
    overlay.offsetHeight;
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(${finalRadius}px at ${x}px ${y}px)`;
      });
    });
    
    setTimeout(() => {
      overlay.remove();
    }, 720);
  }

  window.ReactBitsThemeTransition = { createTransition };
})();
