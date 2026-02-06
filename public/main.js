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

  const typewriterEl = document.getElementById("typewriter");
  const typePhrases = [
    "Python automation and AI tooling",
    "interactive web product development",
    "smart contract engineering",
    "shipping software with measurable impact"
  ];

  if (typewriterEl) {
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

      let delay = deleting ? 32 : 58;

      if (!deleting && charIndex === phrase.length) {
        delay = 1250;
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

  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  const revealObserver = new IntersectionObserver(
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
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

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
      threshold: 0.22,
      rootMargin: "-40% 0px -45% 0px"
    }
  );

  sections.forEach((section) => activeObserver.observe(section));
});
