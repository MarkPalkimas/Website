document.addEventListener("DOMContentLoaded", () => {
  const ENABLE_PROJECTS_SHOWCASE = true;

  const AVAILABILITY = {
    state: "available",
    text: "Availability: Open to internships and junior SWE roles."
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
