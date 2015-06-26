Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Aura', 'lib/aura');

var Aura = Aura || {}; // global Aura namespace
//Aura.map = {};
Ext.ns('Aura.map');
Ext.WindowMgr.zseed = 9001;

Ext.override(Ext.data.AbstractStore, {
  indexOf: Ext.emptyFn
});


Ext.onReady( function() {
  Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*',
    'Ext.ux.CheckColumn',
    'Aura.Cfg',
    'Aura.map.Common',
    'Aura.map.Map'
    ], function() {
      build();
    }
  );
});

function build() {

  var panel = Ext.create('Ext.form.Panel', {
    header: false,
    bodyPadding: 5,
    frame: false,
    border: false,
    width: 690,

    // Fields will be arranged vertically, stretched to full width
    layout: 'anchor',
    defaults: {
      labelAlign: 'right',
      labelWidth: 150,
      // anchor: '100%',
    },

    // The fields
    defaultType: 'displayfield',
    items: [{
      fieldLabel: 'Analysis Name',
      name: 'first',
      value: '<b>Suitability - Suburbanization</b>',
    }, {
      fieldLabel: 'Analysis Type',
      name: 'last',
      value: '<b>Suitability</b>'
    }, {
      fieldLabel: 'Area of Study',
      value: '<b>Hervey Bay, Queensland</b>'
    }, {
      xtype: 'button',
      style: {
        float: 'right'
      },
      text: 'Compute Analysis'
    }]
  });

  win = Ext.create('widget.window', {
    title: 'Analysis: Suitability - Suburbanization - Hervey Bay',
    closable: true,
    closeAction: 'hide',
    width: 700,
    height: 540,
    layout: 'vbox',
    items: [panel, {
      frame: false,
      border: false,
      region: 'center',
      xtype: 'tabpanel',
      layout: 'fit',
      activeTab: 1,
      items: [{
        title: 'Assumptions',
        layout: 'vbox',
        xtype: 'panel'
      }, {
        title: 'Map',
        height: 600,
        layout: 'fit',
        html: '<div id="map"></div>',
        flex: 1
      }, {
        title: 'Report',
        layout: 'fit',
        html: 'Hello world 3',
      }]
    }]
  });
  win.show();

  var map = Ext.create('Aura.map.Map', {
    editorType: 'ole' // or 'OpenLayers' [in-progress]
  });
}