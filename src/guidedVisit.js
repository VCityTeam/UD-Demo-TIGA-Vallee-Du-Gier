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

  getCurrentCategory() {
    if (this.config.categories && this.config.categories.length > 0) {
      for (const category of [...this.config.categories].reverse()) {
        if (this.currentIndex >= category.nodeIndex) return category.id;
      }
    }
    return null;
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
    this.panel.initHeader();
    const menuButton = document.getElementById('menu_header_button');
    menuButton.addEventListener('click', function () {
      const menuPanel = document.getElementById('menu_panel');
      if (menuPanel.classList.contains('menu_panel_closed'))
        menuPanel.classList.replace('menu_panel_closed', 'menu_panel_open');
      else menuPanel.classList.replace('menu_panel_open', 'menu_panel_closed');
    });
  }

  start() {
    if (this.config.categories && this.config.categories.length > 0) {
      this.config.categories.forEach((category) => {
        const category_button = this.panel.createCategoryButton(category);
        category_button.addEventListener(
          'click',
          function () {
            this.goToNode(category.nodeIndex);
          }.bind(this)
        );
      });
    }
    this.addVisitPanelEvents();
    this.panel.start();
    this.goToNode(this.currentIndex);
  }

  goToNode(nodeIndex) {
    this.panel.saveInputValues(this.currentIndex);
    this.currentIndex = nodeIndex;
    const currentNode = this.getNode();
    this.panel.updateHeader(
      this.currentIndex,
      this.config.endIndex,
      this.getCurrentCategory()
    );
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
}
