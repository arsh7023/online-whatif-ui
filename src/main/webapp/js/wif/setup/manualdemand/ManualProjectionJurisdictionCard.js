Ext.define('Wif.setup.manualdemand.ManualProjectionJurisdictionCard', {
  extend : 'Ext.form.Panel',
  project : null,
  isNew : false,
  bodyPadding : 1,
  
  autoRender : true,
  margin : 'auto',
  projectsData : null,
  layout : {
    type : 'border',
  },
  defaults : {
    //collapsible : true
    //split : true
  },

  constructor : function(config) {
    var me = this;
    Ext.apply(this, config);
    var projectId = me.project.projectId;

    this.projections = Ext.create('Wif.setup.manualdemand.ManualProjections', {
      project : me.project,
      region : 'west',
      flex : 1,
      layout : 'fit'
    });
//    this.jurisdictions = Ext.create('Wif.setup.manualdemand.ManualJurisdictions', {
//      project : me.project,
//      region : 'center',
//      flex : 1,
//      layout : 'fit'
//    });

    //me.items = [this.projections, this.jurisdictions];
    me.items = [this.projections];

    this.callParent(arguments);
  },

  listeners : {
    activate : function() {
      this.build();
    }
  },
  build : function() {
    var me = this;
    
    var definition = me.project.getDefinition();
    var rows = definition.projections;
    _.log('rowsprj', rows);
    me.projections.store.removeAll();
    me.projections.store.loadData(rows);
    
//    
//    var rows1 = definition.projections;
//    _.log('rowsprj1', rows1);
//    me.jurisdictions.store.removeAll();
//    me.jurisdictions.store.loadData(rows1);
    
  },

  validate : function(callback) {
    var me = this, gridValid = true;
    
     
     var newprojection=[];
     me.projections.store.each(function(record,idx) {
      if (!record.isValid()) {
        _.log(this, 'validate', 'record is not valid');
        gridValid = false;
      }
      else
      {
      	var ar = {
                "year": record.get('year'),
                "label": record.get('year')
                 };
      	newprojection.push(ar);
      }
    });
    if (!gridValid) {
      Ext.Msg.alert('Status', 'Years for projections should be from 1000 to 2999!');
      return false;
    }
    var definition = me.project.getDefinition();
    Ext.merge(definition, {
      //projections : _.translate3(me.projections.store.data.items, me.projections.yearTranslators)
      projections : newprojection
    });
//    Ext.merge(definition, {
//      localJurisdictions : _.translate3(me.projections.store.data.items, me.projections.labelTranslators)
//    });
    me.project.setDefinition(definition);
    
    _.log(this, 'validate', 'me.project.getDefinition()', me.project.getDefinition());
    
    if (callback) {
      _.log(this, 'callback');
      callback();
    }
    return true;
  }
});
