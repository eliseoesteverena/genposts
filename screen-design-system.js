(function(){
  let currentDs = null;

  function typeOfKind(kind){ return { color: 'color', dimension: 'dimension', fontFamily: 'fontFamily', fontWeight: 'fontWeight', gradient: 'gradient' }[kind]; }

  function walkAndRender(container, node, pathParts, ds){
    for (const key in node) {
      if (key.startsWith('$')) continue;
      const child = node[key];
      if (!child || typeof child !== 'object') continue;
      const path = [...pathParts, key];

      if ('$value' in child) {
        const kind = child.$type || 'text';
        if (kind === 'gradient') { container.appendChild(gradientRow(path, child, ds)); continue; }
        const field = Fields.renderField({
          label: path.join('.'),
          kind: ['color','dimension','fontFamily','fontWeight'].includes(kind) ? kind : 'text',
          value: child.$value,
          tokens: null, // los tokens no se referencian a sí mismos
          onChange(newVal){
            child.$value = (kind === 'dimension' || kind === 'fontWeight') && !isNaN(parseFloat(newVal)) && typeof newVal !== 'object'
              ? (String(newVal).match(/^[\d.]+$/) ? parseFloat(newVal) : newVal)
              : newVal;
            saveTokens(ds);
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
    preview.style.background = `linear-gradient(${v.angle}deg, ${v.stops.map(s => s.color + ' ' + s.position + '%').join(', ')})`;
    wrap.appendChild(preview);

    const ta = document.createElement('textarea');
    ta.className = 'fld-input fld-textarea';
    ta.value = JSON.stringify(v, null, 1);
    ta.addEventListener('change', () => {
      try {
        tokenNode.$value = JSON.parse(ta.value);
        saveTokens(ds);
      } catch (e) { alert('JSON del gradiente inválido: ' + e.message); }
    });
    wrap.appendChild(ta);
    return wrap;
  }

  function saveTokens(ds){
    Store.updateDesignSystem(ds.id, { tokens: ds.tokens });
  }

  function render(params){
    const el = document.querySelector('[data-view="design-system"]');
    const brand = Store.getBrand(params.brandId);
    const ds = brand ? Store.listDesignSystems(brand.id)[0] : null;
    currentDs = ds;

    el.querySelector('.ds-brand-name').textContent = brand ? brand.name : '—';
    const body = el.querySelector('.ds-tokens-body');
    body.innerHTML = '';
    if (!ds) { body.innerHTML = '<p class="panel-hint">No se encontró el design system de esta marca.</p>'; return; }

    walkAndRender(body, ds.tokens, [], ds);

    el.querySelector('.ds-next-btn').onclick = () => Router.go('#/design-system/' + ds.id + '/components');
  }

  Router.register('design-system', render);
})();
