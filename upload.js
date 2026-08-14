(function(){
  /* =========================================================
     SUBIDA DE IMÁGENES A R2
     Se dispara con el evento 'image:request-upload' (emitido por
     render.js al tocar un placeholder, o por inspector.js al
     tocar "Reemplazar imagen…"). Sube el archivo a
     UPLOAD_ENDPOINT (Cloudflare Pages Function / Worker con el
     binding BUCKET, ver functions/api/upload.js) y, si responde
     OK, escribe la URL devuelta en props.src del elemento.
     ========================================================= */

  // Ajustar a la URL real desplegada, ej. 'https://tu-worker.workers.dev/api/upload'.
  // Con Cloudflare Pages Functions (functions/api/upload.js) esta ruta relativa ya funciona sola.
  const UPLOAD_ENDPOINT = window.UPLOAD_ENDPOINT || '/api/upload';

  const modal = document.getElementById('uploadModal');
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('uploadFileInput');
  const closeBtn = document.getElementById('uploadClose');
  const statusEl = document.getElementById('uploadStatus');

  let targetElementId = null;

  function openModal(elementId){
    targetElementId = elementId;
    statusEl.textContent = '';
    statusEl.hidden = true;
    modal.hidden = false;
    dropzone.classList.remove('is-error');
  }
  function closeModal(){
    modal.hidden = true;
    targetElementId = null;
    fileInput.value = '';
  }

  window.addEventListener('image:request-upload', (e) => openModal(e.detail.elementId));
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  ['dragenter','dragover'].forEach(evt =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('is-drag'); })
  );
  ['dragleave','drop'].forEach(evt =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('is-drag'); })
  );
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  async function handleFile(file){
    if (!file.type.startsWith('image/')) {
      showError('Ese archivo no es una imagen.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showError('Máximo 8MB por imagen.');
      return;
    }

    if (targetElementId) {
      window.PostEngine.updateElement(targetElementId, {
        props: Object.assign({}, window.PostEngine.getElement(targetElementId).props, { src: null, status: 'uploading' })
      });
    }
    statusEl.hidden = false;
    statusEl.textContent = 'Subiendo…';
    dropzone.classList.remove('is-error');

    // Si el fetch se cuelga (Function que nunca responde, red caída, etc.) no queremos
    // un "Subiendo…" eterno: lo cortamos a los 20s y lo tratamos como error.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: formData, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        let detail = '';
        try { detail = (await res.json()).error || ''; } catch (_) {}
        throw new Error('HTTP ' + res.status + (detail ? ' — ' + detail : ''));
      }
      const data = await res.json();
      if (!data.url) throw new Error('La respuesta no incluyó "url".');

      if (targetElementId) {
        const el = window.PostEngine.getElement(targetElementId);
        window.PostEngine.updateElement(targetElementId, {
          props: Object.assign({}, el.props, { src: data.url, status: 'ready' })
        });
      }
      statusEl.textContent = '¡Listo! ✓';
      setTimeout(closeModal, 500);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') err = new Error('Se agotó el tiempo de espera (20s) — el servidor no respondió.');
      console.error('Error subiendo a R2:', err);
      if (targetElementId) {
        const el = window.PostEngine.getElement(targetElementId);
        window.PostEngine.updateElement(targetElementId, {
          props: Object.assign({}, el.props, { src: null, status: 'empty' })
        });
      }
      showError('No se pudo subir (' + err.message + '). ¿Está desplegado ' + UPLOAD_ENDPOINT + '?');
    }
  }

  function showError(msg){
    statusEl.hidden = false;
    statusEl.textContent = msg;
    dropzone.classList.add('is-error');
  }
})();
