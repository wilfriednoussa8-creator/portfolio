// ============================================
// MENU HAMBURGER (mobile)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  // Dropdown "Playground" cliquable en mobile (au lieu de hover)
  const dropdown = document.querySelector('.dropdown');
  if (dropdown && window.matchMedia('(max-width: 768px)').matches) {
    const dropdownLink = dropdown.querySelector('a');
    dropdownLink.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('open');
    });
  }

  // Marque le lien de nav actif selon la page courante
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
});
