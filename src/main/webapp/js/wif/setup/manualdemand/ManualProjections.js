Ext.define('Wif.setup.manualdemand.ManualProjections', {
	
 extend : 'Aura.util.Grid',
  //extend : 'Ext.form.Panel',
  project : null,
  title : 'Future Projections',
  model : null,
  pendingChanges : null,
  sortKey : 'year',
  border : 1,

  constructor : function(config) {
    var me = this;
    this.preconstruct();
    Ext.apply(this, config);
    _.log(this, 'constructorproject');
    var projectId = me.project.projectId;

    /*
    this.model = Ext.define('ProjModel', {
      extend : 'Ext.data.Model',
      fields : [{
        name : 'year',
        type : 'string'
      }],
      validations : [{
        type : 'format',
        field : 'year',
        matcher : /^[12][0-9]{3}$/  ///^\d{4}$/
      }]
    });
    */
    
    
    this.model = Ext.define('Wif.setup.ProjModel', {
        extend : 'Ext.data.Model',
        idProperty : '_id',
        fields : [{
          name : 'year',
          type : 'string',
          defaultValue : ''     
        }],
        validations : [{
            type : 'format',
            field : 'year',
            matcher : /^[12][0-9]{3}$/  ///^\d{4}$/
          }]
      });
    

    this.store = Ext.create('Ext.data.Store', {
      model : this.model,
      sorters: [{
        property: 'year',
        direction: 'DESC'
    }]
    });
    
    
    //ali
    
   // this.grid = Ext.create('Ext.grid.Panel', {     
     //   store : store  
      //});
      
    //ali
    
    
    this.yearTranslators = [{
      getter : ['data', 'year'],
      setter : 'year'
    }];

    this.columns.splice(this.insertIdx, 0, {
      header : 'year',
      dataIndex : 'year',
      flex : 1,
      editor : {
        allowBlank : false
      }
    });
    
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
