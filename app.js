(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    if (prefersReducedMotion) {
      preloader.classList.add('is-done');
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => preloader.classList.add('is-done'), 500);
      });
      setTimeout(() => preloader.classList.add('is-done'), 2200);
    }
  }

  /* ---------- Hero heading split reveal ---------- */
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle && !prefersReducedMotion) {
    const words = heroTitle.innerHTML.split(/\s+/);
    heroTitle.innerHTML = words
      .map((w) => `<span class="split-word">${w}&nbsp;</span>`)
      .join('');
    requestAnimationFrame(() => {
      const spans = heroTitle.querySelectorAll('.split-word');
      spans.forEach((s, i) => {
        s.style.transitionDelay = `${i * 60}ms`;
      });
      requestAnimationFrame(() => heroTitle.classList.add('is-split'));
    });
  }

  /* ---------- Ambient hero canvas (drifting hearts/dots) ---------- */
  const ambientCanvas = document.getElementById('ambient-canvas');
  if (ambientCanvas && !prefersReducedMotion && window.innerWidth > 720) {
    const actx = ambientCanvas.getContext('2d');
    let ambientParticles = [];
    function resizeAmbient() {
      const heroEl = ambientCanvas.closest('.hero');
      ambientCanvas.width = heroEl.clientWidth;
      ambientCanvas.height = heroEl.clientHeight;
    }
    function makeAmbientParticles() {
      const count = 22;
      ambientParticles = Array.from({ length: count }, () => ({
        x: Math.random() * ambientCanvas.width,
        y: Math.random() * ambientCanvas.height,
        size: Math.random() * 5 + 3,
        speedY: Math.random() * 0.25 + 0.08,
        drift: Math.random() * 0.6 - 0.3,
        opacity: Math.random() * 0.35 + 0.12,
        heart: Math.random() > 0.6,
      }));
    }
    function drawHeart(x, y, size) {
      actx.beginPath();
      actx.moveTo(x, y);
      actx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
      actx.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
      actx.fill();
    }
    function animateAmbient() {
      actx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
      ambientParticles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.drift;
        if (p.y < -20) {
          p.y = ambientCanvas.height + 20;
          p.x = Math.random() * ambientCanvas.width;
        }
        actx.fillStyle = `rgba(193, 80, 47, ${p.opacity})`;
        if (p.heart) {
          drawHeart(p.x, p.y, p.size);
        } else {
          actx.beginPath();
          actx.arc(p.x, p.y, p.size / 2.4, 0, Math.PI * 2);
          actx.fill();
        }
      });
      requestAnimationFrame(animateAmbient);
    }
    resizeAmbient();
    makeAmbientParticles();
    animateAmbient();
    window.addEventListener('resize', () => {
      resizeAmbient();
    });
  }

  /* ---------- Magnetic button pull ---------- */
  if (canHoverFine && !prefersReducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Tilt-on-hover (fact cards, policy items, terms, countdown units) ---------- */
  function enableTilt() {
    if (!canHoverFine || prefersReducedMotion) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 9;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) translateZ(4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  enableTilt();

  /* ---------- Nav scrollspy + scrolled state + sliding pill ---------- */
  (function initNav() {
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('[data-nav-link]');
    const pill = document.querySelector('.nav__pill');
    const linksContainer = document.querySelector('.nav__links');
    if (!nav || !navLinks.length || !linksContainer) return;

    const sections = Array.from(navLinks)
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    function movePill(link) {
      if (!pill || !link) return;
      const linkRect = link.getBoundingClientRect();
      const containerRect = linksContainer.getBoundingClientRect();
      pill.style.width = linkRect.width + 'px';
      pill.style.transform = `translate(${linkRect.left - containerRect.left}px, -50%)`;
      pill.classList.add('is-ready');
    }

    function setActive(link) {
      navLinks.forEach((a) => a.classList.remove('is-active'));
      if (link) {
        link.classList.add('is-active');
        movePill(link);
      }
    }

    if (sections.length) {
      const spyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const match = Array.from(navLinks).find((a) => a.getAttribute('href') === '#' + entry.target.id);
              if (match) setActive(match);
            }
          });
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
      );
      sections.forEach((s) => spyObserver.observe(s));
    }

    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    }, { passive: true });

    window.addEventListener('resize', () => {
      const activeLink = document.querySelector('[data-nav-link].is-active');
      if (activeLink) movePill(activeLink);
    });
  })();

  /* ---------- Dossier stamp reveal ---------- */
  (function initStamp() {
    const stamp = document.querySelector('.dossier__stamp');
    if (!stamp) return;
    const stampObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stamp.classList.add('is-stamped');
            stampObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    stampObserver.observe(stamp);
  })();

  /* ---------- Scroll progress (existing) ---------- */
  const progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Theme toggle (in-memory only; no persistence) ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.setAttribute('aria-pressed', String(!isDark));
  });

  /* ---------- Custom cursor (desktop / fine pointer only) ---------- */
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && dot && ring) {
    let ringX = 0, ringY = 0, targetX = 0, targetY = 0;
    document.addEventListener('mousemove', (e) => {
      document.body.classList.add('cursor-ready');
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
    });
    function animateRing() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();
    document.querySelectorAll('a, button, .chore-check, .tabs__btn').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Tabs ---------- */
  const tabButtons = document.querySelectorAll('.tabs__btn');
  const tabPanels = document.querySelectorAll('.tabs__panel');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabButtons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      tabPanels.forEach((p) => p.setAttribute('data-active', String(p.id === target)));
    });
  });

  /* ---------- Chore chart toggles ---------- */
  document.querySelectorAll('.chore-check').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));
    });
  });

  /* ---------- Excitement meter ---------- */
  const meterFill = document.querySelector('.meter__fill');
  const meterSection = document.getElementById('excitement');
  const meterWrap = document.querySelector('.meter');
  if (meterFill && meterSection) {
    const meterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            meterFill.style.strokeDashoffset = '0';
            meterObserver.unobserve(entry.target);
            if (meterWrap) {
              setTimeout(() => meterWrap.classList.add('is-complete'), 1600);
            }
          }
        });
      },
      { threshold: 0.4 }
    );
    meterObserver.observe(meterSection);
  }

  /* ---------- Move-in countdown ---------- */
  const countdownTarget = new Date('2026-08-29T00:00:00');
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');
  const countdownNote = document.getElementById('countdown-note');
  function pad(n) {
    return String(Math.max(n, 0)).padStart(2, '0');
  }
  function tickCountdown() {
    const now = new Date();
    let diff = countdownTarget.getTime() - now.getTime();
    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      if (countdownNote) countdownNote.textContent = 'Move-in day is here. I already have my bags by the door.';
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }
  if (elDays) {
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  /* ---------- Dance party confetti ---------- */
  const celebrateBtn = document.getElementById('celebrate-btn');
  const canvas = document.getElementById('confetti-canvas');
  const toast = document.getElementById('toast');
  const toastMessages = [
    'Cue the car karaoke.',
    'Warming up the dance floor.',
    'This is your official first dance party as roommates.',
    'Massage appointments now booking.',
  ];
  let toastIndex = 0;

  if (celebrateBtn && canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId = null;
    const colors = ['#c1502f', '#c98a2c', '#6d7a54', '#e2794f', '#f0d9cd'];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawConfettiHeart(x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
      ctx.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
      ctx.fill();
    }

    function spawnParticles() {
      particles = [];
      const count = 220;
      const origins = [
        { x: canvas.width / 2, y: canvas.height * 0.35 },
        { x: canvas.width * 0.15, y: canvas.height * 0.5 },
        { x: canvas.width * 0.85, y: canvas.height * 0.5 },
      ];
      for (let i = 0; i < count; i++) {
        const origin = origins[i % origins.length];
        const shapeRoll = Math.random();
        particles.push({
          x: origin.x + (Math.random() - 0.5) * 200,
          y: origin.y,
          vx: (Math.random() - 0.5) * 12,
          vy: Math.random() * -10 - 4,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          shape: shapeRoll > 0.66 ? 'heart' : shapeRoll > 0.33 ? 'circle' : 'rect',
          gravity: 0.35 + Math.random() * 0.15,
          life: 0,
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life += 1;
        if (p.y < canvas.height + 40) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.life / 220);
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'heart') {
          drawConfettiHeart(0, 0, p.size / 1.8);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      });
      if (alive) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animId = null;
      }
    }

    celebrateBtn.addEventListener('click', () => {
      spawnParticles();
      if (!animId) animate();
      if (toast) {
        toast.textContent = toastMessages[toastIndex % toastMessages.length];
        toastIndex += 1;
        toast.classList.add('is-visible');
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
      }
    });
  }

  /* ---------- Mobile nav smooth scroll offset already handled via scroll-padding ---------- */
})();
