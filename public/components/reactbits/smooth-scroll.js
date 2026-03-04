(() => {
  // Apple-style smooth scroll with momentum
  function mount(options = {}) {
    const reducedMotion = Boolean(options.reducedMotion);
    
    if (reducedMotion) return () => {};
    
    // Enhanced smooth scrolling for anchor links
    const handleAnchorClick = (e) => {
      const target = e.target.closest("a[href^='#']");
      if (!target) return;
      
      const href = target.getAttribute("href");
      if (!href || href === "#") return;
      
      const targetElement = document.querySelector(href);
      if (!targetElement) return;
      
      e.preventDefault();
      
      // Calculate offset for fixed header
      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
      
      // Smooth scroll with custom easing
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    };
    
    document.addEventListener("click", handleAnchorClick);
    
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }

  window.ReactBitsSmoothScroll = { mount };
})();
