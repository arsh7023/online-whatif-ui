/*
 * @Object Aura.Util
 *
 * Collection of various utility functions.
 *
 * Dependencies:
 * Ext core must be loaded, including Ext.data.Store
 */

// Global Aura.Util namespace
Ext.ns('Aura.Util');
var _u = Aura.Util; // shorthand

(function () {// start enclosure

  /**
   * Generic require that works for both Ext class name and .js files.
   *
   * @param {Array} dependencies Array of of classnames or .js files.
   * @param {String} sig Signature/prefix for classname (default is 'Aura')
   *
   */
  Aura.Util.require = function (dependencies, callback, sig) {
    var i = dependencies.length-1
      , f = callback
      , d
      , fgen = {
          depClass: function (d, nextf) {
            return function() {
              Ext.require(d, nextf);
            }
          }
        , depJs: function (d, nextf) {
            return function() {
              Ext.Loader.loadScript({
                url: d
              , onLoad: nextf
              });
            }
          }
        };

    sig = sig || 'Aura.';

    while (i >= 0) {
      d = dependencies[i];
      if (d.substring(0, sig.length) === sig) { // class dependencies
        f = fgen.depClass(d, f);
      } else { // assume ad-hoc JS file dependencies
        f = fgen.depJs(d, f);
      }
      i--;
    }
    f(); // start the chain!
  };

  /**
   * Combine two arrays of objects
   *
   * [ { "key1": x, "key2": y}
   *   { "key1": v, "key2": w} ]
   *
   * [ { "key1": x, "key2": y}
   *   { "key1": a, "key2": y} ]
   *
   */
  Aura.Util.union = function (arr1, arr2, key) {
    var results = []
      , keys = {}
      , a, i, j;

    if (!arr2) { return Ext.clone(arr1); }

    j = arr1.length;
    for (i = 0; i < j; i++) {
      a = arr1[i];
      results.push(Ext.clone(a));
      keys[a[key]] = 1;
    }

    j = arr2.length;
    for (i = 0; i < j; i++) {
      a = arr2[i];
      if (a[key] in keys) { continue; }
      results.push(Ext.clone(a));
    }
    return results;
  };

  Aura.Util.combine = function (arr1, arr2) {
    var results = [], len;

    len = arr1.length;
    for (var i = 0; i < len; i++) {
      results.push(Ext.clone(arr1[i]));
    }

    len = arr2.length;
    for (i = 0; i < len; i++) {
      results.push(Ext.clone(arr2[i]));
    }
    return results;
  };

  Aura.Util.viewGrid = function (name, grid, element, uiSettings) {
    var win = Ext.create('Ext.Window', {
      title : name,
      element : element,
      x : uiSettings.x,
      y : uiSettings.y,
      width : uiSettings.w,
      height : uiSettings.h,
      headerPosition : 'top',
      layout : 'fit',
      items : [grid]
    });
    win.show();
    return win;
  };

  // ExtJS model utility function
  Aura.Util.quickModel = function (modelName, fields) {
    return Ext.define(modelName, {
      extend : 'Ext.data.Model',
      fields : fields
    });
  };

  // Some pre-defined models
  Aura.Util.dummyModel = Aura.Util.quickModel("Aura.Util.DummyModel", []);
  Aura.Util.jsonRecordModel = Aura.Util.quickModel("Aura.Util.JsonRecordModel", ["id", "data"]);

  Aura.Util.jsonpStore = function (modelName, url, extraParams, root) {
    var store = Ext.create('Ext.data.Store', {
      model : modelName
    , proxy : {
        type : "jsonp"
      , extraParams : extraParams
      , url : url
      , reader : {
          type : 'json'
        , root : root
        }
      }
    , autoLoad : false
    });
    return store;
  };

  Aura.Util.quickColumns = function (fields) {
    var columns = [], i, j = fields.length, field;

    for (i = 0; i < j; i++) {
      field = fields[i];
      columns.push({
        text: field
      , dataIndex: field
      , sortable: true
      });
    }
    return columns;
  };

  Ext.define('Aura.Util.quickCombo', {
    extend : 'Ext.form.ComboBox',
    xtype : 'quickcombobox',

    constructor : function (config) {
      /** Sample for config:
       *
       * { fieldLabel: 'Choose a value'
       *   data: [
       *     {"key": "key1, ""name": "name1"},
       *     {"key": "key2, ""name": "name2"}
       *   ]
       * }
       *
       */
      var store = Ext.create('Ext.data.Store', {
        fields: ['key', 'name']
      , data: config.data
      });

      Ext.applyIf(config, {
        valueField: "key"
      , displayField: "name"
      , store: store
      , queryMode: 'local'
      });
      Ext.apply(this, config);

      this.callParent(arguments);
    }
  });

  Ext.define('Aura.Util.quickGrid', {
    extend : 'Ext.grid.Panel',
    xtype : 'quickgrid',

    constructor : function (config) {
      /** Sample of config:
       *
       * { data: [
       *     {"key": "key1, ""name": "name1"},
       *     {"key": "key2, ""name": "name2"}
       *   ]
       * }
       *
       */

      var store = Ext.create('Ext.data.Store', {
        fields: ['key', 'name'],
        data: config.data
      });

      Ext.applyIf(config, {
        store: store
      , hideHeaders: true
      , style: {
          border: 0
        , padding: 0
        }
      , columns: {
          items: [{
            dataIndex: 'name'
          , flex: 1
          }]
        , defaults: {
            sortable: true
          , menuDisabled: true
          , draggable: false
          , groupable: false
          }
        }
      , selModel: {
          selType: 'rowmodel'
        }
      });
      Ext.apply(this, config);

      this.callParent(arguments);
    }
  });

  Ext.define('Aura.Util.DataListComboBox', {
    extend : 'Ext.form.ComboBox',
    xtype : 'datalistcombobox',
    collection : null,

    constructor : function (config) {
      Ext.apply(this, config);

      Ext.apply(config, {
        valueField : "element",
        displayField : "itemName",
        store : config.collection.store,
        queryMode : 'local',

        // Template for the dropdown menu.
        // Note the use of "x-boundlist-item" class,
        // This is required to make the items selectable.
        /*
        tpl: Ext.create('Ext.XTemplate',
          '<tpl for=".">',
          '<div class="x-boundlist-item">{[this.makeName(element)]}</div>',
          '</tpl>',
          { makeName: function (element) {
              return element.getName();
            }
          }
        ),

        // Template for the content inside text field
        displayTpl: Ext.create('Ext.XTemplate',
          '<tpl for=".">',
          '{[element.getName()]}',
          '</tpl>'
        )
        */
      });

      this.callParent(arguments);
    }
  });

  Ext.define('Aura.Util.sortableGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'sortablegrid',
    orderField: 'orderField',
    autoSync: true,

    constructor : function (config) {
      var me = this, fields = config.fields;

      var store = Ext.create('Ext.data.Store', {
        fields: fields,
        data: config.data
      });
      store.sort(config.orderField, 'ASC');

      var items = [], model = [];
      if (!config.columns) {
        for (var i = 0, j = fields.length; i < j; i++) {
          items.push({
            dataIndex: fields[i]
          , header: fields[i]
          , flex: 1
          });
        }
      }

      Ext.applyIf(config, {
        store: store
      , hideHeaders: true
      , style: {
          border: 0
        , padding: 0
        }
      , columns: items
      , selModel: {
          selType: 'rowmodel'
        }
      });
      Ext.apply(this, config);

      this.viewConfig = {
        markDirty: false
      , forceFit: true
      , plugins: {
          ptype: 'gridviewdragdrop',
          dragText: 'Drag and drop to reorganize'
        }
      , listeners: {
          drop: function (node, data, dropRec, dropPosition) {
            console.log('drop');
            if (!dropRec) return;
            var store = dropRec.store;
            if (!store) return;
            var records = store.data.items;

            for (var i = 0, j = records.length; i < j; i++) {
              records[i].set(me.orderField, i);
            }
            store.sort(me.orderField, 'ASC');
          }
        }
      };

      this.callParent(arguments);
    }
  });

  Ext.define('Aura.Util.SimpleComboBox', {
    extend : 'Ext.form.ComboBox',
    xtype : 'simplecombobox',

    constructor : function (config) {
      /** Sample of config:
       *
       * { fieldLabel: 'Choose a value',
       *   data: [
       *     {"value": "key1, "label": "name1"},
       *     {"value": "key2, "label": "name2"}
       *   ]
       * }
       *
       */

      var store = Ext.create('Ext.data.Store', {
        fields : ['value', 'label'],
        data : config.data
      });

      Ext.applyIf(config, {
        valueField : "value",
        displayField : "label",
        store : store,
        queryMode : 'local'
      });
      Ext.apply(this, config);

      this.callParent(arguments);
    }
  });

  Ext.define('Aura.Util.RemoteComboBox', {
    extend : 'Ext.form.field.ComboBox'
  , xtype : 'remotecombobox'
  , fields: null
  , serviceParams: null
  , autoLoad: null

  , typeAhead: true
  , typeAheadDelay: 50
  , triggerAction: 'all'
  , selectOnTab: true
  , lazyRender: true
  , listClass: 'x-combo-list-small'

  , constructor : function (config) {
      /** Sample of config:
       *
       * { fieldLabel: 'Choose a value',
       *   fields: ['value', 'label']
       *   url: https: ...
       * }
       *
       */
      var fields, store;

      fields = config.fields || ['value', 'label'];
      config.fields = fields;
      store = Ext.create('Ext.data.Store', {
        fields: fields
      , data: []
      });

      Ext.applyIf(config, {
        valueField: fields[0],
        displayField: fields[1],
        store: store,
        queryMode: 'local'
      });
      Ext.apply(this, config);

      this.callParent(arguments);
      if (config.autoLoad) {
        this.load();
      }
    }

  , load: function(loadcallback) {
      var me = this;

      function getComboItems(data) {
        if (!data) {
          return;
        }
        me.store.loadData(data);
        if (me.callback)
          me.callback(data);
        if (loadcallback) {
      	  loadcallback();
        }
      }
      Aura.data.Consumer.getBridgedService(this.serviceParams, getComboItems, 0);
    }
  });

}()); // end enclosure
