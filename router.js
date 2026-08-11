(function(){
  /* =========================================================
     ROUTER — wizard de 3 pasos sobre hash routes, sin build step.
     #/brands                                -> paso 0: elegir/crear marca
     #/brands/:brandId/design-system         -> paso 1: tokens
     #/design-system/:dsId/components        -> paso 2: componentes
     #/design-system/:dsId/editor/:designId? -> paso 3: editor

     Cada vista es un <section data-view="..."> ya presente en el DOM
     (no se genera/destruye en cada navegación); el router solo la
     muestra/oculta y le pasa los params a su función refresh().
     ========================================================= */

  const views = {};
  let current = null;

  function register(name, refresh){
    const el = document.querySelector('[data-view="' + name + '"]');
    if (!el) { console.error('Router: no existe [data-view="' + name + '"]'); return; }
    views[name] = { el, refresh };
  }

  function parse(hash){
    hash = (hash || '').replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean);

    if (parts[0] === 'brands' && parts[1] && parts[2] === 'design-system')
      return { view: 'design-system', params: { brandId: parts[1] } };
    if (parts[0] === 'design-system' && parts[1] && parts[2] === 'components')
      return { view: 'components', params: { dsId: parts[1] } };
    if (parts[0] === 'design-system' && parts[1] && parts[2] === 'editor')
      return { view: 'editor', params: { dsId: parts[1], designId: parts[3] || null } };
    return { view: 'brands', params: {} };
  }

  function dispatch(){
    const { view, params } = parse(location.hash);
    if (!views[view]) return;
    if (current && current !== view) views[current].el.hidden = true;
    views[view].el.hidden = false;
    current = view;
    if (params.dsId) window.Router.lastDsId = params.dsId;
    views[view].refresh(params);
    updateBreadcrumb(view, params);
    window.scrollTo(0, 0);
  }

  function updateBreadcrumb(view){
    document.querySelectorAll('.step-nav [data-step]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.step === view);
    });
  }

  window.Router = {
    register,
    start(){ window.addEventListener('hashchange', dispatch); dispatch(); },
    go(hash){ location.hash = hash; },
    lastDsId: null
  };
})();
