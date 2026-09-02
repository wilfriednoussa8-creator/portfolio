// ============================================
// DATA LAB — Distributions statistiques (connectée à l'API FastAPI / NumPy)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('data-canvas');
  const ctx = canvas.getContext('2d');

  const distSelect = document.getElementById('dist-select');
  const sampleSizeSlider = document.getElementById('sample-size');
  const sampleSizeValue = document.getElementById('sample-size-value');
  const param1Slider = document.getElementById('param-1');
  const param1Label = document.getElementById('param-1-label');
  const param1Value = document.getElementById('param-1-value');
  const param2Slider = document.getElementById('param-2');
  const param2Label = document.getElementById('param-2-label');
  const param2Value = document.getElementById('param-2-value');
  const generateBtn = document.getElementById('generate-btn');
  const resultLine = document.getElementById('result-line');

  const statMean = document.getElementById('stat-mean');
  const statMedian = document.getElementById('stat-median');
  const statStd = document.getElementById('stat-std');

  const API_BASE = window.PORTFOLIO_API_URL || 'http://localhost:8000';

  let lastHistogram = null;
  let lastStats = null;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 400 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function buildParams(type) {
    const p1 = parseFloat(param1Slider.value);
    const p2 = parseFloat(param2Slider.value);

    if (type === 'normal') return { mean: p1, std: p2 };
    if (type === 'uniform') return { min: p1, max: p2 };
    if (type === 'exponential') return { lambda: p1 };
    return {};
  }

  async function fetchDistribution() {
    const type = distSelect.value;
    const n = parseInt(sampleSizeSlider.value);
    const params = buildParams(type);

    resultLine.textContent = '> Génération via l\'API (NumPy)...';

    try {
      const res = await fetch(`${API_BASE}/api/distribution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dist_type: type, params, n }),
      });
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      lastHistogram = data.histogram;
      lastStats = data.stats;
      draw(data.n);
    } catch (err) {
      resultLine.textContent = `> ⚠ API backend injoignable (${API_BASE}). Lance le serveur FastAPI (uvicorn app:app --reload).`;
    }
  }

  function draw(n) {
    const width = canvas.width / window.devicePixelRatio;
    const height = 400;
    ctx.clearRect(0, 0, width, height);

    if (!lastHistogram) return;

    const PADDING_L = 50;
    const PADDING_B = 40;
    const PADDING_T = 20;
    const PADDING_R = 20;

    const { counts, bin_edges } = lastHistogram;
    const maxCount = Math.max(...counts);
    const min = bin_edges[0];
    const max = bin_edges[bin_edges.length - 1];

    const chartW = width - PADDING_L - PADDING_R;
    const chartH = height - PADDING_T - PADDING_B;
    const barWidth = chartW / counts.length;

    // --- Grille horizontale ---
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PADDING_T + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(PADDING_L, y);
      ctx.lineTo(width - PADDING_R, y);
      ctx.stroke();
    }

    // --- Barres de l'histogramme ---
    counts.forEach((count, i) => {
      const barHeight = (count / maxCount) * chartH;
      const x = PADDING_L + i * barWidth;
      const y = PADDING_T + chartH - barHeight;

      ctx.fillStyle = 'rgba(0, 217, 255, 0.7)';
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    });

    // --- Axe des abscisses ---
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PADDING_L, PADDING_T + chartH);
    ctx.lineTo(width - PADDING_R, PADDING_T + chartH);
    ctx.stroke();

    // --- Ligne de la moyenne ---
    if (lastStats) {
      const range = max - min || 1;
      const meanX = PADDING_L + ((lastStats.mean - min) / range) * chartW;
      ctx.strokeStyle = '#7C3AED';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(meanX, PADDING_T);
      ctx.lineTo(meanX, PADDING_T + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // --- Labels min/max ---
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px monospace';
    ctx.fillText(min.toFixed(1), PADDING_L, height - 16);
    ctx.textAlign = 'right';
    ctx.fillText(max.toFixed(1), width - PADDING_R, height - 16);
    ctx.textAlign = 'left';

    // --- Stats ---
    statMean.textContent = lastStats.mean.toFixed(2);
    statMedian.textContent = lastStats.median.toFixed(2);
    statStd.textContent = lastStats.std.toFixed(2);

    resultLine.textContent = `> n = ${n} échantillons  |  min = ${lastStats.min.toFixed(2)}  |  max = ${lastStats.max.toFixed(2)}  |  [NumPy]`;
  }

  function updateParamLabels() {
    const type = distSelect.value;
    if (type === 'normal') {
      param1Label.textContent = 'Moyenne (μ)';
      param2Label.textContent = 'Écart-type (σ)';
      param1Slider.min = -10; param1Slider.max = 10; param1Slider.value = 0;
      param2Slider.min = 0.1; param2Slider.max = 5; param2Slider.value = 1;
      param2Label.parentElement.style.display = 'block';
    } else if (type === 'uniform') {
      param1Label.textContent = 'Min';
      param2Label.textContent = 'Max';
      param1Slider.min = -10; param1Slider.max = 10; param1Slider.value = 0;
      param2Slider.min = -10; param2Slider.max = 10; param2Slider.value = 5;
      param2Label.parentElement.style.display = 'block';
    } else if (type === 'exponential') {
      param1Label.textContent = 'Lambda (λ)';
      param1Slider.min = 0.1; param1Slider.max = 2; param1Slider.value = 0.5;
      param2Label.parentElement.style.display = 'none';
    }
    param1Value.textContent = parseFloat(param1Slider.value).toFixed(1);
    param2Value.textContent = parseFloat(param2Slider.value).toFixed(1);
  }

  // --- Événements ---
  distSelect.addEventListener('change', () => {
    updateParamLabels();
    fetchDistribution();
  });

  param1Slider.addEventListener('input', () => {
    param1Value.textContent = parseFloat(param1Slider.value).toFixed(1);
  });

  param2Slider.addEventListener('input', () => {
    param2Value.textContent = parseFloat(param2Slider.value).toFixed(1);
  });

  sampleSizeSlider.addEventListener('input', () => {
    sampleSizeValue.textContent = sampleSizeSlider.value;
  });

  generateBtn.addEventListener('click', fetchDistribution);

  window.addEventListener('resize', () => {
    resizeCanvas();
    draw(sampleSizeSlider.value);
  });

  // --- Initialisation ---
  resizeCanvas();
  updateParamLabels();
  fetchDistribution();
});
