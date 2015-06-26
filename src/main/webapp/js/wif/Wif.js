/**
 * @class Wif
 * @singleton
 *
 * The entry point for various Wif modules
 *
 */


var Wif = Wif || {} // global Wif namespace
  , evil = eval; // obscure eval, just make sure avoid any external injection

(function () { // setting up main enclosure

  //_.logSetFilter(["Aura.data.factory.TwitterTimelineStore"]);

  Ext.Loader.setConfig({disableCaching: false});
  Ext.Loader.setPath('Wif', wifUiConfig['appBase'] + '/js/wif');
  Ext.Loader.setPath('Ext', 'https://apps.aurin.org.au/assets/js/extjs-4.1.0/src');
  Ext.Loader.setPath('Ext.ux', 'https://apps.aurin.org.au/assets/js/extjs-4.1.0/ux');

  Ext.override(Ext.data.AbstractStore, {
    indexOf : Ext.emptyFn
  });

  // set default setup
  Ext.apply(Wif, {
    uiVersion: '1.0',
    // three main data collections (non-ui components)
    // each wraps a collection of elements
    selectionCollection: null
  , dataCollection: null
  , visualCollection: null
    // hash table for individual elements (selection, data, visual)
  , elementDict: {}

  , areaSelector: null

  , localeStorage: null
  , session: null // container for project and workspace settings
  });

  Wif.launch = function (config) {
    if (!config) config = {};
    // Adjust path to the app container
    if (config.appPath) { Aura.appPath = config.appPath; }
    Ext.Loader.setPath({
      'Wif': Aura.appPath + 'js/wif'
    , 'Ext.ux.desktop': Aura.appPath + 'js/common/Ext/ux/desktop'
    });

    Ext.require([
        'Wif.desktop.App',
        'Wif.model.ProjectsSimpleObject',
        'Ext.util.Renderable',
        'Ext.selection.CellModel',
        'Ext.grid.*',
        'Ext.data.*',
        'Ext.util.*',
        'Ext.state.*',
        'Ext.form.*',
        'Ext.ux.CheckColumn',
        'Ext.ux.desktop.TaskBar',
        'Ext.ux.desktop.Wallpaper'
      ]
    , function () {
        Wif.init(config);
      }
    );

  };
  

  Wif.init = function (config) {
    _.log(this, 'init completed');
    Ext.QuickTips.init();

    Wif.userId = Aura.userId;
    
    Ext.define('Wif.EventBus', {
    	  mixins: {
    		  observable: 'Ext.util.Observable'
    	  },
    	  constructor: function(config) {
    		  this.mixins.observable.constructor.call(this, config);
    		  this.addEvents(
    			'projectsChanged'
    		  );
    	  },
    	  projectsChanged: function() {
    		  this.fireEvent('projectsChanged');
    	  }
      });
    Wif.eventBus = Ext.create('Wif.EventBus');
        
    Wif.projectsSimpleObject = Ext.create('Wif.model.ProjectsSimpleObject');
    Wif.desktopApp = Ext.create('Wif.desktop.App');
    Wif.endpoint = wifUiConfig['endpoint'];
    Wif.db = {};

    Wif.desktopApp.on('ready', function () {
      Wif.desktopApp.moduleShow('Wif.desktop.ProjectListModule');
    });

    //Wif.desktopApp.newScenario();
    //Wif.desktopApp.newProject();

    //Wif.testPrj = Ext.create('Wif.setup.ProjectWizard', { projectId: 106 });
    //Wif.testPrj.build();

  };

}()); // end of main enclosure
