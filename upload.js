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
        props: { ...window.PostEngine.getElement(targetElementId).props, src: null, status: 'uploading' }
      });
    }
    statusEl.hidden = false;
    statusEl.textContent = 'Subiendo…';
    dropzone.classList.remove('is-error');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data.url) throw new Error('La respuesta no incluyó "url".');

      if (targetElementId) {
        const el = window.PostEngine.getElement(targetElementId);
        window.PostEngine.updateElement(targetElementId, {
          props: { ...el.props, src: data.url, status: 'ready' }
        });
      }
      closeModal();
    } catch (err) {
      console.error('Error subiendo a R2:', err);
      if (targetElementId) {
        const el = window.PostEngine.getElement(targetElementId);
        window.PostEngine.updateElement(targetElementId, {
          props: { ...el.props, src: null, status: 'empty' }
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
