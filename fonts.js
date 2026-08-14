(function(){
  const PAIRS = [
    { id: 'editorial-calido', name: 'Editorial calido', heading: 'Fraunces', headingWeight: '600', body: 'Hanken Grotesk', bodyWeight: '400' },
    { id: 'clasico-elegante', name: 'Clasico elegante', heading: 'Playfair Display', headingWeight: '700', body: 'Inter', bodyWeight: '400' },
    { id: 'moderno-saas', name: 'Moderno / SaaS', heading: 'Space Grotesk', headingWeight: '600', body: 'Inter', bodyWeight: '400' },
    { id: 'familia-armonica', name: 'Familia armonica', heading: 'DM Serif Display', headingWeight: '400', body: 'DM Sans', bodyWeight: '400' },
    { id: 'magazine-bold', name: 'Magazine / bold', heading: 'Bricolage Grotesque', headingWeight: '700', body: 'Hanken Grotesk', bodyWeight: '400' },
    { id: 'suave-amigable', name: 'Suave y amigable', heading: 'DM Serif Text', headingWeight: '400', body: 'Plus Jakarta Sans', bodyWeight: '400' },
    { id: 'corporativo-limpio', name: 'Corporativo limpio', heading: 'Manrope', headingWeight: '700', body: 'Manrope', bodyWeight: '400' },
    { id: 'literario', name: 'Literario', heading: 'Newsreader', headingWeight: '500', body: 'Inter', bodyWeight: '400' },
    { id: 'alto-impacto', name: 'Alto impacto', heading: 'Funnel Display', headingWeight: '700', body: 'Funnel Sans', bodyWeight: '400' },
    { id: 'serio-accesible', name: 'Serio y accesible', heading: 'PT Serif', headingWeight: '700', body: 'Open Sans', bodyWeight: '400' },
    { id: 'con-caracter', name: 'Con caracter', heading: 'EB Garamond', headingWeight: '600', body: 'Source Sans 3', bodyWeight: '400' },
    { id: 'tecnico', name: 'Tecnico', heading: 'JetBrains Mono', headingWeight: '700', body: 'Inter', bodyWeight: '400' }
  ];

  // Mapeo explicito de fallback generico por familia — nunca adivinar por el
  // nombre (ej. "Playfair Display" es serif pero no contiene la palabra
  // "serif", una regex sobre el string da falso negativo).
  const GENERIC_FALLBACK = {
    'Fraunces': 'serif', 'Playfair Display': 'serif', 'DM Serif Display': 'serif',
    'DM Serif Text': 'serif', 'Newsreader': 'serif', 'PT Serif': 'serif', 'EB Garamond': 'serif',
    'Space Grotesk': 'sans-serif', 'Hanken Grotesk': 'sans-serif', 'DM Sans': 'sans-serif',
    'Bricolage Grotesque': 'sans-serif', 'Plus Jakarta Sans': 'sans-serif', 'Manrope': 'sans-serif',
    'Funnel Display': 'sans-serif', 'Funnel Sans': 'sans-serif', 'Open Sans': 'sans-serif',
    'Source Sans 3': 'sans-serif', 'Inter': 'sans-serif',
    'JetBrains Mono': 'monospace'
  };

  function cssStack(family){
    return "'" + family + "', " + (GENERIC_FALLBACK[family] || 'sans-serif');
  }

  function injectStylesheet(){
    const families = {};
    PAIRS.forEach(function(p){
      families[p.heading] = families[p.heading] || {};
      families[p.heading][p.headingWeight] = true;
      families[p.body] = families[p.body] || {};
      families[p.body][p.bodyWeight] = true;
    });
    const parts = Object.keys(families).map(function(fam){
      const weights = Object.keys(families[fam]).sort().join(';');
      return 'family=' + encodeURIComponent(fam).replace(/%20/g, '+') + ':wght@' + weights;
    });
    const url = 'https://fonts.googleapis.com/css2?' + parts.join('&') + '&display=swap';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStylesheet);
    else injectStylesheet();
  }

  window.FontPairs = { list: PAIRS, cssStack: cssStack };
})();
