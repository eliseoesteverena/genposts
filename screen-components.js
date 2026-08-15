(function(){
  let currentDsId = null;
  let editingComponentId = null;

  function renderList(){
    const el = document.querySelector('[data-view="components"]');
    const grid = el.querySelector('.cmp-grid');
    grid.innerHTML = '';
    const comps = Store.listComponents(currentDsId);
    if (!comps.length) grid.innerHTML = '<p class="panel-hint">Todavía no hay componentes en este design system.</p>';
    comps.forEach(c => {
      const card = document.createElement('div');
      card.className = 'cmp-card';
      card.innerHTML = '<strong>' + escapeHtml(c.name) + '</strong><span>' + c.elements.length + ' elemento' + (c.elements.length === 1 ? '' : 's') + '</span>';
      const editBtn = document.createElement('button');
      editBtn.type = 'button'; editBtn.className = 'fld-mini-btn'; editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => openEditor(c.id));
      const delBtn = document.createElement('button');
      delBtn.type = 'button'; delBtn.className = 'fld-mini-btn fld-mini-btn--danger'; delBtn.textContent = 'Eliminar';
      delBtn.addEventListener('click', () => { if (confirm('¿Eliminar "' + c.name + '"?')) { Store.deleteComponent(c.id); renderList(); } });
      const actions = document.createElement('div');
      actions.className = 'cmp-card-actions';
      actions.append(editBtn, delBtn);
      card.appendChild(actions);
      grid.appendChild(card);
    });
  }

  function escapeHtml(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function openEditor(componentId){
    editingComponentId = componentId;
    const el = document.querySelector('[data-view="components"]');
    const editor = el.querySelector('.cmp-editor');
    const comp = Store.getComponent(componentId);
    editor.hidden = false;
    editor.querySelector('.cmp-editor-title').textContent = comp.name;
    const body = editor.querySelector('.cmp-editor-body');
    body.innerHTML = '';

    const ds = Store.getDesignSystem(currentDsId);

    comp.elements.forEach((elDef) => {
      const block = document.createElement('div');
      block.className = 'cmp-element-block';
      const head = document.createElement('div');
      head.className = 'cmp-element-head';
      head.innerHTML = '<strong>' + escapeHtml(elDef.name || elDef.id) + '</strong><span class="fld-badge is-literal">' + elDef.type + '</span>';
      block.appendChild(head);

      Object.keys(elDef.props).forEach(key => {
        if (['highlightWords','lineHeight','alt','status'].includes(key)) return;
        const kind = guessKind(key);
        block.appendChild(Fields.renderField({
          label: key, kind, value: elDef.props[key], tokens: ds.tokens,
          options: kind === 'select' ? selectOptions(key) : undefined,
          onChange(v){ elDef.props[key] = v; Store.updateComponent(comp.id, { elements: comp.elements }); }
        }));
      });
      body.appendChild(block);
    });

    editor.querySelector('.cmp-editor-close').onclick = () => { editor.hidden = true; renderList(); };
  }

  function guessKind(key){
    const map = { fill:'gradient', stroke:'color', shadowColor:'color', color:'color',
      strokeWidth:'dimension', radius:'dimension', shadowX:'dimension', shadowY:'dimension', fontSize:'dimension',
      fontFamily:'fontFamily', fontWeight:'fontWeight', text:'longtext', align:'select', name:'select', fit:'select', src:'image' };
    return map[key] || 'text';
  }
  function selectOptions(key){
    if (key === 'align') return ['left','center','right'];
    if (key === 'name') return ['sparkle','doc','pin','arrow-right','check','x','plus','star','heart'];
    if (key === 'fit') return ['contain','cover'];
    return [];
  }

  async function generateWithAi(){
    const el = document.querySelector('[data-view="components"]');
    const promptInput = el.querySelector('.cmp-ai-prompt');
    const status = el.querySelector('.cmp-ai-status');
    const prompt = promptInput.value.trim();
    if (!prompt) { status.hidden = false; status.classList.add('is-error'); status.textContent = 'Describi el componente primero.'; return; }

    const btn = el.querySelector('.cmp-ai-btn');
    btn.disabled = true;
    status.hidden = false; status.classList.remove('is-error'); status.textContent = 'Generando...';

    try {
      const ds = Store.getDesignSystem(currentDsId);
      const elements = await AI.generateComponent(prompt, ds.tokens);
      const validation = Validate.validateComponentElements(elements);
      if (!validation.valid) throw new Error(validation.errors.slice(0, 3).join('; '));
      Store.createComponent(currentDsId, { name: prompt.slice(0, 40), description: prompt, elements: elements });
      promptInput.value = '';
      status.textContent = 'Componente creado.';
      renderList();
    } catch (err) {
      status.classList.add('is-error');
      status.textContent = 'Error: ' + err.message;
    } finally {
      btn.disabled = false;
    }
  }

  function wireCreate(){
    const el = document.querySelector('[data-view="components"]');
    const form = el.querySelector('.cmp-create');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const name = input.value.trim();
      if (!name) return;
      Store.createComponent(currentDsId, { name, description: '', elements: [] });
      input.value = '';
      renderList();
    });

    el.querySelector('.cmp-ai-btn').addEventListener('click', generateWithAi);
  }
  wireCreate();

  function render(params){
    currentDsId = params.dsId;
    Store.setLastActiveBrandId(Store.getDesignSystem(currentDsId).brandId);
    const el = document.querySelector('[data-view="components"]');
    el.querySelector('.cmp-editor').hidden = true;
    renderList();
  }

  Router.register('components', render);
})();
