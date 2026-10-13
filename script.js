// Lightbox for project screenshots.
(function () {
  const box = document.getElementById('lightbox');
  if (!box) return;
  const img = box.querySelector('img');
  const close = box.querySelector('.lb-close');
  let lastFocused = null;

  function open(src, alt) {
    lastFocused = document.activeElement;
    img.src = src;
    img.alt = alt || '';
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    close.focus();
  }

  function shut() {
    box.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.zoom').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const full = btn.dataset.full;
      const inner = btn.querySelector('img');
      open(full, inner ? inner.alt : '');
    });
  });

  close.addEventListener('click', shut);
  box.addEventListener('click', function (e) { if (e.target === box) shut(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !box.hidden) shut();
  });
})();

// Mark the section currently in view in the header nav.
(function () {
  const links = Array.from(document.querySelectorAll('header.site nav a[href^="#"]'));
  const map = new Map();
  links.forEach(function (a) {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) map.set(el, a);
  });
  if (!map.size || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      const a = map.get(en.target);
      if (!a || a.classList.contains('nav-cta')) return;
      a.style.color = en.isIntersecting ? 'var(--burgundy)' : '';
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  map.forEach(function (_a, el) { io.observe(el); });
})();
