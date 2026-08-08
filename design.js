// Copia embebida de design.json (ver nota igual en design.js anterior: evita fallas de
// fetch()/CORS si index.html se abre directo con file://). tokens.json tiene su propia
// copia embebida en tokens.js por el mismo motivo.
window.DEFAULT_DESIGN = {
  "meta": {
    "format": "square",
    "width": 1080,
    "height": 1080,
    "background": "{color.semantic.surface}"
  },
  "elements": [
    {
      "id": "bg-frame",
      "name": "Marco de fondo",
      "type": "rect",
      "x": 40,
      "y": 40,
      "width": 1000,
      "height": 1000,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 0,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "fill": "{color.semantic.surface}",
        "stroke": "{color.semantic.border}",
        "strokeWidth": "{dimension.stroke-width.bold}",
        "radius": 44,
        "shadowX": "{dimension.shadow-offset.lg}",
        "shadowY": "{dimension.shadow-offset.lg}",
        "shadowColor": "{color.semantic.shadow}"
      }
    },
    {
      "id": "sparkle-1",
      "name": "Destello grande",
      "type": "icon",
      "x": 860,
      "y": 96,
      "width": 64,
      "height": 64,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 5,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "name": "sparkle",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "sparkle-2",
      "name": "Destello chico 1",
      "type": "icon",
      "x": 64,
      "y": 300,
      "width": 34,
      "height": 34,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 5,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "name": "sparkle",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "sparkle-3",
      "name": "Destello chico 2",
      "type": "icon",
      "x": 930,
      "y": 540,
      "width": 46,
      "height": 46,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 5,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "name": "sparkle",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "logo-badge",
      "name": "Placa del logo",
      "type": "rect",
      "x": 96,
      "y": 96,
      "width": 176,
      "height": 84,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 9,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "fill": "{color.semantic.surface-card}",
        "stroke": "{color.semantic.border}",
        "strokeWidth": "{dimension.stroke-width.bold}",
        "radius": "{dimension.radius.lg}",
        "shadowX": "{dimension.shadow-offset.sm}",
        "shadowY": "{dimension.shadow-offset.sm}",
        "shadowColor": "{color.semantic.shadow}"
      }
    },
    {
      "id": "logo-mark",
      "name": "Isotipo 99copias",
      "type": "image",
      "x": 118,
      "y": 110,
      "width": 132,
      "height": 56,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "src": "brand:logo99",
        "fit": "contain",
        "status": "ready"
      }
    },
    {
      "id": "title",
      "name": "Título",
      "type": "text",
      "x": 96,
      "y": 220,
      "width": 860,
      "height": 220,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "Impresión rápida\nal mejor precio",
        "fontFamily": "{fontFamily.serif}",
        "fontSize": 74,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text}",
        "lineHeight": 1.08,
        "align": "left",
        "highlightWords": [
          "rápida"
        ]
      }
    },
    {
      "id": "price1-card",
      "name": "Tarjeta B/N",
      "type": "rect",
      "x": 96,
      "y": 478,
      "width": 415,
      "height": 224,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 8,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "fill": "{color.semantic.surface-card}",
        "stroke": "{color.semantic.border}",
        "strokeWidth": "{dimension.stroke-width.bold}",
        "radius": "{dimension.radius.xl}",
        "shadowX": "{dimension.shadow-offset.md}",
        "shadowY": "{dimension.shadow-offset.md}",
        "shadowColor": "{color.semantic.shadow}"
      }
    },
    {
      "id": "price1-icon",
      "name": "Ícono B/N",
      "type": "icon",
      "x": 456,
      "y": 506,
      "width": 46,
      "height": 46,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "name": "doc",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "price1-label",
      "name": "Label B/N",
      "type": "text",
      "x": 128,
      "y": 506,
      "width": 300,
      "height": 40,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "Blanco y Negro",
        "fontFamily": "{fontFamily.sans}",
        "fontSize": 30,
        "fontWeight": "{fontWeight.bold}",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "price1-price",
      "name": "Precio B/N",
      "type": "text",
      "x": 128,
      "y": 584,
      "width": 260,
      "height": 90,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "$50",
        "fontFamily": "{fontFamily.serif}",
        "fontSize": 74,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "price1-unit",
      "name": "Unidad B/N",
      "type": "text",
      "x": 252,
      "y": 622,
      "width": 150,
      "height": 40,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "/carilla",
        "fontFamily": "{fontFamily.sans}",
        "fontSize": 26,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text-muted}"
      }
    },
    {
      "id": "price2-card",
      "name": "Tarjeta Color",
      "type": "rect",
      "x": 541,
      "y": 478,
      "width": 415,
      "height": 224,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 8,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "fill": "{color.semantic.surface-accent}",
        "stroke": "{color.semantic.border}",
        "strokeWidth": "{dimension.stroke-width.bold}",
        "radius": "{dimension.radius.xl}",
        "shadowX": "{dimension.shadow-offset.md}",
        "shadowY": "{dimension.shadow-offset.md}",
        "shadowColor": "{color.semantic.shadow}"
      }
    },
    {
      "id": "price2-icon",
      "name": "Ícono Color",
      "type": "icon",
      "x": 901,
      "y": 506,
      "width": 46,
      "height": 46,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "name": "doc",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "price2-label",
      "name": "Label Color",
      "type": "text",
      "x": 573,
      "y": 506,
      "width": 260,
      "height": 40,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "Color",
        "fontFamily": "{fontFamily.sans}",
        "fontSize": 30,
        "fontWeight": "{fontWeight.bold}",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "price2-price",
      "name": "Precio Color",
      "type": "text",
      "x": 573,
      "y": 584,
      "width": 280,
      "height": 90,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "$150",
        "fontFamily": "{fontFamily.serif}",
        "fontSize": 74,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "price2-unit",
      "name": "Unidad Color",
      "type": "text",
      "x": 730,
      "y": 622,
      "width": 150,
      "height": 40,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "/carilla",
        "fontFamily": "{fontFamily.sans}",
        "fontSize": 26,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text-muted}"
      }
    },
    {
      "id": "zones-title",
      "name": "Título zonas",
      "type": "text",
      "x": 96,
      "y": 748,
      "width": 400,
      "height": 32,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "ZONAS DE ENTREGA",
        "fontFamily": "{fontFamily.mono}",
        "fontSize": 20,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text-muted}"
      }
    },
    {
      "id": "zone1-icon",
      "name": "Pin 1",
      "type": "icon",
      "x": 96,
      "y": 800,
      "width": 20,
      "height": 26,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "name": "pin",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "zone1-label",
      "name": "Zona 1",
      "type": "text",
      "x": 124,
      "y": 798,
      "width": 240,
      "height": 32,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "Sede UBA Drago",
        "fontFamily": "{fontFamily.sans}",
        "fontSize": 28,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "zone2-icon",
      "name": "Pin 2",
      "type": "icon",
      "x": 380,
      "y": 800,
      "width": 20,
      "height": 26,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "name": "pin",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "zone2-label",
      "name": "Zona 2",
      "type": "text",
      "x": 408,
      "y": 798,
      "width": 240,
      "height": 32,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "Estación Belgrano C",
        "fontFamily": "{fontFamily.sans}",
        "fontSize": 28,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "zone3-icon",
      "name": "Pin 3",
      "type": "icon",
      "x": 730,
      "y": 800,
      "width": 20,
      "height": 26,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "name": "pin",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "zone3-label",
      "name": "Zona 3",
      "type": "text",
      "x": 758,
      "y": 798,
      "width": 240,
      "height": 32,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "Estación Belgrano R",
        "fontFamily": "{fontFamily.sans}",
        "fontSize": 28,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "cta-pill",
      "name": "Botón CTA",
      "type": "rect",
      "x": 340,
      "y": 880,
      "width": 400,
      "height": 88,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 8,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "fill": "{gradient.brand-rainbow}",
        "stroke": "{color.semantic.border}",
        "strokeWidth": "{dimension.stroke-width.bold}",
        "radius": "{dimension.radius.full}",
        "shadowX": "{dimension.shadow-offset.md}",
        "shadowY": "{dimension.shadow-offset.md}",
        "shadowColor": "{color.semantic.shadow}"
      }
    },
    {
      "id": "cta-label",
      "name": "Texto CTA",
      "type": "text",
      "x": 340,
      "y": 900,
      "width": 340,
      "height": 50,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "Chequeá turnos",
        "fontFamily": "{fontFamily.sans}",
        "fontSize": 34,
        "fontWeight": "{fontWeight.bold}",
        "color": "{color.semantic.text}",
        "align": "center"
      }
    },
    {
      "id": "cta-arrow",
      "name": "Flecha CTA",
      "type": "icon",
      "x": 670,
      "y": 900,
      "width": 34,
      "height": 50,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "name": "arrow-right",
        "color": "{color.semantic.text}"
      }
    },
    {
      "id": "feature-photo",
      "name": "Foto (subir)",
      "type": "image",
      "x": 96,
      "y": 478,
      "width": 0,
      "height": 0,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 7,
      "locked": false,
      "visible": false,
      "groupId": null,
      "props": {
        "src": null,
        "fit": "cover",
        "alt": "Foto del local",
        "status": "empty"
      }
    },
    {
      "id": "url",
      "name": "URL",
      "type": "text",
      "x": 0,
      "y": 992,
      "width": 1080,
      "height": 40,
      "rotation": 0,
      "opacity": 1,
      "zIndex": 10,
      "locked": false,
      "visible": true,
      "groupId": null,
      "props": {
        "text": "app.99copias.com.ar/impresion-rapida",
        "fontFamily": "{fontFamily.mono}",
        "fontSize": 22,
        "color": "{color.semantic.text-muted}",
        "align": "center"
      }
    }
  ]
};
