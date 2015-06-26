/*
 * @class Wif.setup.DemandWizard
 *
 * Defining and building the setup wizard.
 *
 */

Ext.define('Wif.setup.allocation.config.AllocationConfigWizard', {

  demandId : null,

  definition : {},
  isnew : true,
  getDefinition : function() {
    return this.definition;
  },
  setDefinition : function(definition) {
    this.definition = definition;
  },
  getIsnew : function() {
    return this.isnew;
  },
  setIsnew : function() {
    return this.isnew;
  },
  cardPanel : null,
  win : null,
  constructor : function(config) {
    Ext.apply(this, config);
    console.log('AllocationConfigs.constructor', config, this);
    this.definition.docType = 'AllocationConfigs';
    if (config && config.projectId) {
      this.projectId = config.projectId;
      this.isnew = config.isnew;
      
      // = this.definition.projectId     
      
    } else {
      this.projectId = null;
    }
  },
 
  build : function() { {
      this.win = Ext.create('Ext.Window', {
        title : 'AllocationConfigs Setup',
        autoScroll: true,
        width : 800,
        height : 650,
        layout : 'fit'
      });
      _.log(this, 'window created');
      this.win.show();
      _.log(this, 'complete wizard');

      this.cardPanel = Ext.create('Wif.setup.CardPanel');
      this.win.add([this.cardPanel]);

      _.log(this, 'cards created');

      var cards = [];

      cards.push(Ext.create('Wif.setup.allocation.config.PlannedLanduseFieldCard', {
        project : this,
        isNew : false
      }));
      
      cards.push(Ext.create('Wif.setup.allocation.config.LanduseColorCard', {
        project : this
      }));

      cards.push(Ext.create('Wif.setup.allocation.config.PlannedLanduseDetailCard', {
        project : this
      }));
            
      cards.push(Ext.create('Wif.setup.allocation.config.InfrastructureControlCard', {
      	project : this
      }));  
      
      cards.push(Ext.create('Wif.setup.allocation.config.GrowthPatternCard', {
      	project : this
      }));     
      
      cards.push(Ext.create('Wif.setup.allocation.config.FinaliseAllocationConfigCard', {
        project : this
      }));

      this.cardPanel.add(cards);
      _.log(this, 'first panel activated');
      cards[0].setActive(true);

      _.log(this, 'components created');
    }
    //    catch (err) {
    //    	_.log(this, "Error in setting up ProjectWizard", err);
    //    }
  }
});

