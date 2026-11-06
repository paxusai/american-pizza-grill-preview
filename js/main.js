/* American Pizza & Grill — interactions
   1. Nav, drawer, live open/closed status (Saipan time)
   2. Opening sequence + signature scroll (smoke fly-through into the pizza)
   3. Editorial menu with animated category changes and 3D dishes (js/dish3d.js)
   4. Story parallax + marquees, then the crew strip (horizontal scroll)
   5. Day-to-night hours scene
   6. Build Your Own Pizza (interactive, priced from the real menu)
   7. Finale reveal */
(() => {
  'use strict';

  const D = window.APG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const range = (v, a, b) => clamp((v - a) / (b - a));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverable = matchMedia('(hover: hover)').matches;

  let vw = innerWidth;
  let vh = innerHeight;

  function rng(seed) {
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = s => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
  /* Frame-rate independent easing toward a target (same feel at 30, 60 or 120 fps) */
  let dt = 1 / 60;
  const damp = (cur, target, k) => (reduce ? target : lerp(cur, target, 1 - Math.pow(1 - k, dt * 60)));

  /* 0 when the section's top meets the viewport top, 1 when its bottom meets the viewport bottom */
  function pinProgress(el) {
    const r = el.getBoundingClientRect();
    const total = r.height - vh;
    return total > 0 ? clamp(-r.top / total) : 0;
  }
  function inView(el, margin = 80) {
    const r = el.getBoundingClientRect();
    return r.bottom > -margin && r.top < vh + margin;
  }

  /* =======================================================
     1. NAV, DRAWER, STATUS
     ======================================================= */
  const body = document.body;
  const nav = $('#nav');
  const toggle = $('.nav__toggle');
  const drawer = $('#drawer');
  const actionbar = $('.actionbar');

  function setDrawer(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.hidden = !open;
    body.style.overflow = open ? 'hidden' : '';
    onScroll();
  }
  toggle.addEventListener('click', () => setDrawer(toggle.getAttribute('aria-expanded') !== 'true'));
  drawer.addEventListener('click', e => { if (e.target.closest('a')) setDrawer(false); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && !drawer.hidden) { setDrawer(false); toggle.focus(); }
  });

  function onScroll() {
    const y = scrollY;
    nav.classList.toggle('is-solid', y > 60 || !drawer.hidden);
    actionbar.classList.toggle('is-on', y > vh * .6 && drawer.hidden);
  }
  addEventListener('scroll', onScroll, { passive: true });

  const navLinks = $$('.nav__links a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['menu', 'story', 'hours', 'build', 'visit'].forEach(id => spy.observe(document.getElementById(id)));

  /* Saipan is UTC+10 all year (ChST, no daylight saving) */
  function saipanNow() {
    const now = new Date();
    return new Date(now.getTime() + (now.getTimezoneOffset() + 600) * 60000);
  }
  function fmtMin(m) {
    let h = Math.floor(m / 60);
    const mm = m % 60;
    const ap = h >= 12 && h < 24 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + (mm ? ':' + String(mm).padStart(2, '0') : '') + ' ' + ap;
  }
  function updateStatus() {
    const t = saipanNow();
    const day = t.getDay();
    const m = t.getHours() * 60 + t.getMinutes();
    const [open, close] = D.hours[day];
    let s;
    if (m >= open && m < close) s = { open: true, text: `Open now · until ${fmtMin(close)}` };
    else if (m < open) s = { open: false, text: `Closed · opens ${fmtMin(open)}` };
    else s = { open: false, text: `Closed · opens tomorrow ${fmtMin(D.hours[(day + 1) % 7][0])}` };
    $$('[data-status]').forEach(el => {
      el.classList.toggle('is-open', s.open);
      el.lastElementChild.textContent = s.text;
    });
    $$('[data-hours]').forEach(ul => {
      ul.innerHTML = D.hoursRows.map(r =>
        `<li class="${r.days.includes(day) ? 'is-today' : ''}"><b>${r.label}</b><span>${r.time}</span></li>`).join('');
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  $('[data-year]').textContent = saipanNow().getFullYear();

  /* Reveal on scroll, staggered among siblings */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const sibs = $$('.reveal', en.target.parentElement);
      en.target.style.setProperty('--rd', Math.min(sibs.indexOf(en.target), 6) * 0.08 + 's');
      en.target.classList.add('is-in');
      revealIO.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  $$('.reveal').forEach(el => revealIO.observe(el));

  /* =======================================================
     2. HERO — opening sequence + signature scroll
     ======================================================= */
  const hero = {
    el: $('.hero'), sticky: $('.hero__sticky'), media: $('.hero__media'), img: $('.hero__img'),
    shade: $('.hero__shade'), back: $('.hero__title--back'), front: $('.hero__title--front'),
    headline: $('.hero__headline'), dish: $('.hero__dish'), fades: $$('.hero__fade'), canvas: $('.hero__smoke')
  };
  /* Where the pizza sits inside pizza.jpg (fractions of the image size) */
  const PC = { x: .481, y: .586, ry: .292 };
  let H = {};
  let heroP = 0;
  let introStart = null;

  const smoke = (() => {
    const cv = hero.canvas;
    const ctx = cv.getContext('2d');
    const RES = .5;
    let W = 0, Hh = 0, parts = [], embers = [], tex = null, last = performance.now(), drift = 0;

    function makeTex() {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d');
      const r = rng(11);
      for (let i = 0; i < 40; i++) {
        const a = r() * 6.283, d = r() * 70;
        const x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d * .7, rad = 22 + r() * 46;
        const gr = g.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, 'rgba(238,228,212,.06)');
        gr.addColorStop(.5, 'rgba(238,228,212,.025)');
        gr.addColorStop(1, 'rgba(238,228,212,0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, 256, 256);
      }
      return c;
    }
    const newEmber = fresh => ({ x: Math.random(), y: fresh ? Math.random() : 1.05, v: .03 + Math.random() * .07, s: .6 + Math.random() * 1.6, w: Math.random() * 6.28 });

    function init() {
      tex = makeTex();
      const r = rng(5);
      const n = vw < 768 ? 16 : 28;
      parts = Array.from({ length: n }, () => ({
        x: (r() * 2 - 1) * 1.5, y: (r() * 2 - 1), z: r() * 4, s: .55 + r() * .7,
        rot: r() * 6.283, vr: (r() - .5) * .08, vx: (r() - .5) * .03
      }));
      embers = Array.from({ length: vw < 768 ? 12 : 24 }, () => newEmber(true));
    }
    function resize(w, h) {
      W = Math.max(1, Math.round(w * RES));
      Hh = Math.max(1, Math.round(h * RES));
      cv.width = W;
      cv.height = Hh;
    }
    function render(now, camZ, k, e) {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      if (!reduce) drift += dt * .05;
      ctx.clearRect(0, 0, W, Hh);
      const cx = W / 2, cy = Hh * .52, base = Math.max(W, Hh) * .55;
      ctx.globalCompositeOperation = 'source-over';
      for (const p of parts) {
        p.rot += p.vr * dt;
        p.x += p.vx * dt;
        if (p.x > 1.8) p.x = -1.8;
        if (p.x < -1.8) p.x = 1.8;
        const dz = (((p.z - camZ - drift) % 4) + 4) % 4 + .15;
        const sc = 1 / dz;
        const alpha = k * .55 * smooth(4.15, 2.4, dz) * smooth(.15, 1.1, dz);
        if (alpha < .01) continue;
        const size = base * p.s * sc;
        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(cx + p.x * W * .5 * sc, cy + p.y * Hh * .5 * sc);
        ctx.rotate(p.rot);
        ctx.drawImage(tex, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      if (e > .02 && !reduce) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#ff8a3d';
        for (const m of embers) {
          m.y -= m.v * dt;
          m.w += dt * 2;
          if (m.y < -.05) Object.assign(m, newEmber(false));
          const fl = .5 + .5 * Math.sin(m.w * 3 + m.x * 20);
          ctx.globalAlpha = e * (.3 + .55 * fl) * smooth(1.05, .75, m.y) * smooth(0, .35, m.y);
          ctx.beginPath();
          ctx.arc((m.x + Math.sin(m.w) * .012) * W, m.y * Hh, m.s * RES * 1.5, 0, 6.283);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    return { init, resize, render };
  })();

  function layoutHero() {
    const sw = hero.sticky.clientWidth;
    const sh = hero.sticky.clientHeight;
    const m = sw < 768;
    const cx = sw / 2;
    const cy = sh * (m ? .45 : .53);
    const r0 = Math.min(sw, sh) * (m ? .28 : .25);
    const S0 = r0 / (PC.ry * .96);
    const S1 = Math.max(cx / PC.x, (sw - cx) / (1 - PC.x), cy / PC.y, (sh - cy) / (1 - PC.y)) * 1.03;
    const S2 = S1 * (m ? 1.25 : 1.38);
    const rFull = Math.hypot(Math.max(cx, sw - cx), Math.max(cy, sh - cy)) + 4;
    H = { sw, sh, m, cx, cy, r0, S0, S1, S2, rFull };
    hero.img.style.width = hero.img.style.height = S1 + 'px';
    hero.sticky.style.setProperty('--cy', cy + 'px');
    hero.sticky.style.setProperty('--r0', r0 + 'px');
    smoke.resize(sw, sh);
  }

  function renderHero(now) {
    const target = pinProgress(hero.el);
    heroP = damp(heroP, target, .1);
    if (Math.abs(heroP - target) < .0004) heroP = target;
    const p = heroP;
    const ip = introStart === null ? 0 : (reduce ? 1 : easeIO(clamp((now - introStart - 950) / 1500)));

    const a = easeIO(range(p, 0, .4));      // portal opens to full screen
    const b = easeIO(range(p, .46, .86));   // push in on the pizza, dish name lands
    const c = range(p, .88, 1);             // settle before the menu

    const r = lerp(H.r0 * ip, H.rFull, a);
    let S = lerp(H.S0 * lerp(1.22, 1, ip), H.S1, a);
    S *= lerp(1, H.S2 / H.S1, b);
    const fx = H.cx + (H.m ? 0 : H.sw * .17) * b;
    const fy = H.cy + (H.m ? -H.sh * .1 : H.sh * .01) * b;
    hero.img.style.transform = `translate3d(${(fx - PC.x * S).toFixed(1)}px, ${(fy - PC.y * S).toFixed(1)}px, 0) scale(${(S / H.S1).toFixed(4)})`;
    hero.media.style.clipPath = a > .999 ? 'none' : `circle(${r.toFixed(1)}px at ${H.cx}px ${H.cy}px)`;
    hero.media.style.opacity = (1 - c * .5).toFixed(3);

    const tOp = 1 - smooth(.04, .5, a);
    const tf = `translateY(-50%) scale(${(1 + a * 1.15).toFixed(4)})`;
    hero.back.style.transform = hero.front.style.transform = tf;
    hero.back.style.opacity = hero.front.style.opacity = tOp.toFixed(3);
    const fade = (1 - range(a, 0, .3)).toFixed(3);
    hero.fades.forEach(el => el.style.setProperty('--fade', fade));

    const hOp = smooth(.17, .3, p) * (1 - smooth(.4, .5, p));
    hero.headline.style.opacity = hOp.toFixed(3);
    hero.headline.style.transform = `translateY(-50%) translateY(${((1 - smooth(.17, .3, p)) * 24).toFixed(1)}px) scale(${lerp(.97, 1.05, range(p, .17, .5)).toFixed(4)})`;

    hero.shade.style.opacity = (b * .96).toFixed(3);
    if (p > .58) hero.dish.classList.add('is-on');
    else if (p < .52) hero.dish.classList.remove('is-on');

    smoke.render(now, a * 3.2, lerp(1, .3, b) * (1 - c * .6), 1 - a);
  }

  function startIntro() {
    if (introStart !== null) return;
    introStart = performance.now();
    body.classList.add('is-run');
    setTimeout(() => {
      body.classList.add('is-ready');
      body.classList.remove('is-intro');
      setTimeout(() => body.classList.add('is-settled'), 1100);
    }, reduce ? 0 : 2300);
  }

  /* =======================================================
     3. MENU
     ======================================================= */
  const menu = { tabs: $('#menuTabs'), panel: $('#menuPanel'), cur: -1, token: 0, shown: false };
  const pad = n => String(n).padStart(2, '0');
  const money = v => '$' + (Number.isInteger(v) ? v : v.toFixed(2));

  function priceHTML(p) {
    const list = Array.isArray(p) ? p : [p];
    return `<span class="mi__p">${list.map(v => (v == null ? '<span class="na">&mdash;</span>' : `<span>${money(v)}</span>`)).join('')}</span>`;
  }
  function itemHTML(it) {
    return `<li class="mi${it.star ? ' mi--star' : ''}">` +
      `<span class="mi__n">${it.n}${it.star ? '<span class="star">Try it</span>' : ''}</span>${priceHTML(it.p)}` +
      (it.d ? `<span class="mi__d">${it.d}</span>` : '') +
      (it.a ? `<span class="mi__a">${it.a}</span>` : '') + '</li>';
  }
  function panelHTML(cat, i) {
    const f = cat.feature;
    const words = cat.title.split(' ').map(w => `<span class="w"><span>${w}</span></span>`).join('');
    const feat = f.type
      ? `<figure class="feat feat--type"><div class="feat__frame"><p class="eyebrow">${f.eyebrow}</p><p class="feat__big">${f.big}</p><p class="feat__line">${f.line}</p></div></figure>`
      : `<figure class="feat"><div class="feat__frame"><span class="feat__tag">${f.tag}</span>` +
        `<img src="${f.img}" alt="${f.alt}" style="object-position:${(f.focus || [.5, .5]).map(v => v * 100 + '%').join(' ')}">` +
        `${hoverable ? '<span class="feat__hint" aria-hidden="true">Move to look around</span>' : ''}</div>` +
        `<figcaption><b>${f.caption}</b><span>${f.real ? 'Photographed at American Pizza &amp; Grill' : 'Sample photo'}</span></figcaption></figure>`;
    const groups = cat.groups.map(g => {
      const short = g.items.every(it => !it.d || it.d.length < 40) && !g.cols;
      const cols = short && g.items.length >= 6;
      return `<div class="mg"><div class="mg__h"><h4>${g.name}</h4>` +
        (g.cols ? `<div class="mg__cols">${g.cols.map(c => `<span>${c}</span>`).join('')}</div>` : '') +
        `</div><ul class="mg__list${cols ? ' is-cols' : ''}">${g.items.map(itemHTML).join('')}</ul></div>`;
    }).join('');
    const sides = cat.sides
      ? `<div class="sides"><div class="sides__h"><h4>Signature sides</h4><span>$4</span></div><ul>${D.sides.map(s => `<li>${s}</li>`).join('')}</ul></div>`
      : '';
    const cta = cat.cta ? `<a class="link-arrow mp__cta" href="${cat.cta.href}">${cat.cta.label} <span aria-hidden="true">&rarr;</span></a>` : '';
    return `<article class="mp${i % 2 ? ' mp--flip' : ''}${cat.wide ? ' mp--wide' : ''}">` +
      `<header class="mp__top"><span class="mp__num">${pad(i + 1)} / ${pad(D.menu.length)}</span><h3 class="mp__title">${words}</h3></header>` +
      `<div class="mp__grid"><div class="mp__aside">${feat}</div><div class="mp__body"><p class="mp__kicker">${cat.kicker}</p>${groups}${sides}${cta}</div></div></article>`;
  }
  function animateIn(el) {
    if (reduce || !el) return;
    $$('.mp__title .w > span', el).forEach((s, k) =>
      s.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], { duration: 950, delay: k * 90, easing: EASE, fill: 'backwards' }));
    const fr = $('.feat__frame', el);
    if (fr) {
      fr.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1100, delay: 140, easing: EASE, fill: 'backwards' });
      const im = $('img', fr);
      if (im && !Dish3D.active()) im.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1.04)' }], { duration: 1500, delay: 140, easing: EASE, fill: 'backwards' });
      Dish3D.play();
    }
    $$('.mp__kicker, .mg__h, .mi, .sides, .mp__cta', el).slice(0, 24).forEach((it, k) =>
      it.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 750, delay: 220 + k * 38, easing: EASE, fill: 'backwards' }));
    $$('.mp__num, .feat figcaption', el).forEach(x =>
      x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 350, fill: 'backwards' }));
  }
  async function selectCat(i, { scroll = true } = {}) {
    if (i === menu.cur) return;
    const first = menu.cur === -1;
    menu.cur = i;
    const token = ++menu.token;
    const tabs = $$('.tab', menu.tabs);
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
    const tab = tabs[i];
    menu.tabs.scrollTo({ left: tab.offsetLeft - menu.tabs.clientWidth / 2 + tab.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    menu.panel.setAttribute('aria-labelledby', tab.id);

    const old = menu.panel.firstElementChild;
    if (old && !reduce) {
      menu.panel.style.minHeight = menu.panel.offsetHeight + 'px';
      const out = old.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-18px)' }],
        { duration: 260, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      /* don't let a throttled tab stall the switch */
      await Promise.race([out.finished.catch(() => {}), new Promise(r => setTimeout(r, 420))]);
      if (token !== menu.token) return;
    }
    menu.panel.innerHTML = panelHTML(D.menu[i], i);
    const frameEl = $('.feat__frame', menu.panel);
    if (frameEl) Dish3D.show(frameEl, D.menu[i].feature);
    if (!first && scroll) {
      const barBottom = menu.tabs.getBoundingClientRect().bottom;
      const top = menu.panel.getBoundingClientRect().top;
      if (top < barBottom) scrollTo({ top: scrollY + top - barBottom - 24, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (!first || menu.shown) animateIn(menu.panel.firstElementChild);
    requestAnimationFrame(() => { menu.panel.style.minHeight = ''; });
  }

  menu.tabs.innerHTML = D.menu.map((c, i) =>
    `<button class="tab" type="button" role="tab" id="tab-${c.id}" aria-controls="menuPanel" aria-selected="false" tabindex="-1"><sup>${pad(i + 1)}</sup>${c.label}</button>`).join('');
  menu.tabs.addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (t) selectCat($$('.tab', menu.tabs).indexOf(t));
  });
  menu.tabs.addEventListener('keydown', e => {
    const n = D.menu.length;
    let i = menu.cur;
    if (e.key === 'ArrowRight') i = (i + 1) % n;
    else if (e.key === 'ArrowLeft') i = (i - 1 + n) % n;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n - 1;
    else return;
    e.preventDefault();
    selectCat(i);
    menu.tabs.children[i].focus();
  });
  $$('[data-open-cat]').forEach(a => a.addEventListener('click', () => {
    const i = D.menu.findIndex(c => c.id === a.dataset.openCat);
    if (i >= 0) selectCat(i, { scroll: false });
  }));
  selectCat(0, { scroll: false });
  new IntersectionObserver((entries, io) => {
    if (entries[0].isIntersecting) { menu.shown = true; animateIn(menu.panel.firstElementChild); io.disconnect(); }
  }, { rootMargin: '0px 0px -25% 0px' }).observe(menu.panel);
  /* Warm up the other dishes so tab switches land instantly */
  addEventListener('load', () => setTimeout(() => Dish3D.preload(D.menu.map(c => c.feature).filter(f => f.img)), 1500));

  /* =======================================================
     4. STORY — parallax + marquees
     ======================================================= */
  const story = $('.story');
  const photos = $$('[data-speed]');
  const marquees = $$('[data-marquee]').map(el => ({ el, dir: Number(el.dataset.marquee) || 1, sec: el.closest('section') }));

  function renderStory(now) {
    if (inView(story)) {
      photos.forEach(ph => {
        const r = ph.parentElement.getBoundingClientRect();
        const off = r.top + r.height / 2 - vh / 2;
        ph.style.transform = `translate3d(0, ${(off * Number(ph.dataset.speed)).toFixed(1)}px, 0)`;
      });
    }
    marquees.forEach(m => {
      if (!inView(m.sec)) return;
      const w = m.el.scrollWidth / 2;
      const x = ((((scrollY * .35 + (reduce ? 0 : now * .02)) * m.dir) % w) + w) % w;
      m.el.style.transform = `translate3d(${-x.toFixed(1)}px, 0, 0)`;
    });
  }

  /* On the line: pinned horizontal strip on desktop, swipe row on small screens */
  const line = { pin: $('.line__pin'), track: $('[data-line-track]'), bar: $('[data-line-bar]'), shots: $$('.shot'), dist: 0, on: false };
  let lineP = 0;

  function layoutLine() {
    line.on = vw >= 900 && !reduce;
    line.pin.classList.toggle('is-pinned', line.on);
    line.track.style.transform = '';
    line.dist = line.on ? Math.max(0, line.track.scrollWidth - vw) : 0;
    line.pin.style.height = line.on ? (vh + line.dist) + 'px' : '';
  }
  function renderLine() {
    if (line.on) {
      lineP = damp(lineP, pinProgress(line.pin), .14);
      line.track.style.transform = `translate3d(${(-lineP * line.dist).toFixed(1)}px, 0, 0)`;
      line.bar.style.transform = `scaleX(${lineP.toFixed(4)})`;
    }
    line.shots.forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.right < -100 || r.left > vw + 100) return;
      s.style.setProperty('--px', ((r.left + r.width / 2 - vw / 2) / vw * -7).toFixed(2) + '%');
      if (r.left < vw * (line.on ? .86 : .97) && r.top < vh * .9) s.classList.add('is-in');
    });
  }

  /* =======================================================
     5. DAY → NIGHT
     ======================================================= */
  const dn = { el: $('.dn'), clock: $('[data-clock]'), ampm: $('[data-ampm]'), orb: $('[data-orb]'), last: -1 };
  let dnP = 0;
  const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
  const DAY_BG = [239, 229, 211], NIGHT_BG = [20, 17, 16], DAY_FG = [20, 17, 16], NIGHT_FG = [243, 234, 219];

  function renderDN() {
    const t = pinProgress(dn.el);
    dnP = damp(dnP, t, .12);
    const n = smooth(.2, .78, dnP);
    const bg = mix(DAY_BG, NIGHT_BG, n);
    const fg = mix(DAY_FG, NIGHT_FG, n);
    const s = dn.el.style;
    s.setProperty('--n', n.toFixed(4));
    s.setProperty('--dn-bg', `rgb(${bg})`);
    s.setProperty('--dn-fg', `rgb(${fg})`);
    s.setProperty('--dn-soft', `rgba(${fg},.62)`);
    s.setProperty('--dn-line', `rgba(${fg},.16)`);
    dn.el.classList.toggle('is-night', n > .5);

    const mins = Math.round(lerp(690, 1260, smooth(.06, .9, dnP)) / 15) * 15;
    if (mins !== dn.last) {
      dn.last = mins;
      const h = Math.floor(mins / 60);
      dn.clock.textContent = `${h % 12 || 12}:${pad(mins % 60)}`;
      dn.ampm.textContent = h >= 12 ? 'PM' : 'AM';
    }
    const ang = Math.PI * (1 - smooth(.04, .94, dnP));
    dn.orb.setAttribute('transform', `translate(${(200 + Math.cos(ang) * 180).toFixed(1)} ${(190 - Math.sin(ang) * 180).toFixed(1)})`);
  }

  /* =======================================================
     6. BUILD YOUR OWN PIZZA
     ======================================================= */
  const B = D.build;
  const svg = $('#pizza');
  const stage = $('.build__stage');
  const tip = $('#pzTip');
  const state = { size: B.preset.size, sauce: B.preset.sauce, truffle: false, tops: new Set(B.preset.toppings) };
  const topById = Object.fromEntries(B.toppings.map(t => [t.id, t]));
  const tierById = Object.fromEntries(B.tiers.map(t => [t.id, t]));
  const tierOf = id => tierById[topById[id].tier];

  const SHAPES = {
    pepperoni: '<circle r="44" fill="#9e2a1c"/><circle r="44" fill="none" stroke="#741a10" stroke-width="5"/><circle r="35" fill="#b5392a" opacity=".55"/><circle cx="-14" cy="-10" r="7" fill="#d9705a" opacity=".7"/><circle cx="15" cy="8" r="5.5" fill="#d9705a" opacity=".6"/><circle cx="-4" cy="18" r="4.5" fill="#6e170e" opacity=".6"/><circle cx="12" cy="-18" r="3.5" fill="#6e170e" opacity=".5"/>',
    jalapeno: '<circle r="24" fill="#cfe0a0" opacity=".85"/><circle r="24" fill="none" stroke="#3f7a26" stroke-width="8"/><circle r="9" fill="#e9eecb"/><ellipse cx="-4" cy="2" rx="2.5" ry="4" fill="#f3f0d4"/><ellipse cx="5" cy="-3" rx="2.5" ry="4" fill="#f3f0d4"/>',
    onion: '<path d="M-34 10 A36 36 0 0 1 34 10" fill="none" stroke="#efe0f0" stroke-width="9" stroke-linecap="round"/><path d="M-30 6 A32 32 0 0 1 30 6" fill="none" stroke="#a9729f" stroke-width="3" stroke-linecap="round"/>',
    olive: '<circle r="17" fill="none" stroke="#1b1816" stroke-width="11"/><path d="M-12 -9 A15 15 0 0 1 6 -14" fill="none" stroke="#5a524c" stroke-width="3" stroke-linecap="round"/>',
    tomato: '<circle r="38" fill="#c9372a"/><circle r="31" fill="#e2553f"/><path d="M0 -26 L0 26 M-23 -13 L23 13 M-23 13 L23 -13" stroke="#c9372a" stroke-width="4"/><g fill="#f4cf74"><ellipse cx="0" cy="-15" rx="4" ry="6"/><ellipse cx="13" cy="8" rx="4" ry="6" transform="rotate(120 13 8)"/><ellipse cx="-13" cy="8" rx="4" ry="6" transform="rotate(-120 -13 8)"/></g><circle r="6" fill="#ef8a6c"/>',
    spinach: '<path d="M0 -38 C 30 -22, 28 22, 0 38 C -28 22, -30 -22, 0 -38Z" fill="#2c5527"/><path d="M0 -34 L0 34 M0 -10 L12 -18 M0 6 L-13 -2 M0 18 L11 12" stroke="#4f7e3e" stroke-width="2.5"/>',
    pepper: '<path d="M-34 12 Q0 -30 34 12" fill="none" stroke="#2f7a2a" stroke-width="12" stroke-linecap="round"/><path d="M-26 4 Q0 -24 26 4" fill="none" stroke="#6db352" stroke-width="3" stroke-linecap="round"/>',
    arugula: '<path d="M0 -40 L10 -30 L6 -24 L16 -16 L9 -8 L18 2 L8 8 L14 20 L4 22 L0 40 L-4 22 L-14 20 L-8 8 L-18 2 L-9 -8 L-16 -16 L-6 -24 L-10 -30 Z" fill="#4e8a35"/><path d="M0 -36 V38" stroke="#7fb35d" stroke-width="2.5"/>',
    pineapple: '<rect x="-19" y="-14" width="38" height="28" rx="6" fill="#f0bd45" stroke="#d29a26" stroke-width="3"/><path d="M-6 -12 V12 M6 -12 V12" stroke="#f8d77c" stroke-width="2.5"/>',
    bacon: '<path d="M-46 -8 C -30 -22, -14 4, 2 -8 S 30 -20, 46 -6 L 46 10 C 30 -2, 16 20, 0 8 S -30 2, -46 10 Z" fill="#b7553f"/><path d="M-42 1 C -28 -10, -14 12, 2 1 S 30 -10, 44 2" fill="none" stroke="#f1c7ad" stroke-width="4" stroke-linecap="round"/>',
    sausage: '<path d="M-14 -18 C 4 -24, 22 -12, 20 4 C 18 20, 0 24, -12 18 C -24 12, -26 -10, -14 -18Z" fill="#7a4a30"/><circle cx="-5" cy="-6" r="4" fill="#a06a45"/><circle cx="8" cy="6" r="3" fill="#a06a45"/><circle cx="-8" cy="9" r="2.5" fill="#5a321f"/>',
    mushroom: '<path d="M-30 4 C -30 -26, 30 -26, 30 4 C 20 2, 12 2, 9 4 L 9 22 C 9 28, -9 28, -9 22 L -9 4 C -12 2, -20 2, -30 4Z" fill="#b59d80"/><path d="M-22 -2 Q0 -18 22 -2 M-26 1 C -20 -1, 20 -1, 26 1" fill="none" stroke="#8b7259" stroke-width="2"/>',
    chicken: '<path d="M-24 -14 C -8 -24, 18 -20, 24 -6 C 30 8, 16 22, -2 20 C -20 18, -32 0, -24 -14Z" fill="#e6c995"/><path d="M-14 -10 L 6 10 M -2 -16 L 16 2" stroke="#b9874d" stroke-width="4" stroke-linecap="round"/>',
    beef: '<circle cx="-8" cy="-4" r="10" fill="#5c3022"/><circle cx="8" cy="-8" r="8" fill="#6d3a28"/><circle cx="4" cy="8" r="9" fill="#58301f"/><circle cx="-10" cy="10" r="6" fill="#7a4430"/><circle cx="-4" cy="-6" r="3" fill="#8f5640"/>',
    xmozz: '<path d="M-30 -10 C -22 -34, 14 -34, 28 -16 C 40 0, 30 26, 6 28 C -16 30, -40 16, -30 -10Z" fill="#fbeec6" opacity=".92"/>',
    ham: '<rect x="-26" y="-26" width="52" height="52" rx="12" fill="#e3968e"/><rect x="-18" y="-18" width="36" height="36" rx="9" fill="#efb3ab"/><path d="M-10 -6 Q 0 -12 10 -4" fill="none" stroke="#fbd7d1" stroke-width="3" stroke-linecap="round"/>',
    feta: '<rect x="-11" y="-11" width="22" height="22" rx="3" fill="#fbf8ef" stroke="#e1d8c4" stroke-width="2"/>',
    fmozz: '<circle cx="3" cy="4" r="34" fill="#e2d2ad"/><circle r="34" fill="#fffaf0"/><ellipse cx="-10" cy="-12" rx="12" ry="7" fill="#fff"/>',
    goat: '<path d="M-12 -10 L 2 -15 L 13 -6 L 12 8 L 0 14 L -13 7 Z" fill="#f6f2e8"/><circle cx="12" cy="12" r="4" fill="#f6f2e8"/>',
    steak: '<rect x="-38" y="-14" width="76" height="28" rx="12" fill="#5d2a1d"/><rect x="-30" y="-7" width="60" height="14" rx="7" fill="#b55a50"/><path d="M-22 -12 L-30 12 M-4 -14 L-12 14 M14 -14 L6 14" stroke="#3d1a10" stroke-width="3" opacity=".6"/>'
  };
  const COUNT = { olive: 16, jalapeno: 15, feta: 18, goat: 18, beef: 16, sausage: 16, pineapple: 14, onion: 13, xmozz: 14 };
  const HALO = { olive: 34, jalapeno: 40, feta: 28, goat: 28, beef: 34, sausage: 36, pineapple: 36, xmozz: 50 };

  function blobPath(r, amp, seed, n = 56) {
    const R = rng(seed);
    const ph = [R() * 6.28, R() * 6.28, R() * 6.28];
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      const k = 1 + amp * (Math.sin(a * 3 + ph[0]) * .5 + Math.sin(a * 7 + ph[1]) * .3 + Math.sin(a * 13 + ph[2]) * .2) + (R() - .5) * amp * .6;
      pts.push([Math.cos(a) * r * k, Math.sin(a) * r * k]);
    }
    const f = v => v.toFixed(1);
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + 'Z';
  }
  function scatter(id) {
    const R = rng(hash(id));
    const n = COUNT[id] || 11;
    const minD = n > 13 ? 62 : 82;
    const pts = [];
    for (let tries = 0; pts.length < n && tries < 600; tries++) {
      const a = R() * Math.PI * 2;
      const d = Math.sqrt(R()) * 330;
      const x = Math.cos(a) * d, y = Math.sin(a) * d;
      if (pts.every(p => (p.x - x) ** 2 + (p.y - y) ** 2 > minD * minD)) pts.push({ x, y, rot: R() * 360, s: .85 + R() * .25 });
    }
    return pts;
  }

  function buildSVG() {
    const R = rng(21);
    const spots = Array.from({ length: 30 }, () => {
      const a = R() * 6.283, d = Math.sqrt(R()) * 340;
      return `<ellipse cx="${(Math.cos(a) * d).toFixed(0)}" cy="${(Math.sin(a) * d).toFixed(0)}" rx="${(8 + R() * 22).toFixed(0)}" ry="${(6 + R() * 14).toFixed(0)}" transform="rotate(${(R() * 180).toFixed(0)} ${(Math.cos(a) * d).toFixed(0)} ${(Math.sin(a) * d).toFixed(0)})" fill="${R() > .45 ? '#d6973f' : '#fff3cf'}" opacity="${R() > .45 ? .42 : .7}"/>`;
    }).join('');
    const truffle = Array.from({ length: 46 }, () => {
      const a = R() * 6.283, d = Math.sqrt(R()) * 360;
      return `<ellipse cx="${(Math.cos(a) * d).toFixed(0)}" cy="${(Math.sin(a) * d).toFixed(0)}" rx="${(3 + R() * 6).toFixed(1)}" ry="${(2 + R() * 3).toFixed(1)}" fill="#3a2614" opacity=".55"/>`;
    }).join('');
    const sliceLines = n => Array.from({ length: n / 2 }, (_, i) => {
      const a = i / n * Math.PI * 2 + Math.PI / n;
      const x = Math.cos(a) * 450, y = Math.sin(a) * 450;
      return `<line x1="${(-x).toFixed(1)}" y1="${(-y).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    }).join('');
    const tops = B.toppings.map(t => {
      const halo = HALO[t.id] || 60;
      const pieces = scatter(t.id).map((p, k) =>
        `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)}) scale(${p.s.toFixed(2)})"><g class="pc" style="--d:${k}"><circle class="halo" r="${halo}"/><use href="#s-${t.id}"/></g></g>`).join('');
      return `<g class="tp" data-t="${t.id}" style="--hl:${tierOf(t.id).color}">${pieces}</g>`;
    }).join('');

    svg.insertAdjacentHTML('beforeend', `
      <defs>
        <radialGradient id="gBoard"><stop offset="0" stop-color="#2d2622"/><stop offset=".85" stop-color="#1d1816"/><stop offset="1" stop-color="#171311"/></radialGradient>
        <radialGradient id="gCrust"><stop offset=".82" stop-color="#e4b46c"/><stop offset=".93" stop-color="#c98a43"/><stop offset="1" stop-color="#9a5f27"/></radialGradient>
        <filter id="fTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="8"/><feColorMatrix values="0 0 0 0 .42  0 0 0 0 .24  0 0 0 0 .1  0 0 0 .5 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
        <filter id="fSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
        ${Object.entries(SHAPES).map(([k, v]) => `<g id="s-${k}">${v}</g>`).join('')}
      </defs>
      <circle r="494" fill="url(#gBoard)"/>
      <circle r="478" fill="none" stroke="rgba(243,234,219,.06)" stroke-width="2"/>
      <g class="pz-body">
        <circle r="452" cy="18" fill="#000" opacity=".55" filter="url(#fSoft)"/>
        <circle r="448" fill="url(#gCrust)"/>
        <circle r="448" fill="#fff" filter="url(#fTex)" opacity=".55"/>
        <path class="pz-sauce" d="${blobPath(398, .028, 4)}"/>
        <path d="${blobPath(374, .055, 9)}" fill="#f2dca0" opacity=".93"/>
        <g class="pz-cheese-spots">${spots}</g>
        <g class="truffle">${truffle}</g>
        <g class="tops">${tops}</g>
        <g class="slices" data-n="6" stroke="rgba(78,38,12,.42)" stroke-width="4">${sliceLines(6)}</g>
        <g class="slices" data-n="8" stroke="rgba(78,38,12,.42)" stroke-width="4">${sliceLines(8)}</g>
      </g>`);
  }

  const sauceWrap = $('[data-sauces]');
  const tierWrap = $('[data-tiers]');
  sauceWrap.innerHTML = B.sauces.map(s =>
    `<button type="button" class="sauce" data-sauce="${s.id}" aria-pressed="false"><i style="background:${s.color}"></i>${s.name}</button>`).join('');
  tierWrap.innerHTML = B.tiers.map(t => {
    const items = B.toppings.filter(x => x.tier === t.id);
    return `<div class="tier" style="--c:${t.color}"><p class="tier__h"><i></i><b>${t.name}</b> $${t.price} each<span class="tier__x"></span></p><div class="chips">` +
      items.map(x => `<button type="button" class="chip" data-top="${x.id}" aria-pressed="false">${x.name}</button>`).join('') + '</div></div>';
  }).join('');

  buildSVG();
  const pzBody = $('.pz-body', svg);
  const sauceEl = $('.pz-sauce', svg);
  const truffleEl = $('.truffle', svg);
  const totalEl = $('[data-total]');
  const linesEl = $('[data-lines]');
  const sizeTag = $('[data-size-tag]');
  let shownTotal = 0;

  function price() {
    const s = B.sizes[state.size];
    let t = s.base;
    state.tops.forEach(id => { t += tierOf(id).price * s.mult; });
    if (state.truffle) t += B.truffle;
    return t;
  }
  function tweenTotal(to) {
    const from = shownTotal;
    shownTotal = to;
    if (reduce || from === to) { totalEl.textContent = '$' + to; return; }
    const t0 = performance.now();
    const step = now => {
      const k = clamp((now - t0) / 450);
      totalEl.textContent = '$' + Math.round(lerp(from, to, 1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function orderText() {
    const sauce = B.sauces.find(s => s.id === state.sauce).name;
    const tops = [...state.tops].map(id => topById[id].name);
    return `${state.size}" pizza, ${sauce} sauce${state.truffle ? ', truffle oil' : ''}` +
      (tops.length ? `, with ${tops.join(', ')}` : ', mozzarella only');
  }
  function render() {
    const sz = B.sizes[state.size];
    pzBody.style.transform = `scale(${sz.scale})`;
    $$('.slices', svg).forEach(g => { g.style.opacity = Number(g.dataset.n) === sz.slices ? 1 : 0; });
    sauceEl.style.fill = B.sauces.find(s => s.id === state.sauce).color;
    truffleEl.style.opacity = state.truffle ? 1 : 0;
    $$('.tp', svg).forEach(g => {
      const on = state.tops.has(g.dataset.t);
      if (on && !g.classList.contains('is-on')) { g.classList.remove('is-out'); g.classList.add('is-on'); }
      if (!on && g.classList.contains('is-on')) {
        g.classList.add('is-out');
        setTimeout(() => { if (!state.tops.has(g.dataset.t)) g.classList.remove('is-on', 'is-out'); }, 300);
      }
    });
    $$('[data-size]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.size) === state.size)));
    $$('[data-sauce]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sauce === state.sauce)));
    $$('[data-top]').forEach(b => b.setAttribute('aria-pressed', String(state.tops.has(b.dataset.top))));
    $$('.tier__x', tierWrap).forEach(x => { x.textContent = sz.mult > 1 ? ' · ×2 on 14"' : ''; });
    $('[data-truffle]').checked = state.truffle;
    sizeTag.textContent = state.size + '″';

    const sauce = B.sauces.find(s => s.id === state.sauce).name;
    const tops = [...state.tops].map(id => `${topById[id].name} <span>+$${tierOf(id).price * sz.mult}</span>`);
    linesEl.innerHTML = `<b>${state.size}&Prime; ${sauce}</b> &middot; mozzarella${state.truffle ? ' &middot; truffle oil +$2' : ''}<br>` +
      (tops.length ? tops.join(' &middot; ') : 'No extra toppings yet. Tap a few above.');
    tweenTotal(price());
  }

  /* Hover a topping to light it up on the pie (like units on a floor plan) */
  let focusTimer = 0;
  function focusTop(id, preview) {
    clearTimeout(focusTimer);
    svg.classList.toggle('is-focus', !!id);
    $$('.tp', svg).forEach(g => {
      g.classList.toggle('is-hl', g.dataset.t === id);
      g.classList.toggle('is-preview', !!preview && g.dataset.t === id);
    });
  }
  function flashTop(id) { focusTop(id, false); focusTimer = setTimeout(() => focusTop(null), 900); }

  $('[data-sizes]').addEventListener('click', e => {
    const b = e.target.closest('[data-size]');
    if (b) { state.size = Number(b.dataset.size); render(); }
  });
  sauceWrap.addEventListener('click', e => {
    const b = e.target.closest('[data-sauce]');
    if (b) { state.sauce = b.dataset.sauce; render(); }
  });
  $('[data-truffle]').addEventListener('change', e => { state.truffle = e.target.checked; render(); });
  $('[data-clear]').addEventListener('click', () => { state.tops.clear(); render(); });
  tierWrap.addEventListener('click', e => {
    const b = e.target.closest('[data-top]');
    if (!b) return;
    const id = b.dataset.top;
    if (state.tops.has(id)) state.tops.delete(id); else state.tops.add(id);
    render();
    if (state.tops.has(id)) (hoverable ? focusTop(id, false) : flashTop(id)); else focusTop(null);
  });
  if (hoverable) {
    tierWrap.addEventListener('pointerover', e => {
      const b = e.target.closest('[data-top]');
      if (b) focusTop(b.dataset.top, !state.tops.has(b.dataset.top));
    });
    tierWrap.addEventListener('pointerleave', () => focusTop(null));
    tierWrap.addEventListener('focusin', e => {
      const b = e.target.closest('[data-top]');
      if (b) focusTop(b.dataset.top, !state.tops.has(b.dataset.top));
    });
    tierWrap.addEventListener('focusout', () => focusTop(null));

    svg.addEventListener('pointermove', e => {
      const g = e.target.closest('.tp.is-on');
      if (!g) { tip.hidden = true; if (svg.dataset.hover) { delete svg.dataset.hover; focusTop(null); } return; }
      const id = g.dataset.t;
      const r = stage.getBoundingClientRect();
      tip.style.left = (e.clientX - r.left) + 'px';
      tip.style.top = (e.clientY - r.top) + 'px';
      tip.innerHTML = `${topById[id].name}<small>+$${tierOf(id).price * B.sizes[state.size].mult}</small>`;
      tip.hidden = false;
      if (svg.dataset.hover !== id) { svg.dataset.hover = id; focusTop(id, false); }
    });
    svg.addEventListener('pointerleave', () => { tip.hidden = true; delete svg.dataset.hover; focusTop(null); });
  }

  const copyBtn = $('[data-copy]');
  copyBtn.addEventListener('click', async () => {
    const text = `Order for American Pizza & Grill: ${orderText()}. Estimated $${price()}.`;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied. Now give us a call';
    } catch {
      copyBtn.textContent = 'Copy unavailable';
    }
    setTimeout(() => { copyBtn.textContent = 'Copy my order'; }, 2600);
  });

  render();

  /* =======================================================
     7. FINALE
     ======================================================= */
  const fin = { el: $('.finale__pin'), st: $('.finale__sticky'), lines: $$('.finale__title .ln') };
  let finP = 0;
  function renderFin() {
    const t = pinProgress(fin.el);
    finP = damp(finP, t, .12);
    const a = easeIO(range(finP, 0, .55));
    const m = vw < 768;
    const s = fin.st.style;
    s.setProperty('--ix', lerp(m ? 5 : 14, 0, a).toFixed(2) + '%');
    s.setProperty('--iy', lerp(m ? 16 : 18, 0, a).toFixed(2) + '%');
    s.setProperty('--rad', lerp(18, 0, a).toFixed(1) + 'px');
    s.setProperty('--s', lerp(1.2, 1, a).toFixed(4));
    fin.lines.forEach((ln, k) => ln.classList.toggle('is-on', reduce || finP > .3 + k * .13));
  }

  /* =======================================================
     LOOP
     ======================================================= */
  let lastFrame = performance.now();
  function frame(now) {
    dt = clamp((now - lastFrame) / 1000, 0, .5);
    lastFrame = now;
    if (inView(hero.el)) renderHero(now);
    Dish3D.frame(now, dt);
    renderStory(now);
    if (inView(line.pin)) renderLine();
    if (inView(dn.el)) renderDN();
    if (inView(fin.el)) renderFin();
    requestAnimationFrame(frame);
  }

  function onResize() {
    vw = innerWidth;
    vh = innerHeight;
    layoutHero();
    layoutLine();
  }
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(onResize, 120); });

  smoke.init();
  layoutHero();
  layoutLine();
  addEventListener('load', layoutLine);
  onScroll();
  requestAnimationFrame(frame);

  if (reduce) {
    body.classList.add('is-run', 'is-ready', 'is-settled');
    body.classList.remove('is-intro');
    introStart = -1e9;
  } else {
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const img = hero.img.decode ? hero.img.decode().catch(() => {}) : Promise.resolve();
    Promise.race([Promise.all([fonts, img]), new Promise(r => setTimeout(r, 2200))]).then(startIntro);
  }
})();
