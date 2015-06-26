Ext.define('Wif.setup.UnionAttrFields', {
  //extend : 'Aura.Util.RemoteComboBox',
  extend : 'Ext.data.Store',
  //autoLoad : true,
  //multiSelect : false,
  //forceSelection: true,
  projectId : null,
  //editable : true,
  //allowBlank : false,
  //emptyText : "Select From Union Fields",
  serviceParams : {
    xdomain : "cors",
    url : null,
    method : "get",
    params : null,
    headers : {
      "X-AURIN-USER-ID" : Wif.userId
    }
  },
  constructor : function(config) {
    Ext.apply(this, config);

    if (config.projectId) { 
      this.serviceParams.url = Wif.endpoint + 'projects/' + config.projectId + '/demand/setup/';
    }
    this.callParent(arguments);
  },
  load : function(projectId) {
    var me = this;

    if (projectId) {
      this.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/demand/setup/';
    }

    function serviceHandler(data) {
      var translators = [{
        setter : function(object, value) {
          object.label = value;
          object.value = value;
        }
      }];
      if (!data) {
        return;
      }
      var options = _.translate3(data, translators);
      me.store.removeAll();
      me.store.loadData(options);
      if (me.callback)
        me.callback(data);
    }


    Aura.data.Consumer.getBridgedService(me.serviceParams, serviceHandler, 0);
  }
});
