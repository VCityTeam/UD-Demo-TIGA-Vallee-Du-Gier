/** @format */

import * as udviz from 'ud-viz';
import { FilterValidator } from './filterValidator';

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

    itownsView.addLayer(labelLayer);
  }
}

export function addFilterOnLayer(view, layer, filter, id) {
  if (layer.isC3DTilesLayer) {
    return filterCityObjectsByAttribute(view, layer, filter);
  } else {
    return createTemporaryLayer(layer, filter, id);
  }
}

export function removeFilterOnLayer(view, filter, setVisible=false) {
  if (filter.targetLayer.isC3DTilesLayer) {
    // TODO
  } else {
    view.getItownsView().removeLayer(filter.targetLayer.id, true);
    filter.sourceLayer.visible = setVisible;
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
    });
  } else if (layer.isColorLayer) {
    temporaryLayer = new udviz.itowns.ColorLayer(id, {
      name: id,
      transparent: true,
      source: source,
      style: layer.style,
    });
  }

  const validator = new FilterValidator(filter.properties);
  temporaryLayer.filter = (properties) => {
    return validator.validate(properties);
  };
  return temporaryLayer;
}

export function filterCityObjectsByAttribute(view, layer, filter) {
  for (const tilesManager of view.layerManager.tilesManagers) {
    if (tilesManager.layer.id == layer.id) {
      tilesManager.tiles.forEach((tile) => {
        if (tile.cityObjects != null) {
          tile.cityObjects.forEach((cityObject) => {
            if (filter.attributeValues.includes(cityObject.props[filter.attributeName])) {
              tilesManager.setStyle(cityObject.cityObjectId, filter.styleAccepted);
            } else {
              tilesManager.setStyle(cityObject.cityObjectId, filter.styleRejected);
            }
          });
          tilesManager.applyStyles({
            updateFunction: tilesManager.view.notifyChange.bind(
              tilesManager.view
            ),
          });
        }
      });
      break;
    }
  }
  return layer;
}
