(() => {
  'use strict';

  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menuButton = document.querySelector('.menu-button');
  const navList = document.querySelector('.nav-list');
  const cursor = document.querySelector('.cursor-orb');
  const year = document.getElementById('year');
  const indicator = document.getElementById('scene-indicator');
  const progress = document.querySelector('.scroll-rail i');

  if (year) year.textContent = new Date().getFullYear();

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    navList?.classList.toggle('is-open', !open);
  });
  navList?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    navList.classList.remove('is-open');
  }));

  const revealStaticContent = () => {
    const items = document.querySelectorAll('[data-reveal]');
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(item => observer.observe(item));
  };

  const updateProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
    progress.style.width = `${amount * 100}%`;
  };

  const setSceneLabel = () => {
    if (!indicator || !('IntersectionObserver' in window)) return;
    const scenes = document.querySelectorAll('[data-scroll-scene]');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) indicator.textContent = entry.target.dataset.scrollScene || 'SELECTED WORK';
    }), { rootMargin: '-46% 0px -46% 0px', threshold: 0 });
    scenes.forEach(scene => observer.observe(scene));
  };

  const enablePointerFeedback = () => {
    if (reduceMotion.matches || !window.matchMedia('(pointer:fine)').matches) return;
    window.addEventListener('pointermove', event => {
      if (cursor) cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    }, { passive: true });
    document.querySelectorAll('.magnetic').forEach(element => {
      element.addEventListener('pointermove', event => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .1;
        const y = (event.clientY - rect.top - rect.height / 2) * .13;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
  };

  const initScrollCinema = () => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || reduceMotion.matches) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const media = gsap.matchMedia();

    media.add('(min-width: 801px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        body.classList.add('motion-active');

        const hero = document.querySelector('.hero');
        const heroCopy = document.querySelector('.hero-copy');
        const heroObject = document.querySelector('.hero-object');
        const heroFooter = document.querySelector('.hero-footer');
        if (hero && heroCopy && heroObject && heroFooter) {
          gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .55, invalidateOnRefresh: true } })
            .to(heroCopy, { yPercent: -18, opacity: .45, ease: 'none' }, 0)
            .to(heroObject, { yPercent: 12, scale: .9, rotationZ: -2, ease: 'none' }, 0)
            .to(heroFooter, { opacity: .25, y: 14, ease: 'none' }, 0);
        }

        const buildCenteredScene = ({ track, stage, animation, caption, labels = [] }) => {
          if (!track || !stage) return;
          let activeLabel = -1;
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: track,
              start: 'top top',
              end: 'bottom bottom',
              pin: stage,
              pinSpacing: false,
              scrub: .6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: self => {
                if (!caption || !labels.length) return;
                let next = 0;
                labels.forEach((entry, index) => {
                  if (self.progress >= entry[0]) next = index;
                });
                if (next !== activeLabel) {
                  activeLabel = next;
                  caption.textContent = labels[next][1];
                }
              }
            }
          });
          animation(timeline);
        };

        const studyTrack = document.querySelector('.study-track');
        const studyStage = document.querySelector('.study-stage');
        const studyWindow = document.querySelector('.study-window');
        const studyPapers = document.querySelectorAll('.study-assembly .paper');
        const retrieval = document.querySelector('.retrieval-card');
        const upload = document.querySelector('.upload-slot');
        const answer = document.querySelector('.study-window .answer');
        const askField = document.querySelector('.study-window .ask-field');
        const citations = document.querySelector('.source-citations');
        const studyCaption = document.querySelector('.study-caption');
        buildCenteredScene({
          track: studyTrack,
          stage: studyStage,
          caption: document.querySelector('.study-caption .caption-copy'),
          labels: [
            [0, 'Upload class material'],
            [.2, 'File added to the course workspace'],
            [.45, 'Organizing course material'],
            [.63, 'Finding relevant source material'],
            [.8, 'Grounded answer ready']
          ],
          animation: timeline => {
            timeline
              .fromTo(studyWindow, { y: 52, scale: .92, rotateY: -7 }, { y: 0, scale: 1, rotateY: -5, duration: .2, ease: 'none' }, 0)
              .fromTo(upload, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: .13, ease: 'none' }, .08)
              .fromTo(studyPapers, { y: index => index ? -40 : 40, opacity: 0, scale: .9 }, { y: 0, opacity: 1, scale: 1, stagger: .05, duration: .18, ease: 'none' }, .22)
              .to(studyPapers, { x: index => index ? 68 : -68, opacity: .56, scale: .84, duration: .16, ease: 'none' }, .48)
              .fromTo(retrieval, { y: 28, opacity: 0, scale: .9 }, { y: 0, opacity: 1, scale: 1, duration: .15, ease: 'none' }, .58)
              .fromTo([answer, citations, askField], { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: .04, duration: .18, ease: 'none' }, .7)
              .fromTo(studyCaption, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .12, ease: 'none' }, .84);
          }
        });

        const alpineTrack = document.querySelector('.alpine-track');
        const alpineStage = document.querySelector('.alpine-stage');
        const records = document.querySelectorAll('.data-stage .record-cloud i');
        const pipeline = document.querySelector('.data-track');
        const board = document.querySelector('.signal-board');
        const manualSteps = document.querySelector('.manual-steps');
        const alpineCaption = document.querySelector('.alpine-caption');
        buildCenteredScene({
          track: alpineTrack,
          stage: alpineStage,
          caption: document.querySelector('.alpine-caption .caption-copy'),
          labels: [
            [0, 'Manual handling repeats'],
            [.2, 'Records enter the system'],
            [.43, 'Validation and structure form'],
            [.63, 'Automation takes over'],
            [.82, 'Reliable workflow, less manual work']
          ],
          animation: timeline => {
            timeline
              .fromTo(manualSteps, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: .13, ease: 'none' }, 0)
              .to(records, { x: index => (index - 3.5) * 15, y: index => ((index % 4) - 1.5) * 22, rotation: 0, scale: .78, duration: .22, ease: 'none' }, .18)
              .fromTo(pipeline, { y: 60, opacity: 0, scale: .82 }, { y: 0, opacity: 1, scale: 1, duration: .2, ease: 'none' }, .4)
              .to([records, manualSteps], { opacity: .18, scale: .55, duration: .16, ease: 'none' }, .58)
              .fromTo(board, { x: 76, y: 28, opacity: 0, rotation: 8 }, { x: 0, y: 0, opacity: 1, rotation: 4, duration: .18, ease: 'none' }, .67)
              .fromTo(alpineCaption, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .12, ease: 'none' }, .84);
          }
        });

        const outsmartTrack = document.querySelector('.outsmart-track');
        const outsmartStage = document.querySelector('.outsmart-stage');
        const phone = document.querySelector('.phone-stage .phone');
        const orbit = document.querySelectorAll('.phone-stage .game-orbit');
        const chips = document.querySelectorAll('.phone-stage .game-chip');
        const choices = document.querySelectorAll('.phone-stage .choice');
        const meter = document.querySelector('.game-progress i b');
        const levels = document.querySelector('.level-stack');
        const avatar = document.querySelector('.avatar-card');
        const outsmartCaption = document.querySelector('.outsmart-caption');
        buildCenteredScene({
          track: outsmartTrack,
          stage: outsmartStage,
          caption: document.querySelector('.outsmart-caption .caption-copy'),
          labels: [
            [0, 'Open a level and begin a mission'],
            [.28, 'Progress through AI challenges'],
            [.58, 'Open the avatar lab'],
            [.72, 'Save a customized character'],
            [.86, 'Mission reward unlocked']
          ],
          animation: timeline => {
            timeline
              .fromTo(phone, { y: 46, scale: .92, rotation: 1, opacity: 0 }, { y: 0, scale: 1, rotation: 5, opacity: 1, duration: .2, ease: 'none' }, 0)
              .fromTo(orbit, { opacity: 0, scale: .72 }, { opacity: 1, scale: 1, stagger: .05, duration: .16, ease: 'none' }, .1)
              .fromTo(levels, { x: -28, opacity: 0 }, { x: 0, opacity: 1, duration: .16, ease: 'none' }, .28)
              .fromTo(choices, { x: index => index % 2 ? 20 : -20, opacity: 0 }, { x: 0, opacity: 1, stagger: .04, duration: .16, ease: 'none' }, .43)
              .fromTo(meter, { scaleX: .2 }, { scaleX: 1, transformOrigin: 'left center', duration: .13, ease: 'none' }, .55)
              .fromTo(avatar, { x: 36, y: 18, opacity: 0, rotation: 11 }, { x: 0, y: 0, opacity: 1, rotation: 5, duration: .18, ease: 'none' }, .64)
              .fromTo(chips, { y: index => index ? 28 : -28, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .16, ease: 'none' }, .73)
              .fromTo(outsmartCaption, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .12, ease: 'none' }, .86);
          }
        });

        const portfolioReveal = document.querySelector('.website-reveal');
        const portfolioWindow = document.querySelector('.reveal-window');
        const portfolioLayers = document.querySelectorAll('.portfolio-layers i');
        if (portfolioReveal && portfolioWindow && portfolioLayers.length) {
          gsap.timeline({
            scrollTrigger: {
              trigger: portfolioReveal,
              start: 'top 72%',
              end: 'center 42%',
              scrub: .5,
              invalidateOnRefresh: true
            }
          })
            .fromTo(portfolioWindow, { scale: .92, rotation: -7 }, { scale: 1, rotation: -4, ease: 'none' }, 0)
            .fromTo(portfolioLayers, { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: .07, ease: 'none' }, .18);
        }

        const refresh = () => ScrollTrigger.refresh();
        if (document.fonts?.ready) document.fonts.ready.then(refresh);
        window.addEventListener('load', refresh, { once: true });
      }, document.body);

      return () => {
        body.classList.remove('motion-active');
        context.revert();
      };
    });
  };

  revealStaticContent();
  setSceneLabel();
  enablePointerFeedback();
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  initScrollCinema();
})();
