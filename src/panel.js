import { createCaption } from './captionUtils';

export class Panel {
  constructor(captionConfig) {
    this.captionConfig = captionConfig;
    this.mainPanel = null;
    this.contentPanel = null;
    this.headerPanel = null;
    this.textPanel = null;
    this.captionPanel = null;
    this.footerPanel = null;
    this.width = 'half';
    this.visit = null;
    this.initPanel();
  }

  setVisit(visit) {
    this.visit = visit;
  }

  setButtonsStyle(isStart, isEnd) {
    this.previousButton.disabled = isStart;
    this.nextButton.disabled = isEnd;
  }

  setWidth(type) {
    this.width = type;
    switch (type) {
      case 'half':
        this.mainPanel.classList.remove('full_width');
        this.mainPanel.classList.remove('smaller_width');
        this.mainPanel.classList.add('half_width');
        break;
      case 'full':
        this.mainPanel.classList.remove('half_width');
        this.mainPanel.classList.remove('smaller_width');
        this.mainPanel.classList.add('full_width');
        break;
      case 'smaller':
        this.mainPanel.classList.remove('half_width');
        this.mainPanel.classList.remove('full_width');
        this.mainPanel.classList.add('smaller_width');
        break;
      default:
        this.mainPanel.classList.remove('half_width');
        this.mainPanel.classList.remove('full_width');
        this.mainPanel.classList.remove('smaller_width');
    }
  }

  initPanel() {
    this.mainPanel = document.getElementById('main_panel');
    this.contentPanel = this.mainPanel.querySelector('.content_panel');
    this.headerPanel = this.mainPanel.querySelector('.header_panel');
    this.textPanel = this.mainPanel.querySelector('.text_panel');
    this.mediaContainer = document.getElementById('media_container');
    this.captionPanel = this.mainPanel.querySelector('.caption_panel');
    this.footerPanel = this.mainPanel.querySelector('.footer_panel');
    this.previousButton = document.getElementById('previous_button');
    this.previousButton.addEventListener(
      'click',
      function () {
        const previousIndex = this.visit.getNode().previous;
        this.goToVisitNode(previousIndex);
      }.bind(this)
    );
    this.nextButton = document.getElementById('next_button');
    this.nextButton.addEventListener(
      'click',
      function () {
        const nextIndex = this.visit.getNode().next;
        this.goToVisitNode(nextIndex);
      }.bind(this)
    );
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
        if (layerPanel.style.display == 'flex') {
          layerPanel.style.display = 'none';
        } else {
          layerPanel.style.display = 'flex';
        }
      }.bind(this)
    );
  }

  goToVisitNode(nodeIndex) {
    this.visit.goToNode(nodeIndex);
    this.setWidth(this.visit.getNode().type);
    this.setButtonsStyle(this.visit.isStart(), this.visit.isEnd());
    this.createLayersCaption(this.visit.view, this.visit.filterManager);
  }

  createLayersCaption(view, filterManager) {
    let hasCaption = false;
    const layerPanel = document.getElementById('layer_panel');
    layerPanel.innerHTML = '';
    view.layerManager.getLayers().forEach((layer) => {
      if (layer.visible) {
        const id = filterManager.layerIsFilter(layer.id)
          ? filterManager.getSourceForFilteredLayer(layer.id).id
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
