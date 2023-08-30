import { MediaManager } from './mediaManager';
import { FilterManager } from './filterManager';
import { getLayerById } from './layerUtils';
import { createCaption } from './captionUtils';

export class OpenVisit {
  constructor(view, medias) {
    this.view = view;
    this.medias = medias;
    this.id = 'OPEN';
    this.currentIndex = 0;
    this.categories = [];
    this.filters = {};
    this.contentConfigs = {};
    this.contentNumber = 0;
    this.layerPanelOpen = false;

    this.mediaManager = new MediaManager(view);
    this.filterManager = new FilterManager(view);
  }

  start(config, captionConfig) {
    this.config = config;
    this.captionConfig = captionConfig;
    if (this.config.contents && this.config.contents.length > 0)
      this.fillContent(this.config.contents);
    this.addLayers(this.config.layers);
    const mapButton = document.getElementById('map_button');
    this.infoButton = document.getElementById('info_button');
    mapButton.addEventListener(
      'click',
      function () {
        if (mapButton.classList.contains('unselected_button')) {
          mapButton.classList.replace('unselected_button', 'selected_button');
          this.infoButton.classList.replace(
            'selected_button',
            'unselected_button'
          );
          document.getElementById('info_container').style.display = 'none';
          document.getElementById('categories_container').style.display =
            'block';
        }
      }.bind(this)
    );
    this.infoButton.addEventListener(
      'click',
      function () {
        if (this.infoButton.classList.contains('unselected_button')) {
          this.infoButton.classList.replace(
            'unselected_button',
            'selected_button'
          );
          mapButton.classList.replace('selected_button', 'unselected_button');
          document.getElementById('categories_container').style.display =
            'none';
          document.getElementById('info_container').style.display = 'flex';
        }
      }.bind(this)
    );
    const layerButton = document.getElementById('layer_button');
    layerButton.addEventListener(
      'click',
      function () {
        const layerPanel = document.getElementById('layer_panel');
        if (this.layerPanelOpen) {
          layerPanel.style.display = 'none';
        } else {
          layerPanel.style.display = 'flex';
        }
        this.layerPanelOpen = !this.layerPanelOpen;
      }.bind(this)
    );
    const legendButton = document.getElementById('legend_button');
    legendButton.addEventListener(
      'click',
      function () {
        document.getElementById('legend_panel').style.display = 'none';
      }.bind(this)
    );
    this.addClickOnBuildingEvent();
  }

  getCategory(categoryId) {
    for (const category of this.categories)
      if (category.id == categoryId) return category;
    return null;
  }

  fillContent(contentsConfig) {
    const catContainer = document.getElementById('categories_container');
    contentsConfig.forEach((content) => {
      if (content.type == 'category') this.addCategory(content, catContainer);
      else this.addContent(content, catContainer);
    });
  }

  addCategory(category, parentDiv) {
    const categoryDiv = document.createElement('div');
    categoryDiv.id = 'ov_category_' + this.categories.length;
    this.categories.push({
      id: categoryDiv.id,
      displayed: false,
      layers: category.layers,
    });
    categoryDiv.classList.add('ov_category');
    parentDiv.appendChild(categoryDiv);

    const categoryButton = document.createElement('button');
    if (category.legend) {
      categoryButton.classList.add('ov_legended_category_button');
      categoryButton.appendChild(this.addLegend(category));
    } else {
      categoryButton.classList.add('ov_category_button');
    }
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
            createCaption(filterCaption.style, filterCaption.description)
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
    if (content.type == 'layer') {
      for (const layerCaption of this.captionConfig.layers) {
        if (content.id == layerCaption.id) {
          contentButton.appendChild(
            createCaption(layerCaption.style, layerCaption.description)
          );
          break;
        }
      }
      this.contentConfigs[contentButton.id] = content;
      contentButton.addEventListener(
        'click',
        function () {
          const layer = getLayerById(this.view, content.layer);
          if (layer.visible) this.removeLayer(layer, contentButton);
          else this.addLayer(layer, contentButton);
        }.bind(this)
      );
    }
  }

  addLegend(category) {
    const legendButton = document.createElement('button');
    legendButton.classList.add('ov_legend_button');
    legendButton.addEventListener(
      'click',
      function (event) {
        event.stopImmediatePropagation();
        const legendDiv = document.getElementById('legend_div');
        legendDiv.innerHTML = '';
        const media = this.medias.find((m) => m.id == category.legend);
        this.mediaManager.addContent(media, legendDiv);
        document.getElementById('legend_panel').style.display = 'block';
      }.bind(this)
    );
    return legendButton;
  }

  openCategory(categoryDiv) {
    const categories = categoryDiv.parentNode.querySelectorAll(
      ':scope > .ov_category, :scope > .ov_category_content > .ov_category'
    );
    for (const category of categories) {
      if (category.id != categoryDiv.id) {
        this.closeCategory(category);
      }
    }
    const categoryContent = categoryDiv.querySelector('.ov_category_content');
    const contents = categoryContent.querySelectorAll(':scope > .ov_content');
    for (const content of contents) {
      const contentConfig = this.contentConfigs[content.id];
      if (contentConfig.default == 'show') {
        if (contentConfig.type == 'layer')
          this.addLayer(getLayerById(this.view, contentConfig.layer), content);
        if (contentConfig.type == 'filter')
          if (!(content.id in this.filters)) this.addFilter(content);
      }
    }
    categoryContent.style.display = 'block';
    const categorySquare = categoryDiv.querySelector('.ov_category_square');
    categorySquare.classList.remove('square_right');
    categorySquare.classList.add('square_down');
    this.getCategory(categoryDiv.id).displayed = true;
    const layers = this.getCategory(categoryDiv.id).layers;
    if (layers && layers.length > 0) {
      this.view.layerManager.getLayers().forEach((layer) => {
        for (const layer_config of layers)
          if (layer_config.id == layer.id) layer.visible = layer_config.visible;
      });
    }
    this.view.layerManager.notifyChange();
  }

  closeCategory(categoryDiv) {
    const childCategories = categoryDiv.querySelectorAll(
      ':scope > .ov_category, :scope > .ov_category_content > .ov_category'
    );
    for (const childCategory of childCategories) {
      this.closeCategory(childCategory);
    }
    const categoryContent = categoryDiv.querySelector('.ov_category_content');
    const contents = categoryContent.querySelectorAll(
      ':scope > .ov_content_displayed'
    );
    for (const content of contents) {
      const contentConfig = this.contentConfigs[content.id];
      if (contentConfig.type == 'layer')
        this.removeLayer(getLayerById(this.view, contentConfig.layer), content);
      if (contentConfig.type == 'filter')
        if (content.id in this.filters) this.removeFilter(content);
    }
    categoryContent.style.display = 'none';
    const categorySquare = categoryDiv.querySelector('.ov_category_square');
    categorySquare.classList.remove('square_down');
    categorySquare.classList.add('square_right');
    this.getCategory(categoryDiv.id).displayed = false;
    const layers = this.getCategory(categoryDiv.id).layers;
    if (layers && layers.length > 0) {
      this.mediaManager.deletePins();
      this.view.layerManager.getLayers().forEach((layer) => {
        for (const layer_config of layers)
          if (layer_config.id == layer.id)
            layer.visible = !layer_config.visible;
      });
      this.view.layerManager.notifyChange();
    }
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

  addLayer(layer, contentButton) {
    layer.visible = true;
    contentButton.classList.add('ov_content_displayed');
    this.view.layerManager.notifyChange();
  }

  removeLayer(layer, contentButton) {
    layer.visible = false;
    contentButton.classList.remove('ov_content_displayed');
    this.view.layerManager.notifyChange();
  }

  addLayers(layers) {
    const layerPanel = document.getElementById('layer_panel');
    this.view.layerManager.getLayers().forEach((layer) => {
      let layerDisplayed = false;
      for (const layerConfig of layers) {
        if (layer.id == layerConfig.id) {
          if (layerConfig.default == 'no_caption') {
            layerDisplayed = true;
            break;
          }
          const layerButton = document.createElement('button');
          layerButton.id = layerConfig.id;
          layerButton.classList.add('ov_content');
          for (const layerCaption of this.captionConfig.layers) {
            if (layerConfig.id == layerCaption.id) {
              layerButton.appendChild(
                createCaption(layerCaption.style, layerCaption.description)
              );
              break;
            }
          }
          layerButton.addEventListener(
            'click',
            function () {
              if (layerButton.classList.contains('ov_content_displayed')) {
                this.hideLayer(layer);
              } else {
                this.showLayer(layer);
              }
            }.bind(this)
          );
          layerPanel.appendChild(layerButton);
          if (layerConfig.default == 'show') {
            layerDisplayed = true;
            layerButton.classList.add('ov_content_displayed');
          }
          break;
        }
      }
      layer.visible = layerDisplayed || layer.id == 'planar';
    });
    this.view.layerManager.notifyChange();
  }

  showLayer(layer) {
    const layerButton = document.getElementById(layer.id);
    layerButton.classList.add('ov_content_displayed');
    if (this.filterManager.layerHasFilter(layer.id)) {
      const filters = this.filterManager.getFiltersForLayer(layer.id);
      for (const filter of filters) filter.layer.visible = true;
    } else {
      layer.visible = true;
    }
    this.view.layerManager.notifyChange();
  }

  hideLayer(layer) {
    const layerButton = document.getElementById(layer.id);
    layerButton.classList.remove('ov_content_displayed');
    if (this.filterManager.layerHasFilter(layer.id)) {
      const filters = this.filterManager.getFiltersForLayer(layer.id);
      for (const filter of filters) filter.layer.visible = false;
    } else {
      layer.visible = false;
    }
    this.view.layerManager.notifyChange();
  }

  addClickOnBuildingEvent() {
    this.infoPanel = document.getElementById('info');
    document.getElementById('viewerDiv').addEventListener(
      'mousedown',
      function (e) {
        const cityObject = this.view.layerManager.pickCityObject(e);
        if (
          cityObject &&
          cityObject.tile.layer.id == this.config.selection_target
        ) {
          this.mediaManager.deletePins();

          let offset = 40;
          if (
            cityObject.props['HAUTEUR'] &&
            !isNaN(cityObject.props['HAUTEUR'])
          )
            offset = 20 + cityObject.props['HAUTEUR'];
          this.mediaManager.createPin('../assets/icons/Pink_pin.png', {
            x: cityObject.centroid.x,
            y: cityObject.centroid.y,
            z: cityObject.centroid.z + offset,
          });

          this.setBuildingInfo(cityObject);
          this.infoButton.dispatchEvent(new Event('click'));
        }
      }.bind(this)
    );
  }

  setBuildingInfo(cityObject) {
    this.infoPanel.style.display = 'flex';
    document.getElementById('info_desc').style.display = 'none';
    const infoDivs = this.infoPanel.getElementsByClassName('info_div');
    for (const infoDiv of infoDivs) {
      const attributeField = infoDiv.querySelector('.attribute_field');
      const attributeName = attributeField.id;
      if (cityObject.props[attributeName]) {
        const attributeValue = cityObject.props[attributeName];
        attributeField.textContent = attributeValue;
        for (const desc of infoDiv.querySelectorAll('.attribute_desc'))
          attributeField.textContent += ' ' + desc.textContent;
      } else {
        attributeField.textContent = 'n.c.';
      }
    }
  }
}
