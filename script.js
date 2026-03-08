/* ═══════════════════════════════════════════════════════════
   JJK WEBSITE — MASTER ANIMATION SCRIPT
   GSAP + ScrollTrigger + Canvas particle systems
   ═══════════════════════════════════════════════════════════ */

// ─── Wait for DOM + GSAP to be ready ─────────────────────
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ═══════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════ */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');

  let mx = 0, my = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // Cursor dot follows instantly
    gsap.set(cursor, { left: mx, top: my });
    // Trail follows with slight lag via GSAP ticker
    gsap.to(trail, {
      left: mx,
      top: my,
      duration: 0.18,
      ease: 'power2.out'
    });
  });

  // Scale cursor on hover of interactive elements
  const hoverEls = document.querySelectorAll('a, button, .tech-card, .moment-panel, .lore-card, .technique-tag');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursor, { width: 24, height: 24, duration: 0.3 });
      gsap.to(trail, { width: 60, height: 60, opacity: 0.8, duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cursor, { width: 12, height: 12, duration: 0.3 });
      gsap.to(trail, { width: 36, height: 36, opacity: 1, duration: 0.3 });
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   2. NAVIGATION — scroll state
   ═══════════════════════════════════════════════════════════ */
(function initNav() {
  const nav = document.getElementById('nav');

  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: self => {
      if (self.progress > 0) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  });

  // Smooth scroll for nav links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        gsap.to(window, { scrollTo: target, duration: 1.2, ease: 'power3.inOut' });
      }
    });
  });

  // Restart button
  document.getElementById('restartBtn').addEventListener('click', () => {
    gsap.to(window, { scrollTo: 0, duration: 2, ease: 'power3.inOut' });
  });

  // Enter button
  document.getElementById('enterBtn').addEventListener('click', () => {
    const lore = document.getElementById('lore');
    gsap.to(window, { scrollTo: lore, duration: 1.2, ease: 'power3.inOut' });
  });
})();

/* ═══════════════════════════════════════════════════════════
   3. HERO CANVAS — Cursed Energy Particle System
   ═══════════════════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  // Particle class — each represents a cursed energy mote
  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 20;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = -(Math.random() * 0.8 + 0.3);
      this.r  = Math.random() * 2.5 + 0.5;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 150;
      // Color: purple or blue
      this.hue = Math.random() < 0.6 ? 270 : 195;
      this.sat = 70 + Math.random() * 30;
    }

    update() {
      this.life++;

      // Mouse repulsion / attraction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        this.vx -= (dx / dist) * force * 0.5;
        this.vy -= (dy / dist) * force * 0.5;
      }

      // Gentle turbulence
      this.vx += (Math.random() - 0.5) * 0.08;
      this.vy += (Math.random() - 0.5) * 0.04;

      // Damping
      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      if (this.life > this.maxLife || this.y < -20) this.reset();
    }

    draw() {
      const progress = this.life / this.maxLife;
      const alpha = progress < 0.1
        ? progress * 10
        : progress > 0.8
        ? (1 - progress) * 5
        : 1;

      ctx.save();
      ctx.globalAlpha = alpha * 0.7;

      // Glow effect
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
      grad.addColorStop(0, `hsla(${this.hue},${this.sat}%,70%,1)`);
      grad.addColorStop(1, `hsla(${this.hue},${this.sat}%,70%,0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},${this.sat}%,85%,1)`;
      ctx.fill();

      ctx.restore();
    }
  }

  // Energy wave lines
  class WaveLine {
    constructor(index) {
      this.index = index;
      this.offset = Math.random() * Math.PI * 2;
      this.speed  = 0.005 + Math.random() * 0.005;
      this.amp    = 30 + Math.random() * 60;
      this.y      = H * (0.3 + index * 0.15);
      this.hue    = index % 2 === 0 ? 270 : 195;
      this.alpha  = 0.05 + Math.random() * 0.1;
    }

    draw(t) {
      ctx.beginPath();
      ctx.moveTo(0, this.y);
      for (let x = 0; x <= W; x += 4) {
        const wave = Math.sin((x / W) * Math.PI * 4 + this.offset + t * this.speed) * this.amp
                   + Math.sin((x / W) * Math.PI * 6 + this.offset * 1.5 + t * this.speed * 1.5) * (this.amp * 0.5);
        ctx.lineTo(x, this.y + wave);
      }
      ctx.strokeStyle = `hsla(${this.hue},80%,60%,${this.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Initialise
  for (let i = 0; i < 120; i++) particles.push(new Particle());
  const waves = [0, 1, 2, 3].map(i => new WaveLine(i));

  let t = 0;

  function loop() {
    requestAnimationFrame(loop);

    ctx.clearRect(0, 0, W, H);

    // Draw waves
    waves.forEach(w => w.draw(t));

    // Draw particles
    particles.forEach(p => { p.update(); p.draw(); });

    // Connection lines between nearby particles
    for (let i = 0; i < particles.length; i += 2) {
      for (let j = i + 1; j < particles.length; j += 2) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          ctx.save();
          ctx.globalAlpha = (1 - d / 80) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#7B2FBE';
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    t++;
  }

  loop();
})();

/* ═══════════════════════════════════════════════════════════
   4. HERO PARALLAX — mouse-driven layer movement
   ═══════════════════════════════════════════════════════════ */
(function initHeroParallax() {
  const layers = document.querySelectorAll('.hero-layer');
  const runes  = document.querySelectorAll('.rune');

  window.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;

    gsap.to(layers[0], { x: cx * 20, y: cy * 15, duration: 1.5, ease: 'power2.out' });
    gsap.to(layers[1], { x: cx * 35, y: cy * 25, duration: 1.5, ease: 'power2.out' });
    gsap.to(layers[2], { x: cx *  8, y: cy *  8, duration: 2,   ease: 'power2.out' });

    runes.forEach((rune, i) => {
      const depth = (i + 1) * 12;
      gsap.to(rune, { x: cx * depth, y: cy * (depth * 0.6), duration: 2, ease: 'power2.out' });
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   5. LORE CANVAS — floating energy orbs background
   ═══════════════════════════════════════════════════════════ */
(function initLoreCanvas() {
  const canvas = document.getElementById('loreCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, orbs = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Orb {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = 40 + Math.random() * 100;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.hue = Math.random() < 0.5 ? 270 : 195;
      this.alpha = 0.04 + Math.random() * 0.08;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = 0.005 + Math.random() * 0.01;
    }
    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -this.r) this.x = W + this.r;
      if (this.x > W + this.r) this.x = -this.r;
      if (this.y < -this.r) this.y = H + this.r;
      if (this.y > H + this.r) this.y = -this.r;
    }
    draw(t) {
      const a = this.alpha * (0.7 + 0.3 * Math.sin(t * this.speed + this.phase));
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      g.addColorStop(0, `hsla(${this.hue},80%,60%,${a})`);
      g.addColorStop(1, `hsla(${this.hue},80%,60%,0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  for (let i = 0; i < 12; i++) orbs.push(new Orb());

  let t = 0;
  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    orbs.forEach(o => { o.update(t); o.draw(t); });
    t++;
  }
  loop();
})();

/* ═══════════════════════════════════════════════════════════
   6. TECH CANVAS — energy grid background
   ═══════════════════════════════════════════════════════════ */
(function initTechCanvas() {
  const canvas = document.getElementById('techCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  let t = 0;

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);

    // Draw flowing grid lines
    const gridSize = 80;
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= W; x += gridSize) {
      const wave = Math.sin(t * 0.01 + x * 0.005) * 5;
      ctx.beginPath();
      ctx.moveTo(x + wave, 0);
      ctx.lineTo(x + wave, H);
      ctx.strokeStyle = `rgba(123,47,190,${0.05 + 0.03 * Math.sin(t * 0.01 + x * 0.01)})`;
      ctx.stroke();
    }

    for (let y = 0; y <= H; y += gridSize) {
      const wave = Math.sin(t * 0.01 + y * 0.005) * 5;
      ctx.beginPath();
      ctx.moveTo(0, y + wave);
      ctx.lineTo(W, y + wave);
      ctx.strokeStyle = `rgba(0,212,255,${0.04 + 0.02 * Math.sin(t * 0.012 + y * 0.01)})`;
      ctx.stroke();
    }

    t++;
  }

  loop();
})();

/* ═══════════════════════════════════════════════════════════
   7. ENDING CANVAS — dense particle constellation
   ═══════════════════════════════════════════════════════════ */
(function initEndingCanvas() {
  const canvas = document.getElementById('endingCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, pts = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Pt {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.hue = Math.random() < 0.6 ? 270 : 195;
      this.alpha = 0.3 + Math.random() * 0.6;
      this.phase = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.vx + Math.sin(t * 0.005 + this.phase) * 0.2;
      this.y += this.vy + Math.cos(t * 0.004 + this.phase) * 0.2;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw(t) {
      const a = this.alpha * (0.6 + 0.4 * Math.sin(t * 0.02 + this.phase));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},80%,70%,${a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 200; i++) pts.push(new Pt());

  let t = 0;

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);

    // Connection web
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - d / 100) * 0.12;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `hsl(${(pts[i].hue + pts[j].hue) / 2},70%,60%)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    pts.forEach(p => { p.update(t); p.draw(t); });
    t++;
  }

  loop();
})();

/* ═══════════════════════════════════════════════════════════
   8. GSAP SCROLL ANIMATIONS
   ═══════════════════════════════════════════════════════════ */
(function initScrollAnimations() {

  // ── Lore Section ──────────────────────────────────────────
  gsap.from('.lore-title', {
    scrollTrigger: { trigger: '.lore', start: 'top 75%' },
    opacity: 0,
    y: 60,
    duration: 1.2,
    ease: 'power3.out'
  });

  // Lore cards staggered entrance
  gsap.to('.lore-card', {
    scrollTrigger: { trigger: '.lore-grid', start: 'top 75%' },
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
  });

  // Diagram spin-in
  gsap.from('.lore-diagram', {
    scrollTrigger: { trigger: '.lore-diagram', start: 'top 80%' },
    opacity: 0,
    scale: 0.7,
    duration: 1.4,
    ease: 'back.out(1.7)'
  });

  // ── Character Blocks ───────────────────────────────────────
  document.querySelectorAll('.character-block').forEach((block, idx) => {
    const isReverse = block.classList.contains('reverse');
    const portrait  = block.querySelector('.char-portrait-wrap');
    const info      = block.querySelector('.char-info');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start: 'top 65%',
        toggleActions: 'play none none none'
      }
    });

    // Portrait slides in from outside
    tl.from(portrait, {
      x: isReverse ? 120 : -120,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    });

    // Info fades up
    tl.from(info, {
      x: isReverse ? -80 : 80,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.8');

    // Stat bars fill in sequence
    const statFills = block.querySelectorAll('.stat-fill');
    const statBars  = block.querySelectorAll('.stat-bar');

    tl.fromTo(statFills, {
      width: '0%'
    }, {
      width: (i) => statBars[i]?.dataset.value + '%',
      duration: 1.5,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.4');

    // Technique tags pop in
    tl.from(block.querySelectorAll('.technique-tag'), {
      opacity: 0,
      scale: 0.8,
      y: 10,
      duration: 0.4,
      stagger: 0.08,
      ease: 'back.out(1.7)'
    }, '-=0.8');
  });

  // ── Techniques Grid ────────────────────────────────────────
  gsap.from('.tech-card', {
    scrollTrigger: { trigger: '.tech-grid', start: 'top 70%' },
    opacity: 0,
    y: 60,
    rotationX: 15,
    transformOrigin: 'center top',
    duration: 0.8,
    stagger: {
      amount: 0.8,
      grid: [2, 3],
      from: 'start'
    },
    ease: 'power3.out'
  });

  // ── Curse Hierarchy ────────────────────────────────────────
  document.querySelectorAll('.curse-grade').forEach((grade, i) => {
    gsap.to(grade, {
      scrollTrigger: { trigger: grade, start: 'top 80%' },
      opacity: 1,
      x: 0,
      duration: 1,
      delay: i * 0.15,
      ease: 'power3.out'
    });
  });

  // ── Moments Panels ─────────────────────────────────────────
  gsap.from('.moment-panel', {
    scrollTrigger: { trigger: '.moments-panels', start: 'top 75%' },
    opacity: 0,
    y: 80,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // ── Ending Section ─────────────────────────────────────────
  const endingTl = gsap.timeline({
    scrollTrigger: { trigger: '.ending', start: 'top 60%' }
  });

  endingTl
    .to('.ending-eyebrow', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
    .to('.ending-quote',   { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=0.4')
    .to('.quote-attr',     { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .to('.ending-divider', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3')
    .to('.ending-text',    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
    .to('.btn-restart',    { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.2');

  // Set initial states for ending elements
  gsap.set(['.ending-quote', '.quote-attr', '.ending-text', '.btn-restart'], { y: 40 });

  // ── Section headers entrance ───────────────────────────────
  document.querySelectorAll('.section-header').forEach(header => {
    gsap.from(header.querySelectorAll('.section-label, .section-title'), {
      scrollTrigger: { trigger: header, start: 'top 80%' },
      opacity: 0,
      y: 40,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });
  });

  // ── Ambient curse silhouettes — parallax ───────────────────
  document.querySelectorAll('.ambient-curse').forEach((el, i) => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: '.curses',
        scrub: true,
        start: 'top bottom',
        end: 'bottom top'
      },
      y: -(i % 2 === 0 ? 150 : 100),
      ease: 'none'
    });
  });

  // ── Hero content parallax on scroll ───────────────────────
  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '.hero',
      scrub: true,
      start: 'top top',
      end: 'bottom top'
    },
    y: 200,
    opacity: 0,
    ease: 'none'
  });

  // ── Moment panels — subtle parallax on scroll ──────────────
  document.querySelectorAll('.panel-bg').forEach(bg => {
    gsap.to(bg, {
      scrollTrigger: {
        trigger: bg.closest('.moment-panel'),
        scrub: true,
        start: 'top bottom',
        end: 'bottom top'
      },
      y: -60,
      ease: 'none'
    });
  });

})();

/* ═══════════════════════════════════════════════════════════
   9. CURSED ENERGY RIPPLE — click effect
   ═══════════════════════════════════════════════════════════ */
(function initRipple() {
  const rippleContainer = document.createElement('div');
  rippleContainer.style.cssText = `
    position: fixed; inset: 0; z-index: 9997;
    pointer-events: none; overflow: hidden;
  `;
  document.body.appendChild(rippleContainer);

  document.addEventListener('click', e => {
    const ripple = document.createElement('div');
    const size = 60;
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      border: 1px solid rgba(0,212,255,0.8);
      left: ${e.clientX - size / 2}px;
      top: ${e.clientY - size / 2}px;
      pointer-events: none;
    `;
    rippleContainer.appendChild(ripple);

    gsap.to(ripple, {
      width: 200,
      height: 200,
      left: e.clientX - 100,
      top: e.clientY - 100,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   10. GLITCH TEXT EFFECT — hero title on load
   ═══════════════════════════════════════════════════════════ */
(function initGlitch() {
  const lines = document.querySelectorAll('.title-line');
  const chars = 'アイウエオカキクケコサシスセソ呪術廻戦ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  lines.forEach(line => {
    const original = line.textContent.trim();

    setTimeout(() => {
      let iterations = 0;
      const interval = setInterval(() => {
        line.textContent = original
          .split('')
          .map((char, idx) => {
            if (idx < iterations) return char;
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        iterations += 0.5;
        if (iterations >= original.length) {
          line.textContent = original;
          clearInterval(interval);
        }
      }, 30);
    }, line.classList.contains('title-line-2') ? 800 : 500);
  });
})();

/* ═══════════════════════════════════════════════════════════
   11. SUKUNA BLOCK — special timed screen flash on enter
   ═══════════════════════════════════════════════════════════ */
(function initSukunaEffect() {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(200,0,0,0.15);
    z-index: 9990;
    pointer-events: none;
    opacity: 0;
  `;
  document.body.appendChild(flash);

  ScrollTrigger.create({
    trigger: '.sukuna-block',
    start: 'top 60%',
    once: true,
    onEnter: () => {
      gsap.timeline()
        .to(flash, { opacity: 1, duration: 0.15 })
        .to(flash, { opacity: 0, duration: 0.6, ease: 'power2.out' });
    }
  });
})();

/* ═══════════════════════════════════════════════════════════
   12. SECTION LABEL GLOW PULSE ON ENTER
   ═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.section-label').forEach(label => {
  ScrollTrigger.create({
    trigger: label,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.from(label, {
        opacity: 0,
        letterSpacing: '0.8em',
        duration: 1.2,
        ease: 'power3.out'
      });
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   13. SMOOTH PAGE LOAD
   ═══════════════════════════════════════════════════════════ */
(function initPageLoad() {
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.style.cssText = `
    position: fixed; inset: 0;
    background: var(--clr-bg, #04020a);
    z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 20px;
  `;

  const loaderText = document.createElement('div');
  loaderText.textContent = '呪術廻戦';
  loaderText.style.cssText = `
    font-family: 'Noto Sans JP', sans-serif;
    font-size: 2rem; font-weight: 900;
    background: linear-gradient(135deg, #7B2FBE, #00D4FF);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.3em;
  `;

  const loaderBar = document.createElement('div');
  loaderBar.style.cssText = `
    width: 200px; height: 1px;
    background: rgba(255,255,255,0.1);
    border-radius: 1px; overflow: hidden;
  `;

  const loaderFill = document.createElement('div');
  loaderFill.style.cssText = `
    height: 100%; width: 0%;
    background: linear-gradient(90deg, #7B2FBE, #00D4FF);
    border-radius: 1px;
  `;

  loaderBar.appendChild(loaderFill);
  loader.appendChild(loaderText);
  loader.appendChild(loaderBar);
  document.body.appendChild(loader);

  // Animate load bar
  gsap.to(loaderFill, {
    width: '100%',
    duration: 1.2,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => loader.remove()
      });
    }
  });
})();

/* ═══════════════════════════════════════════════════════════
   14. RESIZE HANDLER
   ═══════════════════════════════════════════════════════════ */
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});
