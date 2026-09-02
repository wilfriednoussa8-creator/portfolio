// ============================================
// ANIMATIONS — Effet machine à écrire (Hero)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('typewriter-text');
  if (!target) return; // n'existe que sur la page Home

  const fullText = "Je fais deux Masters en même temps — Mathématiques Appliquées et Génie Logiciel — et j'aime transformer les modèles mathématiques en applications qui marchent vraiment.";

  let index = 0;
  const typingSpeed = 22; // ms par caractère

  function typeNextChar() {
    if (index < fullText.length) {
      target.textContent += fullText.charAt(index);
      index++;
      setTimeout(typeNextChar, typingSpeed);
    }
  }

  // Petit délai avant de démarrer, pour laisser le Hero apparaître d'abord
  setTimeout(typeNextChar, 300);
});

// ============================================
// SCROLL REVEAL — Fade-in des sections au scroll
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.reveal-on-scroll');
  if (!items.length) return;

  // Si le navigateur ne supporte pas IntersectionObserver, on affiche tout directement
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // n'anime qu'une seule fois
      }
    });
  }, { threshold: 0.15 });

  items.forEach((el, i) => {
    // Léger décalage en cascade pour les éléments groupés (cartes, etc.)
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
    observer.observe(el);
  });
});

// ============================================
// STATS COUNTER — Compteur animé (chiffres clés)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1400; // ms
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      // Easing "ease-out" pour un effet de ralentissement en fin de comptage
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix; // valeur finale exacte
      }
    }

    requestAnimationFrame(tick);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));
});