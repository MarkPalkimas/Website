(() => {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mount(target, options = {}) {
    if (!target) {
      return () => {};
    }

    const reducedMotion = Boolean(options.reducedMotion);
    target.innerHTML = "";

    const primary = document.createElement("span");
    primary.className = "hero-accent-layer primary";

    const secondary = document.createElement("span");
    secondary.className = "hero-accent-layer secondary";

    target.appendChild(primary);
    target.appendChild(secondary);

    if (reducedMotion) {
      target.style.setProperty("--hero-parallax-y", "0px");
      return () => {
        target.innerHTML = "";
      };
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const offset = (progress - 0.5) * 16;
      target.style.setProperty("--hero-parallax-y", `${offset.toFixed(2)}px`);
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
      target.innerHTML = "";
    };
  }

  window.ReactBitsHeroAccent = { mount };
})();
