(function(){
  const drawer = document.getElementById('tokensDrawer');
  const tab = document.getElementById('tokensTab');
  const textarea = document.getElementById('tokensJson');
  const applyBtn = document.getElementById('tokensApply');
  const copyBtn = document.getElementById('tokensCopy');
  const errorEl = document.getElementById('tokensError');

  let isEditing = false;

  function syncFromTokens(){
    if (isEditing) return;
    textarea.value = JSON.stringify(window.PostEngine.getTokens(), null, 2);
    errorEl.hidden = true;
  }

  // Los tokens no cambian solos en cada render (a diferencia del design), pero sincronizamos
  // igual ante cualquier render para reflejar ediciones hechas desde otro lugar (ej. futura UI
  // de "crear token" en el inspector).
  window.addEventListener('design:rendered', syncFromTokens);
  textarea.addEventListener('focus', () => { isEditing = true; });
  textarea.addEventListener('blur', () => { isEditing = false; });

  applyBtn.addEventListener('click', () => {
    try {
      const parsed = JSON.parse(textarea.value);
      if (!parsed || typeof parsed !== 'object') throw new Error('Debe ser un objeto JSON.');
      isEditing = false;
      window.PostEngine.setTokens(parsed);
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
    document.getElementById('debugDrawer').classList.remove('is-open');
    document.getElementById('debugTab').classList.remove('is-active');
    const isOpen = drawer.classList.toggle('is-open');
    tab.classList.toggle('is-active', isOpen);
    tab.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) syncFromTokens();
  });

  syncFromTokens();
})();
