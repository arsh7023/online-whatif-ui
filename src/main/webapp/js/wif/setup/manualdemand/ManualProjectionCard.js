Ext.define('Wif.setup.manualdemand.ManualProjectionCard', {
  extend : 'Ext.form.Panel',
  title : 'Finalise Manual Demand Setup'
//	extend : 'Aura.util.Grid',
//  isNew : false,
//  project : null,
//  title : 'Future Projections',
//  model : null,
//  pendingChanges : null,
//  sortKey : 'year',
//  border : 2,
//
//
//  constructor : function(config) {
//    var me = this;
//    this.preconstruct();
//    Ext.apply(this, config);
//    _.log(this, 'constructorproject');
//    var projectId = me.project.projectId;
////
////    this.projections = Ext.create('Wif.setup.demand.Projections', {
////      project : me.project,
////      region : 'west',
////      flex : 1,
////      layout : 'fit'
////    });
//    
//    
//    this.model = Ext.define('Wif.setup.ProjModel', {
//        extend : 'Ext.data.Model',
//        idProperty : '_id',
//        fields : [{
//          name : 'year',
//          type : 'string',
//          defaultValue : ''     
//        }],
//        validations : [{
//            type : 'format',
//            field : 'year',
//            matcher : /^[12][0-9]{3}$/  ///^\d{4}$/
//          }]
//      });
//    
//
//    this.store = Ext.create('Ext.data.Store', {
//      model : this.model,
//    });
//   
//    this.yearTranslators = [{
//      getter : ['data', 'year'],
//      setter : 'year'
//    }];
//
//    this.columns.splice(this.insertIdx, 0, {
//      header : 'year',
//      dataIndex : 'year',
//      flex : 1,
//      editor : {
//        allowBlank : false
//      }
//    });
//    //
//    //me.items = [this.projections, this.jurisdictions];
//
//    this.callParent(arguments);
//  },
//
//  listeners : {
//    activate : function() {
//    	_.log(this, 'activate projection');
//      this.build();
//    }
//  },
//  build : function() {
//    var me = this;
//    
//    var definition = me.project.getDefinition();
//    var rows = definition.projections;
//    _.log('rowsprj', rows);
//    me.store.removeAll();
//    me.store.loadData(rows);
//    
//    
//  },
//
//  validate : function(callback) {
//    var me = this, gridValid = true;
//    me.store.each(function(record) {
//      if (!record.isValid()) {
//        _.log(this, 'validate', 'record is not valid');
//        gridValid = false;
//      }
//    });
//    if (!gridValid) {
//      Ext.Msg.alert('Status', 'Years for projections should be from 1000 to 2999!');
//      return false;
//    }
//    var definition = me.project.getDefinition();
//    Ext.merge(definition, {
//      projections : _.translate3(me.store.data.items, me.yearTranslators)
//    });
//
//    me.project.setDefinition(definition);
//    
//    _.log(this, 'validate', 'me.project.getDefinition()', me.project.getDefinition());
//    
//    if (callback) {
//      _.log(this, 'callback');
//      callback();
//    }
//    return true;
//  }
});
