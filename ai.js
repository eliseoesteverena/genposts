(function(){
  /* =========================================================
     AI — cliente delgado hacia /api/generate. No sabe nada de
     Store ni de las pantallas; solo arma el request correcto por
     "kind" y valida la forma de la respuesta antes de devolverla.
     ========================================================= */

  const ENDPOINT = window.GENERATE_ENDPOINT || '/api/generate';

  async function call(kind, prompt, ctx, images){
    let res;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: kind, prompt: prompt, context: ctx || {}, images: images || [] })
      });
    } catch (err) {
      throw new Error('No se pudo conectar con el servidor de IA: ' + err.message);
    }

    let data;
    try { data = await res.json(); }
    catch (e) { throw new Error('Respuesta del servidor no es JSON valido.'); }

    if (!res.ok) throw new Error(data.error || ('Error ' + res.status));
    return data.result;
  }

  /** Convierte un File (imagen) a { mimeType, data(base64 sin prefijo) } para mandar a Gemini. */
  function fileToInlinePart(file){
    return new Promise(function(resolve, reject){
      const reader = new FileReader();
      reader.onload = function(){
        const base64 = reader.result.split(',')[1];
        resolve({ mimeType: file.type, data: base64 });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  window.AI = {
    /** Genera/actualiza tokens de marca. ctx: { existingTokens }. */
    generateBrand(prompt, existingTokens, imageFiles){
      return Promise.all((imageFiles || []).map(fileToInlinePart)).then(function(images){
        return call('brand', prompt, { existingTokens: existingTokens }, images);
      });
    },

    /** Genera un componente (array de elementos). ctx: { tokens }. */
    generateComponent(prompt, tokens){
      return call('component', prompt, { tokens: tokens });
    },

    /** Genera un post desde cero. ctx: { tokens, components, anchoredElements }. */
    generatePost(prompt, tokens, components, imageFiles, anchoredElements){
      return Promise.all((imageFiles || []).map(fileToInlinePart)).then(function(images){
        return call('post', prompt, { tokens: tokens, availableComponents: components || [], anchoredElements: anchoredElements || [] }, images);
      });
    },

    /** "Basate en X": remix de un documento existente con contenido nuevo. */
    remixPost(prompt, templateDocument, tokens){
      return call('remix', prompt, { template: templateDocument, tokens: tokens });
    },

    /** Edita un elemento puntual por instrucción en lenguaje natural. */
    editElement(prompt, element, tokens){
      return call('edit-element', prompt, { element: element, tokens: tokens });
    }
  };
})();
