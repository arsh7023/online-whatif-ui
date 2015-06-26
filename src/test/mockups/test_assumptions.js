Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.tree.*',
  'Ext.ux.CheckColumn']);

Ext.override(Ext.data.AbstractStore, {
  indexOf: Ext.emptyFn
});


Ext.onReady(function () {
  Ext.QuickTips.init();

  //we want to setup a model and store instead of using dataUrl
  Ext.define('Suitability', {
    extend: 'Ext.data.Model',
    fields: [{
      name: 'property',
      type: 'string'
    }, {
      name: 'type',
      type: 'string'
    }, {
      name: 'group',
      type: 'string'
    }, {
      name: 'landUse',
      type: 'object'
    }, {
      name: 'residential',
      convert: function (value, record) {
        var landUse = record.get('landUse');
        if (landUse) return landUse.residential;
        return null;
      }
    }, {
      name: 'commercial',
      convert: function (value, record) {
        var landUse = record.get('landUse');
        if (landUse) return landUse.commercial;
        return null;
      }
    }, {
      name: 'industrial',
      convert: function (value, record) {
        var landUse = record.get('landUse');
        if (landUse) return landUse.industrial;
        return null;
      }
    }, {
      name: 'done',
      type: 'boolean'
    }]
  });

  var store = Ext.create('Ext.data.TreeStore', {
    model: 'Suitability',
    proxy: {
      type: 'ajax',
      //the store will get the content from the .json file
      url: 'treegrid.json'
    },
    folderSort: true
  });

  var editor = {
    xtype: 'numberfield',
    allowBlank: false,
    minValue: 0,
    maxValue: 100
  };

  var renderer = function (value, metaData, record, row, col, store, gridView) {

    if (record.get('group') === 'slope') {
      return render1(value, metaData, record, row, col, store, gridView);
    } else if (record.get('group') === 'ag') {
      return render2(value, metaData, record, row, col, store, gridView);
    } else {
      return render3(value, metaData, record, row, col, store, gridView);
    }
  };

  var render0 = function (value, metaData, record, row, col, store, gridView) {
    var background, r, g, b, x;

    if (record.get('type') === 'factor') {
      metaData.style = 'font-weight:bold;color:white;';
      x = 80;
    } else {
      x = 140;
    }
    b = Math.floor((100 - value) * (255 - x) / 100) + x;
    r = Math.floor(value * (255 - x) / 100) + x;
    g = x;

    background = sprintf('rgb(%d,%d,%d)', r, g, b);
    metaData.style += 'background-color:' + background + ';';

    // background color of pink, font color of red, and font-weight of bold
    return value;
  };

  var render1 = function (value, metaData, record, row, col, store, gridView) {
    var background, r, g, b, x;

    if (record.get('type') === 'factor') {
      metaData.style = 'font-weight:bold;color:black;';
      x = 120;
    } else {
      x = 120;
    }
    b = Math.floor(value * (255 - x) / 100) + x;
    r = x;
    g = x;

    background = sprintf('rgb(%d,%d,%d)', r, g, b);
    metaData.style += 'background-color:' + background + ';';

    // background color of pink, font color of red, and font-weight of bold
    return value;
  };

  var render2 = function (value, metaData, record, row, col, store, gridView) {
    var background, r, g, b, x;

    if (record.get('type') === 'factor') {
      metaData.style = 'font-weight:bold;color:black;';
      x = 120;
    } else {
      x = 120;
    }
    b = x;
    r = Math.floor(value * (255 - x) / 100) + x;
    g = x;

    background = sprintf('rgb(%d,%d,%d)', r, g, b);
    metaData.style += 'background-color:' + background + ';';

    // background color of pink, font color of red, and font-weight of bold
    return value;
  };

  var render3 = function (value, metaData, record, row, col, store, gridView) {
    var background, r, g, b, x;

    if (record.get('type') === 'factor') {
      metaData.style = 'font-weight:bold;color:black;';
      x = 120;
    } else {
      x = 120;
    }
    r = x;
    g = Math.floor(value * (255 - x) / 100) + x;
    b = x;

    background = sprintf('rgb(%d,%d,%d)', r, g, b);
    metaData.style += 'background-color:' + background + ';';

    // background color of pink, font color of red, and font-weight of bold
    return value;
  };

  //Ext.ux.tree.TreeGrid is no longer a Ux. You can simply use a tree.TreePanel
  var treePanel = Ext.create('Ext.tree.Panel', {
    frame: false,
    border: false,
    title: 'Suitability Factors',
    collapsible: true,
    useArrows: true,
    rootVisible: false,
    columnLines: true,
    store: store,
    multiSelect: true,
    singleExpand: false,
    cls: 'suit-tree',
    //the 'columns' property is now 'headers'
    plugins: [
    Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit: 2
    })],
    columns: [{
      xtype: 'treecolumn', //this is so we know which column will show the tree
      text: 'Factor',
      width: 250,
      sortable: true,
      dataIndex: 'property'
    }, {
      text: 'Residential',
      width: 70,
      dataIndex: 'residential',
      sortable: true,
      editor: editor,
      renderer: renderer
    }, {
      text: 'Commercial',
      width: 70,
      dataIndex: 'commercial',
      sortable: true,
      editor: editor,
      renderer: renderer
    }, {
      text: 'Industrial',
      width: 70,
      dataIndex: 'industrial',
      sortable: true,
      editor: editor,
      renderer: renderer
    }

    ]
  });


  var renderer2 = function (value) {
    var cssPrefix = Ext.baseCSSPrefix,
      cls = [cssPrefix + 'grid-checkheader'];

    if (value === 'yes') {
      cls.push(cssPrefix + 'grid-checkheader-checked');
    } else if (value === 'no') {
      cls.push(cssPrefix);
    } else {
      cls.push(cssPrefix + 'grid-checkheader-disabled');
    }
    return '<div class="' + cls.join(' ') + '">&#160;</div>';
  }

  Ext.create('Ext.data.Store', {
    storeId: 'conversionStore',
    fields: ['convert_from', 'residential', 'commercial', 'industrial'],
    data: {
      'items': [{
        'convert_from': 'Low Density Res.',
        'residential': 'disable',
        'commercial': 'yes',
        'industrial': 'yes'
      }, {
        'convert_from': 'Med Density Res.',
        'residential': 'disable',
        'commercial': 'yes',
        'industrial': 'yes'
      }, {
        'convert_from': 'Mixed Use',
        'residential': 'disable',
        'commercial': 'no',
        'industrial': 'no'
      }, {
        'convert_from': 'Nursing Home',
        'residential': 'disable',
        'commercial': 'no',
        'industrial': 'no'
      }, {
        'convert_from': 'Local Retail',
        'residential': 'no',
        'commercial': 'disable',
        'industrial': 'no'
      }]
    },
    proxy: {
      type: 'memory',
      reader: {
        type: 'json',
        root: 'items'
      }
    }
  });

  var conversionPanel = Ext.create('Ext.grid.Panel', {
    title: 'Conversion',
    autoScroll: true,
    frame: false,
    border: false,
    store: Ext.data.StoreManager.lookup('conversionStore'),
    //renderTo: Ext.getBody(),
    columnLines: true,
    columns: [{
      text: 'Current Land Uses to be converted',
      width: 250,
      dataIndex: 'convert_from'
    }, {
      text: 'Residential',
      xtype: 'checkcolumn',
      renderer: renderer2,
      width: 70,
      dataIndex: 'residential'
    }, {
      text: 'Commercial',
      xtype: 'checkcolumn',
      renderer: renderer2,
      width: 70,
      dataIndex: 'commercial'
    }, {
      text: 'Industrial',
      xtype: 'checkcolumn',
      renderer: renderer2,
      width: 70,
      dataIndex: 'industrial'
    }]
  });

  var panel = Ext.create('Ext.form.Panel', {
    header: false,
    bodyPadding: 5,
    frame: false,
    border: false,
    width: 490,

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
      value: '<b>Suitability - Suburbanization - Hervey Bay</b>',
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
    width: 500,
    height: 640,
    layout: 'vbox',
    items: [panel, {
      frame: false,
      border: false,
      region: 'center',
      xtype: 'tabpanel',
      items: [{
        title: 'Assumptions',
        layout: 'vbox',
        xtype: 'panel',
        items: [treePanel, conversionPanel]
      }, {
        title: 'Map',
        layout: 'fit',
        html: 'Hello world 2'
      }, {
        title: 'Report',
        layout: 'fit',
        html: 'Hello world 3',
      }]
    }]
  });
  win.show();

});