document.addEventListener("DOMContentLoaded", async () => {
  const ENABLE_PROJECTS_SHOWCASE = true;
  const ENABLE_DEV_CONSOLE_SIGNATURE = true;
  const ENABLE_WEB_VITALS_CAPTURE = true;

  const AVAILABILITY = {
    state: "available",
    text: "Availability: Open to internships and junior SWE roles."
  };

  const isDevHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const defaultBuild = {
    commit: "unknown",
    branch: "unknown",
    buildTime: "unknown",
    version: "unknown"
  };
  window.__BUILD__ = Object.assign({}, defaultBuild, window.__BUILD__ || {});

  const hydrateBuildInfo = async () => {
    try {
      const response = await fetch("/build.json", { cache: "no-store" });
      if (!response.ok) {
        return window.__BUILD__;
      }

      const payload = await response.json();
      window.__BUILD__ = Object.assign({}, window.__BUILD__, payload || {});
      return window.__BUILD__;
    } catch {
      return window.__BUILD__;
    }
  };

  const logConsoleSignature = (build) => {
    if (!ENABLE_DEV_CONSOLE_SIGNATURE || isDevHost) {
      return;
    }

    const signatureKey = "mp_console_signature_v1";
    if (window.sessionStorage.getItem(signatureKey) === "1") {
      return;
    }

    const shortCommit = (build.commit || "unknown").slice(0, 7);
    const buildTime = build.buildTime || "unknown";

    console.log("Mark Palkimas - software developer");
    console.log(`Build: ${shortCommit} ${buildTime}`);
    console.log("Repo: https://github.com/MarkPalkimas/Website");

    window.sessionStorage.setItem(signatureKey, "1");
  };

  const initWebVitals = () => {
    if (!ENABLE_WEB_VITALS_CAPTURE || typeof PerformanceObserver === "undefined") {
      return;
    }

    const vitals = {};
    window.__WEB_VITALS__ = vitals;

    const captureEntry = (entry) => {
      if (!entry || !entry.entryType) {
        return;
      }

      if (entry.entryType === "largest-contentful-paint") {
        vitals.lcp = Number(entry.startTime.toFixed(2));
      }

      if (entry.entryType === "first-input") {
        vitals.fid = Number((entry.processingStart - entry.startTime).toFixed(2));
      }

      if (entry.entryType === "layout-shift" && !entry.hadRecentInput) {
        vitals.cls = Number(((vitals.cls || 0) + entry.value).toFixed(4));
      }

      if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
        vitals.fcp = Number(entry.startTime.toFixed(2));
      }
    };

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(captureEntry);
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // no-op
    }

    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(captureEntry);
      });
      fidObserver.observe({ type: "first-input", buffered: true });
    } catch {
      // no-op
    }

    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(captureEntry);
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      // no-op
    }

    try {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(captureEntry);
      });
      paintObserver.observe({ type: "paint", buffered: true });
    } catch {
      // no-op
    }

    if (isDevHost) {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          console.debug("WebVitals", window.__WEB_VITALS__);
        }
      });
    }
  };

  const build = await hydrateBuildInfo();
  logConsoleSignature(build);
  initWebVitals();

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const availabilityPill = document.getElementById("availability-pill");
  if (availabilityPill) {
    availabilityPill.dataset.state = AVAILABILITY.state;
    availabilityPill.textContent = AVAILABILITY.text;
  }

  const nav = document.querySelector(".site-nav");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const menuToggle = document.querySelector(".menu-toggle");

  const closeMenu = () => {
    if (!nav || !menuToggle) {
      return;
    }
    nav.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("menu-open")) {
        return;
      }
      if (event.target instanceof Node && !nav.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  const revealObserver =
    !prefersReducedMotion && typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                return;
              }

              const delay = Number(entry.target.getAttribute("data-delay") || 0);
              window.setTimeout(() => {
                entry.target.classList.add("in-view");
              }, delay);

              observer.unobserve(entry.target);
            });
          },
          {
            threshold: 0.15,
            rootMargin: "0px 0px -9% 0px"
          }
        )
      : null;

  const registerRevealItems = (items) => {
    Array.from(items || []).forEach((item) => {
      if (!(item instanceof Element) || !item.classList.contains("reveal")) {
        return;
      }

      if (prefersReducedMotion || !revealObserver) {
        item.classList.add("in-view");
      } else {
        revealObserver.observe(item);
      }
    });
  };

  registerRevealItems(document.querySelectorAll(".reveal"));

  if (typeof IntersectionObserver !== "undefined") {
    const sections = Array.from(document.querySelectorAll("section[id]"));
    const linkById = new Map(
      navLinks.map((link) => {
        const id = link.getAttribute("href")?.replace("#", "") || "";
        return [id, link];
      })
    );

    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          navLinks.forEach((link) => link.classList.remove("active"));
          const activeLink = linkById.get(entry.target.id);
          if (activeLink) {
            activeLink.classList.add("active");
          }
        });
      },
      {
        threshold: 0.42,
        rootMargin: "-42% 0px -45% 0px"
      }
    );

    sections.forEach((section) => activeObserver.observe(section));
  }

  const projectsShowcaseHost = document.getElementById("projects-showcase");
  if (ENABLE_PROJECTS_SHOWCASE && projectsShowcaseHost && window.ProjectsShowcase?.mount) {
    window.ProjectsShowcase.mount(projectsShowcaseHost, {
      reducedMotion: prefersReducedMotion
    });
  }
});
