import * as udviz from 'ud-viz';
import { addLabelLayers } from './labelLayer';
import { Visit } from './visit';

var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'src/css/style.css';
document.getElementsByTagName('HEAD')[0].appendChild(link);

const list = [];
const urls = [
  './assets/config/formConfig.json',
  './assets/config/mediaConfig.json',
];
const configs = [];

urls.forEach(function (url, i) {
  list.push(
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        configs[i] = json;
      })
  );
});

Promise.all(list).then(function () {
  const formConfig = configs[0];
  const mediaConfig = configs[1];
  const app = new udviz.Templates.AllWidget();

  app.start('./assets/config/config.json').then((config) => {
    ////// CITY OBJECTS MODULE
    let cityObjectModule = new udviz.Widgets.CityObjectModule(
      app.view3D.layerManager,
      app.config
    );
    app.addModuleView('cityObjects', cityObjectModule.view);

    ////// LAYER CHOICE MODULE
    const layerChoice = new udviz.Widgets.LayerChoice(app.view3D.layerManager);
    app.addModuleView('layerChoice', layerChoice);

    ////// BaseMap Widget
    const baseMap = new udviz.Widgets.BaseMap(
      app.view3D.getItownsView(),
      config['baseMapLayers'],
      app.extent,
      app.config['projection']
    );
    app.addModuleView('baseMap', baseMap);

    addLabelLayers(config, app.view3D.getItownsView());

    let entryPanel = document.createElement('div');
    entryPanel.id = 'entry_panel';
    document.body.appendChild(entryPanel);

    const visit = new Visit(app.view3D, mediaConfig.medias);

    formConfig.visits.forEach((visitConfig) => {
      let visitDiv = document.createElement('div');
      visitDiv.classList.add('visit_div');
      let button = document.createElement('button');
      button.classList.add('visit_button');
      button.innerHTML = visitConfig.name;
      button.addEventListener('click', function () {
        entryPanel.style.display = 'none';
        let allWidgetPanel = document.getElementById(
          '_all_widget_stuct_main_panel'
        );
        allWidgetPanel.style.display = 'block';
        allWidgetPanel.querySelector('nav').style.display = 'none';
        window.dispatchEvent(new Event('resize'));
        visit.start(visitConfig);
      });
      let description = document.createElement('p');
      description.classList.add('visit_desc');
      description.innerHTML = visitConfig.description;
      visitDiv.appendChild(button);
      visitDiv.appendChild(description);
      entryPanel.appendChild(visitDiv);
    });

    let openVisitDiv = document.createElement('div');
    openVisitDiv.classList.add('visit_div');
    let openVisitButton = document.createElement('button');
    openVisitButton.classList.add('visit_button');
    openVisitButton.innerHTML = 'Parcours libre';
    openVisitButton.addEventListener('click', function () {
      entryPanel.style.display = 'none';
      visit.startOpenVisit();
    });
    let openVisitDescription = document.createElement('p');
    openVisitDescription.classList.add('visit_desc');
    openVisitDescription.innerHTML = 'Visite libre de la Vallée du Gier <br> Accès à tous les médias';
    openVisitDiv.appendChild(openVisitButton);
    openVisitDiv.appendChild(openVisitDescription);
    entryPanel.appendChild(openVisitDiv);
  });
});
