(function(){
  /* =========================================================
     INSPECTOR — selección de un elemento en el canvas + panel
     de propiedades. Cada propiedad muestra si está atada a un
     token DTCG (badge "{grupo.token}") o es un valor literal,
     y permite reasignarla a otro token o a un valor a mano.
     (Arrastre/agrupación quedan para el siguiente paso.)
     ========================================================= */

  const canvasEl = document.getElementById('canvas');
  const inspector = document.getElementById('inspector');
  const inspectorEmpty = document.getElementById('inspectorEmpty');
  const inspectorBody = document.getElementById('inspectorBody');
  const inspectorTitle = document.getElementById('inspectorTitle');
  const inspectorType = document.getElementById('inspectorType');

  let selectedId = null;

  // Aplana tokens.json a una lista [{path:'color.semantic.text', type:'color', value:'#131211'}, ...]
  // para poblar los <select> de reasignación. Soporta un nivel de alias para mostrar el valor final.
  function flattenTokens(tokens, prefix, type, out){
    out = out || [];
    for (const key in tokens) {
      if (key.startsWith('$')) continue;
      const node = tokens[key];
      if (!node || typeof node !== 'object') continue;
      const path = prefix ? prefix + '.' + key : key;
      const nodeType = node.$type || type;
      if ('$value' in node) {
        out.push({ path, type: nodeType, value: node.$value });
      } else {
        flattenTokens(node, path, nodeType, out);
      }
    }
    return out;
  }

  function tokensOfType(type){
    const all = flattenTokens(window.PostEngine.getTokens(), '', null, []);
    return all.filter(t => t.type === type);
  }

  function isTokenRef(v){ return typeof v === 'string' && /^\{[\w.\-]+\}$/.test(v); }
  function tokenPathOf(v){ return isTokenRef(v) ? v.slice(1, -1) : null; }

  /* ---------------- selección ---------------- */

  function clearSelection(){
    if (selectedId) {
      const prev = document.getElementById('el_' + selectedId);
      if (prev) prev.classList.remove('is-selected');
    }
    selectedId = null;
    inspectorEmpty.hidden = false;
    inspectorBody.hidden = true;
  }

  function selectElement(id){
    clearSelection();
    selectedId = id;
    const node = document.getElementById('el_' + id);
    if (node) node.classList.add('is-selected');
    renderInspector();
  }

  canvasEl.addEventListener('click', (e) => {
    const target = e.target.closest('.canvas-el');
    if (!target) { clearSelection(); return; }
    selectElement(target.dataset.id);
  });

  // Si el diseño se re-renderiza (cambio de formato, token editado, etc.) el DOM viejo se
  // destruye — hay que reaplicar el resaltado de selección y refrescar el panel con los
  // valores actuales del elemento.
  window.addEventListener('design:rendered', () => {
    if (!selectedId) return;
    const node = document.getElementById('el_' + selectedId);
    if (!node) { clearSelection(); return; }
    node.classList.add('is-selected');
    renderInspector();
  });

  /* ---------------- panel de propiedades ---------------- */

  const PROP_META = {
    // key: { label, kind: 'color'|'dimension'|'fontFamily'|'fontWeight'|'text'|'select'|'gradient', options? }
    fill:        { label: 'Relleno', kind: 'gradient' },
    stroke:      { label: 'Borde (color)', kind: 'color' },
    strokeWidth: { label: 'Grosor de borde', kind: 'dimension' },
    radius:      { label: 'Radio', kind: 'dimension' },
    shadowX:     { label: 'Sombra X', kind: 'dimension' },
    shadowY:     { label: 'Sombra Y', kind: 'dimension' },
    shadowColor: { label: 'Color de sombra', kind: 'color' },
    text:        { label: 'Texto', kind: 'text' },
    fontFamily:  { label: 'Tipografía', kind: 'fontFamily' },
    fontSize:    { label: 'Tamaño', kind: 'number' },
    fontWeight:  { label: 'Peso', kind: 'fontWeight' },
    color:       { label: 'Color', kind: 'color' },
    align:       { label: 'Alineación', kind: 'select', options: ['left','center','right'] },
    name:        { label: 'Ícono', kind: 'select', options: ['sparkle','doc','pin','arrow-right'] },
    src:         { label: 'Imagen', kind: 'image' },
    fit:         { label: 'Ajuste', kind: 'select', options: ['contain','cover'] }
  };

  function fieldRow(elId, propKey, value){
    const meta = PROP_META[propKey] || { label: propKey, kind: 'text' };
    const row = document.createElement('div');
    row.className = 'insp-row';

    const label = document.createElement('label');
    label.className = 'insp-label';
    label.textContent = meta.label;
    row.appendChild(label);

    const controls = document.createElement('div');
    controls.className = 'insp-controls';

    const tokenType = { color: 'color', dimension: 'dimension', fontFamily: 'fontFamily', fontWeight: 'fontWeight', gradient: 'gradient' }[meta.kind];

    if (tokenType) {
      const badge = document.createElement('span');
      badge.className = 'insp-badge' + (isTokenRef(value) ? ' is-token' : ' is-literal');
      badge.textContent = isTokenRef(value) ? value : 'valor literal';
      controls.appendChild(badge);

      const select = document.createElement('select');
      select.className = 'insp-select';
      const litOpt = document.createElement('option');
      litOpt.value = '';
      litOpt.textContent = '— usar valor literal —';
      select.appendChild(litOpt);
      tokensOfType(tokenType).forEach(t => {
        const opt = document.createElement('option');
        opt.value = '{' + t.path + '}';
        opt.textContent = t.path;
        if (isTokenRef(value) && tokenPathOf(value) === t.path) opt.selected = true;
        select.appendChild(opt);
      });
      if (!isTokenRef(value)) litOpt.selected = true;
      select.addEventListener('change', () => {
        if (select.value) {
          window.PostEngine.updateElementProp(elId, propKey, select.value);
        } else {
          const resolved = window.PostEngine.resolveToken(value);
          window.PostEngine.updateElementProp(elId, propKey, typeof resolved === 'object' ? value : resolved);
        }
      });
      controls.appendChild(select);

      if (!isTokenRef(value)) {
        const input = document.createElement('input');
        input.className = 'insp-input';
        input.type = (meta.kind === 'color') ? 'text' : 'text';
        input.value = (typeof value === 'object') ? JSON.stringify(value) : value;
        input.addEventListener('change', () => {
          window.PostEngine.updateElementProp(elId, propKey, input.value);
        });
        controls.appendChild(input);
      }
    }

    else if (meta.kind === 'text') {
      const textarea = document.createElement('textarea');
      textarea.className = 'insp-input insp-textarea';
      textarea.value = value;
      textarea.addEventListener('change', () => {
        window.PostEngine.updateElementProp(elId, propKey, textarea.value);
      });
      controls.appendChild(textarea);
    }

    else if (meta.kind === 'number') {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'insp-input';
      input.value = value;
      input.addEventListener('change', () => {
        window.PostEngine.updateElementProp(elId, propKey, parseFloat(input.value) || 0);
      });
      controls.appendChild(input);
    }

    else if (meta.kind === 'select') {
      const select = document.createElement('select');
      select.className = 'insp-select';
      (meta.options || []).forEach(opt => {
        const o = document.createElement('option');
        o.value = opt; o.textContent = opt;
        if (opt === value) o.selected = true;
        select.appendChild(o);
      });
      select.addEventListener('change', () => {
        window.PostEngine.updateElementProp(elId, propKey, select.value);
      });
      controls.appendChild(select);
    }

    else if (meta.kind === 'image') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'insp-mini-btn';
      btn.textContent = value ? 'Reemplazar imagen…' : 'Subir imagen…';
      btn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('image:request-upload', { detail: { elementId: elId } }));
      });
      controls.appendChild(btn);
      if (value) {
        const small = document.createElement('span');
        small.className = 'insp-hint';
        small.textContent = value.length > 40 ? value.slice(0, 37) + '…' : value;
        controls.appendChild(small);
      }
    }

    row.appendChild(controls);
    return row;
  }

  function renderInspector(){
    const el = window.PostEngine.getElement(selectedId);
    if (!el) { clearSelection(); return; }

    inspectorEmpty.hidden = true;
    inspectorBody.hidden = false;
    inspectorTitle.textContent = el.name || el.id;
    inspectorType.textContent = el.type;
    inspectorBody.innerHTML = '';

    // posición/tamaño: siempre literales en px, no llevan token (ver AI_CONTRACT.md §1.3)
    const geo = document.createElement('div');
    geo.className = 'insp-geo';
    ['x','y','width','height'].forEach(k => {
      const wrap = document.createElement('label');
      wrap.className = 'insp-geo-field';
      wrap.innerHTML = `<span>${k}</span>`;
      const input = document.createElement('input');
      input.type = 'number';
      input.value = el[k];
      input.addEventListener('change', () => {
        window.PostEngine.updateElement(el.id, { [k]: parseFloat(input.value) || 0 });
      });
      wrap.appendChild(input);
      geo.appendChild(wrap);
    });
    inspectorBody.appendChild(geo);

    const divider = document.createElement('div');
    divider.className = 'insp-divider';
    inspectorBody.appendChild(divider);

    Object.keys(el.props).forEach(key => {
      if (key === 'highlightWords' || key === 'lineHeight' || key === 'alt' || key === 'status') return; // avanzado, omitido del panel v1
      inspectorBody.appendChild(fieldRow(el.id, key, el.props[key]));
    });
  }

  clearSelection();
})();
