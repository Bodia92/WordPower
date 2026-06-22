'use strict';
/* =========================================
   СИЛА СЛОВА — main.js v2
   ========================================= */

const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

/* ── CANVAS SPARKS ── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const GOLD = ['rgba(201,168,76,', 'rgba(232,201,106,', 'rgba(248,220,130,'];

  function Particle() {
    this.reset = function() {
      this.x  = Math.random() * W;
      this.y  = H + 10;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = -(Math.random() * 1.2 + 0.4);
      this.r  = Math.random() * 2 + 0.5;
      this.life = 0;
      this.maxLife = Math.random() * 180 + 100;
      this.clr = GOLD[Math.floor(Math.random() * GOLD.length)];
    };
    this.reset();
    this.life = Math.random() * this.maxLife; // stagger start
  }

  const count = window.innerWidth < 600 ? 35 : 70;
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.life++;
      if (p.life > p.maxLife) { p.reset(); return; }
      p.x += p.vx;
      p.y += p.vy;
      const t = p.life / p.maxLife;
      const alpha = t < 0.2 ? t / 0.2 : t > 0.7 ? (1 - t) / 0.3 : 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.clr + (alpha * 0.8) + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  if (motionOk) draw();
})();

/* ── SOUNDWAVE ANIMATION ── */
(function initSoundwave() {
  const bars = document.querySelectorAll('#swBars rect');
  if (!bars.length || !motionOk) return;

  bars.forEach(bar => {
    const baseH = parseFloat(bar.getAttribute('height'));
    function tick() {
      const newH = baseH * (0.25 + Math.random() * 1.55);
      const newY = Math.max(2, 40 - newH / 2);
      bar.setAttribute('height', newH.toFixed(1));
      bar.setAttribute('y',      newY.toFixed(1));
      setTimeout(tick, 80 + Math.random() * 280);
    }
    setTimeout(tick, Math.random() * 1000);
  });
})();

/* ── SCROLL REVEAL (multi-direction) ── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!motionOk) { items.forEach(el => el.classList.add('is-visible')); return; }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // find index among un-visible siblings in same parent for stagger
      const sibs = [...entry.target.parentElement.querySelectorAll('.reveal:not(.is-visible)')];
      const idx  = sibs.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('is-visible'), Math.min(idx * 90, 450));
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  items.forEach(el => io.observe(el));
})();

/* ── PARALLAX (hero content + floating words) ── */
(function initParallax() {
  if (!motionOk) return;
  const content = document.querySelector('.hero__content');
  const floats  = document.querySelectorAll('.float-word');
  const bgLogo  = document.querySelector('.hero__bg-logo img');
  let ticking   = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      if (sy < vh * 1.2) {
        if (content) {
          content.style.transform = `translateY(${sy * 0.22}px)`;
          content.style.opacity   = Math.max(0, 1 - sy / (vh * 0.75));
        }
        floats.forEach((w, i) => {
          const rate = 0.05 + i * 0.025;
          w.style.transform = `translateY(${-sy * rate}px)`;
        });
        if (bgLogo) bgLogo.style.transform = `rotate(${sy * 0.02}deg)`;
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── CURSOR GLOW on day cards ── */
(function initCardGlow() {
  document.querySelectorAll('.days__item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const glow = card.querySelector('.days__card-glow');
      if (!glow) return;
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      glow.style.left = `${x - 150}px`;
      glow.style.top  = `${y - 150}px`;
    });
  });
})();

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ── REGISTER SECTION parallax glow ── */
(function initRegisterGlow() {
  if (!motionOk) return;
  const section = document.querySelector('.register');
  const glow    = section?.querySelector('.register__glow');
  if (!section || !glow) return;
  section.addEventListener('mousemove', e => {
    const r  = section.getBoundingClientRect();
    const cx = (e.clientX - r.left - r.width  / 2) * 0.05;
    const cy = (e.clientY - r.top  - r.height / 2) * 0.05;
    glow.style.transform = `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;
  });
})();
