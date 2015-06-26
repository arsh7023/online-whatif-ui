/*
 * @class Wif.setup.DemandWizard
 *
 * Defining and building the setup wizard.
 *
 */

Ext.define('Wif.setup.trend.trendnewWizard', {

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
    console.log('trendnewWizard.constructor', config, this);
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
        title : 'Demoghraphic Trends',
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
      
      cards.push(Ext.create('Wif.setup.trend.trendnewTrendsInfoCard', {
        project : this
      }));  
      
      cards.push(Ext.create('Wif.setup.trend.trendnewPopulationCard', {
        project : this
      }));    
      
      cards.push(Ext.create('Wif.setup.trend.trendnewEmploymentCard', {
        project : this
      }));   
      
      cards.push(Ext.create('Wif.setup.trend.FinalisetrendnewCard', {
        project : this
      }));

      this.cardPanel.add(cards);
      _.log(this, 'first panel activated');
      cards[0].setActive(true);

      _.log(this, 'components created');
    }

  }
});

