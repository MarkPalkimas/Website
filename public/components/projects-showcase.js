(() => {
  const ENABLE_3D = true;
  const ENABLE_TEXT_PATH_ACCENT = true;
  const ENABLE_MODAL = true;
  const ENABLE_DEV_CONSOLE_SIGNATURE = true;

  const MOBILE_BREAKPOINT = 860;
  const SWIPE_THRESHOLD = 56;

  const PROJECTS = [
    {
      title: "StudyGuideAI / AISCHOOL3",
      kind: "AI Tutor Platform",
      summary: "Classroom AI tutor for teacher materials, OCR, and course-specific student Q&A.",
      techBadges: ["React", "Vite", "Tailwind CSS", "Clerk", "OpenAI API"],
      links: [
        { label: "GitHub", url: "https://github.com/MarkPalkimas/AISCHOOL3" },
        { label: "Live", url: "https://mystudyguideai.com" }
      ],
      details: [
        "Includes protected API endpoints for chat and OCR.",
        "Uses role-aware routing for teachers, students, and admin users.",
        "Structured for deployment through Vercel-hosted APIs."
      ],
      image: {
        src: "assets/project1.jpg",
        alt: "StudyGuideAI interface preview"
      }
    },
    {
      title: "Smart Contracts",
      kind: "Blockchain Engineering",
      summary: "Five contract iterations focused on predictable execution and maintainable logic.",
      techBadges: ["Solidity"],
      links: [{ label: "GitHub", url: "https://github.com/MarkPalkimas/MonOP_SmartContracts_V1-V5" }],
      details: [
        "Versioned contract iterations (V1-V5) to improve maintainability over time.",
        "Focused on dependable execution paths for digital agreement workflows.",
        "Used the project to study contract reliability from both implementation and research angles."
      ],
      image: {
        src: "assets/project2.png",
        alt: "Smart contracts project preview"
      }
    },
    {
      title: "Emotional Detection AI",
      kind: "Applied AI",
      summary: "Interactive model that responds to emotional cues in real time.",
      techBadges: [],
      badgeNote: "Stack badges are intentionally omitted until repository stack docs are explicit.",
      links: [{ label: "GitHub", url: "https://github.com/MarkPalkimas/Emotion-Recognition-AI" }],
      details: [
        "Centered on real-time emotional signal interpretation.",
        "Built to make interactions respond to a user's emotional state.",
        "Repository-linked project with additional implementation details in source."
      ],
      image: {
        src: "assets/project3.png",
        alt: "Emotional detection AI preview"
      }
    },
    {
      title: "Real Estate Information AI Scraper/Aggregator",
      kind: "Data + AI Pipeline",
      summary: "Pipeline for scraping and structuring real-estate data for analysis workflows.",
      techBadges: [],
      badgeNote: "Public repository URL is not listed in this codebase yet.",
      links: [{ label: "GitHub Profile", url: "https://github.com/MarkPalkimas" }],
      details: [
        "Project direction is centered on scraping and aggregation workflows.",
        "Set up to support ranking and filtering once data quality is validated.",
        "Add the exact repository URL to show verified stack badges on this card."
      ],
      image: {
        src: "assets/project-real-estate.svg",
        alt: "Real estate AI pipeline concept card"
      }
    }
  ];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createCard(project, index) {
    const card = document.createElement("article");
    card.className = "showcase-card";
    card.setAttribute("role", "listitem");
    card.tabIndex = 0;
    card.dataset.index = String(index);

    const media = document.createElement("figure");
    media.className = "showcase-media";

    const image = document.createElement("img");
    image.src = project.image?.src || "assets/project1.jpg";
    image.alt = project.image?.alt || `${project.title} preview`;
    image.loading = "lazy";
    image.decoding = "async";
    media.appendChild(image);

    const body = document.createElement("div");
    body.className = "showcase-body";

    const kind = document.createElement("p");
    kind.className = "showcase-kind";
    kind.textContent = project.kind;

    const title = document.createElement("h3");
    title.textContent = project.title;

    const summary = document.createElement("p");
    summary.className = "showcase-summary";
    summary.textContent = project.summary;

    body.appendChild(kind);
    body.appendChild(title);
    body.appendChild(summary);

    if (Array.isArray(project.techBadges) && project.techBadges.length > 0) {
      const badges = document.createElement("ul");
      badges.className = "showcase-badges";
      badges.setAttribute("aria-label", `${project.title} stack`);

      project.techBadges.forEach((badge) => {
        const item = document.createElement("li");
        item.textContent = badge;
        badges.appendChild(item);
      });

      body.appendChild(badges);
    }

    if (project.badgeNote) {
      const note = document.createElement("p");
      note.className = "showcase-note";
      note.textContent = project.badgeNote;
      body.appendChild(note);
    }

    const actions = document.createElement("div");
    actions.className = "showcase-actions";

    const links = document.createElement("div");
    links.className = "showcase-links";
    (project.links || []).forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener";
      anchor.textContent = link.label;
      links.appendChild(anchor);
    });

    const details = document.createElement("button");
    details.type = "button";
    details.className = "showcase-open";
    details.textContent = "Details";

    actions.appendChild(links);
    actions.appendChild(details);

    card.appendChild(media);
    card.appendChild(body);
    card.appendChild(actions);

    return card;
  }

  function mount(target, options = {}) {
    if (!target) {
      return () => {};
    }

    const reducedMotion = Boolean(options.reducedMotion);
    const heading = document.querySelector(".projects-heading");
    if (heading) {
      heading.classList.toggle("no-text-path", !ENABLE_TEXT_PATH_ACCENT || reducedMotion);
    }

    target.innerHTML = "";

    const shell = document.createElement("div");
    shell.className = "projects-shell";
    shell.setAttribute("role", "region");
    shell.setAttribute("aria-label", "Project showcase");
    shell.tabIndex = 0;

    const viewport = document.createElement("div");
    viewport.className = "projects-viewport";

    const track = document.createElement("div");
    track.className = "projects-track";
    track.setAttribute("role", "list");

    const cards = PROJECTS.map((project, index) => createCard(project, index));
    cards.forEach((card) => track.appendChild(card));
    viewport.appendChild(track);

    const controls = document.createElement("div");
    controls.className = "projects-controls";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "projects-nav-btn";
    prevBtn.textContent = "Previous";
    prevBtn.setAttribute("aria-label", "Previous project");

    const dots = document.createElement("div");
    dots.className = "projects-dots";

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "projects-nav-btn";
    nextBtn.textContent = "Next";
    nextBtn.setAttribute("aria-label", "Next project");

    const dotButtons = PROJECTS.map((project, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "projects-dot";
      dot.setAttribute("aria-label", `Show ${project.title}`);
      dot.addEventListener("click", () => {
        setActive(index);
      });
      dots.appendChild(dot);
      return dot;
    });

    controls.appendChild(prevBtn);
    controls.appendChild(dots);
    controls.appendChild(nextBtn);

    shell.appendChild(viewport);
    shell.appendChild(controls);
    target.appendChild(shell);

    const modal = document.getElementById("project-modal");
    const modalClose = document.getElementById("project-modal-close");
    const modalBackdrop = modal?.querySelector("[data-modal-close]");
    const modalKind = document.getElementById("project-modal-kind");
    const modalTitle = document.getElementById("project-modal-title");
    const modalSummary = document.getElementById("project-modal-summary");
    const modalBadges = document.getElementById("project-modal-badges");
    const modalLinks = document.getElementById("project-modal-links");
    const modalDetails = document.getElementById("project-modal-details");
    const modalDialog = modal?.querySelector(".project-modal-dialog");

    let activeIndex = 0;
    let dragX = 0;
    let dragStartX = 0;
    let dragPointerId = null;
    let lastWheelTime = 0;
    let rafId = 0;
    let lastModalTrigger = null;
    let modalKeyHandler = null;

    const isDesktop3D = () => ENABLE_3D && !reducedMotion && window.innerWidth > MOBILE_BREAKPOINT;

    const updateControls = () => {
      prevBtn.disabled = activeIndex <= 0;
      nextBtn.disabled = activeIndex >= PROJECTS.length - 1;

      dotButtons.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });

      cards.forEach((card, index) => {
        card.dataset.active = index === activeIndex ? "true" : "false";
      });
    };

    const render3D = () => {
      if (!isDesktop3D()) {
        return;
      }

      const width = Math.max(viewport.clientWidth, 1);
      const dragRatio = dragX / width;

      cards.forEach((card, index) => {
        const offset = index - activeIndex - dragRatio * 2.2;
        const abs = Math.abs(offset);
        const clampedOffset = clamp(offset, -3, 3);
        const translateX = clampedOffset * 46;
        const translateZ = 70 - Math.min(abs, 3) * 170;
        const rotateY = clampedOffset * -16;
        const scale = 1 - Math.min(abs, 2.5) * 0.08;
        const opacity = abs > 2.35 ? 0 : index === activeIndex ? 1 : 0.65;

        card.style.transform = `translate(-50%, -50%) translate3d(${translateX}%, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = String(opacity);
        card.style.zIndex = String(100 - Math.round(abs * 10));
        card.setAttribute("aria-hidden", abs > 2.4 ? "true" : "false");
      });
    };

    const scheduleMobileSync = () => {
      if (isDesktop3D()) {
        return;
      }
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const viewportRect = viewport.getBoundingClientRect();
        const viewportCenter = viewportRect.left + viewportRect.width / 2;
        let nextIndex = activeIndex;
        let minDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const distance = Math.abs(center - viewportCenter);
          if (distance < minDistance) {
            minDistance = distance;
            nextIndex = index;
          }
        });

        if (nextIndex !== activeIndex) {
          activeIndex = nextIndex;
          updateControls();
        }
      });
    };

    const applyMode = () => {
      shell.classList.toggle("is-mobile", !isDesktop3D());
      if (isDesktop3D()) {
        viewport.scrollLeft = 0;
        render3D();
      } else {
        cards.forEach((card) => {
          card.style.transform = "";
          card.style.opacity = "";
          card.style.zIndex = "";
          card.setAttribute("aria-hidden", "false");
        });
        setActive(activeIndex, { scroll: true, force: true });
      }
      updateControls();
    };

    const setActive = (index, options = {}) => {
      const nextIndex = clamp(index, 0, PROJECTS.length - 1);
      if (!options.force && nextIndex === activeIndex) {
        if (isDesktop3D()) {
          render3D();
        }
        return;
      }

      activeIndex = nextIndex;
      updateControls();

      if (isDesktop3D()) {
        render3D();
        return;
      }

      if (options.scroll) {
        cards[activeIndex]?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    };

    const openModal = (index, trigger) => {
      if (!ENABLE_MODAL || !modal || !modalClose || !modalBackdrop || !modalKind || !modalTitle || !modalSummary || !modalBadges || !modalLinks || !modalDetails) {
        return;
      }

      const project = PROJECTS[index];
      if (!project) {
        return;
      }

      lastModalTrigger = trigger instanceof HTMLElement ? trigger : null;

      modalKind.textContent = project.kind || "Project";
      modalTitle.textContent = project.title || "Project Details";
      modalSummary.textContent = project.summary || "";

      modalBadges.innerHTML = "";
      (project.techBadges || []).forEach((badge) => {
        const item = document.createElement("li");
        item.textContent = badge;
        modalBadges.appendChild(item);
      });

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
        const item = document.createElement("li");
        item.textContent = detail;
        modalDetails.appendChild(item);
      });

      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      window.requestAnimationFrame(() => {
        modal.classList.add("is-open");
      });
      modalClose.focus({ preventScroll: true });

      if (modalKeyHandler) {
        document.removeEventListener("keydown", modalKeyHandler);
      }

      modalKeyHandler = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeModal();
          return;
        }

        if (event.key !== "Tab" || !modal || modal.hidden) {
          return;
        }

        const focusables = Array.from(
          modal.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((item) => item instanceof HTMLElement && item.offsetParent !== null);

        if (focusables.length === 0) {
          modalDialog?.focus();
          event.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement;

        if (event.shiftKey && current === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", modalKeyHandler);
    };

    const closeModal = () => {
      if (!modal || modal.hidden) {
        return;
      }

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");

      window.setTimeout(() => {
        if (!modal.classList.contains("is-open")) {
          modal.hidden = true;
        }
      }, reducedMotion ? 0 : 280);

      if (modalKeyHandler) {
        document.removeEventListener("keydown", modalKeyHandler);
        modalKeyHandler = null;
      }

      if (lastModalTrigger) {
        lastModalTrigger.focus({ preventScroll: true });
      }
    };

    cards.forEach((card, index) => {
      const detailsButton = card.querySelector(".showcase-open");

      detailsButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        setActive(index);
        openModal(index, detailsButton);
      });

      card.addEventListener("click", (event) => {
        const targetElement = event.target;
        if (!(targetElement instanceof Element)) {
          return;
        }

        if (targetElement.closest("a")) {
          return;
        }

        if (isDesktop3D() && index !== activeIndex) {
          setActive(index);
          return;
        }

        openModal(index, card);
      });

      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        if (isDesktop3D() && index !== activeIndex) {
          setActive(index);
          return;
        }

        openModal(index, card);
      });
    });

    prevBtn.addEventListener("click", () => {
      setActive(activeIndex - 1, { scroll: true });
    });

    nextBtn.addEventListener("click", () => {
      setActive(activeIndex + 1, { scroll: true });
    });

    shell.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive(activeIndex - 1, { scroll: true });
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive(activeIndex + 1, { scroll: true });
      }
    });

    viewport.addEventListener(
      "wheel",
      (event) => {
        if (!isDesktop3D()) {
          return;
        }

        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (Math.abs(delta) < 36) {
          return;
        }

        const now = Date.now();
        if (now - lastWheelTime < 260) {
          return;
        }

        lastWheelTime = now;
        event.preventDefault();
        setActive(activeIndex + (delta > 0 ? 1 : -1));
      },
      { passive: false }
    );

    viewport.addEventListener("pointerdown", (event) => {
      if (!isDesktop3D() || event.button !== 0) {
        return;
      }

      const targetElement = event.target;
      if (targetElement instanceof Element && targetElement.closest("a, button")) {
        return;
      }

      dragPointerId = event.pointerId;
      dragStartX = event.clientX;
      dragX = 0;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture(dragPointerId);
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!isDesktop3D() || dragPointerId !== event.pointerId) {
        return;
      }

      dragX = event.clientX - dragStartX;
      render3D();
    });

    const endDrag = (event) => {
      if (dragPointerId !== event.pointerId) {
        return;
      }

      viewport.classList.remove("is-dragging");
      viewport.releasePointerCapture(dragPointerId);
      dragPointerId = null;

      if (Math.abs(dragX) > SWIPE_THRESHOLD) {
        setActive(activeIndex + (dragX < 0 ? 1 : -1));
      }

      dragX = 0;
      render3D();
    };

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    viewport.addEventListener("scroll", scheduleMobileSync, { passive: true });
    window.addEventListener("resize", applyMode);

    if (modalClose && modalBackdrop) {
      modalClose.addEventListener("click", closeModal);
      modalBackdrop.addEventListener("click", closeModal);
    }

    applyMode();
    setActive(0, { force: true, scroll: false });

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", applyMode);
    };
  }

  window.ProjectsShowcase = { mount };
})();
