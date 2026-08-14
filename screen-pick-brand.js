(function(){
  function render(params){
    const section = params.for; // 'components' | 'posts'
    const el = document.querySelector('[data-view="pick-brand"]');
    el.querySelector('.pb-title').textContent = section === 'components' ? 'Componentes de que marca?' : 'Posts de que marca?';
    const list = el.querySelector('.pb-list');
    list.innerHTML = '';

    const brands = Store.listBrands();
    if (!brands.length) {
      list.innerHTML = '<p class="panel-hint">Todavia no tenes ninguna marca creada. <a href="#/brands">Crear una marca</a> primero.</p>';
      return;
    }
    brands.forEach(function(brand){
      const ds = Store.listDesignSystems(brand.id)[0];
      if (!ds) return;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'brand-card';
      card.innerHTML = '<strong>' + escapeHtml(brand.name) + '</strong><span>Entrar</span>';
      card.addEventListener('click', function(){
        Store.setLastActiveBrandId(brand.id);
        Router.go('#/design-system/' + ds.id + '/' + section);
      });
      list.appendChild(card);
    });
  }
  function escapeHtml(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  Router.register('pick-brand', render);
})();
