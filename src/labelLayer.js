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
    });

    itownsView.addLayer(labelLayer);
  }
}
