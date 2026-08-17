(function(){
  let currentDesign = null;
  let selectedId = null;
  let activeTab = null;
  let saveTimer = null;

  const el = () => document.querySelector('[data-view="editor"]');
  const canvasEl = () => document.getElementById('canvas');
  const stage = () => document.querySelector('.stage');
  const stageInner = () => document.getElementById('stageInner');

  function scheduleSave(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (!currentDesign) return;
      Store.updateDesign(currentDesign.id, { document: PostEngine.getDesign() });
    }, 400);
  }
  window.addEventListener('design:rendered', scheduleSave);

  function loadDesign(designId, dsId){
    let record = designId ? Store.getDesign(designId) : null;
    if (!record) {
      record = Store.createDesign(dsId, {
        name: 'Diseno sin titulo',
        document: { meta: { format: 'square', width: 1080, height: 1080, background: '{color.semantic.surface}' }, elements: [] }
      });
      location.hash = '#/design-system/' + dsId + '/editor/' + record.id;
    }
    currentDesign = record;
    const ds = Store.getDesignSystem(dsId);
    Store.setLastActiveBrandId(ds.brandId);
    PostEngine.setTokens(JSON.parse(JSON.stringify(ds.tokens)));
    PostEngine.setDesign(JSON.parse(JSON.stringify(record.document)));
    el().querySelector('.editor-design-name').textContent = record.name;
  }

  function applyScale(){
    const design = PostEngine.getDesign();
    const w = design.meta.width, h = design.meta.height;
    const stageW = stage().clientWidth;
    if (!stageW) { requestAnimationFrame(applyScale); return; }
    const viewportH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const panelOpen = activeTab !== null;
    const heightBudget = panelOpen ? viewportH * 0.30 : viewportH * 0.6;
    const maxW = Math.min(stageW - 32, 480);
    const maxH = Math.min(heightBudget, 640);
    const scale = Math.max(Math.min(maxW / w, maxH / h, 1), 0.05);
    stageInner().style.width = (w * scale) + 'px';
    stageInner().style.height = (h * scale) + 'px';
    canvasEl().style.transform = 'scale(' + scale + ')';
    canvasEl().style.transformOrigin = 'top left';
    window.__postScale = scale;
    positionFloatToolbar();
  }
  window.addEventListener('design:rendered', applyScale);
  window.addEventListener('load', applyScale);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyScale);

  function positionFloatToolbar(){
    const bar = document.getElementById('inspFloatToolbar');
    if (!selectedId) { bar.hidden = true; return; }
    const node = document.getElementById('el_' + selectedId);
    if (!node) { bar.hidden = true; return; }
    const rect = node.getBoundingClientRect();
    bar.hidden = false;
    const barH = bar.offsetHeight || 40;
    let top = rect.top - barH - 8;
    if (top < 8) top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - bar.offsetWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - bar.offsetWidth - 8));
    bar.style.top = top + 'px';
    bar.style.left = left + 'px';
  }

  const TAB_DEFS = {
    content: { label: 'Editar', icon: '\u270E' },
    color:   { label: 'Color', icon: '\u25CF' },
    font:    { label: 'Fuente', icon: 'Aa' },
    align:   { label: 'Alinear', icon: '\u2261' },
    style:   { label: 'Estilo', icon: '\u25C6' },
    position:{ label: 'Posicion', icon: '\u2921' },
    more:    { label: 'Mas', icon: '\u22EF' }
  };
  const TABS_BY_TYPE = {
    rect:  ['color', 'style', 'position', 'more'],
    text:  ['content', 'font', 'color', 'align', 'position', 'more'],
    icon:  ['content', 'color', 'position', 'more'],
    image: ['content', 'position', 'more']
  };

  function renderTabbar(elDef){
    const bar = document.getElementById('inspTabbar');
    bar.innerHTML = '';
    const tabs = TABS_BY_TYPE[elDef.type] || ['position', 'more'];
    tabs.forEach(function(key){
      const def = TAB_DEFS[key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'insp-tab' + (activeTab === key ? ' is-active' : '');
      btn.innerHTML = '<span class="insp-tab-icon">' + def.icon + '</span><span class="insp-tab-label">' + def.label + '</span>';
      btn.addEventListener('click', function(){ toggleTab(key); });
      bar.appendChild(btn);
    });
    bar.hidden = false;
  }

  function toggleTab(key){
    activeTab = (activeTab === key) ? null : key;
    if (activeTab) openPanel(activeTab); else closePanel();
    refreshTabActiveStates();
    applyScale();
  }
  function refreshTabActiveStates(){
    const type = currentElementType();
    document.querySelectorAll('#inspTabbar .insp-tab').forEach(function(btn, i){
      const key = TABS_BY_TYPE[type][i];
      btn.classList.toggle('is-active', key === activeTab);
    });
  }
  function currentElementType(){
    const design = PostEngine.getDesign();
    const elDef = design.elements.find(e => e.id === selectedId);
    return elDef ? elDef.type : 'rect';
  }

  function openPanel(key){
    const panel = document.getElementById('inspPanel');
    const backdrop = document.getElementById('inspPanelBackdrop');
    panel.hidden = false;
    backdrop.hidden = false;
    document.getElementById('inspPanelTitle').textContent = TAB_DEFS[key].label;
    renderPanelBody(key);
  }
  function closePanel(){
    activeTab = null;
    document.getElementById('inspPanel').hidden = true;
    document.getElementById('inspPanelBackdrop').hidden = true;
    refreshTabActiveStates();
    applyScale();
  }

  function ds(){ return Store.getDesignSystem(currentDesign.designSystemId); }
  function currentEl(){ const d = PostEngine.getDesign(); return d.elements.find(e => e.id === selectedId); }

  function renderPanelBody(key){
    const body = document.getElementById('inspPanelBody');
    body.innerHTML = '';
    const elDef = currentEl();
    if (!elDef) return;

    if (key === 'content') body.appendChild(panelContent(elDef));
    else if (key === 'color') body.appendChild(panelColor(elDef));
    else if (key === 'font') body.appendChild(panelFont(elDef));
    else if (key === 'align') body.appendChild(panelAlign(elDef));
    else if (key === 'style') body.appendChild(panelStyle(elDef));
    else if (key === 'position') body.appendChild(panelPosition(elDef));
    else if (key === 'more') body.appendChild(panelMore(elDef));
  }

  function setProp(elDef, key, value){
    PostEngine.updateElementProp(elDef.id, key, value);
  }

  function panelContent(elDef){
    const wrap = document.createElement('div');
    if (elDef.type === 'text') {
      const ta = document.createElement('textarea');
      ta.className = 'fld-input insp-content-textarea';
      ta.value = elDef.props.text;
      ta.addEventListener('input', function(){ setProp(elDef, 'text', ta.value); });
      wrap.appendChild(ta);
    } else if (elDef.type === 'icon') {
      const row = document.createElement('div');
      row.className = 'insp-chip-row';
      ['sparkle', 'doc', 'pin', 'arrow-right', 'check', 'x', 'plus', 'star', 'heart'].forEach(function(name){
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'insp-icon-chip' + (elDef.props.name === name ? ' is-selected' : '');
        chip.textContent = name;
        chip.addEventListener('click', function(){
          setProp(elDef, 'name', name);
          row.querySelectorAll('.insp-icon-chip').forEach(c => c.classList.remove('is-selected'));
          chip.classList.add('is-selected');
        });
        row.appendChild(chip);
      });
      wrap.appendChild(row);
    } else if (elDef.type === 'image') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'download-btn';
      btn.textContent = elDef.props.src ? 'Reemplazar imagen' : 'Subir imagen';
      btn.addEventListener('click', function(){
        window.dispatchEvent(new CustomEvent('image:request-upload', { detail: { elementId: elDef.id } }));
      });
      wrap.appendChild(btn);
    }
    return wrap;
  }

  function panelColor(elDef){
    const wrap = document.createElement('div');
    const propKey = elDef.type === 'rect' ? 'fill' : 'color';
    const current = elDef.props[propKey];

    const row = document.createElement('div');
    row.className = 'insp-chip-row';
    const semanticColors = flattenColorTokens(ds().tokens);
    semanticColors.forEach(function(tok){
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'insp-color-swatch' + (current === tok.ref ? ' is-selected' : '');
      swatch.style.background = PostEngine.resolveToken(tok.ref);
      swatch.title = tok.path;
      swatch.addEventListener('click', function(){
        setProp(elDef, propKey, tok.ref);
        row.querySelectorAll('.insp-color-swatch').forEach(s => s.classList.remove('is-selected'));
        swatch.classList.add('is-selected');
      });
      row.appendChild(swatch);
    });
    wrap.appendChild(row);

    const customRow = document.createElement('div');
    customRow.className = 'insp-custom-color-row';
    const custom = document.createElement('input');
    custom.type = 'color';
    custom.className = 'bk-swatch';
    try { custom.value = toHex(PostEngine.resolveToken(current)); } catch (e) {}
    custom.addEventListener('input', function(){
      setProp(elDef, propKey, custom.value);
      row.querySelectorAll('.insp-color-swatch').forEach(s => s.classList.remove('is-selected'));
    });
    const label = document.createElement('span');
    label.className = 'fld-hint';
    label.textContent = 'Color personalizado';
    customRow.appendChild(custom);
    customRow.appendChild(label);
    wrap.appendChild(customRow);
    return wrap;
  }

  function flattenColorTokens(tokens){
    const out = [];
    const sem = tokens.color && tokens.color.semantic;
    if (!sem) return out;
    Object.keys(sem).forEach(function(k){ out.push({ path: 'color.semantic.' + k, ref: '{color.semantic.' + k + '}' }); });
    return out;
  }
  function toHex(v){
    if (typeof v !== 'string') return '#000000';
    if (v.charAt(0) === '#') return v.length === 4 ? '#' + [v[1],v[1],v[2],v[2],v[3],v[3]].join('') : v.slice(0, 7);
    const m = v.match(/rgba?\(([^)]+)\)/);
    if (!m) return '#000000';
    const parts = m[1].split(',').map(function(s){ return parseInt(s.trim(), 10); });
    return '#' + parts.slice(0, 3).map(function(n){ return n.toString(16).padStart(2, '0'); }).join('');
  }

  function panelFont(elDef){
    const wrap = document.createElement('div');
    const row = document.createElement('div');
    row.className = 'insp-chip-row insp-chip-row--wrap';
    const seen = {};
    const families = [];
    (window.FontPairs ? FontPairs.list : []).forEach(function(p){
      [p.heading, p.body].forEach(function(fam){ if (!seen[fam]) { seen[fam] = true; families.push(fam); } });
    });
    const current = elDef.props.fontFamily;
    families.forEach(function(fam){
      const stack = FontPairs.cssStack(fam);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'insp-font-chip' + (current === stack ? ' is-selected' : '');
      chip.style.fontFamily = stack;
      chip.textContent = fam;
      chip.addEventListener('click', function(){
        setProp(elDef, 'fontFamily', stack);
        row.querySelectorAll('.insp-font-chip').forEach(c => c.classList.remove('is-selected'));
        chip.classList.add('is-selected');
      });
      row.appendChild(chip);
    });
    wrap.appendChild(row);
    return wrap;
  }

  function panelAlign(elDef){
    const wrap = document.createElement('div');
    const row = document.createElement('div');
    row.className = 'insp-segmented';
    [['left', 'Izquierda'], ['center', 'Centro'], ['right', 'Derecha']].forEach(function(pair){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'insp-segmented-btn' + (elDef.props.align === pair[0] ? ' is-selected' : '');
      btn.textContent = pair[1];
      btn.addEventListener('click', function(){
        setProp(elDef, 'align', pair[0]);
        row.querySelectorAll('.insp-segmented-btn').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
      });
      row.appendChild(btn);
    });
    wrap.appendChild(row);
    return wrap;
  }

  function panelStyle(elDef){
    const wrap = document.createElement('div');
    function sliderRow(label, min, max, mapGet, mapSet){
      const row = document.createElement('div');
      row.className = 'insp-slider-row';
      const lbl = document.createElement('span');
      lbl.className = 'fld-label';
      lbl.textContent = label;
      const controls = document.createElement('div');
      controls.className = 'insp-slider-controls';
      const slider = document.createElement('input');
      slider.type = 'range'; slider.min = min; slider.max = max;
      const num = document.createElement('input');
      num.type = 'number'; num.className = 'insp-slider-num';
      const initial = mapGet();
      slider.value = initial; num.value = initial;
      function apply(v){ mapSet(v); }
      slider.addEventListener('input', function(){ num.value = slider.value; apply(parseFloat(slider.value)); });
      num.addEventListener('change', function(){ slider.value = num.value; apply(parseFloat(num.value) || 0); });
      controls.appendChild(slider); controls.appendChild(num);
      row.appendChild(lbl); row.appendChild(controls);
      return row;
    }
    const resolveNum = (v) => { const r = PostEngine.resolveToken(v); return typeof r === 'number' ? r : parseFloat(r) || 0; };

    wrap.appendChild(sliderRow('Radio', 0, 80,
      () => resolveNum(elDef.props.radius), (v) => setProp(elDef, 'radius', v)));
    wrap.appendChild(sliderRow('Grosor de borde', 0, 10,
      () => resolveNum(elDef.props.strokeWidth), (v) => setProp(elDef, 'strokeWidth', v)));
    wrap.appendChild(sliderRow('Sombra', 0, 24,
      () => resolveNum(elDef.props.shadowX), (v) => { setProp(elDef, 'shadowX', v); setProp(elDef, 'shadowY', v); }));
    return wrap;
  }

  function panelPosition(elDef){
    const wrap = document.createElement('div');
    const geo = document.createElement('div');
    geo.className = 'insp-geo';
    ['x', 'y', 'width', 'height'].forEach(function(k){
      const field = document.createElement('label');
      field.className = 'insp-geo-field';
      field.innerHTML = '<span>' + k + '</span>';
      const input = document.createElement('input');
      input.type = 'number'; input.value = Math.round(elDef[k]);
      input.addEventListener('change', function(){ PostEngine.updateElement(elDef.id, { [k]: parseFloat(input.value) || 0 }); });
      field.appendChild(input);
      geo.appendChild(field);
    });
    wrap.appendChild(geo);

    const orderRow = document.createElement('div');
    orderRow.className = 'insp-segmented';
    const back = document.createElement('button');
    back.type = 'button'; back.className = 'insp-segmented-btn'; back.textContent = 'Atras';
    back.addEventListener('click', function(){ PostEngine.updateElement(elDef.id, { zIndex: elDef.zIndex - 1 }); });
    const front = document.createElement('button');
    front.type = 'button'; front.className = 'insp-segmented-btn'; front.textContent = 'Adelante';
    front.addEventListener('click', function(){ PostEngine.updateElement(elDef.id, { zIndex: elDef.zIndex + 1 }); });
    orderRow.appendChild(back); orderRow.appendChild(front);
    wrap.appendChild(orderRow);
    return wrap;
  }

  function panelMore(elDef){
    const wrap = document.createElement('div');

    const aiRow = document.createElement('div');
    aiRow.className = 'insp-more-ai-row';
    const aiInput = document.createElement('input');
    aiInput.type = 'text'; aiInput.className = 'fld-input'; aiInput.placeholder = 'Pedile un ajuste a la IA...';
    const aiBtn = document.createElement('button');
    aiBtn.type = 'button'; aiBtn.className = 'fld-mini-btn'; aiBtn.textContent = 'Aplicar';
    const aiStatus = document.createElement('p');
    aiStatus.className = 'insp-ai-status'; aiStatus.hidden = true;
    aiBtn.addEventListener('click', function(){ editSelectedElementWithAi(aiInput, aiBtn, aiStatus); });
    aiRow.appendChild(aiInput); aiRow.appendChild(aiBtn);
    wrap.appendChild(aiRow);
    wrap.appendChild(aiStatus);

    const divider = document.createElement('div');
    divider.className = 'insp-divider';
    wrap.appendChild(divider);

    const COVERED = { fill: 1, color: 1, fontFamily: 1, align: 1, radius: 1, strokeWidth: 1, shadowX: 1, shadowY: 1,
      text: 1, name: 1, src: 1, highlightWords: 1, lineHeight: 1, alt: 1, status: 1 };
    const guessKind = (key) => ({ shadowColor: 'color', stroke: 'color', fontSize: 'dimension', fontWeight: 'fontWeight', fit: 'select' }[key] || 'text');
    Object.keys(elDef.props).forEach(function(key){
      if (COVERED[key]) return;
      const kind = guessKind(key);
      wrap.appendChild(Fields.renderField({
        label: key, kind: kind, value: elDef.props[key], tokens: ds().tokens,
        options: kind === 'select' ? ['contain', 'cover'] : undefined,
        onChange(v){ setProp(elDef, key, v); }
      }));
    });
    return wrap;
  }

  async function editSelectedElementWithAi(promptInput, btn, status){
    const prompt = promptInput.value.trim();
    if (!prompt) { status.hidden = false; status.classList.add('is-error'); status.textContent = 'Escribi que ajuste queres.'; return; }
    btn.disabled = true;
    status.hidden = false; status.classList.remove('is-error'); status.textContent = 'Aplicando...';
    try {
      const elDef = currentEl();
      const newProps = await AI.editElement(prompt, elDef, ds().tokens);
      Object.assign(elDef.props, newProps);
      PostEngine.setDesign(PostEngine.getDesign());
      promptInput.value = '';
      status.textContent = 'Listo.';
      if (activeTab === 'more') renderPanelBody('more');
    } catch (err) {
      status.classList.add('is-error');
      status.textContent = 'Error: ' + err.message;
    } finally {
      btn.disabled = false;
    }
  }

  function closeInspector(){
    if (selectedId) {
      const n = document.getElementById('el_' + selectedId);
      if (n) n.classList.remove('is-selected');
    }
    selectedId = null;
    activeTab = null;
    document.getElementById('inspFloatToolbar').hidden = true;
    document.getElementById('inspTabbar').hidden = true;
    document.getElementById('inspPanel').hidden = true;
    document.getElementById('inspPanelBackdrop').hidden = true;
    applyScale();
  }

  function selectElement(id){
    if (selectedId) { const prev = document.getElementById('el_' + selectedId); if (prev) prev.classList.remove('is-selected'); }
    selectedId = id;
    activeTab = null;
    const n = document.getElementById('el_' + id);
    if (n) n.classList.add('is-selected');
    document.getElementById('inspPanel').hidden = true;
    document.getElementById('inspPanelBackdrop').hidden = true;
    renderTabbar(currentEl());
    positionFloatToolbar();
    applyScale();
  }

  function mountSelection(){
    canvasEl().addEventListener('click', (e) => {
      const target = e.target.closest('.canvas-el');
      if (!target) { closeInspector(); return; }
      selectElement(target.dataset.id);
    });
    window.addEventListener('design:rendered', () => {
      if (!selectedId) return;
      const n = document.getElementById('el_' + selectedId);
      if (!n) { closeInspector(); return; }
      n.classList.add('is-selected');
      if (activeTab) renderPanelBody(activeTab);
      positionFloatToolbar();
    });
    document.getElementById('inspPanelClose').addEventListener('click', closePanel);
    document.getElementById('inspPanelBackdrop').addEventListener('click', closePanel);

    document.getElementById('inspFloatToolbar').addEventListener('click', (e) => {
      const btn = e.target.closest('.insp-float-btn');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'delete') deleteSelected();
      else if (action === 'duplicate') duplicateSelected();
      else if (action === 'ai') {
        toggleTab('more');
        setTimeout(() => { const inp = document.querySelector('#inspPanelBody .insp-more-ai-row input'); if (inp) inp.focus(); }, 50);
      }
    });
  }

  function deleteSelected(){
    if (!selectedId) return;
    const design = PostEngine.getDesign();
    design.elements = design.elements.filter(e => e.id !== selectedId);
    PostEngine.setDesign(design);
    closeInspector();
  }

  function duplicateSelected(){
    if (!selectedId) return;
    const design = PostEngine.getDesign();
    const src = design.elements.find(e => e.id === selectedId);
    if (!src) return;
    const maxZ = Math.max(0, ...design.elements.map(e => e.zIndex));
    const clone = JSON.parse(JSON.stringify(src));
    clone.id = src.id + '-copy-' + Math.random().toString(36).slice(2, 6);
    clone.x += 24; clone.y += 24;
    clone.zIndex = maxZ + 1;
    design.elements.push(clone);
    PostEngine.setDesign(design);
    selectElement(clone.id);
  }

  function mountDocMenu(){
    const menu = document.getElementById('docMenu');
    const backdrop = document.getElementById('docMenuBackdrop');
    document.getElementById('editorMenuBtn').addEventListener('click', () => {
      menu.querySelector('.doc-menu-name').textContent = currentDesign.name;
      const d = PostEngine.getDesign();
      menu.querySelector('.doc-menu-meta').textContent = d.meta.format + ' \u00b7 ' + d.meta.width + '\u00d7' + d.meta.height + ' \u00b7 ' + d.elements.length + ' elementos';
      menu.hidden = false; backdrop.hidden = false;
    });
    function close(){ menu.hidden = true; backdrop.hidden = true; }
    backdrop.addEventListener('click', close);

    document.getElementById('docMenuRename').addEventListener('click', () => {
      const name = prompt('Nombre del post', currentDesign.name);
      if (!name) return;
      currentDesign = Store.updateDesign(currentDesign.id, { name: name });
      el().querySelector('.editor-design-name').textContent = name;
      close();
    });
    document.getElementById('docMenuDownload').addEventListener('click', () => { close(); downloadJpg(); });
    document.getElementById('docMenuDuplicate').addEventListener('click', () => {
      const copy = Store.createDesign(currentDesign.designSystemId, {
        name: currentDesign.name + ' (copia)',
        document: JSON.parse(JSON.stringify(PostEngine.getDesign()))
      });
      close();
      Router.go('#/design-system/' + currentDesign.designSystemId + '/editor/' + copy.id);
    });
    document.getElementById('docMenuDelete').addEventListener('click', () => {
      if (!confirm('Eliminar "' + currentDesign.name + '"? No se puede deshacer.')) return;
      const dsId = currentDesign.designSystemId;
      Store.deleteDesign(currentDesign.id);
      close();
      Router.go('#/design-system/' + dsId + '/posts');
    });
  }

  function mountToolbar(){
    const formatRow = document.getElementById('formatRow');
    formatRow.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-format]');
      if (!btn) return;
      [...formatRow.children].forEach(b => b.classList.toggle('is-on', b === btn));
      PostEngine.setFormat(btn.dataset.format);
    });

    document.getElementById('toggleDoodles').addEventListener('change', (e) => {
      ['sparkle-1', 'sparkle-2', 'sparkle-3'].forEach(id => PostEngine.setElementVisible(id, e.target.checked));
    });

    document.getElementById('insertComponentBtn').addEventListener('change', (e) => {
      const cmpId = e.target.value;
      e.target.value = '';
      if (!cmpId) return;
      insertComponent(cmpId);
    });

    document.querySelector('.editor-back-btn').addEventListener('click', () => {
      Router.go('#/design-system/' + currentDesign.designSystemId + '/posts');
    });

    mountDocMenu();
  }

  function refreshComponentPicker(){
    const select = document.getElementById('insertComponentBtn');
    const comps = Store.listComponents(currentDesign.designSystemId);
    select.innerHTML = '<option value="">+ Insertar componente...</option>' +
      comps.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('');
  }

  function insertComponent(cmpId){
    const comp = Store.getComponent(cmpId);
    if (!comp) return;
    const design = PostEngine.getDesign();
    const offsetX = 80, offsetY = 80;
    const maxZ = Math.max(0, ...design.elements.map(e => e.zIndex));
    const suffix = '-' + Math.random().toString(36).slice(2, 6);
    comp.elements.forEach((tpl, i) => {
      design.elements.push(Object.assign(JSON.parse(JSON.stringify(tpl)), {
        id: tpl.id + suffix,
        x: tpl.x + offsetX, y: tpl.y + offsetY,
        zIndex: maxZ + 1 + i
      }));
    });
    PostEngine.setDesign(design);
  }

  async function downloadJpg(){
    const prevTransform = canvasEl().style.transform;
    canvasEl().style.transform = 'none';
    try {
      const design = PostEngine.getDesign();
      const canvas = await html2canvas(canvasEl(), { scale: 2, backgroundColor: '#f7f5f0', useCORS: true, logging: false });
      const link = document.createElement('a');
      link.download = (currentDesign.name || 'post') + '-' + design.meta.format + '.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      console.error(err);
      alert('Error al exportar: ' + err.message);
    } finally {
      canvasEl().style.transform = prevTransform;
    }
  }

  let mounted = false;
  function mount(){
    if (mounted) return;
    mounted = true;
    mountSelection();
    mountToolbar();
    if ('ResizeObserver' in window) new ResizeObserver(applyScale).observe(stage());
    else window.addEventListener('resize', applyScale);
    window.addEventListener('resize', positionFloatToolbar);
  }

  function render(params){
    mount();
    closeInspector();
    loadDesign(params.designId, params.dsId);
    refreshComponentPicker();
    applyScale();
  }

  Router.register('editor', render);
})();
