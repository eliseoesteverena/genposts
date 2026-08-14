(function(){
  let currentDs = null;

  const COLOR_ROLES = [
    { key: 'background', label: 'Fondo', hint: 'El fondo general de tus posts.', path: 'color.primitive.paper' },
    { key: 'surface',    label: 'Tarjetas / superficies', hint: 'Fondo de tarjetas y placas sobre el fondo.', path: 'color.primitive.white' },
    { key: 'text',       label: 'Texto', hint: 'Color principal de titulos y texto.', path: 'color.primitive.ink' },
    { key: 'accent',     label: 'Acento de marca', hint: 'Detalles, chips y toques de color.', path: 'color.primitive.yellow' }
  ];

  const STYLE_PRESETS = [
    {
      id: 'cuaderno', name: 'Cuaderno', desc: 'Bordes marcados, sombra dura, mucho caracter.',
      radius: { sm: 6, md: 8, lg: 20, xl: 28, full: 999 },
      stroke: { hairline: 1.5, bold: 3 },
      shadow: { sm: 3, md: 6, lg: 10 }
    },
    {
      id: 'suave', name: 'Suave', desc: 'Esquinas mas redondeadas, sombra corta, bordes finos.',
      radius: { sm: 10, md: 14, lg: 28, xl: 36, full: 999 },
      stroke: { hairline: 1, bold: 1.5 },
      shadow: { sm: 2, md: 3, lg: 5 }
    },
    {
      id: 'editorial', name: 'Editorial', desc: 'Casi sin sombra, esquinas rectas, minimo y serio.',
      radius: { sm: 2, md: 3, lg: 6, xl: 8, full: 999 },
      stroke: { hairline: 1, bold: 1 },
      shadow: { sm: 0, md: 0, lg: 0 }
    }
  ];

  function getNode(tokens, path){
    const parts = path.split('.');
    let node = tokens;
    for (const p of parts) { if (!node) return null; node = node[p]; }
    return node;
  }
  function getValue(tokens, path){ const node = getNode(tokens, path); return node ? node.$value : null; }
  function setValue(tokens, path, value){ const node = getNode(tokens, path); if (node) node.$value = value; }
  function toHex(v){
    if (typeof v !== 'string') return '#000000';
    if (v.startsWith('#')) return v.length === 4 ? '#' + [...v.slice(1)].map(c => c + c).join('') : v.slice(0, 7);
    const m = v.match(/rgba?\(([^)]+)\)/);
    if (!m) return '#000000';
    const parts = m[1].split(',').map(function(s){ return parseInt(s.trim(), 10); });
    return '#' + parts.slice(0,3).map(function(n){ return n.toString(16).padStart(2, '0'); }).join('');
  }

  function saveTokens(ds){ Store.updateDesignSystem(ds.id, { tokens: ds.tokens }); }

  function updatePreview(ds){
    const preview = document.getElementById('bkPreview');
    const t = ds.tokens;
    const bg = getValue(t, 'color.primitive.paper');
    const surface = getValue(t, 'color.primitive.white');
    const text = getValue(t, 'color.primitive.ink');
    const accent = getValue(t, 'color.primitive.yellow');
    const headFont = getValue(t, 'fontFamily.serif');
    const bodyFont = getValue(t, 'fontFamily.sans');
    const radius = num(getValue(t, 'dimension.radius.xl')) || 20;
    const stroke = num(getValue(t, 'dimension.stroke-width.bold')) || 3;
    const shadow = num(getValue(t, 'dimension.shadow-offset.md'));

    preview.style.background = bg;
    preview.style.color = text;
    preview.style.border = stroke + 'px solid ' + text;
    preview.style.borderRadius = radius + 'px';
    preview.style.boxShadow = shadow > 0 ? (shadow + 'px ' + shadow + 'px 0 ' + text) : 'none';

    const title = preview.querySelector('.bk-preview-title');
    const body = preview.querySelector('.bk-preview-body');
    const chip = preview.querySelector('.bk-preview-chip');
    const eyebrow = preview.querySelector('.bk-preview-eyebrow');
    title.style.fontFamily = headFont; title.style.color = text;
    body.style.fontFamily = bodyFont; body.style.color = text;
    eyebrow.style.fontFamily = bodyFont; eyebrow.style.color = text; eyebrow.style.opacity = .55;
    chip.style.background = (surface && surface !== bg) ? surface : accent;
    chip.style.color = text; chip.style.fontFamily = bodyFont;
    chip.style.border = '2px solid ' + text;
  }

  function renderColors(ds){
    const wrap = document.getElementById('bkColors');
    wrap.innerHTML = '';
    COLOR_ROLES.forEach(function(role){
      const item = document.createElement('label');
      item.className = 'bk-color-item';
      const swatch = document.createElement('input');
      swatch.type = 'color';
      swatch.className = 'bk-swatch';
      swatch.value = toHex(getValue(ds.tokens, role.path));
      swatch.addEventListener('input', function(){
        setValue(ds.tokens, role.path, swatch.value);
        saveTokens(ds);
        updatePreview(ds);
      });
      const text = document.createElement('span');
      text.className = 'bk-color-text';
      text.innerHTML = '<strong>' + role.label + '</strong><small>' + role.hint + '</small>';
      item.appendChild(swatch); item.appendChild(text);
      wrap.appendChild(item);
    });
  }

  function renderFonts(ds){
    const wrap = document.getElementById('bkFonts');
    wrap.innerHTML = '';

    // --- opcion principal: pares curados con nombre, no fuentes sueltas ---
    const currentHeading = getValue(ds.tokens, 'fontFamily.serif');
    const currentBody = getValue(ds.tokens, 'fontFamily.sans');

    const pairGrid = document.createElement('div');
    pairGrid.className = 'bk-pair-grid';
    FontPairs.list.forEach(function(pair){
      const headingStack = FontPairs.cssStack(pair.heading);
      const bodyStack = FontPairs.cssStack(pair.body);
      const isSelected = currentHeading === headingStack && currentBody === bodyStack;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'bk-pair-card' + (isSelected ? ' is-selected' : '');
      card.innerHTML =
        '<span class="bk-pair-sample" style="font-family:' + headingStack + '; font-weight:' + pair.headingWeight + ';">Aa</span>' +
        '<span class="bk-pair-info"><strong>' + pair.name + '</strong>' +
        '<small style="font-family:' + bodyStack + ';">' + pair.heading + ' + ' + pair.body + '</small></span>';
      card.addEventListener('click', function(){
        setValue(ds.tokens, 'fontFamily.serif', headingStack);
        setValue(ds.tokens, 'fontFamily.sans', bodyStack);
        saveTokens(ds);
        pairGrid.querySelectorAll('.bk-pair-card').forEach(function(c){ c.classList.remove('is-selected'); });
        card.classList.add('is-selected');
        updatePreview(ds);
      });
      pairGrid.appendChild(card);
    });
    wrap.appendChild(pairGrid);

    // --- avanzado: romper el par y elegir cada rol por separado ---
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'fld-mini-btn bk-font-separate-toggle';
    toggle.textContent = 'Elegir titulo y texto por separado';
    const separateBody = document.createElement('div');
    separateBody.hidden = true;
    toggle.addEventListener('click', function(){
      separateBody.hidden = !separateBody.hidden;
      toggle.textContent = separateBody.hidden ? 'Elegir titulo y texto por separado' : 'Ocultar seleccion por separado';
    });
    wrap.appendChild(toggle);
    wrap.appendChild(separateBody);

    [['heading', 'Titulo', 'fontFamily.serif'], ['body', 'Texto', 'fontFamily.sans']].forEach(function(entry){
      const kind = entry[0], label = entry[1], path = entry[2];
      const block = document.createElement('div');
      block.className = 'bk-font-block';
      const h = document.createElement('span');
      h.className = 'bk-font-block-label';
      h.textContent = label;
      block.appendChild(h);

      const currentValue = getValue(ds.tokens, path);
      // reusamos las mismas familias curadas, listadas individualmente, para
      // que "por separado" siga siendo Google Fonts reales, no un stack distinto
      const seen = {};
      FontPairs.list.forEach(function(pair){
        const fam = kind === 'heading' ? pair.heading : pair.body;
        const weight = kind === 'heading' ? pair.headingWeight : pair.bodyWeight;
        if (seen[fam]) return;
        seen[fam] = true;
        const stack = FontPairs.cssStack(fam);
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'bk-font-card' + (currentValue === stack ? ' is-selected' : '');
        card.style.fontFamily = stack;
        card.style.fontWeight = weight;
        card.innerHTML = '<span class="bk-font-sample">Aa</span><span class="bk-font-name">' + fam + '</span>';
        card.addEventListener('click', function(){
          setValue(ds.tokens, path, stack);
          saveTokens(ds);
          block.querySelectorAll('.bk-font-card').forEach(function(c){ c.classList.remove('is-selected'); });
          card.classList.add('is-selected');
          pairGrid.querySelectorAll('.bk-pair-card').forEach(function(c){ c.classList.remove('is-selected'); }); // ya no matchea ningun par curado
          updatePreview(ds);
        });
        block.appendChild(card);
      });
      separateBody.appendChild(block);
    });
  }

  function applyPreset(ds, preset){
    const t = ds.tokens;
    Object.keys(preset.radius).forEach(function(k){ setValue(t, 'dimension.radius.' + k, preset.radius[k]); });
    Object.keys(preset.stroke).forEach(function(k){ setValue(t, 'dimension.stroke-width.' + k, preset.stroke[k]); });
    Object.keys(preset.shadow).forEach(function(k){ setValue(t, 'dimension.shadow-offset.' + k, preset.shadow[k]); });
    saveTokens(ds);
  }

  function num(v){ return typeof v === 'number' ? v : parseFloat(v) || 0; }

  function detectPreset(ds){
    const cur = num(getValue(ds.tokens, 'dimension.shadow-offset.md'));
    const found = STYLE_PRESETS.find(function(p){ return p.shadow.md === cur; });
    return found ? found.id : null;
  }

  function renderPresets(ds){
    const wrap = document.getElementById('bkPresets');
    wrap.innerHTML = '';
    const activeId = detectPreset(ds);
    STYLE_PRESETS.forEach(function(preset){
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'bk-preset-card' + (preset.id === activeId ? ' is-selected' : '');
      card.innerHTML = '<strong>' + preset.name + '</strong><span>' + preset.desc + '</span>';
      card.addEventListener('click', function(){
        applyPreset(ds, preset);
        wrap.querySelectorAll('.bk-preset-card').forEach(function(c){ c.classList.remove('is-selected'); });
        card.classList.add('is-selected');
        updatePreview(ds);
      });
      wrap.appendChild(card);
    });
  }

  function walkAndRender(container, node, pathParts, ds){
    for (const key in node) {
      if (key.startsWith('$')) continue;
      const child = node[key];
      if (!child || typeof child !== 'object') continue;
      const path = pathParts.concat([key]);

      if ('$value' in child) {
        const kind = child.$type || 'text';
        if (kind === 'gradient') { container.appendChild(gradientRow(path, child, ds)); continue; }
        const field = Fields.renderField({
          label: path.join('.'),
          kind: ['color', 'dimension', 'fontFamily', 'fontWeight'].indexOf(kind) !== -1 ? kind : 'text',
          value: child.$value,
          tokens: null,
          onChange(newVal){
            child.$value = (kind === 'dimension' || kind === 'fontWeight') && String(newVal).match(/^[\d.]+$/)
              ? parseFloat(newVal) : newVal;
            saveTokens(ds);
            updatePreview(ds);
          }
        });
        container.appendChild(field);
      } else {
        const group = document.createElement('div');
        group.className = 'tok-group';
        const h = document.createElement('h4');
        h.className = 'tok-group-title';
        h.textContent = path.join('.');
        group.appendChild(h);
        walkAndRender(group, child, path, ds);
        container.appendChild(group);
      }
    }
  }

  function gradientRow(path, tokenNode, ds){
    const wrap = document.createElement('div');
    wrap.className = 'fld-row';
    const lbl = document.createElement('label');
    lbl.className = 'fld-label';
    lbl.textContent = path.join('.') + ' (gradiente)';
    wrap.appendChild(lbl);
    const preview = document.createElement('div');
    preview.className = 'tok-grad-preview';
    const v = tokenNode.$value;
    preview.style.background = 'linear-gradient(' + v.angle + 'deg, ' + v.stops.map(function(s){ return s.color + ' ' + s.position + '%'; }).join(', ') + ')';
    wrap.appendChild(preview);
    const ta = document.createElement('textarea');
    ta.className = 'fld-input fld-textarea';
    ta.value = JSON.stringify(v, null, 1);
    ta.addEventListener('change', function(){
      try { tokenNode.$value = JSON.parse(ta.value); saveTokens(ds); }
      catch (e) { alert('JSON del gradiente invalido: ' + e.message); }
    });
    wrap.appendChild(ta);
    return wrap;
  }

  function wireAdvancedToggle(ds){
    const btn = document.getElementById('bkAdvancedToggle');
    const body = document.getElementById('bkAdvancedBody');
    btn.onclick = function(){
      const willOpen = body.hidden;
      body.hidden = !willOpen;
      btn.textContent = willOpen ? 'Ocultar vista avanzada' : 'Personalizar en detalle (avanzado) >';
      if (willOpen) {
        body.innerHTML = '';
        walkAndRender(body, ds.tokens, [], ds);
      }
    };
  }

  function updateUndoButton(ds){
    const btn = document.querySelector('[data-view="design-system"] .bk-undo-btn');
    btn.disabled = !Store.canUndoTokens(ds.id);
  }

  async function regenerateWithAi(ds){
    const el = document.querySelector('[data-view="design-system"]');
    const promptInput = el.querySelector('.bk-ai-prompt');
    const status = el.querySelector('.bk-ai-status');
    const prompt = promptInput.value.trim();
    if (!prompt) { status.hidden = false; status.textContent = 'Escribi que ajuste queres.'; status.classList.add('is-error'); return; }

    const btn = el.querySelector('.bk-ai-btn');
    btn.disabled = true;
    status.hidden = false; status.classList.remove('is-error'); status.textContent = 'Generando...';

    try {
      const partial = await AI.generateBrand(prompt, ds.tokens, []);
      const validation = Validate.validateBrandTokens(partial);
      if (!validation.valid) throw new Error(validation.errors.join('; '));
      Store.mergeAiTokens(ds.id, partial); // guarda snapshot previo automaticamente
      promptInput.value = '';
      status.textContent = 'Listo. Podes deshacer este cambio si no te convence.';
      renderColors(ds); renderFonts(ds); renderPresets(ds); updatePreview(ds);
      updateUndoButton(ds);
    } catch (err) {
      status.classList.add('is-error');
      status.textContent = 'Error: ' + err.message;
    } finally {
      btn.disabled = false;
    }
  }

  function undoLastAiChange(ds){
    if (!Store.canUndoTokens(ds.id)) return;
    Store.undoTokens(ds.id);
    renderColors(ds); renderFonts(ds); renderPresets(ds); updatePreview(ds);
    updateUndoButton(ds);
    const status = document.querySelector('[data-view="design-system"] .bk-ai-status');
    status.hidden = false; status.classList.remove('is-error'); status.textContent = 'Deshecho.';
  }

  function render(params){
    const el = document.querySelector('[data-view="design-system"]');
    const brand = Store.getBrand(params.brandId);
    const ds = brand ? Store.listDesignSystems(brand.id)[0] : null;
    currentDs = ds;

    el.querySelector('.ds-brand-name').textContent = brand ? brand.name : '-';
    if (!ds) return;
    Store.setLastActiveBrandId(brand.id);

    renderColors(ds);
    renderFonts(ds);
    renderPresets(ds);
    updatePreview(ds);
    updateUndoButton(ds);
    wireAdvancedToggle(ds);
    document.getElementById('bkAdvancedBody').hidden = true;
    document.getElementById('bkAdvancedToggle').textContent = 'Personalizar en detalle (avanzado) >';

    el.querySelector('.bk-ai-btn').onclick = function(){ regenerateWithAi(ds); };
    el.querySelector('.bk-undo-btn').onclick = function(){ undoLastAiChange(ds); };
    el.querySelector('.ds-components-btn').onclick = function(){ Router.go('#/design-system/' + ds.id + '/components'); };
    el.querySelector('.ds-done-btn').onclick = function(){ Router.go('#/'); };
  }

  Router.register('design-system', render);
})();
