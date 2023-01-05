import * as udviz from 'ud-viz';
import { addLabelLayers } from './labelLayer';
import { Form } from './form';

var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'src/css/style.css';
document.getElementsByTagName('HEAD')[0].appendChild(link);

fetch('../assets/config/formConfig.json')
  .then((response) => response.json())
  .then((json) => {
    document.body.style.width = '100%';
    document.body.style.display = 'block';

    let entryPanel = document.createElement('div');
    entryPanel.id = 'entry_panel';

    json.graphs.forEach((graph) => {
      let button = document.createElement('button');
      button.innerHTML = graph.name;
      button.addEventListener('click', function () {
        entryPanel.style.display = 'none';
        startApp(graph);
      });
      entryPanel.appendChild(button);
    });

    let openVisitButton = document.createElement('button');
    openVisitButton.innerHTML = 'Parcours libre';
    openVisitButton.addEventListener('click', function () {
      entryPanel.style.display = 'none';
      startApp();
    });
    entryPanel.appendChild(openVisitButton);
    document.body.appendChild(entryPanel);
  });

function startApp(formGraph) {
  const app = new udviz.Templates.AllWidget();

  app.start('../assets/config/config.json').then((config) => {
    if (formGraph) {
      let allWidgetPanel = document.getElementById(
        '_all_widget_stuct_main_panel'
      );
      allWidgetPanel.style.display = 'block';
      allWidgetPanel.querySelector('nav').style.display = 'none';
      window.dispatchEvent(new Event('resize'));

      const form = new Form(app.view3D.getItownsView(), formGraph);
    }

    ////// CITY OBJECTS MODULE
    let cityObjectModule = new udviz.Widgets.CityObjectModule(
      app.view3D.layerManager,
      app.config
    );
    app.addModuleView('cityObjects', cityObjectModule.view);

    ////// 3DTILES DEBUG
    const debug3dTilesWindow = new udviz.Widgets.Debug3DTilesWindow(
      app.view3D.layerManager
    );
    app.addModuleView('3dtilesDebug', debug3dTilesWindow, {
      name: '3DTiles Debug',
    });

    ////// CAMERA POSITIONER
    const cameraPosition = new udviz.Widgets.CameraPositionerView(
      app.view3D.getItownsView(),
      app.view3D.getItownsView().controls
    );
    app.addModuleView('cameraPositioner', cameraPosition);

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
  });
}
