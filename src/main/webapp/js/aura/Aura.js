/**
 * @class Aura
 * @singleton
 *
 * The entry point for various Aura modules
 *
 */

var Aura = Aura || {} // global Aura namespace
  , evil = eval; // obscure eval, just make sure avoid any external injection

(function () { // setting up main enclosure

  //_.logSetFilter(["Aura.data.factory.TwitterTimelineStore"]);

  Ext.Loader.setConfig({ // configure asynchronous loader
    enabled: true
  , paths: {
      'Aura': wifUiConfig['appBase'] + '/js/aura' // relative to the HTML container
    }
  });

  // set default setup
  Ext.apply(Aura, {
    host: window.location.host
  , endpoints: {
      'portal.aurin.org.au': 'endpoints-prod.js'
    , 'portal-dev.aurin.org.au': 'endpoints-dev.js'
    , 'staging.aurin.org.au': 'endpoints-staging.js'
    , 'localhost:8080': 'endpoints-dev.js'
    , 'localhost': 'endpoints-local.js'
    }
  , auraMap: null // Aura.map.Map instance
  , appPath: wifUiConfig['appBase'] + '/'
  , useDispatcher: false
  , dispatcher: ''
  , postDispatcher: ''
  , userId: "Guest"

    // three main data collections (non-ui components)
    // each wraps a collection of elements
  , selectionCollection: null
  , dataCollection: null
  , visualCollection: null
    // hash table for individual elements (selection, data, visual)
  , elementDict: {}

  , areaSelector: null

  , localeStorage: null
  , session: null // container for project and workspace settings
  });

  Aura.launch = function (config) {
    if (!config) config = {};
    // Adjust path to the app container
    if (config.appPath) { Aura.appPath = config.appPath; }
    Ext.Loader.setPath('Aura', Aura.appPath + 'js/aura');

    var host = (Aura.host in Aura.endpoints) ? Aura.host : 'portal.aurin.org.au';

    Ext.ns("Aura.workflow");
    Ext.ns('Aura.form.workflow');

    Aura.Util.require(
      [ 'Aura.Cfg'
      , Aura.appPath + '/js/aura/local-system/' + Aura.endpoints[host]
      , 'Aura.data.Consumer'
      ]
    , function () { Aura.init(config); }
    );
  };

  Aura.init = function (config) {
    var project;


    Ext.QuickTips.init();

    // Set default config value
    if (typeof config === 'undefined') {
      config = {
        noUi: false // set noUi true for debugging without building the UI
      };
    }

    // Configure userId
    if (config.userId) { // set by index.jsp
      Aura.userId = config.userId;
    } else {
      // inject userId manually
      if (Aura.host === 'localhost') { // testing only
        Aura.userId = 'Guest';
      } else {
        Aura.userId = 'Guest-' + _.uuid4();
      }
    }

    // Update resource path
    Aura.Cfg.updateResourcePath(Aura.appPath);

    // Setting up dispatcher for secure proxy
    // For testing in localhost use non-secure proxy in restricted network

      //line below commented by ali;  
//    if (Aura.host !== "localhost") {
      Aura.useDispatcher = true; // use dispatcher servlet
      Aura.dispatcher = Aura.appPath + 'dispatcher?url=';
      Aura.getDispatcher = Aura.appPath + 'dispatcher?';
      Aura.postDispatcher = Aura.appPath + 'dispatcher';
      Aura.downloader = Aura.appPath + 'downloader';
//    }

    if (config.noPlayground) {
      if (config.callback) {
        config.callback();
      }
      return;
    }


    // Setting up local storage provider for client side persistence
    // Also act as a proxy
    Aura.localStore = Ext.state.LocalStorageProvider.create();

    // Setting and loading up user project
    project = Ext.create('Aura.project.Project', {
      localStore: Aura.localStore
    , userId: Aura.userId
    , noRemote: false
    , callback: projectLoaded
    });

    function projectLoaded (project) {
      var workspaceSettings, dependencies, brusher, cfg;

      _.log(this, 'projectloaded', project);

      /// Workspace setting
      workspaceSettings = Ext.create('Aura.workspace.WorkspaceSettings', {
        localStore: Aura.localStore
      , defaultUiSettings: Aura.Cfg.ui.defaultUiSettings
      });

      /// Dependencies and brushing
      dependencies = Ext.create('Aura.element.Dependencies');
      brusher = Ext.create('Aura.Brusher', {
        dependencies: dependencies
      });

      /// Session
      Aura.session = {
        project: project
      , workspaceSettings: workspaceSettings
      , dependencies: dependencies
      , brusher: brusher
      };

      /// Collections
      cfg = {
        project: project
      , autoLoad: true
      };

      Aura.selectionCollection = Ext.create('Aura.element.SelectionCollection', cfg);
      Aura.dataCollection = Ext.create('Aura.element.DataCollection', cfg);
      Aura.visualCollection = Ext.create('Aura.element.VisualCollection', cfg);

      /// Workspace
      if (!config.noUi) { // if ui is not disabled
        Aura.session.workspace = Ext.create('Aura.workspace.Workspace', {
          floatingSelector: true
        , mapEditorType: 'ole' // or 'OpenLayers' [in-progress]
        });
        Aura.session.workspace.build();
      }

      /// Final callback
      if (config.callback) {
        config.callback();
      }
    };
  };

}()); // end of main enclosure
