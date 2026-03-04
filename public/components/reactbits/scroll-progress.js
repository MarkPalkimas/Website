(() => {
  function mount(options = {}) {
    const reducedMotion = Boolean(options.reducedMotion);
    
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-bright), var(--accent), #8b5cf6);
      z-index: 9999;
      transition: width ${reducedMotion ? "0s" : "0.1s"} ease-out;
      box-shadow: 0 0 10px var(--accent-glow);
    `;
    document.body.appendChild(progress);

    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      progress.style.width = `${scrollPercent}%`;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      progress.remove();
    };
  }

  window.ReactBitsScrollProgress = { mount };
})();
