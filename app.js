(() => {
  'use strict';

  /* ---------- Scroll progress ---------- */
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
  if (meterFill && meterSection) {
    const meterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            meterFill.style.strokeDashoffset = '0';
            meterObserver.unobserve(entry.target);
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

    function spawnParticles() {
      particles = [];
      const count = 140;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height * 0.35,
          vx: (Math.random() - 0.5) * 12,
          vy: Math.random() * -10 - 4,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          shape: Math.random() > 0.5 ? 'circle' : 'rect',
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
