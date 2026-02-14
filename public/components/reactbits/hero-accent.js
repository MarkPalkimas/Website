(() => {
  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makeBlob(width, height) {
    return {
      x: randomBetween(0.12, 0.88) * width,
      y: randomBetween(0.12, 0.88) * height,
      vx: randomBetween(-0.028, 0.028),
      vy: randomBetween(-0.022, 0.022),
      radius: randomBetween(120, 260),
      alpha: randomBetween(0.08, 0.2),
      hue: randomBetween(193, 212)
    };
  }

  function mount(target, options = {}) {
    if (!target) {
      return () => {};
    }

    const reducedMotion = Boolean(options.reducedMotion);
    const canvas = document.createElement("canvas");
    canvas.className = "hero-accent-canvas";
    target.appendChild(canvas);

    const context = canvas.getContext("2d");
    if (!context) {
      return () => {};
    }

    const blobs = [];
    let width = 0;
    let height = 0;
    let rafId = 0;
    let lastTs = 0;

    function resetBlobs() {
      blobs.length = 0;
      for (let i = 0; i < 4; i += 1) {
        blobs.push(makeBlob(width, height));
      }
    }

    function resize() {
      width = Math.max(1, target.clientWidth);
      height = Math.max(1, target.clientHeight);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      resetBlobs();
      draw(0);
    }

    function draw(deltaMs) {
      context.clearRect(0, 0, width, height);

      blobs.forEach((blob) => {
        if (!reducedMotion && deltaMs > 0) {
          blob.x += blob.vx * deltaMs;
          blob.y += blob.vy * deltaMs;

          if (blob.x < -blob.radius * 0.2 || blob.x > width + blob.radius * 0.2) {
            blob.vx *= -1;
          }
          if (blob.y < -blob.radius * 0.2 || blob.y > height + blob.radius * 0.2) {
            blob.vy *= -1;
          }
        }

        const gradient = context.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        gradient.addColorStop(0, `hsla(${blob.hue}, 100%, 62%, ${blob.alpha})`);
        gradient.addColorStop(1, `hsla(${blob.hue}, 100%, 62%, 0)`);

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        context.fill();
      });
    }

    function animate(timestamp) {
      const delta = lastTs > 0 ? Math.min(timestamp - lastTs, 34) : 16;
      lastTs = timestamp;
      draw(delta);
      rafId = window.requestAnimationFrame(animate);
    }

    resize();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(target);
    } else {
      window.addEventListener("resize", resize);
    }

    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(animate);
    }

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resize);
      }
      canvas.remove();
    };
  }

  window.ReactBitsHeroAccent = { mount };
})();
