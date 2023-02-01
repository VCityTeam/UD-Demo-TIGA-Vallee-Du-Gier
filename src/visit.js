import { Form } from './form';
import { MediaPanel } from './mediaPanel';
import { THREE } from 'ud-viz';

export class Visit {
  constructor(view, medias) {
    this.id = 'NONE';
    this.config = null;
    this.medias = medias;
    this.allowedMedias = null;
    this.currentIndex = 0;
    this.view = view;

    this.form = new Form();
    this.addFormEvents();

    this.mediaPanel = new MediaPanel();
    this.addMediaPanelEvents();
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

  addFormEvents() {
    this.form.previousButton.addEventListener(
      'click',
      function () {
        this.goToPreviousNode();
      }.bind(this)
    );
    this.form.nextButton.addEventListener(
      'click',
      function () {
        this.goToNextNode();
      }.bind(this)
    );
    this.form.closeButton.addEventListener(
      'click',
      function () {
        if (this.form.isClosed) {
          this.form.openTextPanel(
            this.getNode().type,
            this.isStart(),
            this.isEnd()
          );
        } else {
          this.form.closeTextPanel();
        }
      }.bind(this)
    );
  }

  addMediaPanelEvents() {
    document.getElementById('viewerDiv').addEventListener(
      'mousedown',
      function (e) {
        const cityObject = this.view.layerManager.pickCityObject(e);
        if (cityObject) {
          const media = this.allowedMedias.find(
            (m) => m.parent_id == cityObject.props.id
          );
          if (media) {
            this.mediaPanel.setContent(media);
          }
        }
      }.bind(this)
    );
  }

  start(visitConfig) {
    this.config = visitConfig;
    this.id = this.config.id;
    this.currentIndex = this.config.startIndex;
    this.allowedMedias = this.medias.filter((media) =>
      this.config.medias.includes(media.id)
    );
    this.applyStyleToParents(this.allowedMedias.map((m) => m.parent_id));
    const startNode = this.config.nodes[this.currentIndex];
    this.form.start(startNode.type, startNode.path, this.currentIndex);
    this.filterLayers(startNode.layers, startNode.filter);
    this.travelToPosition(startNode, this.view);
  }

  startOpenVisit() {
    this.id = 'OPEN';
    this.currentIndex = 0;
    this.form.hide();
    this.allowedMedias = this.medias;
    this.applyStyleToParents(this.allowedMedias.map((m) => m.parent_id));
  }

  reset() {
    this.id = 'NONE';
    this.config = null;
    this.currentIndex = 0;
    this.form.reset();
  }

  goToPreviousNode() {
    this.mediaPanel.closePanel();
    this.form.saveInputValues(this.currentIndex);
    this.form.formContainer.innerHTML = '';
    let current = this.getNode();
    let previous = this.config.nodes[current.previous];
    this.currentIndex = current.previous;
    this.form.setWidth(previous.type);
    this.form.setButtonsStyle(this.isStart(), this.isEnd());
    this.form.fillWithHtmlFromFile(previous.path, this.currentIndex);
    this.setMedia(previous);
    this.filterLayers(previous.layers, previous.filter);
    this.travelToPosition(previous, this.view);
  }

  goToNextNode() {
    this.mediaPanel.closePanel();
    this.form.saveInputValues(this.currentIndex);
    this.form.formContainer.innerHTML = '';
    let current = this.getNode();
    let next = this.config.nodes[current.next];
    this.currentIndex = current.next;
    this.form.setWidth(next.type);
    this.form.setButtonsStyle(this.isStart(), this.isEnd());
    this.filterLayers(next.layers, next.filter);
    if (this.isEnd()) {
      this.form.fillWithRecapValues(this.config.name);
      this.form.initRecapButtons();
      this.form.restartButton.addEventListener(
        'click',
        function () {
          this.reset();
          document.getElementById('entry_panel').style.display = 'grid';
        }.bind(this)
      );
      this.form.visitButton.addEventListener(
        'click',
        function () {
          this.startOpenVisit();
        }.bind(this)
      );
    } else {
      this.setMedia(next);
      this.form.fillWithHtmlFromFile(next.path, this.currentIndex);
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

  applyStyleToParents(parentIds) {
    this.view.layerManager.tilesManagers.forEach((tilesManager) => {
      tilesManager.tiles.forEach((tile) => {
        if (tile.cityObjects != null) {
          tile.cityObjects.forEach((cityObject) => {
            if (parentIds.includes(cityObject.props.id)) {
              tilesManager.setStyle(cityObject.cityObjectId, {
                materialProps: {
                  color: 0xff0000,
                  emissive: 0x00ff00,
                  emissiveIntensity: 0.2,
                },
              });
              tilesManager.applyStyles({
                updateFunction: tilesManager.view.notifyChange.bind(
                  tilesManager.view
                ),
              });
            }
          });
        }
      });
    });
  }

  filterLayers(layerIds, filter) {
    this.view.layerManager.getLayers().forEach((layer) => {
      layer.visible = layerIds.includes(layer.id) || layer.id == 'planar';
    });
  }

  setMedia(node) {
    if (node.media) {
      const media = this.medias.find((m) => m.id == node.media);
      if (media) {
        this.mediaPanel.setContent(media, this.view);
      }
    }
  }
}
