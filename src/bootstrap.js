import * as udviz from 'ud-viz';
import { addLabelLayers } from './labelLayer';
import { initTextPanel } from './form';

let formConfig = null;
fetch('../assets/config/formConfig.json')
  .then((response) => response.json())
  .then((json) => {
    formConfig = json;
    console.log(formConfig);
    let entryPanel = document.createElement('div');
    entryPanel.id = 'entry_panel';
    entryPanel.style.float = 'left';
    entryPanel.style.height = '100%';
    entryPanel.style.width = '100%';
    entryPanel.style.backgroundColor = 'white';
    entryPanel.style.display = 'grid';

    json.graphs.forEach((graph) => {
      let button = document.createElement('button');
      button.innerHTML = graph.name;
      button.addEventListener('click', function () {
        entryPanel.style.height = '0';
        startApp(graph);
      });
      entryPanel.appendChild(button);
    });
    document.body.appendChild(entryPanel);
  });

function startApp(formGraph) {
  const app = new udviz.Templates.AllWidget();

  app.start('../assets/config/config.json').then((config) => {
    let allWidgetDiv = document.getElementById('_all_widget');
    allWidgetDiv.style.width = '70%';
    allWidgetDiv.style.float = 'right';

    document.body.style.width = '100%';
    document.body.style.display = 'block';

    initTextPanel(formGraph);

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
