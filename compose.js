(function(){
  function placeComponentElements(elements, canvasWidth, canvasHeight){
    if (!elements.length) return [];
    const minX = Math.min.apply(null, elements.map(function(e){ return e.x; }));
    const minY = Math.min.apply(null, elements.map(function(e){ return e.y; }));
    const maxX = Math.max.apply(null, elements.map(function(e){ return e.x + e.width; }));
    const maxY = Math.max.apply(null, elements.map(function(e){ return e.y + e.height; }));
    const bboxW = maxX - minX;
    const bboxH = maxY - minY;

    const offsetX = Math.round((canvasWidth - bboxW) / 2) - minX;
    const offsetY = Math.round(canvasHeight * 0.38) - minY;

    const suffix = '-anchor-' + Math.random().toString(36).slice(2, 7);
    return elements.map(function(e){
      return Object.assign({}, e, { id: e.id + suffix, x: e.x + offsetX, y: e.y + offsetY });
    });
  }

  function mergeAnchoredElements(aiDocument, anchoredElements){
    const anchoredIds = anchoredElements.map(function(e){ return e.id; });
    const filtered = aiDocument.elements.filter(function(e){ return anchoredIds.indexOf(e.id) === -1; });
    aiDocument.elements = anchoredElements.concat(filtered);
    return aiDocument;
  }

  window.Compose = { placeComponentElements: placeComponentElements, mergeAnchoredElements: mergeAnchoredElements };
})();
