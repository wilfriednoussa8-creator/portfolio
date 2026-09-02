// ============================================
// AI LAB — Régression linéaire (connectée à l'API FastAPI / scikit-learn)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('ai-canvas');
  const ctx = canvas.getContext('2d');

  const generateBtn = document.getElementById('generate-btn');
  const clearBtn = document.getElementById('clear-btn');
  const noiseSlider = document.getElementById('noise-slider');
  const noiseValue = document.getElementById('noise-value');
  const pointCountSlider = document.getElementById('point-count');
  const pointCountValue = document.getElementById('point-count-value');
  const resultLine = document.getElementById('result-line');
  const predictInput = document.getElementById('predict-x');
  const predictOutput = document.getElementById('predict-output');

  const API_BASE = window.PORTFOLIO_API_URL || 'http://localhost:8000';

  let points = [];
  let currentRegression = null;
  const PADDING = 40;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 400 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function toPixel(x, y, width, height) {
    const px = PADDING + (x / 10) * (width - 2 * PADDING);
    const py = height - PADDING - (y / 10) * (height - 2 * PADDING);
    return [px, py];
  }

  function toData(px, py, width, height) {
    const x = ((px - PADDING) / (width - 2 * PADDING)) * 10;
    const y = ((height - PADDING - py) / (height - 2 * PADDING)) * 10;
    return [x, y];
  }

  // --- Appel API : calcule la régression via scikit-learn ---
  async function fetchRegression(pts) {
    if (pts.length < 2) {
      currentRegression = null;
      return null;
    }
    try {
      const res = await fetch(`${API_BASE}/api/regression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: pts }),
      });
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      currentRegression = data;
      return data;
    } catch (err) {
      resultLine.textContent = `> ⚠ API backend injoignable (${API_BASE}). Lance le serveur FastAPI (uvicorn app:app --reload).`;
      return null;
    }
  }

  async function fetchGeneratedData(n, noise) {
    try {
      const res = await fetch(`${API_BASE}/api/regression/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_points: n, noise: noise }),
      });
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      return data.points;
    } catch (err) {
      resultLine.textContent = `> ⚠ API backend injoignable (${API_BASE}). Lance le serveur FastAPI (uvicorn app:app --reload).`;
      return [];
    }
  }

  async function draw() {
    const width = canvas.width / window.devicePixelRatio;
    const height = 400;
    ctx.clearRect(0, 0, width, height);

    // --- Grille ---
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const [px] = toPixel(i, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(px, PADDING);
      ctx.lineTo(px, height - PADDING);
      ctx.stroke();

      const [, py] = toPixel(0, i, width, height);
      ctx.beginPath();
      ctx.moveTo(PADDING, py);
      ctx.lineTo(width - PADDING, py);
      ctx.stroke();
    }

    // --- Axes ---
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(PADDING, PADDING, width - 2 * PADDING, height - 2 * PADDING);

    // --- Points ---
    ctx.fillStyle = '#7C3AED';
    points.forEach(p => {
      const [px, py] = toPixel(p.x, p.y, width, height);
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- Appel API pour la régression ---
    const reg = await fetchRegression(points);

    if (reg) {
      const [px0, py0] = toPixel(reg.line_points[0].x, reg.line_points[0].y, width, height);
      const [px1, py1] = toPixel(reg.line_points[1].x, reg.line_points[1].y, width, height);

      ctx.strokeStyle = '#00D9FF';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(0, 217, 255, 0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(px0, py0);
      ctx.lineTo(px1, py1);
      ctx.stroke();
      ctx.shadowBlur = 0;

      resultLine.textContent = `> y = ${reg.slope.toFixed(2)}x + ${reg.intercept.toFixed(2)}   |   R² = ${reg.r2.toFixed(3)}   |   n = ${reg.n_points} points   |   [scikit-learn]`;
      updatePrediction();
    } else if (points.length > 0) {
      resultLine.textContent = `> Ajoute au moins 2 points pour calculer la régression`;
      predictOutput.textContent = '—';
    }
  }

  async function updatePrediction() {
    const xVal = parseFloat(predictInput.value);
    if (isNaN(xVal) || !currentRegression) {
      predictOutput.textContent = '—';
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/regression/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slope: currentRegression.slope,
          intercept: currentRegression.intercept,
          x: xVal,
        }),
      });
      const data = await res.json();
      predictOutput.textContent = data.y_predicted.toFixed(2);
    } catch (err) {
      predictOutput.textContent = '—';
    }
  }

  async function generateRandomData() {
    const count = parseInt(pointCountSlider.value);
    const noise = parseFloat(noiseSlider.value);
    resultLine.textContent = '> Génération des données via l\'API...';
    points = await fetchGeneratedData(count, noise);
    draw();
  }

  // --- Événements ---
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const [x, y] = toData(px, py, rect.width, 400);

    if (x >= 0 && x <= 10 && y >= 0 && y <= 10) {
      points.push({ x, y });
      draw();
    }
  });

  generateBtn.addEventListener('click', generateRandomData);

  clearBtn.addEventListener('click', () => {
    points = [];
    currentRegression = null;
    draw();
  });

  noiseSlider.addEventListener('input', () => {
    noiseValue.textContent = parseFloat(noiseSlider.value).toFixed(1);
  });

  pointCountSlider.addEventListener('input', () => {
    pointCountValue.textContent = pointCountSlider.value;
  });

  predictInput.addEventListener('input', updatePrediction);

  window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
  });

  // --- Initialisation ---
  resizeCanvas();
  generateRandomData();
});
