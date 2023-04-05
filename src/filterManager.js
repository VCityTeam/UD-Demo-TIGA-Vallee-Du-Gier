import * as udviz from 'ud-viz';
import { FilterValidator } from './filterValidator';

export class FilterManager {
  constructor(view) {
    this.view = view;
    this.filters = {};
  }

  layerHasFilter(layerId) {
    for (const id in this.filters)
      if (this.filters[id].source.id == layerId) return true;
    return false;
  }

  layerIsFilter(layerId) {
    for (const id in this.filters) {
      if (this.filters[id].layer.id == layerId) return true;
    }
    return false;
  }

  getSourceForFilteredLayer(layerId) {
    for (const id in this.filters) {
      if (this.filters[id].layer.id == layerId) return this.filters[id].source;
    }
    return undefined;
  }

  addFilter(layer, filter) {
    let filterLayer = null;
    if (layer.isC3DTilesLayer) {
      filterLayer = this.filterCityObjectsByAttribute(layer, filter);
    } else {
      filterLayer = this.createTemporaryLayer(layer, filter);
      this.view.getItownsView().addLayer(filterLayer);
      this.view.layerManager.notifyChange();
    }
    const filterId = 'filter_' + Object.keys(this.filters).length;
    this.filters[filterId] = {
      layer: filterLayer,
      source: layer,
      properties: filter.properties,
    };
    return filterId;
  }

  removeFilter(filterId) {
    const filter = this.filters[filterId];
    if (filter.layer.isC3DTilesLayer) {
      // TODO
    } else {
      this.view.getItownsView().removeLayer(filter.layer.id, true);
      this.view.layerManager.notifyChange();
    }
    delete this.filters[filterId];
  }

  removeAllFilters() {
    const ids = Object.keys(this.filters);
    for (const id of ids) {
      this.removeFilter(id);
    }
  }

  createTemporaryLayer(layer, filter) {
    let source = null;
    let temporaryLayer = null;
    const id = 'temporary_' + Object.keys(this.filters).length;

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

  filterCityObjectsByAttribute(layer, filter) {
    for (const tilesManager of this.view.layerManager.tilesManagers) {
      if (tilesManager.layer.id == layer.id) {
        tilesManager.tiles.forEach((tile) => {
          if (tile.cityObjects != null) {
            tile.cityObjects.forEach((cityObject) => {
              if (
                filter.properties['attribute_values'].includes(
                  cityObject.props[filter.properties['attribute']]
                )
              ) {
                tilesManager.setStyle(
                  cityObject.cityObjectId,
                  filter.properties['style_accepted']
                );
              } else {
                tilesManager.setStyle(
                  cityObject.cityObjectId,
                  filter.properties['style_rejected']
                );
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
}
