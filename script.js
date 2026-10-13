/* Portfolio interactions: lightbox, scroll reveal, sticky header, nav highlighting. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sticky header shadow ---------- */
  var bar = document.querySelector('.bar');
  if (bar) {
    var onScroll = function () {
      bar.classList.toggle('stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          ro.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- active section in nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.bar-nav a[href^="#"]'));
  var targets = [];
  links.forEach(function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    if (el) targets.push({ a: a, el: el });
  });
  if (targets.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var hit = targets.filter(function (t) { return t.el === en.target; })[0];
        if (!hit) return;
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          hit.a.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(function (t) { so.observe(t.el); });
  }


  /* ---------- scroll progress bar ---------- */
  var prog = document.querySelector('#progress i');
  if (prog) {
    var tick = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      prog.style.width = pct.toFixed(2) + '%';
    };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
  }

  /* ---------- lightbox ---------- */
  var box = document.getElementById('lightbox');
  if (!box) return;
  var img = box.querySelector('img');
  var closeBtn = box.querySelector('.lb-close');
  var lastFocused = null;

  function open(src, alt) {
    lastFocused = document.activeElement;
    img.src = src;
    img.alt = alt || '';
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function shut() {
    box.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.zoom').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var inner = btn.querySelector('img');
      open(btn.dataset.full, inner ? inner.alt : '');
    });
  });

  closeBtn.addEventListener('click', shut);
  box.addEventListener('click', function (e) { if (e.target === box) shut(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !box.hidden) shut();
    /* keep focus inside the dialog */
    if (e.key === 'Tab' && !box.hidden) { e.preventDefault(); closeBtn.focus(); }
  });
})();
