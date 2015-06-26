Ext.define('Wif.setup.SuFactorValues', {
  extend : 'Ext.grid.Panel',
  project : null,
  factor : null,
  loadmask : null,
  serviceParams : {
    xdomain : "cors",
    url : null,
    headers : {
      'X-AURIN-USER-ID' : Wif.userId
    }
  },
  title : 'Factor Values',
  model : null,
  baseViewConfig : {
    markDirty : false,
    forceFit : true
  },
  insertIdx : 0// 1
  ,
  baseColumns : [
  /*{ xtype: 'checkcolumn'
   , dataIndex: 'checked'
   , width: 20
   , stopSelection: false
   }
   ,*/
  {
    xtype : 'actioncolumn',
    width : 24,
    sortable : false,
    items : [{
      iconCls : 'wif-grid-row-delete',
      tooltip : 'Delete',
      handler : function(grid, rowIndex, colIndex) {
        var panel = grid.ownerCt;
        grid.store.removeAt(rowIndex);
        panel.fireChanged();
      }
    }]
  }],
  selModel : {
    selType : 'cellmodel'
  },
  border : 0,
  baseTbar : [{
    text : 'Add New Item',
    handler : function() {
      var grid = this.findParentByType('grid'), record = Ext.create(grid.model, grid.modelDefault || {}), store = grid.getStore(), gridCount = store.getCount();

      store.add(record);
      grid.cellEditor.startEditByPosition({
        row : gridCount,
        column : grid.insertIdx
      });
    }
  }],
  preconstruct : function() {
    this.viewConfig = Ext.clone(this.baseViewConfig);
    this.columns = Ext.clone(this.baseColumns);
    this.tbar = Ext.clone(this.baseTbar);
  },
  fireChanged : function() {
    var me = this;
    _.log(this, 'fireChanged');
    var factorTypes = [];
    me.store.each(function(record) {
      var ft = _.translate(record.data, me.store.outTranslators);
      delete ft._id;
      delete ft._rev;
      factorTypes.push(ft);
      return true;
    });
    me.factor.data.factorTypes = factorTypes;
    me.fireEvent('changed', me);
  },
  constructor : function(config) {
    var me = this;
    Ext.apply(this, config);
    this.preconstruct();
    this.addEvents(['changed']);

    Ext.apply(this.viewConfig, {
      plugins : {
        ptype : 'gridviewdragdrop',
        dragText : 'Drag and drop to reorganize'
      },
      listeners : {
        drop : function(node, data, dropRec, dropPosition) {
          if (!dropRec)
            return;
          var store = dropRec.store;
          if (!store)
            return;
          var records = store.data.items;

          for (var i = 0, j = records.length; i < j; i++) {
            records[i].set('naturalOrder', i);
          }
          store.sort('naturalOrder', 'ASC');
        }
      }
    });

    this.columns.splice(this.insertIdx, 0// insert after first column
    , {
      header : '',
      dataIndex : 'naturalOrder',
      width : 20,
      align : 'left'
    }, {
      header : 'Value',
      dataIndex : 'value',
      flex : 1,
      align : 'left',
      editor : {
        allowBlank : false
      }
    }, {
      header : 'Value Label',
      dataIndex : 'label',
      flex : 2,
      editor : {
        allowBlank : false
      }
    });

    this.tbar = [{
      text : 'Initialize Values',
      handler : function() {
        // https://dev-api.aurin.org.au/aurin-wif/projects/1/unionAttributes/SCORE_1/values
        if (!me.factor)
          return;
        var store = me.getStore();

        Ext.Msg.show({
          title : 'Overwrite?',
          msg : 'This will remove all the existing data. Would you like to continue?',
          buttons : Ext.Msg.YESNO,
          icon : Ext.Msg.QUESTION,
          fn : function(btn) {
            if (btn === 'yes') {
              initValues();
            }
          }
        });

        function initValues() {
          var serviceParams = {
            xdomain : "cors",
            url : Wif.endpoint + 'projects/' + me.project.projectId + '/unionAttributes/' + me.factor.data.featureFieldName + '/values/',
            method : "get",
            params : null,
            headers : {
              "X-AURIN-USER-ID" : Wif.userId
            }
          };

          function serviceHandler(data) {

            if (!data) {
              return;
            }
            var rows = [];
            for (var i = 0, j = data.length; i < j; i++) {
              rows[i] = {
                label : data[i],
                value : data[i],
                naturalOrder : i,
                docType : 'FactorType',
                factorId : me.factor.data._id
              };
            }
            // replace with everything and replace with new ones
            store.loadData(rows);
            store.sort('naturalOrder', 'ASC');
            me.fireChanged();
            me.loadmask.hide();
          }


          me.loadmask = Ext.create('Ext.LoadMask', me, {
            msg : 'Updating ...'
          });
          me.loadmask.show();
          Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
        }

      }
    }];

    /*{
     "id": 201,
     "value": "2.0",
     "label": "6% - <12%",
     "naturalOrder": 2
     }*/

    this.model = Ext.define('Wif.setup.FactorValueModel', {
      extend : 'Ext.data.Model',
      idProperty : '_id',
      fields : [{
        name : '_id',
        type : 'auto',
        defaultValue : null,
        useNull : true
      }, {
        name : '_rev',
        type : 'auto',
        defaultValue : null,
        useNull : true
      }, {
        name : 'docType',
        type : 'string',
        defaultValue : 'FactorType'
      }, {
        name : 'naturalOrder',
        type : 'auto'
      }, {
        name : 'value',
        type : 'auto',
        defaultValue : ''
      }, {
        name : 'label',
        type : 'string',
        defaultValue : ''
      }, {
        name : 'factorId',
        type : 'string',
        defaultValue : ''
      }]
    });

    this.store = Ext.create('Ext.data.Store', {
      model : 'Wif.setup.FactorValueModel',
      outTranslators : [{
        getter : '_id'
      }, {
        getter : '_rev'
      }, {
        getter : 'label'
      }, {
        getter : 'value'
      }, {
        getter : 'factorId'
      }, {
        getter : 'docType'
      }, {
        getter : 'naturalOrder'
      }]
    });

    this.cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit : 1
    });
    this.plugins = [this.cellEditor];

    this.callParent(arguments);
  },
  rebuild : function(factor) {
    var me = this;
    me.factor = factor;
    if (factor == null) {
      me.store.removeAll();
    } else {
      me.store.loadData(factor.data.factorTypes);
    }
  },
  build : function() {
    me.on('beforeedit', function(editor, e) {
      _.log(this, 'beforeedit', editor, e);
      return true;
    });

    me.on('edit', function(editor, e) {
      _.log(this, 'edit', editor, e);
      me.mask.show();
      me.fireChanged();
      return true;
    });
  }
});
