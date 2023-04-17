import { Panel } from './panel';
import { MediaManager } from './mediaManager';
import { FilterManager } from './filterManager';
import { THREE } from 'ud-viz';

export class Visit {
  constructor(view, medias) {
    this.id = 'NONE';
    this.config = null;
    this.medias = medias;
    this.currentIndex = 0;
    this.view = view;

    this.panel = new Panel();
    this.mediaManager = new MediaManager(view);
    this.filterManager = new FilterManager(view);
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

  filterLayers(layerIds, filters = undefined) {
    this.filterManager.removeAllFilters();

    this.view.layerManager.getLayers().forEach((layer) => {
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          if (filter.layer == layer.id) {
            this.filterManager.addFilter(layer, filter);
          }
        });
      }
      if (this.filterManager.layerHasFilter(layer.id)) {
        if (layer.isC3DTilesLayer) layer.visible = true;
        else layer.visible = false;
      } else {
        layer.visible =
          layerIds == undefined ||
          layerIds.includes(layer.id) ||
          layer.id == 'planar';
      }
    });
  }

  setMedia(node) {
    this.panel.cleanMediaContainer();
    if (node.medias && node.medias.length > 0) {
      node.medias.forEach((nodeMedia) => {
        const media = this.medias.find((m) => m.id == nodeMedia);
        if (media) {
          this.mediaManager
            .addContent(media, this.panel.mediaContainer)
            .then(() => {
              this.panel.setForm(this.currentIndex);
            });
        }
      });
    }
  }

  createLayersCaption() {
    this.panel.footerPanel.innerHTML = '';
    this.view.layerManager.getLayers().forEach((layer) => {
      if (layer.visible) {
        const id = this.filterManager.layerIsFilter(layer.id)
          ? this.filterManager.getSourceForFilteredLayer(layer.id).id
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
