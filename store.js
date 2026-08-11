(function(){
  /* =========================================================
     STORE — única fuente de verdad de datos de la app.
     Hoy persiste en localStorage (caché de cliente); mañana, cuando
     haya API real, esta es la capa que se reemplaza — el resto de
     la app (router, screens, editor) solo habla con Store.*, nunca
     toca localStorage directo. Ese es el punto de esta capa.

     Entidades: User -> Brand -> DesignSystem -> Component / Design
     ========================================================= */

  const KEY = '99copias-store-v1';
  const listeners = {};

  function emit(event, payload){ (listeners[event] || []).forEach(fn => fn(payload)); }
  function on(event, fn){ (listeners[event] = listeners[event] || []).push(fn); return () => off(event, fn); }
  function off(event, fn){ listeners[event] = (listeners[event] || []).filter(f => f !== fn); }

  function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2, 9); }
  function now(){ return new Date().toISOString(); }

  function load(){
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.error('Store: no se pudo leer localStorage', e); }
    return null;
  }
  function persist(){
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { console.error('Store: no se pudo escribir localStorage', e); }
  }

  /* ---------------- Seed inicial (demo) ---------------- */
  function seed(){
    const userId = uid('user');
    const brandId = uid('brand');
    const dsId = uid('ds');
    return {
      users: [{ id: userId, name: 'Vos', email: null, createdAt: now() }],
      brands: [{ id: brandId, userId, name: '99copias', createdAt: now() }],
      designSystems: [{
        id: dsId, brandId, name: 'Design System — 99copias', tokens: window.DEFAULT_TOKENS || {}, createdAt: now()
      }],
      components: (window.DEFAULT_COMPONENTS || []).map(function(c){ return Object.assign({}, c, { id: uid('cmp'), designSystemId: dsId, createdAt: now() }); }),
      designs: window.DEFAULT_DESIGN ? [{
        id: uid('dsg'), designSystemId: dsId, name: 'Post — Impresión rápida', document: window.DEFAULT_DESIGN, createdAt: now(), updatedAt: now()
      }] : []
    };
  }

  let db = load() || seed();
  if (!load()) persist();

  /* ---------------- Genéricos de CRUD ---------------- */
  function list(coll, filter){
    return db[coll].filter(x => !filter || Object.keys(filter).every(k => x[k] === filter[k]));
  }
  function get(coll, id){ return db[coll].find(x => x.id === id) || null; }
  function create(coll, prefix, data){
    const row = Object.assign({ id: uid(prefix), createdAt: now() }, data);
    db[coll].push(row);
    persist(); emit('change', { coll, type: 'create', id: row.id });
    return row;
  }
  function update(coll, id, patch){
    const row = get(coll, id);
    if (!row) return null;
    Object.assign(row, patch, { updatedAt: now() });
    persist(); emit('change', { coll, type: 'update', id });
    return row;
  }
  function remove(coll, id){
    db[coll] = db[coll].filter(x => x.id !== id);
    persist(); emit('change', { coll, type: 'delete', id });
  }

  /* ---------------- API pública ---------------- */
  window.Store = {
    on, off,

    getCurrentUser(){ return db.users[0]; },

    listBrands(){ return list('brands'); },
    getBrand(id){ return get('brands', id); },
    createBrand(data){ return create('brands', 'brand', Object.assign({ userId: this.getCurrentUser().id }, data)); },
    updateBrand(id, patch){ return update('brands', id, patch); },
    deleteBrand(id){
      // cascada: design systems -> components + designs de ese brand
      this.listDesignSystems(id).forEach(ds => this.deleteDesignSystem(ds.id));
      remove('brands', id);
    },

    listDesignSystems(brandId){ return list('designSystems', brandId ? { brandId } : null); },
    getDesignSystem(id){ return get('designSystems', id); },
    createDesignSystem(brandId, data){
      return create('designSystems', 'ds', Object.assign({ brandId: brandId, tokens: {} }, data));
    },
    updateDesignSystem(id, patch){ return update('designSystems', id, patch); },
    deleteDesignSystem(id){
      this.listComponents(id).forEach(c => remove('components', c.id));
      this.listDesigns(id).forEach(d => remove('designs', d.id));
      remove('designSystems', id);
    },

    listComponents(designSystemId){ return list('components', designSystemId ? { designSystemId } : null); },
    getComponent(id){ return get('components', id); },
    createComponent(designSystemId, data){ return create('components', 'cmp', Object.assign({ designSystemId: designSystemId, elements: [] }, data)); },
    updateComponent(id, patch){ return update('components', id, patch); },
    deleteComponent(id){ remove('components', id); },

    listDesigns(designSystemId){ return list('designs', designSystemId ? { designSystemId } : null); },
    getDesign(id){ return get('designs', id); },
    createDesign(designSystemId, data){ return create('designs', 'dsg', Object.assign({ designSystemId: designSystemId }, data)); },
    updateDesign(id, patch){ return update('designs', id, patch); },
    deleteDesign(id){ remove('designs', id); },

    // acceso de solo lectura al blob completo, útil para debug/export
    dump(){ return JSON.parse(JSON.stringify(db)); },
    reset(){ db = seed(); persist(); emit('change', { coll: '*', type: 'reset' }); }
  };
})();
