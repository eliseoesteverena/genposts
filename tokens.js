// Copia embebida de tokens.json como objeto JS (ver nota en design.js: evita fallas de
// fetch()/CORS al abrir index.html con file://). tokens.json es la fuente 'oficial' legible;
// esta es la que corre en runtime y la que edita el panel de Tokens de la UI.
window.DEFAULT_TOKENS = {
  "$description": "Design tokens del generador de posts de 99copias, en formato W3C Design Tokens Community Group (DTCG) 2025.10 — https://www.designtokens.org/tr/drafts/format/. Estructura en dos capas: 'primitive' (valores crudos, sin significado semántico) y 'semantic' (alias con nombre de uso, ej. color.semantic.surface). Los elementos del documento de diseño referencian preferentemente tokens semánticos.",
  "color": {
    "$type": "color",
    "primitive": {
      "ink": {
        "$value": "#131211"
      },
      "ink-60": {
        "$value": "rgba(19,18,17,0.62)"
      },
      "ink-40": {
        "$value": "rgba(19,18,17,0.42)"
      },
      "ink-15": {
        "$value": "rgba(19,18,17,0.15)"
      },
      "paper": {
        "$value": "#f7f5f0"
      },
      "white": {
        "$value": "#ffffff"
      },
      "yellow": {
        "$value": "#f5d949"
      },
      "yellow-pale": {
        "$value": "#faf0c2"
      },
      "mint": {
        "$value": "#cdf2dd"
      },
      "pink": {
        "$value": "#ffd9e3"
      },
      "danger": {
        "$value": "#c0392b"
      }
    },
    "semantic": {
      "text": {
        "$value": "{color.primitive.ink}",
        "$description": "Color de texto principal sobre fondo claro."
      },
      "text-muted": {
        "$value": "{color.primitive.ink-60}"
      },
      "surface": {
        "$value": "{color.primitive.paper}",
        "$description": "Fondo base del lienzo."
      },
      "surface-card": {
        "$value": "{color.primitive.white}",
        "$description": "Fondo de tarjetas/plates sobre 'surface'."
      },
      "surface-accent": {
        "$value": "{color.primitive.yellow-pale}",
        "$description": "Fondo de tarjeta/bloque destacado."
      },
      "border": {
        "$value": "{color.primitive.ink}",
        "$description": "Color estándar de borde/trazo duro."
      },
      "shadow": {
        "$value": "{color.primitive.ink}",
        "$description": "Color estándar de sombra offset dura."
      }
    }
  },
  "dimension": {
    "$type": "dimension",
    "radius": {
      "sm": {
        "$value": "6px"
      },
      "md": {
        "$value": "8px"
      },
      "lg": {
        "$value": "20px"
      },
      "xl": {
        "$value": "28px"
      },
      "full": {
        "$value": "999px"
      }
    },
    "stroke-width": {
      "hairline": {
        "$value": "1.5px"
      },
      "bold": {
        "$value": "3px"
      }
    },
    "shadow-offset": {
      "sm": {
        "$value": "3px"
      },
      "md": {
        "$value": "6px"
      },
      "lg": {
        "$value": "10px"
      }
    }
  },
  "fontFamily": {
    "$type": "fontFamily",
    "serif": {
      "$value": "'Fraunces', Georgia, 'Times New Roman', serif",
      "$description": "Titulares editoriales."
    },
    "sans": {
      "$value": "'Geist Sans', -apple-system, 'Segoe UI', sans-serif",
      "$description": "Texto de uso general."
    },
    "mono": {
      "$value": "'Geist Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
      "$description": "Eyebrows, URLs, datos."
    }
  },
  "fontWeight": {
    "$type": "fontWeight",
    "regular": {
      "$value": 400
    },
    "medium": {
      "$value": 500
    },
    "semibold": {
      "$value": 600
    },
    "bold": {
      "$value": 700
    }
  },
  "gradient": {
    "$type": "gradient",
    "$description": "Extensión de proyecto sobre DTCG: $type 'gradient' no es aún parte del core spec, pero es la convención de facto usada por Tokens Studio/Style Dictionary. $value = { angle, stops: [{color, position}] }.",
    "brand-rainbow": {
      "$value": {
        "angle": 90,
        "stops": [
          {
            "color": "#ffb4c6",
            "position": 0
          },
          {
            "color": "#ffd7a8",
            "position": 22
          },
          {
            "color": "#fff3a0",
            "position": 42
          },
          {
            "color": "#c9f0c4",
            "position": 62
          },
          {
            "color": "#b8dcff",
            "position": 80
          },
          {
            "color": "#d7bdff",
            "position": 100
          }
        ]
      }
    }
  }
};
