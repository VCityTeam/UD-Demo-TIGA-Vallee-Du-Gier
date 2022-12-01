/** @format */

import * as udviz from 'ud-viz';

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

  // Declare the data source for the layer
  const labelSource = new udviz.itowns.FileSource({
    url: '../assets/geojson/COMMUNES_GIER_Centroids_3946.geojson',
    crs: 'EPSG:3946',
    format: 'application/json',
  });

  const labelStyle = new udviz.itowns.Style({
    zoom: { min: 0, max: 20 },
    text: {
      field: '{COMMUNE}',
      color: 'white',
      transform: 'uppercase',
      size: 15,
      haloColor: 'rgba(20,20,20, 0.8)',
      haloWidth: 3,
    },
  });

  const labelLayer = new udviz.itowns.LabelLayer('wfsCarto', {
    source: labelSource,
    style: labelStyle,
  });

  app.view3D.getItownsView().addLayer(labelLayer);
});
