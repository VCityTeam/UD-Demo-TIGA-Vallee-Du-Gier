import { Panel } from './panel';
import { MediaManager } from './mediaManager';
import { THREE } from 'ud-viz';
import { addFilterOnLayer, getLayerById, removeFilterOnLayer } from './layerUtils';

export class Visit {
  constructor(view, medias) {
    this.id = 'NONE';
    this.config = null;
    this.medias = medias;
    this.allowedMedias = null;
    this.currentIndex = 0;
    this.view = view;
    this.modifiedCityObjects = [];
    this.layerFilters = [];

    this.panel = new Panel();
    this.mediaManager = new MediaManager(view);
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

  setVisit() {
    this.panel.initHeader();
    this.addVisitPanelEvents();
  }

  start(visitConfig, captionConfig) {
    this.config = visitConfig;
    this.captionConfig = captionConfig;
    this.id = this.config.id;
    this.currentIndex = this.config.startIndex;
    this.setVisit();
    this.panel.setProgressCount(this.currentIndex, this.config.endIndex);
    const startNode = this.config.nodes[this.currentIndex];
    this.panel.start(startNode.path, this.currentIndex);
    this.filterLayers(startNode.layers, startNode.filters);
    this.createLayersCaption();
    this.travelToPosition(startNode, this.view);
  }

  startOpenVisit(openVisitConfig, captionConfig) {
    this.config = openVisitConfig;
    this.captionConfig = captionConfig;
    this.id = 'OPEN';
    this.currentIndex = 0;
    this.allowedMedias = this.medias;
    this.setOpenVisit();
    this.filterLayers(this.config.layers);
  }

  setOpenVisit() {
    const title = document.createElement('h1');
    title.innerHTML = this.config.name;
    this.panel.headerPanel.appendChild(title);
    const subTitle = document.createElement('h2');
    subTitle.innerHTML = this.config.description;
    this.panel.headerPanel.appendChild(subTitle);
    this.fillOpenVisitContent(this.config.categories);
  }

  reset() {
    this.id = 'NONE';
    this.config = null;
    this.currentIndex = 0;
    this.panel.reset();
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

  layerHasFilter(layerId) {
    for (const filter of this.layerFilters) {
      if (filter.sourceLayer.id == layerId) return true;
    }
    return false;
  }

  layerIsFilter(layerId) {
    for (const filter of this.layerFilters) {
      if (filter.targetLayer.id == layerId) return true;
    }
    return false;
  }

  getSourceForFilteredLayer(layerId) {
    for (const filter of this.layerFilters) {
      if (filter.targetLayer.id == layerId) return filter.sourceLayer;
    }
    return undefined;
  }

  filterLayers(layerIds, filters = undefined) {
    this.layerFilters.forEach((filter) => {
      removeFilterOnLayer(this.view, filter);
    });
    this.layerFilters = [];

    this.view.layerManager.getLayers().forEach((layer) => {
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          if (filter.layer == layer.id) {
            const temporaryLayer = addFilterOnLayer(
              this.view,
              layer,
              filter,
              'temporary_' + this.layerFilters.length
            );
            this.layerFilters.push({
              sourceLayer: layer,
              targetLayer: temporaryLayer,
            });
          }
        });
      }
      layer.visible =
        layerIds == undefined ||
        (layerIds.includes(layer.id) && !this.layerHasFilter(layer.id)) ||
        layer.id == 'planar';
    });
  }

  setMedia(node) {
    if (node.media) {
      const media = this.medias.find((m) => m.id == node.media);
      if (media) {
        this.panel.mediaContainer.style.display = 'block';
        this.mediaManager.setContent(media, this.panel.mediaContainer);
      }
    } else {
      this.panel.cleanMediaContainer();
    }
  }

  fillOpenVisitContent(categoriesConfig) {
    categoriesConfig.forEach((category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.classList.add('ov_category');
      this.panel.textPanel.appendChild(categoryDiv);

      const categoryName = document.createElement('h3');
      categoryName.innerHTML = category.name;
      categoryDiv.appendChild(categoryName);

      if (category.contents) {
        category.contents.forEach((content) => {
          const contentButton = document.createElement('button');
          contentButton.classList.add('ov_content');
          categoryDiv.appendChild(contentButton);

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
                const temporaryLayer = addFilterOnLayer(this.view, layer, content, 'temporary_' + this.layerFilters.length);
                this.layerFilters.push({
                  sourceLayer: layer,
                  targetLayer: temporaryLayer,
                });
                layer.visible = false;
              }.bind(this)
            );
          }
        });
      }
    });
  }

  createLayersCaption() {
    this.panel.footerPanel.innerHTML = '';
    this.view.layerManager.getLayers().forEach((layer) => {
      if (layer.visible) {
        const id = this.layerIsFilter(layer.id)
          ? this.getSourceForFilteredLayer(layer.id).id
          : layer.id;
        for (const layerCaption of this.captionConfig.layers) {
          if (id == layerCaption.id) {
            this.panel.footerPanel.appendChild(
              this.panel.createCaption(
                layerCaption.style,
                layerCaption.description
              )
            );
            break;
          }
        }
      }
    });
  }
}
