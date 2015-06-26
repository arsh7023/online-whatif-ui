Ext.define('Wif.setup.allocation.AllocationScenario', {
  extend : 'Ext.grid.Panel',
  project : null,
  title : 'Allocation Scenario',
  margin : '20 20 20 20',
  constructor : function(config) {
    _.log(this, 'constructor');
    var me = this;
    Ext.apply(this, config);

    this.addEvents(['changed']);

    this.columns = [{
      header : '',
      dataIndex : 'naturalOrder',
      width : 60,
      align : 'left'
    }, {
      header : 'Label',
      dataIndex : 'label',
      flex : 1
    }];

    this.model = Ext.define('Wif.setup.AllocationModel', {
      extend : 'Ext.data.Model',
      idProperty : '_id',
      fields : [{
        name : 'label',
        type : 'string',
        defaultValue : ''
      }, {
        name : 'naturalOrder',
        type : 'auto'
      }]
    });

    this.store = Ext.create('Ext.data.Store', {
      model : 'Wif.setup.AllocationModel'
    });

    var fields = this.model.getFields();
    var store = this.store;

    this.viewConfig = {
      markDirty : false,
      forceFit : true,
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
    };

    var serviceParams = {
      xdomain : "cors",
      url : Wif.endpoint + 'projects/' + me.project.projectId + '/allocationLUs/',
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
          label : data[i].label,
          naturalOrder : i
        };
      }
      store.removeAll();
      store.loadData(rows);
      store.sort('naturalOrder', 'ASC');
      me.fireChanged();
    };

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    this.callParent(arguments);
  },

  listeners : {
    activate : function() {
      _.log(this, 'activate');
      this.build();
    }
  },
  build : function() {
    var me = this, projectId = me.project.projectId;

    // if (projectId) {// do this before callParent
    // me.store.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/allocationLUs/';
    // }
    //
    // this.callParent(arguments);
  }
});
