/*
 * @class Wif.setup.DemandWizard
 *
 * Defining and building the setup wizard.
 *
 */

Ext.define('Wif.setup.demand.DemandWizard', {

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
    console.log('DemandWizard.constructor', config, this);
    this.definition.docType = 'DemandConfig';
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
        title : 'Demand Setup',
        width : 800,
        height : 600,
        layout : 'fit'
      });
      _.log(this, 'window created');
      this.win.show();
      _.log(this, 'complete wizard');

      this.cardPanel = Ext.create('Wif.setup.CardPanel');
      this.win.add([this.cardPanel]);

      _.log(this, 'cards created');

      var cards = [];

      cards.push(Ext.create('Wif.setup.demand.EnumPopulCard', {
        project : this,
        isNew : false
      }));

      cards.push(Ext.create('Wif.setup.demand.EmploymentSectorsCard', {
        project : this
      }));

      cards.push(Ext.create('Wif.setup.demand.CurrentEmploymentCard', {
        project : this
      }));

      cards.push(Ext.create('Wif.setup.demand.PastPopulationCard', {
        project : this
      }));

      cards.push(Ext.create('Wif.setup.demand.PastEmploymentCard', {
        project : this
      }));

      cards.push(Ext.create('Wif.setup.demand.ProjectionJurisdictionCard', {
        project : this
      }));

      cards.push(Ext.create('Wif.setup.demand.FinaliseDemandCard', {
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

