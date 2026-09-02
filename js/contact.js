// ============================================
// CONTACT FORM — Soumission AJAX vers Formspree
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    statusEl.className = 'form-status';
    statusEl.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        statusEl.className = 'form-status success';
        statusEl.textContent = '✓ Message envoyé ! Je te réponds au plus vite.';
        form.reset();
      } else {
        throw new Error('Erreur d\'envoi');
      }
    } catch (error) {
      statusEl.className = 'form-status error';
      statusEl.textContent = '✗ Une erreur est survenue. Essaie de me contacter directement par email.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer le message';
    }
  });
});
