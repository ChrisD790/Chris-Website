/* ================================================================
   main.js — Portfolio Framework
   All interactive behaviour lives here.
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   CONFIG — edit these values to personalise
---------------------------------------------------------------- */
const CONFIG = {
  // Rotating roles shown in the hero typewriter
  roles: [
    'Mechatronics Engineering Student',
    'Software Developer',
    'Robotics And Automation Developer',
    'Computer Vision Enthusiast',
    'FIRST Tech Challenge Team Lead',
  ],
  typeSpeed:   80,   // ms per character (typing)
  deleteSpeed: 40,   // ms per character (deleting)
  pauseAfter:  2000, // ms to pause before deleting
};

/* ================================================================
   1. TYPEWRITER  — cycles through CONFIG.roles in the hero
================================================================ */
(function initTypewriter() {
  const el = document.getElementById('heroRole');
  if (!el) return;

  let roleIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;

  function tick() {
    const current = CONFIG.roles[roleIndex % CONFIG.roles.length];
    el.textContent = isDeleting
      ? current.slice(0, charIndex--)
      : current.slice(0, charIndex++);

    let delay = isDeleting ? CONFIG.deleteSpeed : CONFIG.typeSpeed;

    if (!isDeleting && charIndex > current.length) {
      delay = CONFIG.pauseAfter;
      isDeleting = true;
    } else if (isDeleting && charIndex < 0) {
      isDeleting = false;
      charIndex  = 0;
      roleIndex++;
      delay = 400;
    }

    setTimeout(tick, delay);
  }
  tick();
})();

/* ================================================================
   2. SNOWFALL CANVAS — drifting blue/purple particles across the
      full page, no mouse interaction
================================================================ */
(function initSnow() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Snowflake count — more = denser snowfall
  const COUNT = 200;

  // Colour palette: mostly blues with a violet minority
  const PALETTE = [
    { r: 96,  g: 165, b: 250 }, // #60a5fa  sky blue     (dominant)
    { r: 96,  g: 165, b: 250 }, // repeated for weight
    { r: 147, g: 197, b: 253 }, // #93c5fd  lighter blue
    { r: 147, g: 197, b: 253 },
    { r: 129, g: 140, b: 248 }, // #818cf8  indigo
    { r: 167, g: 139, b: 250 }, // #a78bfa  violet (less frequent)
    { r: 199, g: 210, b: 254 }, // #c7d2fe  lavender-white
  ];

  let W, H;
  let flakes = [];

  class Flake {
    constructor(initY) {
      this.reset(initY !== undefined ? initY : Math.random() * -50);
    }

    reset(startY) {
      this.x     = Math.random() * W;
      this.y     = startY !== undefined ? startY : -6;
      // Vary size: most are tiny, a few larger
      this.r     = Math.random() < 0.15
                    ? Math.random() * 2.2 + 1.4   // occasional larger flake
                    : Math.random() * 1.4 + 0.4;  // typical small flake
      // Drift: slow gentle fall with slight horizontal sway
      this.vy    = Math.random() * 0.7 + 0.25;    // downward speed
      this.vx    = (Math.random() - 0.5) * 0.35;  // horizontal drift
      // Each flake gently sways on a sine wave
      this.swayAmp   = Math.random() * 0.4;        // sway width
      this.swayFreq  = Math.random() * 0.012 + 0.004;
      this.swayOff   = Math.random() * Math.PI * 2;
      this.tick      = 0;
      // Colour
      this.col   = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      // Opacity: fainter for tiny ones so they blur into the bg
      this.a     = this.r < 1.2
                    ? Math.random() * 0.25 + 0.08
                    : Math.random() * 0.45 + 0.15;
    }

    update() {
      this.tick++;
      this.x += this.vx + Math.sin(this.tick * this.swayFreq + this.swayOff) * this.swayAmp;
      this.y += this.vy;
      // Reset when it falls off bottom or drifts too far sideways
      if (this.y > H + 10 || this.x < -20 || this.x > W + 20) {
        this.reset();
      }
    }

    draw() {
      const { r, g, b } = this.col;
      // Soft glow for larger flakes
      if (this.r > 1.6) {
        const grd = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.r * 2.5
        );
        grd.addColorStop(0,   `rgba(${r},${g},${b},${this.a})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }
      // Solid core dot
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.a + 0.1})`;
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    // Spread initial flakes across the full height so the screen isn't empty at load
    flakes = Array.from({ length: COUNT }, () => new Flake(Math.random() * H));
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    flakes.forEach(f => { f.update(); f.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  loop();
})();

/* ================================================================
   3. SCROLL REVEAL  — fade elements in as they enter the viewport
================================================================ */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   4. ACTIVE NAV  — highlights the current section link
================================================================ */
(function initActiveNav() {
  const links    = document.querySelectorAll('[data-nav]');
  const sections = document.querySelectorAll('section[id]');
  if (!links.length || !sections.length) return;

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`[data-nav][href="#${e.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );
  sections.forEach(s => io.observe(s));
})();

/* ================================================================
   5. NAVBAR SCROLL SHADOW
================================================================ */
(function initNavbarScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* ================================================================
   6. MOBILE NAV BURGER
================================================================ */
(function initMobileNav() {
  const burger = document.getElementById('navBurger');
  const links  = document.getElementById('navLinks');
  if (!burger || !links) return;

  function close() {
    burger.classList.remove('open');
    links.classList.remove('open');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when a nav link is tapped
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) close();
  });
})();

/* ================================================================
   7. SKILL FILTER
================================================================ */
(function initSkillFilter() {
  const bar   = document.getElementById('filterBar');
  const grid  = document.getElementById('skillsGrid');
  if (!bar || !grid) return;

  const cards = grid.querySelectorAll('.skill-card');

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    // Update active button
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
      // Use inline positioning trick so layout doesn't collapse
      card.style.display = match ? '' : 'none';
    });
  });
})();

/* ================================================================
   8. BACK TO TOP BUTTON
================================================================ */
(function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ================================================================
   9. FOOTER YEAR
================================================================ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ================================================================
   10. SUBTLE CARD TILT on mouse move (project cards)
================================================================ */
(function initTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width  - .5;
      const y = (e.clientY - top)  / height - .5;
      card.style.transform = `translateY(-5px) rotateX(${(-y * 6).toFixed(1)}deg) rotateY(${(x * 6).toFixed(1)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
