// Componentes ("recetas") semilla: grupos de elementos reusables, coordenadas
// relativas a (0,0). Store.js los clona para cada Design System nuevo.
window.DEFAULT_COMPONENTS = [
  {
    "name": "Tarjeta de precio",
    "description": "Fondo + ícono + label + precio + unidad. Coordenadas relativas a (0,0) — se reposicionan al insertar en un diseño.",
    "elements": [
      {
        "id": "card-bg",
        "name": "Fondo",
        "type": "rect",
        "x": 0,
        "y": 0,
        "width": 415,
        "height": 224,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 0,
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
        "id": "card-icon",
        "name": "Ícono",
        "type": "icon",
        "x": 360,
        "y": 28,
        "width": 46,
        "height": 46,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 2,
        "locked": false,
        "visible": true,
        "groupId": null,
        "props": {
          "name": "doc",
          "color": "{color.semantic.text}"
        }
      },
      {
        "id": "card-label",
        "name": "Label",
        "type": "text",
        "x": 32,
        "y": 28,
        "width": 300,
        "height": 40,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 2,
        "locked": false,
        "visible": true,
        "groupId": null,
        "props": {
          "text": "Servicio",
          "fontFamily": "{fontFamily.sans}",
          "fontSize": 30,
          "fontWeight": "{fontWeight.bold}",
          "color": "{color.semantic.text}"
        }
      },
      {
        "id": "card-price",
        "name": "Precio",
        "type": "text",
        "x": 32,
        "y": 106,
        "width": 260,
        "height": 90,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 2,
        "locked": false,
        "visible": true,
        "groupId": null,
        "props": {
          "text": "$0",
          "fontFamily": "{fontFamily.serif}",
          "fontSize": 74,
          "fontWeight": "{fontWeight.semibold}",
          "color": "{color.semantic.text}"
        }
      },
      {
        "id": "card-unit",
        "name": "Unidad",
        "type": "text",
        "x": 156,
        "y": 144,
        "width": 150,
        "height": 40,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 2,
        "locked": false,
        "visible": true,
        "groupId": null,
        "props": {
          "text": "/unidad",
          "fontFamily": "{fontFamily.sans}",
          "fontSize": 26,
          "fontWeight": "{fontWeight.semibold}",
          "color": "{color.semantic.text-muted}"
        }
      }
    ]
  },
  {
    "name": "Botón CTA (pill)",
    "description": "Fondo degradé + texto + flecha. Reusa el acento de marca reservado para el elemento de mayor jerarquía.",
    "elements": [
      {
        "id": "cta-bg",
        "name": "Fondo",
        "type": "rect",
        "x": 0,
        "y": 0,
        "width": 400,
        "height": 88,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 0,
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
        "id": "cta-text",
        "name": "Texto",
        "type": "text",
        "x": 0,
        "y": 20,
        "width": 340,
        "height": 50,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 2,
        "locked": false,
        "visible": true,
        "groupId": null,
        "props": {
          "text": "Llamado a la acción",
          "fontFamily": "{fontFamily.sans}",
          "fontSize": 34,
          "fontWeight": "{fontWeight.bold}",
          "color": "{color.semantic.text}",
          "align": "center"
        }
      },
      {
        "id": "cta-arrow",
        "name": "Flecha",
        "type": "icon",
        "x": 330,
        "y": 20,
        "width": 34,
        "height": 50,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 2,
        "locked": false,
        "visible": true,
        "groupId": null,
        "props": {
          "name": "arrow-right",
          "color": "{color.semantic.text}"
        }
      }
    ]
  },
  {
    "name": "Tag con pin (zona/ubicación)",
    "description": "Ícono de pin + texto corto. Pensado para listas de ubicaciones/horarios repetidas.",
    "elements": [
      {
        "id": "tag-icon",
        "name": "Pin",
        "type": "icon",
        "x": 0,
        "y": 2,
        "width": 20,
        "height": 26,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 0,
        "locked": false,
        "visible": true,
        "groupId": null,
        "props": {
          "name": "pin",
          "color": "{color.semantic.text}"
        }
      },
      {
        "id": "tag-label",
        "name": "Texto",
        "type": "text",
        "x": 28,
        "y": 0,
        "width": 240,
        "height": 32,
        "rotation": 0,
        "opacity": 1,
        "zIndex": 1,
        "locked": false,
        "visible": true,
        "groupId": null,
        "props": {
          "text": "Ubicación",
          "fontFamily": "{fontFamily.sans}",
          "fontSize": 28,
          "fontWeight": "{fontWeight.semibold}",
          "color": "{color.semantic.text}"
        }
      }
    ]
  }
];
