document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const nav = document.querySelector(".site-nav");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const menuToggle = document.querySelector(".menu-toggle");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const focusRotator = document.getElementById("focus-rotator");
  const focusItems = [
    "Python automation",
    "AI-driven tooling",
    "high-impact web experiences",
    "smart contract systems"
  ];

  if (focusRotator) {
    let index = 0;
    setInterval(() => {
      focusRotator.style.opacity = "0";

      setTimeout(() => {
        index = (index + 1) % focusItems.length;
        focusRotator.textContent = focusItems[index];
        focusRotator.style.opacity = "1";
      }, 180);
    }, 2200);
  }

  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const sections = Array.from(document.querySelectorAll("section[id]"));
  const linkBySection = new Map(
    navLinks.map((link) => {
      const targetId = link.getAttribute("href")?.replace("#", "") || "";
      return [targetId, link];
    })
  );

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const activeId = entry.target.id;
        navLinks.forEach((link) => link.classList.remove("active"));

        const activeLink = linkBySection.get(activeId);
        if (activeLink) {
          activeLink.classList.add("active");
        }
      });
    },
    {
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0.01
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
});
