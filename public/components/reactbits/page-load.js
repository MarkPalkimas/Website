(() => {
  // Apple-style page load animation with smooth fade-in
  function mount(options = {}) {
    const reducedMotion = Boolean(options.reducedMotion);
    
    if (reducedMotion) return () => {};
    
    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: var(--bg);
      z-index: 10000;
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.52s cubic-bezier(0.28, 0.11, 0.32, 1);
      will-change: opacity;
    `;
    
    document.body.appendChild(overlay);
    
    // Fade out after content is ready
    const fadeOut = () => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
      }, 520);
    };
    
    // Wait for fonts and images
    if (document.readyState === "complete") {
      requestAnimationFrame(() => {
        requestAnimationFrame(fadeOut);
      });
    } else {
      window.addEventListener("load", () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(fadeOut);
        });
      }, { once: true });
    }
    
    return () => {
      overlay.remove();
    };
  }

  window.ReactBitsPageLoad = { mount };
})();
