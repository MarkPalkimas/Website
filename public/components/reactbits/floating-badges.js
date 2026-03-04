(() => {
  function mount(target, options = {}) {
    if (!target) {
      return () => {};
    }

    const reducedMotion = Boolean(options.reducedMotion);
    if (reducedMotion) {
      return () => {};
    }

    const badges = options.badges || [];
    const container = document.createElement("div");
    container.style.cssText = `
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    `;

    badges.forEach((badge, index) => {
      const el = document.createElement("div");
      el.textContent = badge.text;
      el.style.cssText = `
        position: absolute;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        color: var(--accent-bright);
        backdrop-filter: blur(10px);
        animation: float-${index} ${15 + index * 3}s ease-in-out infinite;
        left: ${badge.x || Math.random() * 80 + 10}%;
        top: ${badge.y || Math.random() * 80 + 10}%;
        opacity: 0.6;
      `;
      container.appendChild(el);

      const style = document.createElement("style");
      style.textContent = `
        @keyframes float-${index} {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 10 - 5}deg);
          }
          50% {
            transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 10 - 5}deg);
          }
          75% {
            transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 10 - 5}deg);
          }
        }
      `;
      document.head.appendChild(style);
    });

    target.appendChild(container);

    return () => {
      container.remove();
    };
  }

  window.ReactBitsFloatingBadges = { mount };
})();
