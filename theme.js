(() => {
  const storageKey = 'elektrocare-theme';
  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
  let storedTheme = null;
  try { storedTheme = localStorage.getItem(storageKey); } catch (_) { /* storage may be unavailable */ }
  const initialTheme = storedTheme === 'dark' || storedTheme === 'light'
    ? storedTheme
    : (systemPreference.matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = initialTheme;

  const icons = { light: '☀', dark: '☾' };
  const labels = { light: 'Tema terang aktif. Ganti ke tema gelap', dark: 'Tema gelap aktif. Ganti ke tema terang' };
  const applyTheme = (theme, persist = false) => {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const icon = button.querySelector('.theme-icon');
      if (icon) icon.textContent = icons[theme];
      button.setAttribute('aria-label', labels[theme]);
      button.title = labels[theme];
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    });
    if (persist) {
      try { localStorage.setItem(storageKey, theme); } catch (_) { /* theme remains active for this page */ }
    }
  };

  const initialize = () => {
    applyTheme(document.documentElement.dataset.theme);
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
      });
    });

    const navbars = document.querySelectorAll('.navbar, .site-header, .story-header');
    const updateNavbar = () => navbars.forEach((bar) => bar.classList.toggle('is-scrolled', window.scrollY > 12));
    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    const revealTargets = document.querySelectorAll('.hero-content, .hero-image, .about-content, .section-heading, .service-card, .review-placeholder, .contact > p, .social-links, .reservation-box, .form-card');
    revealTargets.forEach((element, index) => {
      element.dataset.reveal = 'up';
      if (element.classList.contains('service-card')) element.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add('is-revealed'));
    } else {
      const observer = new IntersectionObserver((entries, activeObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            activeObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
      revealTargets.forEach((element) => observer.observe(element));
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();

  systemPreference.addEventListener?.('change', (event) => {
    let hasSavedPreference = false;
    try { hasSavedPreference = localStorage.getItem(storageKey) !== null; } catch (_) { hasSavedPreference = true; }
    if (!hasSavedPreference) applyTheme(event.matches ? 'dark' : 'light');
  });
})();
