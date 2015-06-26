Ext.ns("Aura.visual");
Ext.ns('au.edu.uq.visual');
Ext.ns('aurin.form.visual');

Aura.visual.Catalog = {
  "description": "Registered Visualizations",
  "items": {

    // ------------- Charts - Basic ---------------------------------------- //
    "js://aurin.org.au/visual/bar-hz": {
      "name": "Horizontal Bar Chart"
    , "type": "on-context"
    , "group": "Charts - Interactive"
    , "vizClass": "Aura.visual.factory.BarChart"
    , "paramDefinition": {
        "refs": ["process1"]
       , "x": "language"
       , "y": "count"
      }
    , "formDefinition": { type: "function", name: "barHzForm" }
      /**
       * { type: "object", name: 'Aura.form.visual.BarHz'}
       * { type: "configurable", url: 'js/aura/form/process/CountCfg.js', name: 'Aura.form.process.Count'}
       * { type: "function", name: 'barHzForm'}
       *
       * Function-type formDefinition allows form generation from function calling
       * either from function Aura.form.visual.Functions['barHzForm'] or direct function calls
       */
    }
  , "js://aurin.org.au/visual/scatter-plot": {
     "name": "Scatter Plot"
    , "type": "on-context"
    , "group": "Charts - Interactive"
    , "vizClass": "Aura.visual.factory.ScatterPlot"
    , "paramDefinition": {
        "refs": ["process1"]
      , "x": "lat"
      , "y": "long"
      }
    , "formDefinition": { type: "function", name: "scatterPlotForm" }
    }

    // ------------- Charts - Processing ----------------------------------- //

  , "js://uq.edu.au/visual/barchart": {
      name: 'Processing Bar Chart'
    , type: 'on-context'
    , group: "Charts - Static"
    , description: 'Processing Bar Chart'
    , disable: 1
    , vizClass: "Aura.visual.factory.processing.BarChart"
    , serviceDefinition: {
        url: wifUiConfig['appBase'] + "/js/uq/visual/BarChart.js"
      , ns: 'au.edu.uq.visual.BarChart'
      }
    }

  , "js://uq.edu.au/visual/scatterplot": {
      name: 'Processing Scatter Plot'
    , type: 'on-context'
    , group: "Charts - Static"
    , description: 'Processing Scatter Plot'
    , disable: 1
    , vizClass: "Aura.visual.factory.processing.ScatterPlot"
    , serviceDefinition: {
        url: wifUiConfig['appBase'] + "/js/uq/visual/ScatterPlot.js"
      , ns: 'au.edu.uq.visual.ScatterPlot'
      }
    }

  // ------------- Charts - Using R ----------------------------------- //

  , "js://aurin.org.au/visual/linear-regression-plot": {
      "name": "Linear Regression Plot",
      "type": "on-context",
      "group": "Charts - Using R",
      "vizClass": "Aura.visual.factory.RegressionPlot",
      "paramDefinition": {
        "refs": ["process1"],
        "x": "lat",
        "y": "long"
      },
      "formDefinition": { type: "function", name: "regressionPlotForm" }
    }

  , "js://aurin.org.au/visual/gg-plot2": {
      "name": "R Visualisation using Ggplot2",
      "type": "on-context",
      "group": "Charts - Using R",
      "vizClass": "Aura.visual.factory.GgPlot2",
      "paramDefinition": {
        "refs": ["process1"],
        "x": "x",
        "y": "y",
        "geoms": []
      },
      "formDefinition": { type: "function", name: "ggPlot2Form" }
    }

  // ------------- Map Visualisations ----------------------------------- //

  , "js://aurin.org.au/visual/choropleth": {
      "name": "Choropleth",
      "type": "in-context",
      "group": "Map Visualisations",
      "vizClass": "Aura.visual.factory.Choropleth",
      "paramDefinition": {
        "refs": ["source"],
        "valueKey": "source.attribute",
        "classType": "jenks",
        "classNum": "4",
        "palette": "YlOrRd"
      },
      "formDefinition": { type: "function", name: "choroplethForm" }
    }

  , "js://aurin.org.au/visual/centroid": {
      "name": "Centroid",
      "type": "in-context",
      "group": "Map Visualisations",
      "vizClass": "Aura.visual.factory.Centroid",
      "paramDefinition": {
        "refs": ["source"],
        "valueKey": "source.attribute",
        "classType": "jenks",
        "classNum": "4",
        "palette": "YlOrRd"
      },
      "formDefinition": { type: "function", name: "centroidForm" }
      //"formDefinition": { type: "configurable", url: wifUiConfig['appBase'] + '/js/aura/form/visual/CentroidCfg.js', name: 'aurin.form.visual.Centroid'}
    },

    "js://aurin.org.au/visual/plot-point": {
      "name": "Point Plot",
      "type": "in-context",
      "group": "Map Visualisations",
      "vizClass": "Aura.visual.factory.PlotPoint",
      "paramDefinition": {
        "refs": ["source"],
        "x": "language",
        "y": "language",
        "groupBy": "language",
        "palette": "Paired"
      },
      "formDefinition": { type: "object", name: 'Aura.form.visual.PlotPoint'}
      //"formDefinition": { type: "configurable", url: wifUiConfig['appBase'] + '/js/aura/form/visual/PlotPointCfg.js', name: 'aurin.form.visual.PlotPoint'}
    },

    "js://aurin.org.au/visual/point-path": {
      "name": "Point Path",
      "type": "in-context",
      "group": "Map Visualisations",
      "vizClass": "Aura.visual.factory.PointPath",
      "paramDefinition": {
        "refs": ["source"],
        "x": "language",
        "y": "language",
        "groupBy": "language",
        "palette": "Paired"
      },
      "formDefinition": { type: "object", name: 'Aura.form.visual.PlotPoint'}
      //"formDefinition": { type: "configurable", url: wifUiConfig['appBase'] + '/js/aura/form/visual/PlotPointCfg.js', name: 'aurin.form.visual.PlotPoint'}
    }

  // ------------- 3D Visualisations ----------------------------------- //

  , "js://aurin.org.au/visual/space-time": {
      name: 'Space Time Cube'
    , type: 'on-context'
    , group: "3D Visualisation"
    , description: 'Space Time Cube'
    , vizClass: "Aura.visual.factory.3d.SpaceTime"
    , "formDefinition": { type: "configurable", url: wifUiConfig['appBase'] + '/js/aura/form/visual/SpaceTimeCfg.js', name: 'aurin.form.visual.SpaceTime'}
    }

  // ------------- Map Overlays ----------------------------------- //

  , "js://aurin.org.au/visual/wms-layer": {
      "name": "WMS Layer",
      "type": "in-context",
      "group": "Map Overlays",
      "vizClass": "Aura.visual.factory.WmsLayer",
      "paramDefinition": {
        "url": "http://eresearch2.geosp.uq.edu.au/geoserver/wms",
        "layers": "election2010:booth_variables",
        "defaultStyle": null,
        "sldBody": null
      },
      "formDefinition": { type: "object", name: 'Aura.form.visual.WmsLayer'}
    }

  , "js://aurin.org.au/visual/geojson-layer": {
      "name": "GeoJSON Layer from Dataset",
      "type": "in-context",
      "group": "Map Overlays",
      "vizClass": "Aura.visual.factory.GeoJsonDataset",
      //"disable": 1,
      "formDefinition": { type: "configurable", url: wifUiConfig['appBase'] + '/js/aura/form/visual/GeoJsonDatasetCfg.js', name: 'aurin.form.visual.GeoJsonDataset'}
    }

  // ------------- Special Visualisations ----------------------------------- //

  , "js://aurin.org.au/visual/ssis-layer": {
      "name": "2010 Federal Election & 2006 Census",
      "type": "in-context",
      "group": "Special Visualisations",
      "vizClass": "Aura.visual.factory.SsisLayer",
      "disable": 1,
      "paramDefinition": {
        "mtype": null,
        "mdataid": null,
        "method": null,
        "nclass": null,
        "twgx": null
      },
      "formDefinition": { type: "object", name: 'Aura.form.visual.SsisLayer'}
    },

    "js://aurin.org.au/visual/wif-layer": {
      "name": "What-if Analysis",
      "type": "in-context",
      "group": "Special Visualisations",
      "vizClass": "Aura.visual.factory.WifLayer",
      "disable": 1,
      "paramDefinition": {
        "factor": null,
        "rating": '50',
        "factor2": null,
        "rating2": '50',
        "factor3": null,
        "rating3": '50',
      },
      "formDefinition": { type: "object", name: 'Aura.form.visual.WifLayer'}
    },

    "js://aurin.org.au/visual/wif-suitability-layer": {
      "name": "What-if Suitability Analysis",
      "type": "in-context",
      "group": "Special Visualisations",
      "vizClass": "Aura.visual.factory.WifCommonLayer",
      "disable": 1,
      "paramDefinition": {
        'suitabilityLUName': null,
        "factor": '50',
        "importance": null,
        'factorType': '50',
        "rating": null,
        'convertFrom': '50',
      },
      "formDefinition": { type: "object", name: 'Aura.form.visual.WifSuitabilityLayer'}
    },



    "js://aurin.org.au/visual/geoinfo-layer": {
      "name": "Smart VIC Boundaries",
      "type": "in-context",
      "group": "Special Visualisations",
      "vizClass": "Aura.visual.factory.GeoInfoLayer",
      "disable": 1,
      "paramDefinition": {},
      "formDefinition": { type: "object", name: 'Aura.form.visual.GeoInfoLayer'}
    },

    "js://aurin.org.au/visual/vicstreet-layer": {
      "name": "Smart VIC Streets",
      "type": "in-context",
      "group": "Special Visualisations",
      "vizClass": "Aura.visual.factory.VicStreetLayer",
      "disable": 1,
      "paramDefinition": {},
      "formDefinition": { type: "object", name: 'Aura.form.visual.VicStreetLayer'}
    },

  }
};
