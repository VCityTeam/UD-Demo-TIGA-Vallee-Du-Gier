import { Visit } from './visit';

export class GuidedVisit extends Visit {
  constructor(view, medias) {
    super(view, medias);
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

  start(visitConfig, captionConfig) {
    this.config = visitConfig;
    this.captionConfig = captionConfig;
    this.id = this.config.id;
    this.currentIndex = this.config.startIndex;
    this.panel.initHeader();
    this.addVisitPanelEvents();
    this.panel.setProgressCount(this.currentIndex, this.config.endIndex);
    const startNode = this.config.nodes[this.currentIndex];
    this.panel.start(startNode.path, this.currentIndex);
    this.filterLayers(startNode.layers, startNode.filters);
    this.createLayersCaption();
    this.travelToPosition(startNode, this.view);
  }

  goToPreviousNode() {
    this.panel.saveInputValues(this.currentIndex);
    this.panel.formContainer.innerHTML = '';
    let current = this.getNode();
    let previous = this.config.nodes[current.previous];
    this.currentIndex = current.previous;
    this.panel.setProgressCount(this.currentIndex, this.config.endIndex);
    this.panel.setButtonsStyle(this.isStart(), this.isEnd());
    this.panel.fillWithHtmlFromFile(previous.path, this.currentIndex);
    this.setMedia(previous);
    this.filterLayers(previous.layers, previous.filters);
    this.createLayersCaption();
    this.travelToPosition(previous, this.view);
  }

  goToNextNode() {
    this.panel.saveInputValues(this.currentIndex);
    this.panel.formContainer.innerHTML = '';
    let current = this.getNode();
    let next = this.config.nodes[current.next];
    this.currentIndex = current.next;
    this.panel.setProgressCount(this.currentIndex, this.config.endIndex);
    this.panel.setButtonsStyle(this.isStart(), this.isEnd());
    this.filterLayers(next.layers, next.filters);
    this.createLayersCaption();
    if (this.isEnd()) {
      this.panel.fillWithHtmlFromFile(next.path, this.currentIndex).then(() => {
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
      });
    } else {
      this.panel.fillWithHtmlFromFile(next.path, this.currentIndex);
      this.setMedia(next);
      this.travelToPosition(next, this.view);
    }
  }
}
