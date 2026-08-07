(function(){
  /* =========================================================
     PANEL DE DEBUG — muestra el documento JSON del diseño en
     tiempo real (se actualiza solo en cada render.js) y permite
     editarlo a mano para probar el schema antes de tener UI
     de arrastre/selección.
     ========================================================= */

  const drawer = document.getElementById('debugDrawer');
  const tab = document.getElementById('debugTab');
  const textarea = document.getElementById('debugJson');
  const applyBtn = document.getElementById('debugApply');
  const copyBtn = document.getElementById('debugCopy');
  const errorEl = document.getElementById('debugError');

  let isEditing = false; // mientras el usuario tiene foco en el textarea, no lo pisamos con auto-refresh

  function syncFromDesign(){
    if (isEditing) return;
    const design = window.PostEngine.getDesign();
    textarea.value = JSON.stringify(design, null, 2);
    errorEl.hidden = true;
  }

  // Cada vez que render.js redibuja el canvas (por cualquier motivo:
  // cambio de formato, toggle de visibilidad, aplicar JSON manual...),
  // refrescamos el panel para que siempre refleje el estado real.
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
    } catch (err) {
      textarea.select();
    }
  });

  tab.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('is-open');
    tab.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    tab.textContent = isOpen ? '</> JSON ▾' : '</> JSON ▸';
    if (isOpen) syncFromDesign();
  });

  // primer render ya disparó 'design:rendered' antes de que este script
  // corriera (render.js se ejecuta primero), así que sincronizamos una vez al cargar.
  syncFromDesign();
})();
