(() => {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeStandard(value) {
    const t = clamp(value, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  }

  function mount(container, options = {}) {
    if (!container) {
      return () => {};
    }

    const chips = Array.from(container.querySelectorAll(".flow-chip"));
    if (chips.length === 0) {
      return () => {};
    }

    const reducedMotion = Boolean(options.reducedMotion);
    if (reducedMotion) {
      chips.forEach((chip) => chip.style.setProperty("--flow-progress", "1"));
      return () => {};
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;

      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // Starts before the group enters the viewport and completes near center view.
      const baseProgress = clamp((vh - rect.top) / (vh + rect.height * 0.55), 0, 1);

      chips.forEach((chip, index) => {
        const stagger = index * 0.09;
        const localProgress = clamp((baseProgress - stagger) / (1 - stagger), 0, 1);
        chip.style.setProperty("--flow-progress", easeStandard(localProgress).toFixed(4));
      });
    };

    const onScrollOrResize = () => {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }

  window.ReactBitsFlowIcons = { mount };
})();
