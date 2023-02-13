/** @format */

import * as udviz from 'ud-viz';

export function addLabelLayers(config, itownsView) {
  for (const layer of config['LabelLayers']) {
    // Declare the data source for the layer
    const labelSource = new udviz.itowns.FileSource({
      url: layer.url,
      crs: 'EPSG:3946',
      format: 'application/json',
    });

    const labelStyle = new udviz.itowns.Style(layer.style);

    const labelLayer = new udviz.itowns.LabelLayer(layer.id, {
      source: labelSource,
      style: labelStyle,
      zoom: layer.zoom,
    });

    console.log(labelLayer);
    itownsView.addLayer(labelLayer);
  }
}

export function createTemporaryLayer(layer, filter, id) {
  let source = null;
  let temporaryLayer = null;

  if (layer.source.isFileSource) {
    source = new udviz.itowns.FileSource({
      url: layer.source.url,
      crs: 'EPSG:3946',
      format: 'application/json',
    });
  }

  if (layer.isLabelLayer) {
    temporaryLayer = new udviz.itowns.LabelLayer(id, {
      source: source,
      style: layer.style,
      zoom: layer.zoom,
      filter: (properties) => {return properties.id > 0;}
    });
  }

  return temporaryLayer;
}
