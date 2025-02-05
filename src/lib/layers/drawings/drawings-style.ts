import type { FilterSpecification, LayerSpecification } from 'maplibre-gl';

export const circleColor = '#000000';
export const lineColor = '#777777';
export const polygonColor = '#000000';
export const hiddenColor = '#888888';
const activeColor = 'orange';
const vertexColor = '#ffffff';

type Layer = Omit<LayerSpecification, 'source'> & { filter: FilterSpecification };

export const editorDrawingStyles: Layer[] = [
  // Polygons
  {
    id: 'gl-draw-polygon-fill',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
    paint: {
      'fill-color': ['case', ['==', ['get', 'active'], 'true'], activeColor, polygonColor],
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-line',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon']],
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'active'], 'true'],
        activeColor,
        ['has', 'user_color'],
        ['get', 'user_color'],
        polygonColor,
      ],
      'line-width': 3.5,
      'line-opacity': 0.7,
    },
  },
  // Lines
  {
    id: 'gl-draw-lines',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString']],
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'active'], 'true'],
        activeColor,
        ['has', 'user_color'],
        ['get', 'user_color'],
        lineColor,
      ],
      'line-width': 3.5,
      'line-opacity': 0.7,
    },
  },
  // Points
  {
    id: 'gl-draw-point',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    paint: {
      'circle-radius': 7,
      'circle-color': 'transparent',
      'circle-stroke-color': [
        'case',
        ['==', ['get', 'active'], 'true'],
        activeColor,
        ['has', 'user_color'],
        ['get', 'user_color'],
        circleColor,
      ],
      'circle-stroke-width': 3,
      'circle-opacity': 0.7,
    },
  },
  // Vertex
  //   Visible when editing polygons and lines
  {
    id: 'gl-draw-vertex-outer',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'vertex'],
      ['!=', 'mode', 'simple_select'],
    ],
    paint: {
      'circle-radius': 7,
      'circle-color': activeColor,
    },
  },
  {
    id: 'gl-draw-vertex-inner',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'vertex'],
      ['!=', 'mode', 'simple_select'],
      ['!=', 'active', 'true'],
    ],
    paint: {
      'circle-radius': 5,
      'circle-color': vertexColor,
    },
  },
  // Midpoint
  //   Visible when editing polygons and lines
  {
    id: 'gl-draw-midpoint',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 5,
      'circle-color': vertexColor,
      'circle-opacity': 0.7,
    },
  },
];
