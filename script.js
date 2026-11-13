'use strict';

// Data layanan ELEKTROCARE
const services = [
  { icon: '❄️', name: 'AC', description: 'Pemeriksaan dan perbaikan AC.' },
  { icon: '📺', name: 'Televisi', description: 'Pemeriksaan dan perbaikan TV.' },
  { icon: '🧺', name: 'Mesin Cuci', description: 'Penanganan masalah mesin cuci.' },
  { icon: '🧊', name: 'Kulkas', description: 'Pemeriksaan masalah pendinginan.' },
  { icon: '🌀', name: 'Kipas Angin', description: 'Perbaikan kipas angin rumah.' },
  { icon: '🔊', name: 'Speaker', description: 'Pemeriksaan perangkat audio.' },
  { icon: '♨️', name: 'Setrika', description: 'Perbaikan setrika listrik.' },
  { icon: '🍚', name: 'Rice Cooker', description: 'Perbaikan penanak nasi.' }
];

const serviceGrid = document.getElementById('serviceGrid');
if (serviceGrid) {
  serviceGrid.innerHTML = services.map(({ icon, name, description }) => `
    <article class="service-card">
      <div class="service-icon" aria-hidden="true">${icon}</div>
      <h3>${name}</h3>
      <p>${description}</p>
    </article>
  `).join('');
}

const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
if (menuToggle && navMenu) {
  const closeMenu = () => {
    navMenu.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
  });

  navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menuToggle.focus();
    }
  });
}

