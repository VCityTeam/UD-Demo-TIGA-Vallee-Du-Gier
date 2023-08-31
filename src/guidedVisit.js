import { MediaManager } from './mediaManager';
import { FilterManager } from './filterManager';
import { THREE } from 'ud-viz';

export class GuidedVisit {
  constructor(view, config, medias, mediaContainer) {
    this.view = view;
    this.config = config;
    this.medias = medias;
    this.mediaContainer = mediaContainer;
    this.id = this.config.id;
    this.currentIndex = this.config.startIndex;

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

  async goToNode(nodeIndex) {
    this.currentIndex = nodeIndex;
    const currentNode = this.getNode();
    this.filterLayers(currentNode.layers, currentNode.filters);
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
}
