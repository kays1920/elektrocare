'use strict';

const navToggle = document.getElementById('navToggle');
const storyNav = document.getElementById('storyNav');

if (navToggle && storyNav) {
  const closeNav = () => {
    storyNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Buka navigasi');
  };

  navToggle.addEventListener('click', () => {
    const open = storyNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Tutup navigasi' : 'Buka navigasi');
  });
  storyNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('click', (event) => {
    if (!storyNav.contains(event.target) && !navToggle.contains(event.target)) closeNav();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
      navToggle.focus();
    }
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}
