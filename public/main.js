document.addEventListener("DOMContentLoaded", async () => {
  const ENABLE_HERO_EFFECT = true;
  const ENABLE_DYNAMIC_PROJECTS = true;
  const ENABLE_PROJECT_MODAL = true;

  const PROJECTS_DATA_URL = "data/projects.json";
  const AVAILABILITY = {
    state: "available",
    text: "Availability: Open to software engineering internships and project collaborations."
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
      link.addEventListener("click", closeMenu);
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
          if (!entry.isIntersecting) return;

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

  const createProjectCard = (project, index) => {
    const card = document.createElement("article");
    card.className = "project-card reveal";
    card.dataset.delay = String(Math.min(index * 45, 180));

    const media = document.createElement("figure");
    media.className = "project-media";

    const image = document.createElement("img");
    image.src = project.image?.src || "assets/project1.jpg";
    image.alt = project.image?.alt || `${project.title} preview`;
    image.loading = "lazy";
    image.decoding = "async";
    media.appendChild(image);

    const headerRow = document.createElement("div");
    headerRow.className = "project-header-row";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const kind = document.createElement("span");
    kind.className = "project-kind";
    kind.textContent = project.kind;

    headerRow.appendChild(title);
    headerRow.appendChild(kind);

    const summary = document.createElement("p");
    summary.textContent = project.summary;

    card.appendChild(media);
    card.appendChild(headerRow);
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
      const badgeNote = document.createElement("p");
      badgeNote.className = "badge-note";
      badgeNote.textContent = project.badgeNote;
      card.appendChild(badgeNote);
    }

    const actions = document.createElement("div");
    actions.className = "project-actions";

    const linksWrap = document.createElement("div");
    linksWrap.className = "project-links";

    (project.links || []).forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener";
      anchor.textContent = link.label;
      linksWrap.appendChild(anchor);
    });

    const detailsBtn = document.createElement("button");
    detailsBtn.type = "button";
    detailsBtn.className = "project-open";
    detailsBtn.textContent = "Details";
    detailsBtn.dataset.projectIndex = String(index);

    actions.appendChild(linksWrap);
    actions.appendChild(detailsBtn);
    card.appendChild(actions);

    return card;
  };

  const hydrateProjectsFromJson = async () => {
    const projectsGrid = document.getElementById("projects-grid");
    if (!projectsGrid || !ENABLE_DYNAMIC_PROJECTS) {
      return { projectsGrid, projects: [] };
    }

    const source = projectsGrid.dataset.projectSource || PROJECTS_DATA_URL;

    try {
      const response = await fetch(source, {
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Projects request failed: ${response.status}`);
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

      return { projectsGrid, projects };
    } catch (error) {
      console.warn("Unable to load projects JSON", error);
      projectsGrid.innerHTML =
        '<article class="project-card project-loading in-view"><h3>Unable to load projects.</h3><p>Please refresh this page or view GitHub directly.</p><div class="project-links"><a href="https://github.com/MarkPalkimas" target="_blank" rel="noopener">GitHub Profile</a></div></article>';
      return { projectsGrid, projects: [] };
    }
  };

  const bindProjectModal = (projects) => {
    if (!ENABLE_PROJECT_MODAL) {
      return;
    }

    const modal = document.getElementById("project-modal");
    const modalClose = document.getElementById("project-modal-close");
    const modalBackdrop = modal?.querySelector("[data-modal-close]");
    const modalTitle = document.getElementById("project-modal-title");
    const modalKind = document.getElementById("project-modal-kind");
    const modalSummary = document.getElementById("project-modal-summary");
    const modalBadges = document.getElementById("project-modal-badges");
    const modalLinks = document.getElementById("project-modal-links");
    const modalDetails = document.getElementById("project-modal-details");

    if (!modal || !modalClose || !modalBackdrop || !modalTitle || !modalKind || !modalSummary || !modalBadges || !modalLinks || !modalDetails) {
      return;
    }

    let currentIndex = -1;

    const openModal = (index) => {
      const project = projects[index];
      if (!project) return;

      currentIndex = index;
      modalKind.textContent = project.kind || "Project";
      modalTitle.textContent = project.title || "Project Details";
      modalSummary.textContent = project.summary || "";

      modalBadges.innerHTML = "";
      (project.techBadges || []).forEach((badge) => {
        const badgeItem = document.createElement("li");
        badgeItem.textContent = badge;
        modalBadges.appendChild(badgeItem);
      });

      if ((project.techBadges || []).length === 0) {
        modalBadges.innerHTML = "";
      }

      modalLinks.innerHTML = "";
      (project.links || []).forEach((link) => {
        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noopener";
        anchor.textContent = link.label;
        modalLinks.appendChild(anchor);
      });

      modalDetails.innerHTML = "";
      (project.details || []).forEach((detail) => {
        const listItem = document.createElement("li");
        listItem.textContent = detail;
        modalDetails.appendChild(listItem);
      });

      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      window.requestAnimationFrame(() => {
        modal.classList.add("is-open");
      });
    };

    const closeModal = () => {
      if (modal.hidden) return;

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      currentIndex = -1;

      window.setTimeout(() => {
        if (!modal.classList.contains("is-open")) {
          modal.hidden = true;
        }
      }, prefersReducedMotion ? 0 : 280);
    };

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest(".project-open");
      if (trigger) {
        const index = Number(trigger.getAttribute("data-project-index"));
        if (!Number.isNaN(index)) {
          openModal(index);
        }
      }
    });

    modalClose.addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && currentIndex >= 0) {
        closeModal();
      }
    });
  };

  const { projects } = await hydrateProjectsFromJson();
  bindProjectModal(projects);

  const heroAccent = document.getElementById("hero-accent");
  if (ENABLE_HERO_EFFECT && heroAccent && window.ReactBitsHeroAccent?.mount) {
    window.ReactBitsHeroAccent.mount(heroAccent, { reducedMotion: prefersReducedMotion });
  }
});
