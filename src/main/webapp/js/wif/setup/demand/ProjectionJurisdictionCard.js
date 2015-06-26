Ext.define('Wif.setup.demand.ProjectionJurisdictionCard', {
  extend : 'Ext.form.Panel',
  project : null,
  isNew : false,
  bodyPadding : 2,
  
  autoRender : true,
  margin : 'auto',
  projectsData : null,
  layout : {
    type : 'border',
  },
  defaults : {
    collapsible : true,
    split : true
  },

  constructor : function(config) {
    var me = this;
    Ext.apply(this, config);
    var projectId = me.project.projectId;

    this.projections = Ext.create('Wif.setup.demand.Projections', {
      project : me.project,
      region : 'west',
      flex : 1,
      layout : 'fit'
    });
    this.jurisdictions = Ext.create('Wif.setup.demand.Jurisdictions', {
      project : me.project,
      region : 'center',
      flex : 1,
      layout : 'fit'
    });

    me.items = [this.projections, this.jurisdictions];

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
    
    
    var rows1 = definition.localJurisdictions;
    _.log('rowsprj1', rows1);
    me.jurisdictions.store.removeAll();
    me.jurisdictions.store.loadData(rows1);
    
  },

  validate : function(callback) {
    var me = this, gridValid = true;
    me.projections.store.each(function(record) {
      if (!record.isValid()) {
        _.log(this, 'validate', 'record is not valid');
        gridValid = false;
      }
    });
    if (!gridValid) {
      Ext.Msg.alert('Status', 'Years for projections should be from 1000 to 2999!');
      return false;
    }
    var definition = me.project.getDefinition();
    Ext.merge(definition, {
      projections : _.translate3(me.projections.store.data.items, me.projections.yearTranslators)
    });
    Ext.merge(definition, {
      localJurisdictions : _.translate3(me.jurisdictions.store.data.items, me.jurisdictions.labelTranslators)
    });
    me.project.setDefinition(definition);
    
    _.log(this, 'validate', 'me.project.getDefinition()', me.project.getDefinition());
    
    if (callback) {
      _.log(this, 'callback');
      callback();
    }
    return true;
  }
});
