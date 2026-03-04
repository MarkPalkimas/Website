(() => {
  function mount(elements, options = {}) {
    const reducedMotion = Boolean(options.reducedMotion);
    if (reducedMotion || "ontouchstart" in window) {
      return () => {};
    }

    const strength = options.strength || 0.3;
    const cleanups = [];

    Array.from(elements || []).forEach((element) => {
      let rafId = null;

      const onMouseMove = (e) => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }

        rafId = requestAnimationFrame(() => {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const deltaX = (e.clientX - centerX) * strength;
          const deltaY = (e.clientY - centerY) * strength;

          element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
      };

      const onMouseLeave = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        element.style.transform = "";
      };

      element.addEventListener("mousemove", onMouseMove);
      element.addEventListener("mouseleave", onMouseLeave);

      cleanups.push(() => {
        element.removeEventListener("mousemove", onMouseMove);
        element.removeEventListener("mouseleave", onMouseLeave);
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }

  window.ReactBitsMagneticElements = { mount };
})();
