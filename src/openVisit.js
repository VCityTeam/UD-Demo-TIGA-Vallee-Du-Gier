import { Visit } from './visit';
import {
  addFilterOnLayer,
  getLayerById,
  removeFilterOnLayer,
} from './layerUtils';

export class OpenVisit extends Visit {
  constructor(view, medias) {
    super(view, medias);
    this.id = 'OPEN';
    this.currentIndex = 0;
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
    this.fillContent(this.config.categories);
    this.filterLayers(this.config.layers);
  }

  fillContent(categoriesConfig) {
    categoriesConfig.forEach((category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.classList.add('ov_category');
      this.panel.textPanel.appendChild(categoryDiv);

      const categoryButton = document.createElement('button');
      categoryButton.classList.add('ov_category_button');
      const categoryName = document.createElement('h3');
      categoryName.innerHTML = category.name;
      categoryName.classList.add('ov_category_name');
      categoryButton.appendChild(categoryName);
      const categorySquare = document.createElement('div');
      categorySquare.classList.add('ov_category_square', 'square_right');
      categoryButton.appendChild(categorySquare);
      categoryDiv.appendChild(categoryButton);

      const categoryContent = document.createElement('div');
      categoryContent.classList.add('ov_category_content');
      categoryContent.style.display = 'none';
      categoryButton.addEventListener(
        'click',
        function () {
          if (categoryContent.style.display == 'none') {
            categoryContent.style.display = 'block';
            categorySquare.classList.remove('square_right');
            categorySquare.classList.add('square_down');
          } else {
            categoryContent.style.display = 'none';
            categorySquare.classList.remove('square_down');
            categorySquare.classList.add('square_right');
          }
        }.bind(this)
      );
      categoryDiv.appendChild(categoryContent);

      if (category.contents) {
        category.contents.forEach((content) => {
          const contentButton = document.createElement('button');
          contentButton.classList.add('ov_content');
          categoryContent.appendChild(contentButton);

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
                if (this.layerHasFilter(content.layer)) {
                  let i = 0;
                  let filter = null;
                  for (const f of this.layerFilters) {
                    if (f.sourceLayer.id == content.layer) filter = f;
                    i++;
                  }
                  removeFilterOnLayer(this.view, filter, true);
                  this.layerFilters.splice(i, 1);
                }
                const layer = getLayerById(this.view, content.layer);
                const temporaryLayer = addFilterOnLayer(
                  this.view,
                  layer,
                  content,
                  'temporary_' + this.layerFilters.length
                );
                this.layerFilters.push({
                  sourceLayer: layer,
                  targetLayer: temporaryLayer,
                });
              }.bind(this)
            );
          }
        });
      }
    });
  }
}
