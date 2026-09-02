// ============================================
// NEURAL NETWORK BACKGROUND — Animation du Hero
// Points connectés par des lignes, mouvement lent.
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return; // n'existe que sur la page Home

  const ctx = canvas.getContext('2d');
  const heroSection = canvas.closest('.hero');

  // Respecte les préférences d'accessibilité (mouvement réduit)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height;
  let nodes = [];
  let animationId;

  const MAX_DISTANCE = 140;    // distance max pour tracer une ligne entre 2 nœuds
  const NODE_COLOR = '0, 217, 255';   // cyan, en RGB pour rgba() dynamique
  const NODE_SPEED = 0.25;

  function getNodeCount() {
    // Densité adaptée à la taille de l'écran, plus léger sur mobile
    return width < 600 ? 22 : width < 1000 ? 35 : 50;
  }

  function resize() {
    const rect = heroSection.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
  }

  function createNodes() {
    const count = getNodeCount();
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * NODE_SPEED,
      vy: (Math.random() - 0.5) * NODE_SPEED,
    }));
  }

  function updateNodes() {
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      // Rebond doux sur les bords
      if (node.x <= 0 || node.x >= width) node.vx *= -1;
      if (node.y <= 0 || node.y >= height) node.vy *= -1;

      node.x = Math.max(0, Math.min(width, node.x));
      node.y = Math.max(0, Math.min(height, node.y));
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // --- Lignes entre nœuds proches ---
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DISTANCE) {
          const opacity = (1 - dist / MAX_DISTANCE) * 0.35;
          ctx.strokeStyle = `rgba(${NODE_COLOR}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // --- Points ---
    nodes.forEach(node => {
      ctx.fillStyle = `rgba(${NODE_COLOR}, 0.6)`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function animate() {
    updateNodes();
    draw();
    animationId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    createNodes();

    if (prefersReducedMotion) {
      draw(); // affiche une image statique, sans animer
      return;
    }

    animate();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationId);
    resize();
    createNodes();
    if (!prefersReducedMotion) animate();
  });

  init();
});