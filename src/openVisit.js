import { Visit } from './visit';
import { getLayerById } from './layerUtils';

export class OpenVisit extends Visit {
  constructor(view, medias) {
    super(view, medias);
    this.id = 'OPEN';
    this.currentIndex = 0;
    this.categories = [];
    this.filters = {};
    this.contentNumber = 0;
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
    this.filterLayers(this.config.layers);
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

    if (content.type == 'layer') {
      for (const layerCaption of this.captionConfig.layers) {
        if (content.id == layerCaption.id) {
          contentButton.appendChild(
            this.panel.createCaption(
              layerCaption.style,
              layerCaption.description
            )
          );
          break;
        }
      }
      contentButton.addEventListener(
        'click',
        function () {
          const layer = getLayerById(this.view, content.id);
          layer.visible = !layer.visible;
          this.view.layerManager.notifyChange();
        }.bind(this)
      );
    } else if (content.type == 'filter') {
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
      contentButton.addEventListener(
        'click',
        function () {
          if (contentButton.id in this.filters) {
            this.removeFilter(contentButton, content);
          } else {
            this.addFilter(contentButton, content);
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
    categoryDiv.querySelector('.ov_category_content').style.display = 'block';
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
    categoryDiv.querySelector('.ov_category_content').style.display = 'none';
    const categorySquare = categoryDiv.querySelector('.ov_category_square');
    categorySquare.classList.remove('square_down');
    categorySquare.classList.add('square_right');
    this.getCategory(categoryDiv.id).displayed = false;
  }

  addFilter(contentButton, content) {
    const layer = getLayerById(this.view, content.layer);
    const filterId = this.filterManager.addFilter(layer, content);
    this.filters[contentButton.id] = filterId;
    if (!layer.isC3DTilesLayer) layer.visible = false;
    contentButton.classList.add('ov_content_displayed');
  }

  removeFilter(contentButton, content) {
    const filterId = this.filters[contentButton.id];
    this.filterManager.removeFilter(filterId);
    const layer = getLayerById(this.view, content.layer);
    if (!layer.isC3DTilesLayer)
      layer.visible = !this.filterManager.layerHasFilter(layer.id);
    delete this.filters[contentButton.id];
    contentButton.classList.remove('ov_content_displayed');
  }
}
