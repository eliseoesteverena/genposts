(function(){
  const drawer = document.getElementById('debugDrawer');
  const tab = document.getElementById('debugTab');
  const textarea = document.getElementById('debugJson');
  const applyBtn = document.getElementById('debugApply');
  const copyBtn = document.getElementById('debugCopy');
  const errorEl = document.getElementById('debugError');

  let isEditing = false;

  function syncFromDesign(){
    if (isEditing) return;
    textarea.value = JSON.stringify(window.PostEngine.getDesign(), null, 2);
    errorEl.hidden = true;
  }

  window.addEventListener('design:rendered', syncFromDesign);
  textarea.addEventListener('focus', () => { isEditing = true; });
  textarea.addEventListener('blur', () => { isEditing = false; });

  applyBtn.addEventListener('click', () => {
    try {
      const parsed = JSON.parse(textarea.value);
      if (!parsed || typeof parsed !== 'object' || !parsed.meta || !Array.isArray(parsed.elements)) {
        throw new Error('El documento debe tener "meta" (objeto) y "elements" (array).');
      }
      isEditing = false;
      window.PostEngine.setDesign(parsed);
      errorEl.hidden = true;
    } catch (err) {
      errorEl.hidden = false;
      errorEl.textContent = 'JSON inválido: ' + err.message;
    }
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copiado ✓';
      setTimeout(() => { copyBtn.textContent = original; }, 1200);
    } catch (err) { textarea.select(); }
  });

  tab.addEventListener('click', () => {
    // Cerramos el otro drawer (tokens) si estaba abierto: solo uno visible a la vez.
    document.getElementById('tokensDrawer').classList.remove('is-open');
    document.getElementById('tokensTab').classList.remove('is-active');
    const isOpen = drawer.classList.toggle('is-open');
    tab.classList.toggle('is-active', isOpen);
    tab.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) syncFromDesign();
  });

  syncFromDesign();
})();
