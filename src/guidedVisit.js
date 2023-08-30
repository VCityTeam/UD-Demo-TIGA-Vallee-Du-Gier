import { Panel } from './panel';
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

    this.panel = new Panel();
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

  addVisitPanelEvents() {
    this.panel.previousButton.addEventListener(
      'click',
      function () {
        this.goToPreviousNode();
      }.bind(this)
    );
    this.panel.nextButton.addEventListener(
      'click',
      function () {
        this.goToNextNode();
      }.bind(this)
    );
  }

  init(visitConfig, captionConfig) {
    this.config = visitConfig;
    this.captionConfig = captionConfig;
    this.id = this.config.id;
    this.currentIndex = this.config.startIndex;
    const menuButton = document.getElementById('menu_header_button');
    menuButton.addEventListener('click', function () {
      const menuPanel = document.getElementById('menu_panel');
      if (menuPanel.classList.contains('menu_panel_closed'))
        menuPanel.classList.replace('menu_panel_closed', 'menu_panel_open');
      else menuPanel.classList.replace('menu_panel_open', 'menu_panel_closed');
    });
    const layerButton = document.getElementById('layer_button');
    layerButton.addEventListener(
      'click',
      function () {
        const layerPanel = document.getElementById('layer_panel');
        if (this.layerPanelOpen) {
          layerPanel.style.display = 'none';
        } else {
          layerPanel.style.display = 'flex';
        }
        this.layerPanelOpen = !this.layerPanelOpen;
      }.bind(this)
    );
  }

  start() {
    this.addVisitPanelEvents();
    this.goToNode(this.currentIndex);
  }

  goToNode(nodeIndex) {
    this.panel.saveInputValues(this.currentIndex);
    this.currentIndex = nodeIndex;
    const currentNode = this.getNode();
    this.panel.setWidth(currentNode.type);
    this.panel.setButtonsStyle(this.isStart(), this.isEnd());
    this.setMedia(currentNode);
    this.filterLayers(currentNode.layers, currentNode.filters);
    this.createLayersCaption();
    this.travelToPosition(currentNode, this.view);
  }

  goToPreviousNode() {
    const previousIndex = this.getNode().previous;
    this.goToNode(previousIndex);
  }

  goToNextNode() {
    const nextIndex = this.getNode().next;
    this.goToNode(nextIndex);
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

  setMedia(node) {
    this.panel.cleanMediaContainer();
    if (node.medias && node.medias.length > 0) {
      node.medias.forEach((nodeMedia) => {
        const media = this.medias.find((m) => m.id == nodeMedia);
        if (media) {
          if (!media.context || media.context == 'left') {
            this.mediaManager
              .addContent(media, this.panel.mediaContainer)
              .then(() => {
                this.panel.setForm(this.currentIndex);
              });
          } else {
            this.mediaManager.addContent(media, this.panel.mediaContainer);
          }
        }
      });
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
