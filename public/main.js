document.addEventListener("DOMContentLoaded", async () => {
  const ENABLE_HERO_EFFECT = true;
  const ENABLE_PROJECT_TILT_EFFECT = true;
  const ENABLE_BUTTON_SHINE_EFFECT = true;
  const ENABLE_DYNAMIC_PROJECTS = true;

  const PROJECTS_DATA_URL = "data/projects.json";
  const AVAILABILITY = {
    state: "available",
    text: "Availability: Open to software engineering internships and project collaborations."
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (ENABLE_BUTTON_SHINE_EFFECT) {
    document.body.classList.add("enable-shine");
  }

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const availabilityPill = document.getElementById("availability-pill");
  if (availabilityPill) {
    availabilityPill.textContent = AVAILABILITY.text;
    availabilityPill.dataset.state = AVAILABILITY.state;
  }

  const nav = document.querySelector(".site-nav");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const menuToggle = document.querySelector(".menu-toggle");

  const closeMenu = () => {
    if (!nav || !menuToggle) return;
    nav.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("menu-open")) return;
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

  const typewriterEl = document.getElementById("typewriter");
  const typePhrases = [
    "AI tutoring systems with production guardrails",
    "interactive web products with clean UX",
    "smart contract workflows with reliability in mind",
    "shipping features quickly without sacrificing quality"
  ];

  if (typewriterEl) {
    if (prefersReducedMotion) {
      typewriterEl.textContent = typePhrases[0];
    } else {
      let phraseIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const phrase = typePhrases[phraseIndex];

        if (deleting) {
          charIndex = Math.max(charIndex - 1, 0);
        } else {
          charIndex = Math.min(charIndex + 1, phrase.length);
        }

        typewriterEl.textContent = phrase.slice(0, charIndex);

        let delay = deleting ? 30 : 48;

        if (!deleting && charIndex === phrase.length) {
          delay = 1300;
          deleting = true;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % typePhrases.length;
          delay = 280;
        }

        window.setTimeout(tick, delay);
      };

      tick();
    }
  }

  const revealObserver =
    !prefersReducedMotion && typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;

              const delay = Number(entry.target.getAttribute("data-delay") || 0);
              window.setTimeout(() => {
                entry.target.classList.add("in-view");
              }, delay);

              observer.unobserve(entry.target);
            });
          },
          {
            threshold: 0.15,
            rootMargin: "0px 0px -8% 0px"
          }
        )
      : null;

  const registerRevealItems = (items) => {
    Array.from(items || []).forEach((item) => {
      if (!(item instanceof Element)) return;

      if (!item.classList.contains("reveal")) {
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

  const sections = Array.from(document.querySelectorAll("section[id]"));
  const linkById = new Map(
    navLinks.map((link) => {
      const id = link.getAttribute("href")?.replace("#", "") || "";
      return [id, link];
    })
  );

  if (typeof IntersectionObserver !== "undefined") {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => link.classList.remove("active"));
          const activeLink = linkById.get(entry.target.id);
          if (activeLink) {
            activeLink.classList.add("active");
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: "-40% 0px -45% 0px"
      }
    );

    sections.forEach((section) => activeObserver.observe(section));
  }

  const bindDetailsToggles = (root = document) => {
    const buttons = Array.from(root.querySelectorAll(".details-toggle"));

    buttons.forEach((button) => {
      const panelId = button.getAttribute("aria-controls");
      if (!panelId) return;

      const panel = document.getElementById(panelId);
      if (!panel) return;

      const openLabel = button.dataset.openLabel || button.textContent.trim() || "Details";
      const closeLabel = "Hide details";

      button.textContent = openLabel;

      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        button.textContent = expanded ? openLabel : closeLabel;
        panel.hidden = expanded;
      });
    });
  };

  const createProjectCard = (project, index) => {
    const card = document.createElement("article");
    card.className = "project-card reveal";
    card.dataset.delay = String(Math.min(40 + index * 40, 240));
    card.dataset.reactbitsTilt = "true";

    const media = document.createElement("figure");
    media.className = "project-media";
    const image = document.createElement("img");
    image.src = project.image?.src || "assets/project1.jpg";
    image.alt = project.image?.alt || `${project.title} preview`;
    image.loading = "lazy";
    image.decoding = "async";
    media.appendChild(image);
    card.appendChild(media);

    const headerRow = document.createElement("div");
    headerRow.className = "project-header-row";

    const title = document.createElement("h3");
    title.textContent = project.title;
    headerRow.appendChild(title);

    const kind = document.createElement("span");
    kind.className = "project-kind";
    kind.textContent = project.kind;
    headerRow.appendChild(kind);

    card.appendChild(headerRow);

    const summary = document.createElement("p");
    summary.textContent = project.summary;
    card.appendChild(summary);

    if (Array.isArray(project.techBadges) && project.techBadges.length > 0) {
      const badges = document.createElement("ul");
      badges.className = "tech-badges";
      badges.setAttribute("aria-label", `Verified stack for ${project.title}`);

      project.techBadges.forEach((badge) => {
        const badgeItem = document.createElement("li");
        badgeItem.textContent = badge;
        badges.appendChild(badgeItem);
      });

      card.appendChild(badges);
    }

    if (project.badgeNote) {
      const note = document.createElement("p");
      note.className = "badge-note";
      note.textContent = project.badgeNote;
      card.appendChild(note);
    }

    if (Array.isArray(project.links) && project.links.length > 0) {
      const linksWrap = document.createElement("div");
      linksWrap.className = "project-links";

      project.links.forEach((link) => {
        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noopener";
        anchor.textContent = link.label;
        linksWrap.appendChild(anchor);
      });

      card.appendChild(linksWrap);
    }

    const detailsId = `project-details-${index + 1}`;
    const detailsButton = document.createElement("button");
    detailsButton.className = "details-toggle";
    detailsButton.type = "button";
    detailsButton.setAttribute("aria-expanded", "false");
    detailsButton.setAttribute("aria-controls", detailsId);
    detailsButton.dataset.openLabel = "Details";
    detailsButton.textContent = "Details";
    card.appendChild(detailsButton);

    const detailsPanel = document.createElement("div");
    detailsPanel.id = detailsId;
    detailsPanel.className = "project-details";
    detailsPanel.hidden = true;

    const detailsList = document.createElement("ul");
    (project.details || []).forEach((detail) => {
      const listItem = document.createElement("li");
      listItem.textContent = detail;
      detailsList.appendChild(listItem);
    });

    detailsPanel.appendChild(detailsList);
    card.appendChild(detailsPanel);

    return card;
  };

  const hydrateProjectsFromJson = async () => {
    const projectsGrid = document.getElementById("projects-grid");
    if (!projectsGrid || !ENABLE_DYNAMIC_PROJECTS) {
      return projectsGrid;
    }

    const source = projectsGrid.dataset.projectSource || PROJECTS_DATA_URL;

    try {
      const response = await fetch(source, {
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Projects request failed with ${response.status}`);
      }

      const projects = await response.json();
      if (!Array.isArray(projects)) {
        throw new Error("Projects payload is not an array");
      }

      const fragment = document.createDocumentFragment();
      projects.forEach((project, index) => {
        fragment.appendChild(createProjectCard(project, index));
      });

      projectsGrid.innerHTML = "";
      projectsGrid.appendChild(fragment);

      registerRevealItems(projectsGrid.querySelectorAll(".reveal"));
    } catch (error) {
      console.warn("Project JSON load failed", error);
      if (!projectsGrid.querySelector(".project-card")) {
        projectsGrid.innerHTML =
          '<article class="project-card project-loading in-view"><h3>Unable to load projects.</h3><p>Please refresh this page or visit my GitHub profile directly.</p><div class="project-links"><a href="https://github.com/MarkPalkimas" target="_blank" rel="noopener">GitHub Profile</a></div></article>';
      }
    }

    return projectsGrid;
  };

  const mountProjectTilt = () => {
    const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!ENABLE_PROJECT_TILT_EFFECT || prefersReducedMotion || !supportsFinePointer || !window.ReactBitsCardTilt?.mount) {
      return;
    }

    const cards = document.querySelectorAll("[data-reactbits-tilt]");
    if (cards.length === 0) {
      return;
    }

    window.ReactBitsCardTilt.mount(cards, { maxTilt: 4.5, lift: 5 });
  };

  const projectsGrid = await hydrateProjectsFromJson();
  bindDetailsToggles(projectsGrid || document);
  mountProjectTilt();

  const footerWink = document.getElementById("footer-wink");
  if (footerWink) {
    footerWink.addEventListener("click", () => {
      footerWink.classList.remove("active");
      window.requestAnimationFrame(() => {
        footerWink.classList.add("active");
      });
    });
  }

  const heroAccent = document.getElementById("hero-accent");
  if (ENABLE_HERO_EFFECT && heroAccent && window.ReactBitsHeroAccent?.mount) {
    window.ReactBitsHeroAccent.mount(heroAccent, { reducedMotion: prefersReducedMotion });
  }
});
