(function(){
  const REQUIRED_BY_TYPE = {
    rect: ['fill'],
    text: ['text', 'fontFamily', 'fontSize', 'color'],
    icon: ['name', 'color'],
    image: ['src', 'fit']
  };
  const ICON_NAMES = ['sparkle', 'doc', 'pin', 'arrow-right'];
  const ELEMENT_TYPES = ['rect', 'text', 'icon', 'image'];

  function validateElement(el, errors, prefix){
    ['id', 'type', 'x', 'y', 'width', 'height', 'zIndex', 'props'].forEach(function(k){
      if (!(k in el)) errors.push(prefix + ': falta "' + k + '"');
    });
    if (ELEMENT_TYPES.indexOf(el.type) === -1) {
      errors.push(prefix + ': type invalido "' + el.type + '"');
      return;
    }
    const req = REQUIRED_BY_TYPE[el.type] || [];
    req.forEach(function(k){
      if (!el.props || !(k in el.props)) errors.push(prefix + ' (' + el.type + '): falta props.' + k);
    });
    if (el.type === 'icon' && el.props && ICON_NAMES.indexOf(el.props.name) === -1) {
      errors.push(prefix + ': icon.name invalido "' + (el.props && el.props.name) + '"');
    }
    if (el.type === 'text' && el.props && el.props.align && ['left', 'center', 'right'].indexOf(el.props.align) === -1) {
      errors.push(prefix + ': align invalido');
    }
    if (el.type === 'image' && el.props && el.props.fit && ['contain', 'cover'].indexOf(el.props.fit) === -1) {
      errors.push(prefix + ': fit invalido');
    }
  }

  function validateDesignDocument(doc){
    const errors = [];
    if (!doc || typeof doc !== 'object') { return { valid: false, errors: ['el documento no es un objeto'] }; }
    if (!doc.meta) errors.push('falta "meta"');
    else {
      ['format', 'width', 'height', 'background'].forEach(function(k){
        if (!(k in doc.meta)) errors.push('meta.' + k + ' falta');
      });
      if (['square', 'portrait', 'story'].indexOf(doc.meta.format) === -1) errors.push('meta.format invalido');
    }
    if (!Array.isArray(doc.elements)) { errors.push('falta "elements" (array)'); return { valid: false, errors: errors }; }

    const ids = {};
    doc.elements.forEach(function(el, i){
      validateElement(el, errors, 'elements[' + i + ']' + (el && el.id ? ' (' + el.id + ')' : ''));
      if (el && el.id) {
        if (ids[el.id]) errors.push('id duplicado: ' + el.id);
        ids[el.id] = true;
      }
    });
    return { valid: errors.length === 0, errors: errors };
  }

  function validateComponentElements(elements){
    const errors = [];
    if (!Array.isArray(elements)) return { valid: false, errors: ['se esperaba un array de elementos'] };
    if (elements.length === 0) errors.push('el componente no tiene elementos');
    if (elements.length > 12) errors.push('demasiados elementos para un componente (' + elements.length + ')');
    const ids = {};
    elements.forEach(function(el, i){
      validateElement(el, errors, 'elements[' + i + ']' + (el && el.id ? ' (' + el.id + ')' : ''));
      if (el && el.id) {
        if (ids[el.id]) errors.push('id duplicado: ' + el.id);
        ids[el.id] = true;
      }
    });
    return { valid: errors.length === 0, errors: errors };
  }

  function validateBrandTokens(tokens){
    const errors = [];
    if (!tokens || typeof tokens !== 'object') return { valid: false, errors: ['no es un objeto'] };
    if (tokens.color && tokens.color.semantic) errors.push('no debe incluir color.semantic (solo primitivos)');
    const ALLOWED_TOP = ['color', 'fontFamily', 'dimension'];
    Object.keys(tokens).forEach(function(k){
      if (ALLOWED_TOP.indexOf(k) === -1) errors.push('clave no permitida en la raiz: ' + k);
    });
    return { valid: errors.length === 0, errors: errors };
  }

  window.Validate = { validateDesignDocument: validateDesignDocument, validateComponentElements: validateComponentElements, validateBrandTokens: validateBrandTokens };
})();
