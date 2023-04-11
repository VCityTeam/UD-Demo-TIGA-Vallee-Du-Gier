import { Visit } from './visit';
import { getLayerById } from './layerUtils';

export class OpenVisit extends Visit {
  constructor(view, medias) {
    super(view, medias);
    this.id = 'OPEN';
    this.currentIndex = 0;
    this.categories = [];
    this.filters = {};
    this.contentConfigs = {};
    this.contentNumber = 0;
    this.layerPanelOpen = false;
  }

  start(config, captionConfig) {
    this.config = config;
    this.captionConfig = captionConfig;
    const title = document.createElement('h1');
    title.innerHTML = this.config.name;
    this.panel.headerPanel.appendChild(title);
    const subTitle = document.createElement('h2');
    subTitle.innerHTML = this.config.description;
    this.panel.headerPanel.appendChild(subTitle);
    this.fillContent(this.config.contents);
    this.addLayers(this.config.layers);
    const layerButton = document.getElementById('layer_button');
    layerButton.addEventListener(
      'click',
      function () {
        const layerPanel = document.getElementById('layer_panel');
        if (this.layerPanelOpen) {
          layerPanel.style.display = 'none';
          layerButton.style.backgroundColor = '#d9d9d9';
        } else {
          layerPanel.style.display = 'flex';
          layerButton.style.backgroundColor = '#c8c8c8';
        }
        this.layerPanelOpen = !this.layerPanelOpen;
      }.bind(this)
    );
  }

  getCategory(categoryId) {
    for (const category of this.categories)
      if (category.id == categoryId) return category;
    return null;
  }

  fillContent(contentsConfig) {
    contentsConfig.forEach((content) => {
      if (content.type == 'category')
        this.addCategory(content, this.panel.textPanel);
      else this.addContent(content, this.panel.textPanel);
    });
  }

  addCategory(category, parentDiv) {
    const categoryDiv = document.createElement('div');
    categoryDiv.id = 'ov_category_ ' + this.categories.length;
    this.categories.push({
      id: categoryDiv.id,
      displayed: false,
    });
    categoryDiv.classList.add('ov_category');
    parentDiv.appendChild(categoryDiv);

    const categoryButton = document.createElement('button');
    categoryButton.classList.add('ov_category_button');
    categoryDiv.appendChild(categoryButton);

    const categoryName = document.createElement('h3');
    categoryName.innerHTML = category.name;
    categoryName.classList.add('ov_category_name');
    categoryButton.appendChild(categoryName);

    const categorySquare = document.createElement('div');
    categorySquare.classList.add('ov_category_square', 'square_right');
    categoryButton.appendChild(categorySquare);

    const categoryContent = document.createElement('div');
    categoryContent.classList.add('ov_category_content');
    categoryContent.style.display = 'none';
    categoryDiv.appendChild(categoryContent);

    categoryButton.addEventListener(
      'click',
      function () {
        if (this.getCategory(categoryDiv.id).displayed) {
          this.closeCategory(categoryDiv);
        } else {
          this.openCategory(categoryDiv);
        }
      }.bind(this)
    );

    if (category.contents) {
      category.contents.forEach((content) => {
        if (content.type == 'category')
          this.addCategory(content, categoryContent);
        else this.addContent(content, categoryContent);
      });
    }
  }

  addContent(content, parentDiv) {
    const contentButton = document.createElement('button');
    contentButton.id = 'content_' + this.contentNumber;
    contentButton.classList.add('ov_content');
    parentDiv.appendChild(contentButton);
    this.contentNumber++;
    if (content.type == 'filter') {
      for (const filterCaption of this.captionConfig.filters) {
        if (content.id == filterCaption.id) {
          contentButton.appendChild(
            this.panel.createCaption(
              filterCaption.style,
              filterCaption.description
            )
          );
          break;
        }
      }
      this.contentConfigs[contentButton.id] = content;
      contentButton.addEventListener(
        'click',
        function () {
          if (contentButton.id in this.filters) {
            this.removeFilter(contentButton);
          } else {
            this.addFilter(contentButton);
          }
        }.bind(this)
      );
    }
  }

  openCategory(categoryDiv) {
    const categories =
      categoryDiv.parentNode.getElementsByClassName('ov_category');
    for (const category of categories) {
      if (category.id != categoryDiv.id) {
        this.closeCategory(category);
      }
    }
    const categoryContent = categoryDiv.querySelector('.ov_category_content');
    const contents = categoryContent.querySelectorAll('.ov_content');
    for (const content of contents) {
      if (this.contentConfigs[content.id].default == 'show') {
        this.addFilter(content);
      }
    }
    categoryContent.style.display = 'block';
    const categorySquare = categoryDiv.querySelector('.ov_category_square');
    categorySquare.classList.remove('square_right');
    categorySquare.classList.add('square_down');
    this.getCategory(categoryDiv.id).displayed = true;
  }

  closeCategory(categoryDiv) {
    const childCategories = categoryDiv.querySelectorAll('.ov_category');
    for (const childCategory of childCategories) {
      this.closeCategory(childCategory);
    }
    const categoryContent = categoryDiv.querySelector('.ov_category_content');
    const contents = categoryContent.querySelectorAll('.ov_content_displayed');
    for (const content of contents) {
      if (content.id in this.filters) {
        this.removeFilter(content);
      }
    }
    categoryContent.style.display = 'none';
    const categorySquare = categoryDiv.querySelector('.ov_category_square');
    categorySquare.classList.remove('square_down');
    categorySquare.classList.add('square_right');
    this.getCategory(categoryDiv.id).displayed = false;
  }

  addFilter(contentButton) {
    const layer = getLayerById(
      this.view,
      this.contentConfigs[contentButton.id].layer
    );
    const filterId = this.filterManager.addFilter(
      layer,
      this.contentConfigs[contentButton.id]
    );
    this.filters[contentButton.id] = filterId;
    if (!layer.isC3DTilesLayer) layer.visible = false;
    contentButton.classList.add('ov_content_displayed');
  }

  removeFilter(contentButton) {
    const filterId = this.filters[contentButton.id];
    this.filterManager.removeFilter(filterId);
    const layer = getLayerById(
      this.view,
      this.contentConfigs[contentButton.id].layer
    );
    if (!layer.isC3DTilesLayer)
      layer.visible = !this.filterManager.layerHasFilter(layer.id);
    delete this.filters[contentButton.id];
    contentButton.classList.remove('ov_content_displayed');
  }

  addLayers(layers) {
    const layerPanel = document.getElementById('layer_panel');
    this.view.layerManager.getLayers().forEach((layer) => {
      let layerInVisit = false;
      for (const layerConfig of layers) {
        if (layer.id == layerConfig.id) {
          const layerButton = document.createElement('button');
          layerButton.id = layerConfig.id;
          layerButton.classList.add('ov_content');
          for (const layerCaption of this.captionConfig.layers) {
            if (layerConfig.id == layerCaption.id) {
              layerButton.appendChild(
                this.panel.createCaption(
                  layerCaption.style,
                  layerCaption.description
                )
              );
              break;
            }
          }
          layerButton.addEventListener(
            'click',
            function () {
              layer.visible = !layer.visible;
              this.view.layerManager.notifyChange();
            }.bind(this)
          );
          layerPanel.appendChild(layerButton);
          layerInVisit = true;
          break;
        }
      }
      layer.visible = layerInVisit || layer.id == 'planar';
    });
    this.view.layerManager.notifyChange();
  }
}
