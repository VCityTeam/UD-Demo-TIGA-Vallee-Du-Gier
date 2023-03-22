import { Panel } from './panel';
import { MediaManager } from './mediaManager';
import { THREE } from 'ud-viz';
import {
  addFilterOnLayer,
  removeFilterOnLayer,
} from './layerUtils';

export class Visit {
  constructor(view, medias) {
    this.id = 'NONE';
    this.config = null;
    this.medias = medias;
    this.currentIndex = 0;
    this.view = view;
    this.modifiedCityObjects = [];
    this.layerFilters = [];

    this.panel = new Panel();
    this.mediaManager = new MediaManager(view);
  }

  start(config, captionConfig) {
    this.config = config;
    this.captionConfig = captionConfig;
  }

  reset() {
    this.id = 'NONE';
    this.config = null;
    this.currentIndex = 0;
    this.panel.reset();
  }

  travelToPosition(node, view) {
    if (node.position && node.rotation) {
      const newCameraCoordinates = new THREE.Vector3(
        node.position.x,
        node.position.y,
        node.position.z
      );
      const newCameraQuaternion = new THREE.Quaternion(
        node.rotation.x,
        node.rotation.y,
        node.rotation.z,
        node.rotation.w
      );
      view
        .getItownsView()
        .controls.initiateTravel(
          newCameraCoordinates,
          'auto',
          newCameraQuaternion,
          true
        );
    }
  }

  layerHasFilter(layerId) {
    for (const filter of this.layerFilters) {
      if (filter.sourceLayer.id == layerId) return true;
    }
    return false;
  }

  layerIsFilter(layerId) {
    for (const filter of this.layerFilters) {
      if (filter.targetLayer.id == layerId) return true;
    }
    return false;
  }

  getSourceForFilteredLayer(layerId) {
    for (const filter of this.layerFilters) {
      if (filter.targetLayer.id == layerId) return filter.sourceLayer;
    }
    return undefined;
  }

  filterLayers(layerIds, filters = undefined) {
    this.layerFilters.forEach((filter) => {
      removeFilterOnLayer(this.view, filter);
    });
    this.layerFilters = [];

    this.view.layerManager.getLayers().forEach((layer) => {
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          if (filter.layer == layer.id) {
            const temporaryLayer = addFilterOnLayer(
              this.view,
              layer,
              filter,
              'temporary_' + this.layerFilters.length
            );
            this.layerFilters.push({
              sourceLayer: layer,
              targetLayer: temporaryLayer,
            });
          }
        });
      }
      if (!this.layerHasFilter(layer.id)) {
        layer.visible =
          layerIds == undefined ||
          layerIds.includes(layer.id) ||
          layer.id == 'planar';
      }
    });
  }

  setMedia(node) {
    if (node.media) {
      const media = this.medias.find((m) => m.id == node.media);
      if (media) {
        this.panel.mediaContainer.style.display = 'block';
        this.mediaManager.setContent(media, this.panel.mediaContainer);
      }
    } else {
      this.panel.cleanMediaContainer();
    }
  }

  createLayersCaption() {
    this.panel.footerPanel.innerHTML = '';
    this.view.layerManager.getLayers().forEach((layer) => {
      if (layer.visible) {
        const id = this.layerIsFilter(layer.id)
          ? this.getSourceForFilteredLayer(layer.id).id
          : layer.id;
        for (const layerCaption of this.captionConfig.layers) {
          if (id == layerCaption.id) {
            this.panel.footerPanel.appendChild(
              this.panel.createCaption(
                layerCaption.style,
                layerCaption.description,
                15
              )
            );
            break;
          }
        }
      }
    });
  }
}
