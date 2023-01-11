import * as udviz from 'ud-viz';
import { addLabelLayers } from './labelLayer';
import { Visit } from './visit';

var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'src/css/style.css';
document.getElementsByTagName('HEAD')[0].appendChild(link);

fetch('../assets/config/formConfig.json')
  .then((response) => response.json())
  .then((json) => {
    const app = new udviz.Templates.AllWidget();

    app.start('../assets/config/config.json').then((config) => {
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
      const layerChoice = new udviz.Widgets.LayerChoice(
        app.view3D.layerManager
      );
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

      const visit = new Visit(app.view3D);

      json.visits.forEach((visitConfig) => {
        let button = document.createElement('button');
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
        entryPanel.appendChild(button);
      });

      let openVisitButton = document.createElement('button');
      openVisitButton.innerHTML = 'Parcours libre';
      openVisitButton.addEventListener('click', function () {
        entryPanel.style.display = 'none';
        visit.startOpenVisit();
      });
      entryPanel.appendChild(openVisitButton);
    });
  });
