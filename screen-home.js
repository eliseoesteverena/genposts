(function(){
  let action = 'post';
  let selectedBrandId = null;
  let baseChoice = 'scratch';
  let attachedFiles = [];

  function el(){ return document.querySelector('[data-view="home"]'); }

  function render(){
    const root = el();
    selectedBrandId = selectedBrandId || Store.getLastActiveBrandId() || (Store.listBrands()[0] && Store.listBrands()[0].id);
    attachedFiles = [];

    root.querySelectorAll('.home-action-btn').forEach(function(b){ b.classList.toggle('is-on', b.dataset.action === action); });
    renderConditionalFields();
    renderAttachments();
    root.querySelector('.home-prompt').value = '';
    root.querySelector('.home-status').hidden = true;
  }

  function renderConditionalFields(){
    const root = el();
    const brandField = root.querySelector('.home-brand-field');
    const baseField = root.querySelector('.home-base-field');
    const attachField = root.querySelector('.home-attach-field');

    brandField.hidden = action !== 'post';
    baseField.hidden = action !== 'post';
    attachField.hidden = false;
    attachField.querySelector('.home-attach-label').textContent = action === 'brand'
      ? 'Referencias visuales (opcional) - logo, fotos, capturas que te gusten'
      : 'Imagen para incluir (opcional)';

    if (action === 'post') {
      const brandSelect = root.querySelector('.home-brand-select');
      const brands = Store.listBrands();
      brandSelect.innerHTML = brands.map(function(b){
        return '<option value="' + b.id + '"' + (b.id === selectedBrandId ? ' selected' : '') + '>' + escapeHtml(b.name) + '</option>';
      }).join('') || '<option value="">No tenes marcas todavia</option>';

      renderBaseOptions();
    }
  }

  function renderBaseOptions(){
    const root = el();
    const baseSelect = root.querySelector('.home-base-select');
    const ds = selectedBrandId && Store.listDesignSystems(selectedBrandId)[0];
    const designs = ds ? Store.listDesigns(ds.id) : [];
    const comps = ds ? Store.listComponents(ds.id) : [];

    let html = '<option value="scratch">Nada, desde cero</option>';
    if (designs.length) {
      html += '<optgroup label="Un post existente">' +
        designs.map(function(d){ return '<option value="design:' + d.id + '">' + escapeHtml(d.name) + '</option>'; }).join('') +
        '</optgroup>';
    }
    if (comps.length) {
      html += '<optgroup label="Un componente">' +
        comps.map(function(c){ return '<option value="component:' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join('') +
        '</optgroup>';
    }
    baseSelect.innerHTML = html;
    baseChoice = 'scratch';
  }

  function renderAttachments(){
    const root = el();
    const list = root.querySelector('.home-attach-list');
    list.innerHTML = '';
    attachedFiles.forEach(function(file, i){
      const chip = document.createElement('span');
      chip.className = 'home-attach-chip';
      chip.textContent = file.name.length > 20 ? file.name.slice(0, 17) + '...' : file.name;
      const rm = document.createElement('button');
      rm.type = 'button'; rm.textContent = 'x';
      rm.addEventListener('click', function(){ attachedFiles.splice(i, 1); renderAttachments(); });
      chip.appendChild(rm);
      list.appendChild(chip);
    });
  }

  function escapeHtml(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function setStatus(msg, isError){
    const s = el().querySelector('.home-status');
    s.hidden = false;
    s.textContent = msg;
    s.classList.toggle('is-error', !!isError);
  }

  async function submit(){
    const root = el();
    const prompt = root.querySelector('.home-prompt').value.trim();
    if (!prompt) { setStatus('Escribi que queres crear.', true); return; }

    const btn = root.querySelector('.home-submit-btn');
    btn.disabled = true;
    setStatus('Generando con IA...');

    try {
      if (action === 'brand') await submitBrand(prompt);
      else await submitPost(prompt);
    } catch (err) {
      console.error(err);
      setStatus('Error: ' + err.message, true);
    } finally {
      btn.disabled = false;
    }
  }

  async function submitBrand(prompt){
    const tokens = JSON.parse(JSON.stringify(window.DEFAULT_TOKENS));
    const partial = await AI.generateBrand(prompt, tokens, attachedFiles);
    const validation = Validate.validateBrandTokens(partial);
    if (!validation.valid) throw new Error('La IA devolvio tokens invalidos: ' + validation.errors.join('; '));

    const brand = Store.createBrand({ name: prompt.slice(0, 40) });
    const ds = Store.createDesignSystem(brand.id, { name: 'Design System - ' + brand.name, tokens: tokens });
    Store.mergeAiTokens(ds.id, partial);
    Store.setLastActiveBrandId(brand.id);
    setStatus('Marca creada.');
    Router.go('#/brands/' + brand.id + '/design-system');
  }

  async function submitPost(prompt){
    if (!selectedBrandId) throw new Error('Elegi una marca primero.');
    const ds = Store.listDesignSystems(selectedBrandId)[0];
    if (!ds) throw new Error('Esa marca no tiene design system.');

    const baseSelect = el().querySelector('.home-base-select');
    baseChoice = baseSelect.value;

    let doc;
    if (baseChoice.indexOf('design:') === 0) {
      const srcDesign = Store.getDesign(baseChoice.slice(7));
      doc = await AI.remixPost(prompt, srcDesign.document, ds.tokens);
    } else if (baseChoice.indexOf('component:') === 0) {
      // Anclamos el componente nosotros mismos (deterministico) en vez de
      // pedirle "de favor" a la IA que lo incluya - ver compose.js.
      const comp = Store.getComponent(baseChoice.slice(10));
      const canvasSize = { width: 1080, height: 1080 };
      const anchored = Compose.placeComponentElements(comp.elements, canvasSize.width, canvasSize.height);
      doc = await AI.generatePost(prompt, ds.tokens, Store.listComponents(ds.id), attachedFiles, anchored);
      doc = Compose.mergeAnchoredElements(doc, anchored);
    } else {
      doc = await AI.generatePost(prompt, ds.tokens, Store.listComponents(ds.id), attachedFiles);
    }

    const validation = Validate.validateDesignDocument(doc);
    if (!validation.valid) throw new Error('La IA devolvio un diseno invalido: ' + validation.errors.slice(0, 3).join('; '));

    const design = Store.createDesign(ds.id, { name: prompt.slice(0, 40), document: doc });
    Store.setLastActiveBrandId(selectedBrandId);
    setStatus('Post creado.');
    Router.go('#/design-system/' + ds.id + '/editor/' + design.id);
  }

  function wire(){
    const root = el();
    root.querySelectorAll('.home-action-btn').forEach(function(b){
      b.addEventListener('click', function(){ action = b.dataset.action; render(); });
    });
    root.querySelector('.home-brand-select').addEventListener('change', function(e){
      selectedBrandId = e.target.value; renderBaseOptions();
    });
    root.querySelector('.home-attach-input').addEventListener('change', function(e){
      attachedFiles = attachedFiles.concat(Array.from(e.target.files));
      renderAttachments();
      e.target.value = '';
    });
    root.querySelector('.home-submit-btn').addEventListener('click', submit);
  }

  let wired = false;
  Router.register('home', function(){
    if (!wired) { wire(); wired = true; }
    render();
  });
})();
