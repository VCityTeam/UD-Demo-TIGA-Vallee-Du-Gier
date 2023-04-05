import { Visit } from './visit';
import { getLayerById } from './layerUtils';

export class OpenVisit extends Visit {
  constructor(view, medias) {
    super(view, medias);
    this.id = 'OPEN';
    this.currentIndex = 0;
    this.categories = [];
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
        const cat = this.getCategory(categoryDiv.id);
        if (cat.displayed) {
          this.closeCategory(categoryDiv, categoryContent, categorySquare);
          cat.displayed = false;
        } else {
          this.openCategory(categoryDiv, categoryContent, categorySquare);
          cat.displayed = true;
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
    contentButton.classList.add('ov_content');
    parentDiv.appendChild(contentButton);

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
          const layer = getLayerById(this.view, content.layer);
          this.filterManager.addFilter(layer, content);
          if (!layer.isC3DTilesLayer) layer.visible = false;
        }.bind(this)
      );
    }
  }

  openCategory(categoryDiv, categoryContent, categorySquare) {
    categoryContent.style.display = 'block';
    categorySquare.classList.remove('square_right');
    categorySquare.classList.add('square_down');
  }

  closeCategory(categoryDiv, categoryContent, categorySquare) {
    categoryContent.style.display = 'none';
    categorySquare.classList.remove('square_down');
    categorySquare.classList.add('square_right');
  }
}
