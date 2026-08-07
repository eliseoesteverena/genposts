(function(){
  const post = document.getElementById('post');
  const stageInner = document.getElementById('stageInner');
  const stage = document.querySelector('.stage');
  const formatRow = document.getElementById('formatRow');
  const toggleDoodles = document.getElementById('toggleDoodles');
  const downloadBtn = document.getElementById('downloadBtn');

  const SIZES = {
    square:   { w: 1080, h: 1080 },
    portrait: { w: 1080, h: 1350 },
    story:    { w: 1080, h: 1920 }
  };

  let currentScale = 1;

  function applyScale(){
    const size = SIZES[post.dataset.format];
    const stageW = stage.clientWidth;
    // Si el stage todavía no tiene ancho real (layout no asentado), reintentamos
    // en el próximo frame en vez de calcular con un valor de 0/erróneo.
    if (!stageW) {
      requestAnimationFrame(applyScale);
      return;
    }
    const viewportH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const maxW = Math.min(stageW - 48, 480);
    const maxH = Math.min(viewportH * 0.6, 640);
    const scale = Math.max(Math.min(maxW / size.w, maxH / size.h, 1), 0.05);
    currentScale = scale;
    stageInner.style.width = (size.w * scale) + 'px';
    stageInner.style.height = (size.h * scale) + 'px';
    post.style.transform = `scale(${scale})`;
    post.style.transformOrigin = 'top left';
    window.__postScale = scale; // lo usa select.js para convertir coordenadas de pantalla al espacio real del post
  }

  function setFormat(fmt){
    post.dataset.format = fmt;
    [...formatRow.children].forEach(btn => {
      btn.classList.toggle('is-on', btn.dataset.format === fmt);
    });
    applyScale();
  }

  formatRow.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-format]');
    if(!btn) return;
    setFormat(btn.dataset.format);
  });

  toggleDoodles.addEventListener('change', () => {
    document.querySelectorAll('[data-doodle]').forEach(el => {
      el.style.display = toggleDoodles.checked ? '' : 'none';
    });
  });

  // ResizeObserver es más confiable que 'resize' en mobile: reacciona a cambios
  // reales de layout (rotación, barra de direcciones que aparece/desaparece,
  // teclado virtual, fuentes que terminan de cargar, etc.) sin depender de timing.
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => applyScale());
    ro.observe(stage);
  } else {
    window.addEventListener('resize', applyScale);
    window.addEventListener('orientationchange', applyScale);
  }

  // Primer cálculo: inmediato + tras 'load' + tras que carguen las fuentes,
  // por si el ancho del stage cambia una vez que todo terminó de asentarse.
  applyScale();
  window.addEventListener('load', applyScale);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(applyScale);
  }

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Generando…';

    // Deseleccionamos y ocultamos asas/contornos de selección: no deben salir en el JPG
    if (window.__deselectAll) window.__deselectAll();
    post.classList.add('exporting');

    // Quitamos el transform de escala para capturar a resolución nativa
    const prevTransform = post.style.transform;
    post.style.transform = 'none';

    try {
      const canvas = await html2canvas(post, {
        scale: 2, // exporta al doble de la resolución base (2160px de ancho en formato cuadrado)
        backgroundColor: '#f7f5f0',
        useCORS: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `99copias-post-${post.dataset.format}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      console.error('Error al exportar', err);
      alert('Hubo un error al generar la imagen. Probá de nuevo.');
    } finally {
      post.style.transform = prevTransform;
      post.classList.remove('exporting');
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalText;
    }
  });
})();
