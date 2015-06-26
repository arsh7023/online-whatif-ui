/*
 * @class Wif.setup.ProjectWizard
 *
 * Defining and building the setup wizard.
 *
 */

Ext.define('Wif.setup.ProjectWizard', {
  // id should not be fixed

  /*

   { "name": "What-If for Guest",
   "originalUnits": "m.k.s",
   "analysisOption": "Suitability",
   "uazDataStoreURI": "https://dev-api.aurin.org.au/datastore-new/files/5c695966abd98815ec556476e9000da2",
   "srs": "EPSG:102723"
   }
   */

  definition : {// default values
    "name" : "Untitled",
    "originalUnits" : "metric",
    "existingLUAttributeName" : '',
    "analysisOption" : "Suitability",
    "srs" : "EPSG:102723"
  },
  
  factorList : [],
  cardPanel : null,
  win : null,
  constructor : function(config) {
    Ext.apply(this, config);
    console.log('ProjectWizard.constructor', config, this);
    if (config && config.projectId) {
      this.projectId = config.projectId;
    } else {
      this.projectId = null;
    }
  }
, updateCouchRevision: function(callback) {
	var me = this;
	
	if (me.definition == null || me.definition._id == null) {
		if (callback) { callback(); }
		return;
	}
	var serviceParams = {
        xdomain: "cors"
      , url : Wif.endpoint + 'projects/' + me.definition._id + '/revision/'
      , method: "get"
      , params: null
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };
	var serviceHandler = function(data,status) {
		if (data) {
			me.definition._rev = data;
		}
		if (callback) { callback(); }
	};
	Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0, 1);
  },
  build : function() {

    //    try
    {
      this.win = Ext.create('Ext.Window', {
        title : 'WhatIf Setup',
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
      cards.push(Ext.create('Wif.setup.ProjectCard', {
        project : this,
        isNew : false
      }));
      cards.push(Ext.create('Wif.setup.UazProcessCard', {
        project : this
      }));
      cards.push(Ext.create('Wif.setup.ExistingLuCard', {
        project : this
      }));
      cards.push(Ext.create('Wif.setup.SuitabilityLuCard', {
        project : this
      }));
      cards.push(Ext.create('Wif.setup.SuitabilityFactorsCard', {
        project : this
      }));
      cards.push(Ext.create('Wif.setup.FinaliseCard', {
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

, selfDestroy: function() {
	if (this.win != null) {
		this.win.close();
	}
}
});
