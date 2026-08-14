(function(){
  let currentDsId = null;

  function render(params){
    currentDsId = params.dsId;
    Store.setLastActiveBrandId(Store.getDesignSystem(currentDsId).brandId);

    const el = document.querySelector('[data-view="posts"]');
    const brand = Store.getBrand(Store.getDesignSystem(currentDsId).brandId);
    el.querySelector('.posts-brand-name').textContent = brand ? brand.name : '-';

    const grid = el.querySelector('.posts-grid');
    grid.innerHTML = '';
    const designs = Store.listDesigns(currentDsId);
    if (!designs.length) {
      grid.innerHTML = '<p class="panel-hint">Todavia no hay posts en esta marca. Cread uno desde el inicio o con el boton de aca abajo.</p>';
    }
    designs.forEach(function(d){
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'post-card';
      card.innerHTML = '<strong>' + escapeHtml(d.name) + '</strong><span>' + d.document.meta.format + ' - ' + d.document.elements.length + ' elementos</span>';
      card.addEventListener('click', function(){
        Router.go('#/design-system/' + currentDsId + '/editor/' + d.id);
      });
      grid.appendChild(card);
    });

    el.querySelector('.posts-new-btn').onclick = function(){
      Router.go('#/design-system/' + currentDsId + '/editor');
    };
  }

  function escapeHtml(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  Router.register('posts', render);
})();
