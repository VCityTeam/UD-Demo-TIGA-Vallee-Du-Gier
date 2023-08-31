import { MediaManager } from './mediaManager';
import { FilterManager } from './filterManager';
import { createCaption } from './captionUtils';
import { THREE } from 'ud-viz';

export class GuidedVisit {
  constructor(view, medias) {
    this.id = 'NONE';
    this.config = null;
    this.medias = medias;
    this.currentIndex = 0;
    this.view = view;
    this.mediaContainer = null;

    this.mediaManager = new MediaManager(view);
    this.filterManager = new FilterManager(view);
  }

  isStart() {
    return this.currentIndex == this.config.startIndex;
  }

  isEnd() {
    return this.currentIndex == this.config.endIndex;
  }

  getNode() {
    return this.config.nodes[this.currentIndex];
  }

  init(visitConfig, captionConfig, mediaContainer) {
    this.config = visitConfig;
    this.captionConfig = captionConfig;
    this.id = this.config.id;
    this.currentIndex = this.config.startIndex;
    this.mediaContainer = mediaContainer;
  }

  async goToNode(nodeIndex) {
    this.currentIndex = nodeIndex;
    const currentNode = this.getNode();
    this.filterLayers(currentNode.layers, currentNode.filters);
    this.createLayersCaption();
    this.travelToPosition(currentNode, this.view);
    await this.setMedia(currentNode);
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
    this.view.layerManager.notifyChange();
  }

  async setMedia(node) {
    this.mediaContainer.innerHTML = '';
    if (node.medias && node.medias.length > 0) {
      for (const nodeMedia of node.medias) {
        const media = this.medias.find((m) => m.id == nodeMedia);
        if (media) {
          await this.mediaManager.addContent(media, this.mediaContainer);
        }
      }
    }
  }

  createLayersCaption() {
    let hasCaption = false;
    const layerPanel = document.getElementById('layer_panel');
    layerPanel.innerHTML = '';
    this.view.layerManager.getLayers().forEach((layer) => {
      if (layer.visible) {
        const id = this.filterManager.layerIsFilter(layer.id)
          ? this.filterManager.getSourceForFilteredLayer(layer.id).id
          : layer.id;
        for (const layerCaption of this.captionConfig.layers) {
          if (id == layerCaption.id) {
            hasCaption = true;
            layerPanel.appendChild(
              createCaption(layerCaption.style, layerCaption.description, 10)
            );
            break;
          }
        }
      }
    });
    if (hasCaption)
      document.getElementById('layer_div').style.display = 'block';
    else document.getElementById('layer_div').style.display = 'none';
  }
}
