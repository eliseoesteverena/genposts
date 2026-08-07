(function(){
  const postFrame = document.getElementById('postFrame');
  const stage = document.querySelector('.stage');

  const selectionPanel = document.getElementById('selectionPanel');
  const selCountEl = document.getElementById('selCount');
  const alignRow = document.getElementById('alignRow');
  const orderBack = document.getElementById('orderBack');
  const orderFwd = document.getElementById('orderFwd');
  const freeToggle = document.getElementById('freeToggle');
  const nudgeRange = document.getElementById('nudgeRange');
  const groupBtn = document.getElementById('groupBtn');
  const ungroupBtn = document.getElementById('ungroupBtn');
  const resetSelBtn = document.getElementById('resetSelBtn');
  const clearSelBtn = document.getElementById('clearSelBtn');

  /** Conjunto de elementos actualmente seleccionados (nodos DOM). */
  const selected = new Set();

  function scale(){ return window.__postScale || 1; }

  // El origen (0,0) del "espacio del post" es la esquina superior izquierda
  // del *contenido* de postFrame (dentro de su borde), sin importar el zoom
  // de la vista previa.
  function frameOrigin(){
    const r = postFrame.getBoundingClientRect();
    const cs = getComputedStyle(postFrame);
    return {
      x: r.left + (parseFloat(cs.borderLeftWidth) || 0),
      y: r.top + (parseFloat(cs.borderTopWidth) || 0)
    };
  }

  function toFrameBox(el){
    const r = el.getBoundingClientRect();
    const o = frameOrigin();
    const s = scale();
    return {
      left: (r.left - o.x) / s,
      top: (r.top - o.y) / s,
      width: r.width / s,
      height: r.height / s
    };
  }

  /** Guarda los valores de posicionamiento originales (inline) de cada elemento
   *  seleccionable, para poder restaurarlos con precisión al desactivar
   *  "posición libre" (útil sobre todo para los doodles decorativos, que ya
   *  traen top/right/bottom de fábrica). */
  document.querySelectorAll('.sel-target').forEach(el => {
    el.dataset.origPosition = el.style.position || '';
    el.dataset.origLeft = el.style.left || '';
    el.dataset.origTop = el.style.top || '';
    el.dataset.origRight = el.style.right || '';
    el.dataset.origBottom = el.style.bottom || '';
  });

  /** Saca al elemento del flujo flex y lo fija en posición libre, preservando su lugar visual actual. */
  function makeFree(el){
    if (el.classList.contains('is-free')) return;
    const box = toFrameBox(el);
    el.classList.add('is-free');
    el.style.position = 'absolute';
    el.style.left = box.left + 'px';
    el.style.top = box.top + 'px';
    el.style.right = '';
    el.style.bottom = '';
    el.style.margin = '0';
  }

  /** Devuelve al elemento a su posicionamiento original (flujo normal, o el
   *  top/right/bottom de fábrica si era un doodle). */
  function unfree(el){
    el.classList.remove('is-free');
    el.style.position = el.dataset.origPosition || '';
    el.style.left = el.dataset.origLeft || '';
    el.style.top = el.dataset.origTop || '';
    el.style.right = el.dataset.origRight || '';
    el.style.bottom = el.dataset.origBottom || '';
    el.style.margin = '';
  }

  /* ---------------- Selección ---------------- */

  function renderSelection(){
    document.querySelectorAll('.sel-target').forEach(el => {
      const oldHandle = el.querySelector(':scope > .sel-handle');
      if (oldHandle) oldHandle.remove();
      el.classList.toggle('is-selected', selected.has(el));
    });

    // El asa de arrastre solo aparece con una única selección (elemento o grupo).
    if (selected.size === 1) {
      const el = [...selected][0];
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'sel-handle';
      handle.setAttribute('aria-label', 'Arrastrar');
      handle.textContent = '✥';
      handle.addEventListener('pointerdown', (e) => startDrag(el, e));
      handle.addEventListener('click', (e) => e.stopPropagation());
      el.appendChild(handle);
    }

    const count = selected.size;
    selectionPanel.hidden = count === 0;
    selCountEl.textContent = count;

    const soleIsGroup = count === 1 && [...selected][0].classList.contains('post-group');
    groupBtn.disabled = count < 2;
    ungroupBtn.disabled = !soleIsGroup;
    resetSelBtn.disabled = count === 0 || soleIsGroup;

    // El toggle de "posición libre" no debe poder desarmar un grupo: para eso está "Desagrupar".
    freeToggle.disabled = count !== 1 || soleIsGroup;
    freeToggle.checked = count === 1 && [...selected][0].classList.contains('is-free');

    if (count > 0) {
      const first = [...selected][0];
      nudgeRange.value = parseFloat(first.style.marginTop) || 0;
    } else {
      nudgeRange.value = 0;
    }
  }

  function selectOnly(el){
    selected.clear();
    selected.add(el);
    renderSelection();
  }

  function toggleInSelection(el){
    if (selected.has(el)) selected.delete(el); else selected.add(el);
    renderSelection();
  }

  function clearSelection(){
    selected.clear();
    renderSelection();
  }
  window.__deselectAll = clearSelection;

  postFrame.addEventListener('click', (e) => {
    if (e.target.closest('.sel-handle')) return; // el asa maneja su propio gesto
    const target = e.target.closest('.sel-target');
    if (!target) { clearSelection(); return; }
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleInSelection(target);
    } else {
      selectOnly(target);
    }
  });

  stage.addEventListener('click', (e) => {
    if (e.target === stage) clearSelection();
  });

  /* ---------------- Arrastre ---------------- */

  function startDrag(el, e){
    e.preventDefault();
    e.stopPropagation();
    makeFree(el);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startLeft = parseFloat(el.style.left) || 0;
    const startTop = parseFloat(el.style.top) || 0;
    el.classList.add('is-dragging');
    el.setPointerCapture && el.setPointerCapture(e.pointerId);

    function onMove(ev){
      const s = scale();
      const dx = (ev.clientX - startClientX) / s;
      const dy = (ev.clientY - startClientY) / s;
      el.style.left = (startLeft + dx) + 'px';
      el.style.top = (startTop + dy) + 'px';
    }
    function onUp(){
      el.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderSelection(); // refleja el nuevo estado (toggle "posición libre", etc.)
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  }

  /* ---------------- Panel: alinear / orden / libre / nudge ---------------- */

  alignRow.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-align]');
    if (!btn) return;
    selected.forEach(el => { el.style.alignSelf = btn.dataset.align; });
  });

  function bumpOrder(dir){
    selected.forEach(el => {
      const cur = parseInt(el.style.order || '0', 10);
      el.style.order = cur + dir;
    });
  }
  orderBack.addEventListener('click', () => bumpOrder(-1));
  orderFwd.addEventListener('click', () => bumpOrder(1));

  freeToggle.addEventListener('change', () => {
    if (selected.size !== 1) return;
    const el = [...selected][0];
    if (freeToggle.checked) makeFree(el); else unfree(el);
  });

  nudgeRange.addEventListener('input', () => {
    selected.forEach(el => { el.style.marginTop = nudgeRange.value + 'px'; });
  });

  /* ---------------- Agrupar / Desagrupar ---------------- */

  groupBtn.addEventListener('click', () => {
    if (selected.size < 2) return;
    const items = [...selected];
    const boxes = items.map(el => ({ el, box: toFrameBox(el) }));

    const bbLeft = Math.min(...boxes.map(b => b.box.left));
    const bbTop = Math.min(...boxes.map(b => b.box.top));
    const bbRight = Math.max(...boxes.map(b => b.box.left + b.box.width));
    const bbBottom = Math.max(...boxes.map(b => b.box.top + b.box.height));

    const group = document.createElement('div');
    group.className = 'post-group sel-target is-free';
    group.dataset.el = 'group-' + Date.now();
    group.style.position = 'absolute';
    group.style.left = bbLeft + 'px';
    group.style.top = bbTop + 'px';
    group.style.width = (bbRight - bbLeft) + 'px';
    group.style.height = (bbBottom - bbTop) + 'px';
    postFrame.appendChild(group);

    boxes.forEach(({ el, box }) => {
      el.classList.add('is-free');
      el.classList.remove('sel-target'); // ya no se selecciona individualmente: ahora se selecciona vía el grupo
      el.style.position = 'absolute';
      el.style.left = (box.left - bbLeft) + 'px';
      el.style.top = (box.top - bbTop) + 'px';
      el.style.right = '';
      el.style.bottom = '';
      el.style.margin = '0';
      el.style.alignSelf = '';
      el.style.order = '';
      group.appendChild(el);
    });

    selectOnly(group);
  });

  ungroupBtn.addEventListener('click', () => {
    if (selected.size !== 1) return;
    const group = [...selected][0];
    if (!group.classList.contains('post-group')) return;

    const groupLeft = parseFloat(group.style.left) || 0;
    const groupTop = parseFloat(group.style.top) || 0;
    const children = [...group.children];

    children.forEach(child => {
      const childLeft = parseFloat(child.style.left) || 0;
      const childTop = parseFloat(child.style.top) || 0;
      child.style.left = (groupLeft + childLeft) + 'px';
      child.style.top = (groupTop + childTop) + 'px';
      child.classList.add('sel-target'); // vuelve a ser seleccionable individualmente
      postFrame.appendChild(child);
    });

    group.remove();
    selected.clear();
    children.forEach(c => selected.add(c));
    renderSelection();
  });

  /* ---------------- Restablecer / limpiar ---------------- */

  resetSelBtn.addEventListener('click', () => {
    selected.forEach(el => {
      if (el.classList.contains('post-group')) return; // desagrupar primero
      el.style.alignSelf = '';
      el.style.order = '';
      el.style.marginTop = '';
      unfree(el);
    });
    renderSelection();
  });

  clearSelBtn.addEventListener('click', clearSelection);
})();
