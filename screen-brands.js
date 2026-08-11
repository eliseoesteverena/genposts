(function(){
  function render(){
    const el = document.querySelector('[data-view="brands"]');
    const list = el.querySelector('.brand-list');
    list.innerHTML = '';

    const brands = Store.listBrands();
    if (!brands.length) {
      list.innerHTML = '<p class="panel-hint">Todavía no creaste ninguna marca.</p>';
    }
    brands.forEach(brand => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'brand-card';
      const dsCount = Store.listDesignSystems(brand.id).length;
      card.innerHTML = `<strong>${escapeHtml(brand.name)}</strong><span>${dsCount} design system${dsCount === 1 ? '' : 's'}</span>`;
      card.addEventListener('click', () => {
        const ds = Store.listDesignSystems(brand.id)[0];
        if (ds) Router.go('#/brands/' + brand.id + '/design-system');
      });
      list.appendChild(card);
    });
  }

  function escapeHtml(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function wireCreate(){
    const el = document.querySelector('[data-view="brands"]');
    const form = el.querySelector('.brand-create');
    const input = el.querySelector('.brand-create input');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = input.value.trim();
      if (!name) return;
      const brand = Store.createBrand({ name });
      // toda marca nueva arranca con un Design System propio, clonando los
      // tokens base globales como punto de partida editable.
      Store.createDesignSystem(brand.id, {
        name: 'Design System — ' + name,
        tokens: JSON.parse(JSON.stringify(window.DEFAULT_TOKENS || {}))
      });
      input.value = '';
      render();
      Router.go('#/brands/' + brand.id + '/design-system');
    });
  }

  Router.register('brands', render);
  wireCreate();
})();
