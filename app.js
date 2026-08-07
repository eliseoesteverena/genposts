(function(){
  const stage = document.querySelector('.stage');
  const stageInner = document.getElementById('stageInner');
  const canvasEl = document.getElementById('canvas');
  const formatRow = document.getElementById('formatRow');
  const toggleDoodles = document.getElementById('toggleDoodles');
  const downloadBtn = document.getElementById('downloadBtn');

  const DOODLE_IDS = ['sparkle-1', 'sparkle-2', 'sparkle-3'];

  function applyScale(){
    const design = window.PostEngine.getDesign();
    const w = design.meta.width;
    const h = design.meta.height;

    const stageW = stage.clientWidth;
    if (!stageW) { requestAnimationFrame(applyScale); return; }

    const viewportH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const maxW = Math.min(stageW - 48, 480);
    const maxH = Math.min(viewportH * 0.55, 620);
    const scale = Math.max(Math.min(maxW / w, maxH / h, 1), 0.05);

    stageInner.style.width = (w * scale) + 'px';
    stageInner.style.height = (h * scale) + 'px';
    canvasEl.style.transform = `scale(${scale})`;
    canvasEl.style.transformOrigin = 'top left';
    window.__postScale = scale; // lo usará la futura UI de arrastre
  }

  // Recalculamos la escala cada vez que el canvas se vuelve a dibujar
  // (cambio de formato, edición manual del JSON, etc.) y ante cualquier
  // cambio real de tamaño del contenedor (rotación, teclado, barra del navegador).
  window.addEventListener('design:rendered', applyScale);
  if ('ResizeObserver' in window) {
    new ResizeObserver(applyScale).observe(stage);
  } else {
    window.addEventListener('resize', applyScale);
    window.addEventListener('orientationchange', applyScale);
  }
  window.addEventListener('load', applyScale);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyScale);
  applyScale();

  formatRow.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-format]');
    if (!btn) return;
    [...formatRow.children].forEach(b => b.classList.toggle('is-on', b === btn));
    window.PostEngine.setFormat(btn.dataset.format);
  });

  toggleDoodles.addEventListener('change', () => {
    DOODLE_IDS.forEach(id => window.PostEngine.setElementVisible(id, toggleDoodles.checked));
  });

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Generando…';

    const prevTransform = canvasEl.style.transform;
    canvasEl.style.transform = 'none';

    try {
      const design = window.PostEngine.getDesign();
      const canvas = await html2canvas(canvasEl, {
        scale: 2,
        backgroundColor: design.meta.background,
        useCORS: true,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `99copias-post-${design.meta.format}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      console.error('Error al exportar', err);
      alert('Hubo un error al generar la imagen. Probá de nuevo.');
    } finally {
      canvasEl.style.transform = prevTransform;
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalText;
    }
  });
})();
