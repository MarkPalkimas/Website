(() => {
  function attachTilt(card, options) {
    const maxTilt = Number(options.maxTilt || 4.5);
    const lift = Number(options.lift || 5);
    let frameId = 0;

    function update(clientX, clientY) {
      const rect = card.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      const tiltY = (x - 0.5) * maxTilt * 2;
      const tiltX = (0.5 - y) * maxTilt * 2;

      card.style.setProperty("--glow-x", `${Math.max(0, Math.min(100, x * 100))}%`);
      card.style.setProperty("--glow-y", `${Math.max(0, Math.min(100, y * 100))}%`);
      card.style.transform = `perspective(900px) translateY(-${lift}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      card.classList.add("is-tilting");
    }

    function onPointerMove(event) {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(() => update(event.clientX, event.clientY));
    }

    function onPointerExit() {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      card.style.transform = "";
      card.classList.remove("is-tilting");
    }

    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerleave", onPointerExit);
    card.addEventListener("pointercancel", onPointerExit);
    card.addEventListener("pointerup", onPointerExit);

    return () => {
      card.removeEventListener("pointermove", onPointerMove);
      card.removeEventListener("pointerleave", onPointerExit);
      card.removeEventListener("pointercancel", onPointerExit);
      card.removeEventListener("pointerup", onPointerExit);
    };
  }

  function mount(elements, options = {}) {
    const list = Array.from(elements || []);
    const cleanup = list.map((card) => attachTilt(card, options));

    return () => {
      cleanup.forEach((fn) => fn());
    };
  }

  window.ReactBitsCardTilt = { mount };
})();
