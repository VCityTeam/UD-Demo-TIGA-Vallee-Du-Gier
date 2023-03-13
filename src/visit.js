import { Panel } from './panel';
import { MediaManager } from './mediaManager';
import { THREE } from 'ud-viz';
import { createTemporaryLayer } from './layerUtils';

export class Visit {
  constructor(view, medias) {
    this.id = 'NONE';
    this.config = null;
    this.medias = medias;
    this.allowedMedias = null;
    this.currentIndex = 0;
    this.view = view;
    this.modifiedCityObjects = [];
    this.temporaryLayers = [];

    this.panel = new Panel();
    this.mediaManager = new MediaManager(view);
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

  start(visitConfig) {
    this.config = visitConfig;
    this.id = this.config.id;
    this.currentIndex = this.config.startIndex;
    const startNode = this.config.nodes[this.currentIndex];
    this.panel.start(startNode.path, this.currentIndex);
    this.addVisitPanelEvents();
    this.filterLayers(startNode.layers, startNode.filters);
    this.travelToPosition(startNode, this.view);
  }

  startOpenVisit() {
    this.id = 'OPEN';
    this.currentIndex = 0;
    this.allowedMedias = this.medias;
  }

  reset() {
    this.id = 'NONE';
    this.config = null;
    this.currentIndex = 0;
    this.panel.reset();
  }

  goToPreviousNode() {
    this.panel.saveInputValues(this.currentIndex);
    this.panel.formContainer.innerHTML = '';
    let current = this.getNode();
    let previous = this.config.nodes[current.previous];
    this.currentIndex = current.previous;
    this.panel.setButtonsStyle(this.isStart(), this.isEnd());
    this.panel.fillWithHtmlFromFile(previous.path, this.currentIndex);
    this.setMedia(previous);
    this.filterLayers(previous.layers, previous.filters);
    this.travelToPosition(previous, this.view);
  }

  goToNextNode() {
    this.panel.saveInputValues(this.currentIndex);
    this.panel.formContainer.innerHTML = '';
    let current = this.getNode();
    let next = this.config.nodes[current.next];
    this.currentIndex = current.next;
    this.panel.setButtonsStyle(this.isStart(), this.isEnd());
    this.filterLayers(next.layers, next.filters);
    if (this.isEnd()) {
      this.panel.fillWithRecapValues(this.config.name);
      this.panel.cleanMediaContainer();
      this.panel.initRecapButtons();
      this.panel.restartButton.addEventListener(
        'click',
        function () {
          location.href = '../index.html';
        }.bind(this)
      );
      this.panel.visitButton.addEventListener(
        'click',
        function () {
          location.href = './open_visit.html';
        }.bind(this)
      );
    } else {
      this.panel.fillWithHtmlFromFile(next.path, this.currentIndex);
      this.setMedia(next);
      this.travelToPosition(next, this.view);
    }
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

  filterLayers(layerIds, filters) {
    this.temporaryLayers.forEach((layer) => {
      this.view.getItownsView().removeLayer(layer.id, true);
    });
    this.temporaryLayers = [];

    this.view.layerManager.getLayers().forEach((layer) => {
      let isFiltered = false;
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          if (filter.layer == layer.id) {
            isFiltered = true;
            const temporaryLayer = createTemporaryLayer(
              layer,
              filter,
              'temporary_' + this.temporaryLayers.length
            );
            this.view.getItownsView().addLayer(temporaryLayer);
            this.temporaryLayers.push(temporaryLayer);
          }
        });
        if (!isFiltered) layer.filter = undefined;
      } else {
        layer.filter = undefined;
      }
      layer.visible =
        layerIds == undefined ||
        (layerIds.includes(layer.id) && !isFiltered) ||
        layer.id == 'planar';
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
}
