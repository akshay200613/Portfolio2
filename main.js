/* =============================================================
   Akshay C — Portfolio Main Script
   Handles: Loading screen, particles, cursor, typewriter,
            scroll animations, tilt, navbar, magnetic, forms
   ============================================================= */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. LOADING SCREEN — Terminal Easter Egg
   ───────────────────────────────────────────────────────────── */
(function initLoadingScreen() {
  const screen   = document.getElementById('loading-screen');
  const textEl   = document.getElementById('terminal-text');
  if (!screen || !textEl) return;

  const lines = [
    '> python initializing_portfolio.py',
    'Loading modules...',
    'Importing numpy, pandas, torch... ✓',
    'Connecting to LangGraph agents... ✓',
    'Spinning up FastAPI... ✓',
    'Portfolio initialized successfully.',
    '',
    '> ./run_portfolio.sh'
  ];

  let lineIdx = 0, charIdx = 0;
  const speed = 28; // ms per char

  function typeLine() {
    if (lineIdx >= lines.length) {
      // Done — hide loading screen
      setTimeout(() => {
        screen.classList.add('hidden');
        document.body.style.overflow = '';
        triggerHeroReveal();
      }, 500);
      return;
    }

    const line = lines[lineIdx];

    if (charIdx < line.length) {
      textEl.textContent += line[charIdx++];
      setTimeout(typeLine, speed);
    } else {
      // Line done — move to next
      lineIdx++;
      charIdx = 0;
      if (lineIdx < lines.length) {
        textEl.textContent += '\n';
        setTimeout(typeLine, 160);
      } else {
        setTimeout(typeLine, 50);
      }
    }
  }

  // Prevent scroll during loading
  document.body.style.overflow = 'hidden';
  setTimeout(typeLine, 300);
})();

function triggerHeroReveal() {
  // Kick off hero animations after loading
  document.querySelectorAll('#hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 150);
  });
  // Start typewriter
  startTypewriter();
}


/* ─────────────────────────────────────────────────────────────
   2. CUSTOM CURSOR
   ───────────────────────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only enable on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  // Ring follows with lerp
  function animRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  // Hover state on interactive elements
  const hoverEls = document.querySelectorAll('a, button, .btn, .skill-tag, .stack-tag, .soft-skill-chip, .project-card, .stat-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();


/* ─────────────────────────────────────────────────────────────
   3. SCROLL PROGRESS BAR
   ───────────────────────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total  = document.documentElement.scrollHeight - window.innerHeight;
    const pct    = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();


/* ─────────────────────────────────────────────────────────────
   4. NAVBAR — shrink + blur on scroll + mobile toggle
   ───────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('nav-toggle');
  const links     = document.getElementById('nav-links');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    links.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
})();


/* ─────────────────────────────────────────────────────────────
   5. PARTICLE CANVAS — animated network reacting to mouse
   ───────────────────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const ACCENT = '0, 245, 255';
  let W, H, particles, mouse = { x: null, y: null };

  const isMobile = () => window.innerWidth < 768;
  const COUNT    = () => isMobile() ? 40 : 90;
  const MAX_DIST = () => isMobile() ? 100 : 160;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function buildParticles() {
    particles = Array.from({ length: COUNT() }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const maxD = MAX_DIST();

    particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.3;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          // cap speed
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 1.5) { p.vx = p.vx / speed * 1.5; p.vy = p.vy / speed * 1.5; }
        }
      }

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, ${p.alpha})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxD) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          const opacity = (1 - dist / maxD) * 0.18;
          ctx.strokeStyle = `rgba(${ACCENT}, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });

  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  }

  resize();
  draw();
})();


/* ─────────────────────────────────────────────────────────────
   6. TYPEWRITER — cycling hero titles
   ───────────────────────────────────────────────────────────── */
function startTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'Machine Learning Engineer',
    'RAG & Agentic AI Builder',
  ];
  let pi = 0, ci = 0, deleting = false;
  const typeSpeed   = 65;
  const deleteSpeed = 35;
  const pauseAfter  = 2000;
  const pauseNext   = 400;

  function tick() {
    const phrase = phrases[pi];

    if (!deleting) {
      // Typing
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(tick, pauseAfter);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      // Deleting
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, pauseNext);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }
  tick();
}


/* ─────────────────────────────────────────────────────────────
   7. SCROLL-TRIGGERED REVEAL ANIMATIONS
   ───────────────────────────────────────────────────────────── */
(function initReveal() {
  // Skip hero — those are handled after loading screen
  const allReveal = document.querySelectorAll(
    'section:not(#hero) .reveal-up, section:not(#hero) .reveal-left, section:not(#hero) .reveal-right'
  );

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  allReveal.forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────────────────────
   8. CARD TILT ON MOUSE MOVE
   ───────────────────────────────────────────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ─────────────────────────────────────────────────────────────
   9. MAGNETIC HOVER EFFECT (buttons)
   ───────────────────────────────────────────────────────────── */
(function initMagnetic() {
  const magnets = document.querySelectorAll('.magnetic');
  if (window.matchMedia('(pointer: coarse)').matches) return;

  magnets.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) * 0.25;
      const y = (e.clientY - rect.top  - rect.height / 2) * 0.25;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();


/* ─────────────────────────────────────────────────────────────
   10. CONTACT FORM — validation
   ───────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  function setError(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errorId);
    if (!input || !err) return;
    if (msg) {
      input.classList.add('error');
      err.textContent = msg;
    } else {
      input.classList.remove('error');
      err.textContent = '';
    }
  }

  function validate() {
    let ok = true;
    const name    = document.getElementById('form-name').value.trim();
    const email   = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name) {
      setError('form-name',    'name-error',    '// Name is required');
      ok = false;
    } else { setError('form-name', 'name-error', ''); }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('form-email',   'email-error',   '// Valid email required');
      ok = false;
    } else { setError('form-email', 'email-error', ''); }

    if (message.length < 10) {
      setError('form-message', 'message-error', '// Message must be at least 10 characters');
      ok = false;
    } else { setError('form-message', 'message-error', ''); }

    return ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    // Since there's no backend, show success message
    if (success) {
      success.removeAttribute('hidden');
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    form.reset();
  });

  // Live validation on input
  ['form-name', 'form-email', 'form-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', validate);
  });
})();


/* ─────────────────────────────────────────────────────────────
   11. FOOTER YEAR
   ───────────────────────────────────────────────────────────── */
(function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─────────────────────────────────────────────────────────────
   12. ACTIVE NAV LINK ON SCROLL
   ───────────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          link.style.background = '';
        });
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) {
          active.style.color = 'var(--accent)';
          active.style.background = 'var(--accent-dim)';
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => obs.observe(s));
})();
