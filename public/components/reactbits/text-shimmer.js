(() => {
  function mount(elements, options = {}) {
    const reducedMotion = Boolean(options.reducedMotion);
    if (reducedMotion) {
      return () => {};
    }

    const style = document.createElement("style");
    style.textContent = `
      @keyframes shimmer {
        0% {
          background-position: -200% center;
        }
        100% {
          background-position: 200% center;
        }
      }

      .text-shimmer {
        background: linear-gradient(
          90deg,
          var(--text) 0%,
          var(--accent-bright) 25%,
          #8b5cf6 50%,
          var(--accent-bright) 75%,
          var(--text) 100%
        );
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 3s linear infinite;
      }
    `;
    document.head.appendChild(style);

    Array.from(elements || []).forEach((el) => {
      el.classList.add("text-shimmer");
    });

    return () => {
      style.remove();
      Array.from(elements || []).forEach((el) => {
        el.classList.remove("text-shimmer");
      });
    };
  }

  window.ReactBitsTextShimmer = { mount };
})();
