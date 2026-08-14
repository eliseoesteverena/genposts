(function(){
  const views = {};
  let current = null;

  function register(name, refresh){
    const el = document.querySelector('[data-view="' + name + '"]');
    if (!el) { console.error('Router: no existe [data-view="' + name + '"]'); return; }
    views[name] = { el: el, refresh: refresh };
  }

  function parse(hash){
    hash = (hash || '').replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean);

    if (parts.length === 0) return { view: 'home', params: {} };
    if (parts[0] === 'auth') return { view: 'auth', params: {} };
    if (parts[0] === 'brands' && parts.length === 1) return { view: 'brands', params: {} };
    if (parts[0] === 'brands' && parts[1] && parts[2] === 'design-system')
      return { view: 'design-system', params: { brandId: parts[1] } };
    if (parts[0] === 'pick-brand' && parts[1])
      return { view: 'pick-brand', params: { for: parts[1] } };
    if (parts[0] === 'design-system' && parts[1] && parts[2] === 'components')
      return { view: 'components', params: { dsId: parts[1] } };
    if (parts[0] === 'design-system' && parts[1] && parts[2] === 'posts')
      return { view: 'posts', params: { dsId: parts[1] } };
    if (parts[0] === 'design-system' && parts[1] && parts[2] === 'editor')
      return { view: 'editor', params: { dsId: parts[1], designId: parts[3] || null } };
    return { view: 'home', params: {} };
  }

  function dispatch(){
    const parsed = parse(location.hash);
    const view = parsed.view, params = parsed.params;
    if (!views[view]) return;
    if (current && current !== view) views[current].el.hidden = true;
    views[view].el.hidden = false;
    current = view;
    if (params.dsId) window.Router.lastDsId = params.dsId;
    views[view].refresh(params);
    updateActiveNav(view);
    closeSidebar();
    window.scrollTo(0, 0);
  }

  function updateActiveNav(view){
    document.querySelectorAll('.side-nav [data-nav]').forEach(function(btn){
      btn.classList.toggle('is-active', btn.dataset.nav === view);
    });
  }

  function closeSidebar(){
    const sb = document.getElementById('sidebar');
    const bd = document.getElementById('sidebarBackdrop');
    if (sb) sb.classList.remove('is-open');
    if (bd) bd.classList.remove('is-open');
  }

  function goToSection(section){
    const lastBrandId = Store.getLastActiveBrandId();
    if (lastBrandId && Store.getBrand(lastBrandId)) {
      const ds = Store.listDesignSystems(lastBrandId)[0];
      if (ds) { location.hash = '#/design-system/' + ds.id + '/' + section; return; }
    }
    location.hash = '#/pick-brand/' + section;
  }

  window.Router = {
    register: register,
    start(){ window.addEventListener('hashchange', dispatch); dispatch(); },
    go(hash){ location.hash = hash; },
    goToSection: goToSection,
    lastDsId: null
  };
})();
