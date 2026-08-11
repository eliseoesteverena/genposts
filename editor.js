(function(){
  let currentDesign = null;
  let selectedId = null;
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
      const list = Store.listDesigns(dsId);
      record = list[0] || Store.createDesign(dsId, {
        name: 'Diseno sin titulo',
        document: { meta: { format: 'square', width: 1080, height: 1080, background: '{color.semantic.surface}' }, elements: [] }
      });
      location.hash = '#/design-system/' + dsId + '/editor/' + record.id;
    }
    currentDesign = record;
    const ds = Store.getDesignSystem(dsId);
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
    const maxW = Math.min(stageW - 32, 480);
    const maxH = Math.min(viewportH * 0.6, 640);
    const scale = Math.max(Math.min(maxW / w, maxH / h, 1), 0.05);
    stageInner().style.width = (w * scale) + 'px';
    stageInner().style.height = (h * scale) + 'px';
    canvasEl().style.transform = 'scale(' + scale + ')';
    canvasEl().style.transformOrigin = 'top left';
    window.__postScale = scale;
  }
  window.addEventListener('design:rendered', applyScale);
  window.addEventListener('load', applyScale);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyScale);

  const drawer = () => document.getElementById('inspDrawer');
  const drawerBody = () => document.getElementById('inspDrawerBody');

  function closeInspector(){
    if (selectedId) {
      const n = document.getElementById('el_' + selectedId);
      if (n) n.classList.remove('is-selected');
    }
    selectedId = null;
    drawer().classList.remove('is-open');
    document.getElementById('inspDrawerBackdrop').classList.remove('is-open');
  }

  function openInspector(id){
    if (selectedId) { const prev = document.getElementById('el_' + selectedId); if (prev) prev.classList.remove('is-selected'); }
    selectedId = id;
    const n = document.getElementById('el_' + id);
    if (n) n.classList.add('is-selected');
    drawer().classList.add('is-open');
    document.getElementById('inspDrawerBackdrop').classList.add('is-open');
    renderInspector();
  }

  function renderInspector(){
    const record = currentDesign;
    const design = PostEngine.getDesign();
    const elDef = design.elements.find(e => e.id === selectedId);
    if (!elDef) { closeInspector(); return; }

    const body = drawerBody();
    body.innerHTML = '';
    document.getElementById('inspDrawerTitle').textContent = elDef.name || elDef.id;
    document.getElementById('inspDrawerType').textContent = elDef.type;

    const ds = Store.getDesignSystem(record.designSystemId);

    const geo = document.createElement('div');
    geo.className = 'insp-geo';
    ['x', 'y', 'width', 'height'].forEach(k => {
      const wrap = document.createElement('label');
      wrap.className = 'insp-geo-field';
      wrap.innerHTML = '<span>' + k + '</span>';
      const input = document.createElement('input');
      input.type = 'number'; input.value = Math.round(elDef[k]);
      input.addEventListener('change', () => { PostEngine.updateElement(elDef.id, { [k]: parseFloat(input.value) || 0 }); });
      wrap.appendChild(input);
      geo.appendChild(wrap);
    });
    body.appendChild(geo);

    const divider = document.createElement('div');
    divider.className = 'insp-divider';
    body.appendChild(divider);

    const guessKind = (key) => ({
      fill: 'gradient', stroke: 'color', shadowColor: 'color', color: 'color',
      strokeWidth: 'dimension', radius: 'dimension', shadowX: 'dimension', shadowY: 'dimension', fontSize: 'dimension',
      fontFamily: 'fontFamily', fontWeight: 'fontWeight', text: 'longtext', align: 'select', name: 'select', fit: 'select', src: 'image'
    }[key] || 'text');
    const selectOptions = (key) => key === 'align' ? ['left','center','right'] : key === 'name' ? ['sparkle','doc','pin','arrow-right'] : key === 'fit' ? ['contain','cover'] : [];

    Object.keys(elDef.props).forEach(key => {
      if (['highlightWords', 'lineHeight', 'alt', 'status'].includes(key)) return;
      const kind = guessKind(key);
      body.appendChild(Fields.renderField({
        label: key, kind, value: elDef.props[key], tokens: ds.tokens,
        options: kind === 'select' ? selectOptions(key) : undefined,
        onChange(v){ PostEngine.updateElementProp(elDef.id, key, v); renderInspector(); },
        onUploadRequest(){ window.dispatchEvent(new CustomEvent('image:request-upload', { detail: { elementId: elDef.id } })); }
      }));
    });
  }

  function mountSelection(){
    canvasEl().addEventListener('click', (e) => {
      const target = e.target.closest('.canvas-el');
      if (!target) { closeInspector(); return; }
      openInspector(target.dataset.id);
    });
    window.addEventListener('design:rendered', () => {
      if (!selectedId) return;
      const n = document.getElementById('el_' + selectedId);
      if (!n) { closeInspector(); return; }
      n.classList.add('is-selected');
      renderInspector();
    });
    document.getElementById('inspDrawerClose').addEventListener('click', closeInspector);
    document.getElementById('inspDrawerBackdrop').addEventListener('click', closeInspector);
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

    document.getElementById('downloadBtn').addEventListener('click', downloadJpg);
    document.getElementById('insertComponentBtn').addEventListener('change', (e) => {
      const cmpId = e.target.value;
      e.target.value = '';
      if (!cmpId) return;
      insertComponent(cmpId);
    });
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
    const btn = document.getElementById('downloadBtn');
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Generando...';
    closeInspector();
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
      btn.disabled = false;
      btn.textContent = original;
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
