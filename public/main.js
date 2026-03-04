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

  // Theme management
  const THEME_KEY = "portfolio-theme";
  const getStoredTheme = () => localStorage.getItem(THEME_KEY);
  const setStoredTheme = (theme) => localStorage.setItem(THEME_KEY, theme);
  
  const getPreferredTheme = () => {
    const stored = getStoredTheme();
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    setStoredTheme(theme);
  };

  // Initialize theme
  setTheme(getPreferredTheme());

  // Theme toggle button
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", (e) => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      
      // Create animated transition
      if (window.ReactBitsThemeTransition?.createTransition) {
        const rect = themeToggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        window.ReactBitsThemeTransition.createTransition(x, y, newTheme);
      }
      
      // Small delay to sync with animation
      setTimeout(() => {
        setTheme(newTheme);
      }, 50);
    });
  }

  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!getStoredTheme()) {
      setTheme(e.matches ? "dark" : "light");
    }
  });

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

  // Initialize particles in hero section
  const heroSection = document.querySelector(".hero");
  if (heroSection && window.ReactBitsParticles?.mount && !prefersReducedMotion) {
    const particleContainer = document.createElement("div");
    particleContainer.style.position = "absolute";
    particleContainer.style.inset = "0";
    particleContainer.style.pointerEvents = "none";
    particleContainer.style.zIndex = "0";
    heroSection.style.position = "relative";
    heroSection.insertBefore(particleContainer, heroSection.firstChild);
    window.ReactBitsParticles.mount(particleContainer, { reducedMotion: prefersReducedMotion });
  }

  // Initialize magnetic cursor
  if (window.ReactBitsMagneticCursor?.mount && !prefersReducedMotion) {
    window.ReactBitsMagneticCursor.mount({ reducedMotion: prefersReducedMotion });
  }

  // Initialize scroll progress indicator
  if (window.ReactBitsScrollProgress?.mount) {
    window.ReactBitsScrollProgress.mount({ reducedMotion: prefersReducedMotion });
  }

  // Initialize text shimmer on hero heading
  if (window.ReactBitsTextShimmer?.mount && !prefersReducedMotion) {
    const heroHeading = document.querySelector(".hero h1");
    if (heroHeading) {
      window.ReactBitsTextShimmer.mount([heroHeading], { reducedMotion: prefersReducedMotion });
    }
  }

  // Initialize floating badges in skills section
  if (window.ReactBitsFloatingBadges?.mount && !prefersReducedMotion) {
    const skillsSection = document.getElementById("skills");
    if (skillsSection) {
      skillsSection.style.position = "relative";
      window.ReactBitsFloatingBadges.mount(skillsSection, {
        reducedMotion: prefersReducedMotion,
        badges: [
          { text: "React", x: 10, y: 15 },
          { text: "TypeScript", x: 85, y: 20 },
          { text: "Node.js", x: 15, y: 75 },
          { text: "Python", x: 80, y: 70 },
          { text: "AI/ML", x: 50, y: 50 },
        ]
      });
    }
  }

  // Initialize animated grid in projects section
  if (window.ReactBitsAnimatedGrid?.mount && !prefersReducedMotion) {
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      projectsSection.style.position = "relative";
      window.ReactBitsAnimatedGrid.mount(projectsSection, { reducedMotion: prefersReducedMotion });
    }
  }

  // Initialize magnetic effect on buttons
  if (window.ReactBitsMagneticElements?.mount && !prefersReducedMotion) {
    const buttons = document.querySelectorAll(".btn, .resume-btn, .theme-toggle");
    window.ReactBitsMagneticElements.mount(buttons, { 
      reducedMotion: prefersReducedMotion,
      strength: 0.2
    });
  }

  // Add mouse tracking for card hover effects
  const addMouseTracking = (elements) => {
    elements.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mouse-x", `${x}%`);
        el.style.setProperty("--mouse-y", `${y}%`);
      });
    });
  };

  // Apply to skill groups, panels, and contact cards
  addMouseTracking(document.querySelectorAll(".skill-group, .panel, .contact-card"));

  // Observer for dynamically added showcase cards
  const cardObserver = new MutationObserver(() => {
    const showcaseCards = document.querySelectorAll(".showcase-card");
    addMouseTracking(showcaseCards);
  });

  const projectsShowcase = document.getElementById("projects-showcase");
  if (projectsShowcase) {
    cardObserver.observe(projectsShowcase, { childList: true, subtree: true });
  }
});
