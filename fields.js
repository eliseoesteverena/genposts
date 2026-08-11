(function(){
  /* =========================================================
     FIELDS — un único patrón de "editar una propiedad" reusado en
     los 3 lugares donde la app edita datos: tokens (paso 1),
     componentes (paso 2) y elementos de un diseño (paso 3, inspector).
     Antes esto vivía duplicado en cada pantalla; ahora es un
     módulo compartido: cambiar cómo se ve un campo de color se
     cambia una sola vez.
     ========================================================= */

  function isTokenRef(v){ return typeof v === 'string' && /^\{[\w.\-]+\}$/.test(v); }
  function tokenPathOf(v){ return isTokenRef(v) ? v.slice(1, -1) : null; }

  function flattenTokens(tokens, prefix, type, out){
    out = out || [];
    for (const key in tokens) {
      if (key.startsWith('$')) continue;
      const node = tokens[key];
      if (!node || typeof node !== 'object') continue;
      const path = prefix ? prefix + '.' + key : key;
      const nodeType = node.$type || type;
      if ('$value' in node) out.push({ path, type: nodeType, value: node.$value });
      else flattenTokens(node, path, nodeType, out);
    }
    return out;
  }

  /**
   * Renderiza una fila "label + control" para una propiedad, con soporte de
   * atado a token cuando corresponde. Devuelve el elemento DOM de la fila.
   *
   * opts: { label, kind, value, options, tokens (objeto DTCG completo o null),
   *         onChange(newValue) }
   * kind: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'gradient' |
   *       'text' | 'longtext' | 'number' | 'select' | 'image'
   */
  function renderField(opts){
    const { label, kind, value, options, tokens, onChange } = opts;
    const row = document.createElement('div');
    row.className = 'fld-row';

    const lbl = document.createElement('label');
    lbl.className = 'fld-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    const controls = document.createElement('div');
    controls.className = 'fld-controls';

    const TOKEN_TYPES = { color: 'color', dimension: 'dimension', fontFamily: 'fontFamily', fontWeight: 'fontWeight', gradient: 'gradient' };
    const tokenType = TOKEN_TYPES[kind];

    if (tokenType && tokens) {
      const badge = document.createElement('span');
      badge.className = 'fld-badge' + (isTokenRef(value) ? ' is-token' : ' is-literal');
      badge.textContent = isTokenRef(value) ? value : 'literal';
      controls.appendChild(badge);

      const select = document.createElement('select');
      select.className = 'fld-select';
      const litOpt = document.createElement('option');
      litOpt.value = ''; litOpt.textContent = '— valor literal —';
      select.appendChild(litOpt);
      flattenTokens(tokens, '', null, []).filter(t => t.type === tokenType).forEach(t => {
        const opt = document.createElement('option');
        opt.value = '{' + t.path + '}'; opt.textContent = t.path;
        if (isTokenRef(value) && tokenPathOf(value) === t.path) opt.selected = true;
        select.appendChild(opt);
      });
      if (!isTokenRef(value)) litOpt.selected = true;
      select.addEventListener('change', () => onChange(select.value || (typeof value === 'object' ? value : String(value))));
      controls.appendChild(select);

      if (!isTokenRef(value) && kind !== 'gradient') {
        const input = document.createElement('input');
        input.className = 'fld-input';
        input.type = 'text';
        input.value = (typeof value === 'object') ? JSON.stringify(value) : value;
        input.addEventListener('change', () => onChange(input.value));
        if (kind === 'color') {
          const swatch = document.createElement('input');
          swatch.type = 'color';
          swatch.className = 'fld-swatch';
          try { swatch.value = rgbToHex(value); } catch (_) { swatch.value = '#000000'; }
          swatch.addEventListener('input', () => { input.value = swatch.value; onChange(swatch.value); });
          controls.appendChild(swatch);
        }
        controls.appendChild(input);
      }
    }

    else if (kind === 'text') {
      const input = document.createElement('input');
      input.className = 'fld-input'; input.type = 'text'; input.value = value;
      input.addEventListener('change', () => onChange(input.value));
      controls.appendChild(input);
    }

    else if (kind === 'longtext') {
      const ta = document.createElement('textarea');
      ta.className = 'fld-input fld-textarea'; ta.value = value;
      ta.addEventListener('change', () => onChange(ta.value));
      controls.appendChild(ta);
    }

    else if (kind === 'number') {
      const input = document.createElement('input');
      input.className = 'fld-input'; input.type = 'number'; input.value = value;
      input.addEventListener('change', () => onChange(parseFloat(input.value) || 0));
      controls.appendChild(input);
    }

    else if (kind === 'select') {
      const select = document.createElement('select');
      select.className = 'fld-select';
      (options || []).forEach(opt => {
        const o = document.createElement('option');
        o.value = opt; o.textContent = opt;
        if (opt === value) o.selected = true;
        select.appendChild(o);
      });
      select.addEventListener('change', () => onChange(select.value));
      controls.appendChild(select);
    }

    else if (kind === 'image') {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'fld-mini-btn';
      btn.textContent = value ? 'Reemplazar imagen…' : 'Subir imagen…';
      btn.addEventListener('click', () => opts.onUploadRequest && opts.onUploadRequest());
      controls.appendChild(btn);
      if (value) {
        const hint = document.createElement('span');
        hint.className = 'fld-hint';
        hint.textContent = String(value).length > 34 ? String(value).slice(0, 31) + '…' : value;
        controls.appendChild(hint);
      }
    }

    row.appendChild(controls);
    return row;
  }

  function rgbToHex(v){
    if (typeof v !== 'string') throw new Error('no color');
    if (v.startsWith('#')) return v.length === 4
      ? '#' + [...v.slice(1)].map(c => c + c).join('')
      : v.slice(0, 7);
    const m = v.match(/rgba?\(([^)]+)\)/);
    if (!m) throw new Error('no color');
    const [r, g, b] = m[1].split(',').map(s => parseInt(s.trim(), 10));
    return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
  }

  window.Fields = { renderField, flattenTokens, isTokenRef, tokenPathOf };
})();
