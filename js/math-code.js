// ============================================
// MATH × CODE — Visualisation de fonctions
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('math-canvas');
  const ctx = canvas.getContext('2d');

  const functionSelect = document.getElementById('function-select');
  const sliderA = document.getElementById('param-a');
  const sliderB = document.getElementById('param-b');
  const sliderC = document.getElementById('param-c');
  const valueA = document.getElementById('value-a');
  const valueB = document.getElementById('value-b');
  const valueC = document.getElementById('value-c');
  const resultLine = document.getElementById('result-line');

  // Redimensionne le canvas à la taille réelle de son conteneur (évite le flou)
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 400 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function getFunctionValue(x, type, a, b, c) {
    switch (type) {
      case 'quadratic':
        return a * x * x + b * x + c;
      case 'sine':
        return a * Math.sin(b * x + c);
      case 'exponential':
        return a * Math.exp(b * x * 0.3) * 0.1 + c;
      default:
        return 0;
    }
  }

  function draw() {
    const width = canvas.width / window.devicePixelRatio;
    const height = 400;
    ctx.clearRect(0, 0, width, height);

    const type = functionSelect.value;
    const a = parseFloat(sliderA.value);
    const b = parseFloat(sliderB.value);
    const c = parseFloat(sliderC.value);

    valueA.textContent = a.toFixed(1);
    valueB.textContent = b.toFixed(1);
    valueC.textContent = c.toFixed(1);

    const originX = width / 2;
    const originY = height / 2;
    const scale = 30; // pixels par unité

    // --- Grille ---
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += scale) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += scale) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // --- Axes ---
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // --- Courbe ---
    ctx.strokeStyle = '#00D9FF';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 217, 255, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    let firstPoint = true;
    let maxY = -Infinity;

    for (let px = 0; px < width; px++) {
      const x = (px - originX) / scale;
      const y = getFunctionValue(x, type, a, b, c);
      const py = originY - y * scale;

      if (y > maxY) maxY = y;

      if (firstPoint) {
        ctx.moveTo(px, py);
        firstPoint = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // --- Résultat texte ---
    let formula = '';
    if (type === 'quadratic') formula = `f(x) = ${a.toFixed(1)}x² + ${b.toFixed(1)}x + ${c.toFixed(1)}`;
    if (type === 'sine') formula = `f(x) = ${a.toFixed(1)} · sin(${b.toFixed(1)}x + ${c.toFixed(1)})`;
    if (type === 'exponential') formula = `f(x) = ${a.toFixed(1)} · e^(${b.toFixed(1)}x · 0.3) + ${c.toFixed(1)}`;

    resultLine.textContent = `> ${formula}   |   max local observé : ${maxY.toFixed(2)}`;
  }

  // --- Écouteurs d'événements ---
  [functionSelect, sliderA, sliderB, sliderC].forEach(el => {
    el.addEventListener('input', draw);
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
  });

  resizeCanvas();
  draw();
});
