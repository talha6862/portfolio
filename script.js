/* Portfolio interactions: theme + accent, mobile nav, typed line, counters,
   scroll reveal, project filter, contact form, quick-answers panel, lightbox. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  function save(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  /* ---------- theme toggle ---------- */
  var themeBtn = $('#themeBtn');
  var metaTheme = $('meta[name="theme-color"]');
  function paintTheme() {
    var light = root.getAttribute('data-theme') === 'light';
    if (themeBtn) themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    if (metaTheme) metaTheme.setAttribute('content', light ? '#FAF6F2' : '#120A0D');
  }
  paintTheme();
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      save('ta-theme', next);
      paintTheme();
    });
  }

  /* ---------- accent colour ---------- */
  var accentBtn = $('#accentBtn');
  var accentMenu = $('#accentMenu');
  function paintAccent() {
    var cur = root.getAttribute('data-accent');
    $$('button', accentMenu).forEach(function (b) {
      b.classList.toggle('on', b.dataset.accent === cur);
    });
  }
  function closeAccent() {
    if (!accentMenu || accentMenu.hidden) return;
    accentMenu.hidden = true;
    accentBtn.setAttribute('aria-expanded', 'false');
  }
  if (accentBtn && accentMenu) {
    paintAccent();
    accentBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      accentMenu.hidden = !accentMenu.hidden;
      accentBtn.setAttribute('aria-expanded', String(!accentMenu.hidden));
    });
    accentMenu.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-accent]');
      if (!b) return;
      root.setAttribute('data-accent', b.dataset.accent);
      save('ta-accent', b.dataset.accent);
      paintAccent();
      closeAccent();
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.accent-pick')) closeAccent();
    });
  }

  /* ---------- mobile nav ---------- */
  var nav = $('#nav');
  var navBtn = $('#navBtn');
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    if (navBtn) navBtn.setAttribute('aria-expanded', 'false');
  }
  if (nav && navBtn) {
    navBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
  }

  /* ---------- sticky header + progress ---------- */
  var bar = $('.bar');
  var prog = $('#progress i');
  function onScroll() {
    if (bar) bar.classList.toggle('stuck', window.scrollY > 12);
    if (prog) {
      var max = root.scrollHeight - window.innerHeight;
      prog.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0).toFixed(2) + '%';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- typed line ---------- */
  var typed = $('#typed');
  if (typed && !reduced) {
    var words = ['React web apps', 'React Native apps', 'PostgreSQL back ends', 'REST APIs', 'ERP systems'];
    var wi = 0, ci = words[0].length, deleting = true;
    var step = function () {
      var w = words[wi];
      ci += deleting ? -1 : 1;
      typed.textContent = w.slice(0, ci);
      var wait = deleting ? 38 : 75;
      if (!deleting && ci === w.length) { deleting = true; wait = 1700; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; wait = 280; }
      setTimeout(step, wait);
    };
    setTimeout(step, 2200);
  }

  /* ---------- counters ---------- */
  function countUp(el) {
    var end = parseInt(el.dataset.count, 10) || 0;
    if (reduced) { el.textContent = end; return; }
    var t0 = null, dur = 1200;
    el.textContent = '0';
    var frame = function (t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ---------- scroll reveal (staggered inside grids) ---------- */
  var reveals = $$('.reveal');
  reveals.forEach(function (el) {
    var sibs = $$(':scope > .reveal', el.parentNode);
    var i = sibs.indexOf(el);
    if (sibs.length > 1 && i > 0) el.style.setProperty('--rd', Math.min(i, 5) * 70 + 'ms');
  });
  function show(el) {
    el.classList.add('in');
    $$('[data-count]', el).forEach(countUp);
  }
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- active section in nav ---------- */
  var links = $$('.bar-nav a[href^="#"]');
  var targets = links.map(function (a) {
    return { a: a, el: $(a.getAttribute('href')) };
  }).filter(function (t) { return t.el; });
  if (targets.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        targets.forEach(function (t) { t.a.classList.toggle('active', t.el === en.target); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(function (t) { so.observe(t.el); });
  }

  /* ---------- project filter ---------- */
  var filterBtns = $$('.filters button');
  var projects = $$('.project');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      projects.forEach(function (p) {
        var match = f === 'all' || (' ' + p.dataset.cat + ' ').indexOf(' ' + f + ' ') > -1;
        p.hidden = !match;
        if (match) {
          p.classList.add('in');
          p.classList.remove('pop');
          void p.offsetWidth;
          p.classList.add('pop');
        }
      });
    });
  });

  /* ---------- contact form (opens the visitor's email app) ---------- */
  var form = $('#contactForm');
  var status = $('#formStatus');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var ok = true;
      [f.name, f.email, f.message].forEach(function (el) {
        var bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value.trim()));
        el.classList.toggle('bad', bad);
        el.setAttribute('aria-invalid', String(bad));
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) { status.textContent = 'Please fill in your name, a valid email and a message.'; return; }
      var subject = f.subject.value.trim() || 'Portfolio enquiry from ' + f.name.value.trim();
      var body = f.message.value.trim() + '\n\n— ' + f.name.value.trim() + '\n' + f.email.value.trim();
      window.location.href = 'mailto:talhaaslam6862@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.textContent = 'Your email app should open with the message ready to send.';
    });
  }

  /* ---------- quick answers ---------- */
  var fab = $('#chatFab');
  var panel = $('#chatPanel');
  var log = $('#chatLog');
  var answers = {
    skills: ['What are your skills?',
      'React, React Native (Expo), Node.js, Express and PHP, with PostgreSQL, MySQL and MongoDB behind them. <a href="#skills">See all skills</a>'],
    projects: ['What have you built?',
      'SYNC ERP (pharma field force platform, in production), Trav-Ease.pk, Paws.pk, the Medlife ERP Portal and the Medlife Healthcare Store. <a href="#projects">See the projects</a>'],
    services: ['What services do you offer?',
      'Web applications, back end and databases, mobile apps, and WordPress / WooCommerce. <a href="#services">See services</a>'],
    experience: ['Where have you worked?',
      'Full-Stack Developer at Medlife Pharmaceuticals now; before that Web Developer at Ezitech and Data Analyst at Masood Textile Mills. <a href="#experience">See experience</a>'],
    hire: ['How can I hire Talha?',
      'Open to full-stack and React Native roles, in Lahore or remote. Email <a href="mailto:talhaaslam6862@gmail.com">talhaaslam6862@gmail.com</a> or use the <a href="#contact">contact form</a>.']
  };
  function say(html, who) {
    var m = document.createElement('div');
    m.className = 'msg ' + who;
    m.innerHTML = html;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }
  function toggleChat(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    if (open && !log.children.length) say('Hi! Pick a topic and I\'ll point you to the right place.', 'bot');
  }
  if (fab && panel && log) {
    fab.addEventListener('click', function () { toggleChat(panel.hidden); });
    $('#chatClose').addEventListener('click', function () { toggleChat(false); fab.focus(); });
    $('#chatQuick').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-q]');
      if (!b) return;
      var a = answers[b.dataset.q];
      say(a[0], 'me');
      setTimeout(function () { say(a[1], 'bot'); }, reduced ? 0 : 350);
    });
    log.addEventListener('click', function (e) {
      if (e.target.closest('a[href^="#"]') && window.innerWidth < 700) toggleChat(false);
    });
  }

  /* ---------- footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- lightbox ---------- */
  var box = $('#lightbox');
  var img = box && $('img', box);
  var closeBtn = box && $('.lb-close', box);
  var lastFocused = null;

  function openBox(src, alt) {
    lastFocused = document.activeElement;
    img.src = src;
    img.alt = alt || '';
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function shutBox() {
    box.hidden = true;
    img.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
  if (box) {
    $$('.zoom').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var inner = $('img', btn);
        openBox(btn.dataset.full, inner ? inner.alt : '');
      });
    });
    closeBtn.addEventListener('click', shutBox);
    box.addEventListener('click', function (e) { if (e.target === box) shutBox(); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (box && !box.hidden) shutBox();
      else if (panel && !panel.hidden) toggleChat(false);
      closeAccent();
      closeNav();
    }
    /* keep focus inside the lightbox */
    if (e.key === 'Tab' && box && !box.hidden) { e.preventDefault(); closeBtn.focus(); }
  });
})();
