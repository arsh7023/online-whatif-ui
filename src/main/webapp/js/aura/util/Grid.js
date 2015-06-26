Ext.define('Aura.util.Grid', {
  extend : 'Ext.grid.Panel',
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
    width : 38,
    header: 'Delete',
    sortable : false,
    items : [{
      iconCls : 'wif-grid-row-delete',
      tooltip : 'Delete',
      handler : function(grid, rowIndex, colIndex) {
        grid.store.removeAt(rowIndex);
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
  constructor : function(config) {
    Ext.apply(this, config);

    this.cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit : 1
    });
    this.plugins = [this.cellEditor];

    this.callParent(arguments);
  }
}); 