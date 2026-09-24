/* =============================================================
   Akshay C — Portfolio Main Script  (v2)
   Handles: Loading screen, particles, cursor, typewriter,
            scroll animations, tilt, navbar, magnetic,
            stat counters, skill tag stagger, forms
   ============================================================= */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. LOADING SCREEN — Terminal Easter Egg
   ───────────────────────────────────────────────────────────── */
(function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  const textEl = document.getElementById('terminal-text');
  if (!screen || !textEl) return;

  const lines = [
    '> python initializing_portfolio.py',
    'Loading modules...',
    'Importing numpy, pandas, torch... ✓',
    'Connecting to LangGraph agents... ✓',
    'Spinning up FastAPI... ✓',
    'Loading ML models... ✓',
    'Portfolio initialized successfully.',
    '',
    '> ./run_portfolio.sh'
  ];

  let lineIdx = 0, charIdx = 0;
  const speed = 24;

  function typeLine() {
    if (lineIdx >= lines.length) {
      setTimeout(() => {
        screen.classList.add('hidden');
        document.body.style.overflow = '';
        triggerHeroReveal();
      }, 400);
      return;
    }
    const line = lines[lineIdx];
    if (charIdx < line.length) {
      textEl.textContent += line[charIdx++];
      setTimeout(typeLine, speed);
    } else {
      lineIdx++; charIdx = 0;
      if (lineIdx < lines.length) {
        textEl.textContent += '\n';
        setTimeout(typeLine, 140);
      } else {
        setTimeout(typeLine, 50);
      }
    }
  }

  document.body.style.overflow = 'hidden';
  setTimeout(typeLine, 300);
})();

function triggerHeroReveal() {
  document.querySelectorAll('#hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 130);
  });
  startTypewriter();
}


/* ─────────────────────────────────────────────────────────────
   2. CUSTOM CURSOR
   ───────────────────────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  const hoverEls = document.querySelectorAll(
    'a, button, .btn, .skill-tag, .stack-tag, .soft-skill-chip, .project-card, .stat-card, .contact-chip'
  );
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = ''; });
})();


/* ─────────────────────────────────────────────────────────────
   3. SCROLL PROGRESS BAR
   ───────────────────────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });
})();


/* ─────────────────────────────────────────────────────────────
   4. NAVBAR — shrink + blur on scroll + mobile toggle
   ───────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    links.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
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
  const PURPLE  = '124, 58, 237';
  let W, H, particles;
  let mouse = { x: null, y: null };

  const isMobile = () => window.innerWidth < 768;
  const COUNT    = () => isMobile() ? 45 : 100;
  const MAX_DIST = () => isMobile() ? 110 : 170;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function buildParticles() {
    particles = Array.from({ length: COUNT() }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      r:     Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.85 ? PURPLE : ACCENT
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const maxD = MAX_DIST();

    particles.forEach((p, i) => {
      // Move
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const force = (130 - dist) / 130 * 0.32;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          const spd = Math.hypot(p.vx, p.vy);
          if (spd > 1.8) { p.vx = (p.vx / spd) * 1.8; p.vy = (p.vy / spd) * 1.8; }
        }
      }

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q  = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxD) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          const opacity = (1 - dist / maxD) * 0.16;
          ctx.strokeStyle = `rgba(${ACCENT}, ${opacity})`;
          ctx.lineWidth = 0.5;
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
    'Deep Learning Practitioner',
    'End-to-End ML Systems'
  ];
  let pi = 0, ci = 0, deleting = false;
  const typeSpeed   = 65;
  const deleteSpeed = 30;
  const pauseAfter  = 2200;
  const pauseNext   = 380;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(tick, pauseAfter); return; }
      setTimeout(tick, typeSpeed);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, pauseNext); return;
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
  const allReveal = document.querySelectorAll(
    'section:not(#hero) .reveal-up, section:not(#hero) .reveal-left, section:not(#hero) .reveal-right, section:not(#hero) .reveal-scale'
  );

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  allReveal.forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────────────────────
   8. SKILL TAG STAGGER ANIMATION
   ───────────────────────────────────────────────────────────── */
(function initSkillTagStagger() {
  const categories = document.querySelectorAll('.skill-category');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.skill-tag');
        tags.forEach((tag, i) => {
          setTimeout(() => tag.classList.add('tag-visible'), i * 60);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  categories.forEach(cat => obs.observe(cat));
})();


/* ─────────────────────────────────────────────────────────────
   9. STAT COUNTER ANIMATION
   ───────────────────────────────────────────────────────────── */
(function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCount(el, target, suffix, duration = 1400) {
    const startTime = performance.now();
    const isFloat   = target % 1 !== 0;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat ? (eased * target).toFixed(1) : Math.round(eased * target);

      // Preserve the unit span inside
      const unitEl = el.querySelector('.stat-unit');
      if (unitEl) {
        el.firstChild.textContent = current;
      } else {
        el.textContent = current + suffix;
      }

      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const text    = el.textContent.trim();
      // Parse number from text: "6+", "15+", "97.1%", "2"
      const match   = text.match(/[\d.]+/);
      const suffix  = text.replace(/[\d.]+/, '');
      if (!match) return;

      const target = parseFloat(match[0]);
      // Reset
      const unitEl = el.querySelector('.stat-unit');
      if (unitEl) { el.firstChild.textContent = '0'; }
      else { el.textContent = '0'; }

      setTimeout(() => animateCount(el, target, suffix), 200);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  statNumbers.forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────────────────────
   10. CARD TILT ON MOUSE MOVE
   ───────────────────────────────────────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) scale(1.025)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ─────────────────────────────────────────────────────────────
   11. MAGNETIC HOVER EFFECT (buttons)
   ───────────────────────────────────────────────────────────── */
(function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) * 0.22;
      const y = (e.clientY - rect.top  - rect.height / 2) * 0.22;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();


/* ─────────────────────────────────────────────────────────────
   12. CONTACT FORM — validation + FormSubmit
   ───────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');
  if (!form) return;

  function setError(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errorId);
    if (!input || !err) return;
    if (msg) { input.classList.add('error'); err.textContent = msg; }
    else { input.classList.remove('error'); err.textContent = ''; }
  }

  function validate() {
    let ok = true;
    const name    = document.getElementById('form-name').value.trim();
    const email   = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name)   { setError('form-name',    'name-error',    '// Name is required'); ok = false; }
    else           setError('form-name', 'name-error', '');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('form-email', 'email-error', '// Valid email required'); ok = false;
    } else setError('form-email', 'email-error', '');

    if (message.length < 10) {
      setError('form-message', 'message-error', '// Message must be at least 10 characters'); ok = false;
    } else setError('form-message', 'message-error', '');

    return ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    // Loading state
    const btnText = submitBtn.querySelector('.btn-text');
    const origText = btnText.textContent;
    btnText.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate send (replace with actual endpoint like FormSubmit)
    await new Promise(r => setTimeout(r, 900));

    if (success) {
      success.removeAttribute('hidden');
      success.innerHTML = `<span>✓</span> Message sent! I'll get back to you soon.`;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    form.reset();
    submitBtn.disabled = false;
    btnText.textContent = origText;
  });

  // Live validation
  ['form-name', 'form-email', 'form-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', validate);
  });
})();


/* ─────────────────────────────────────────────────────────────
   13. FOOTER YEAR
   ───────────────────────────────────────────────────────────── */
(function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─────────────────────────────────────────────────────────────
   14. ACTIVE NAV LINK ON SCROLL
   ───────────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35, rootMargin: '-10% 0px -60% 0px' });

  sections.forEach(s => obs.observe(s));
})();


/* ─────────────────────────────────────────────────────────────
   15. SMOOTH SCROLL WITH OFFSET
   ───────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
