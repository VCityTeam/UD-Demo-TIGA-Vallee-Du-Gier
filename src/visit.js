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
            this.mediaPanel.setContent({ path: '../assets/form/01.txt' });
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
    const startNode = this.config.nodes[this.currentIndex];
    this.form.start(startNode.type, startNode.path, this.currentIndex);
    this.travelToPosition(startNode, this.view);
  }

  startOpenVisit() {
    this.id = 'OPEN';
    this.form.hide();
    this.allowedMedias = this.medias;
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
    if (this.isEnd()) {
      this.form.fillWithRecapValues(this.config.name);
      this.form.initRecapButtons();
      this.form.restartButton.addEventListener(
        'click',
        function () {
          this.reset();
          document.getElementById('entry_panel').style.display = 'block';
        }.bind(this)
      );
      this.form.visitButton.addEventListener(
        'click',
        function () {
          this.startOpenVisit();
        }.bind(this)
      );
    } else {
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
}
