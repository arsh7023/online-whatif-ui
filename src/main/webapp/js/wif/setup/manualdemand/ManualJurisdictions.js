Ext.define('Wif.setup.manualdemand.ManualJurisdictions', {

  extend : 'Aura.util.Grid',
  //extend : 'Ext.form.Panel',
  project : null,
  title : 'Jurisdictions',
  model : null,
  pendingChanges : null,
  sortKey : 'label',
  border : 2,

  constructor : function(config) {
    var me = this;
    this.preconstruct();
    Ext.apply(this, config);
    _.log(this, 'constructor');
    
    this.model = Ext.define('JurisModel', {
      extend : 'Ext.data.Model',
      fields : [{
        name : 'label',
        type : 'string'
      }]
    });

    this.store = Ext.create('Ext.data.Store', {
      model : this.model,
    });

    this.labelTranslators = [{
      getter : ['data', 'label'],
      setter : 'label'
    }];

    this.columns.splice(this.insertIdx, 0
    , {
      header : 'Label',
      dataIndex : 'label',
      flex : 1,
      editor : {
        allowBlank : false
      }
    });
    //Aura.store = this.store;
   this.callParent(arguments);
  },

  listeners : {
    activate : function() {
      _.log(this, 'activate');
      this.build();
    }
  },
  build : function() {
    var me = this;
  },

  validate : function(callback) {
    var me = this;
  }

});
