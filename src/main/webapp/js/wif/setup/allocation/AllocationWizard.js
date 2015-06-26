/*
 * @class Wif.setup.DemandWizard
 *
 * Defining and building the setup wizard.
 *
 */

Ext.define('Wif.setup.allocation.AllocationWizard', {

  definition : {},

  getDefinition : function() {
    return this.definition;
  },

  setDefinition : function(definition) {
    this.definition = definition;
  },

  cardPanel : null,
  win : null,
  constructor : function(config) {
    Ext.apply(this, config);
    console.log('AllocationWizard.constructor', config, this);
    if (config && config.projectId) {
      this.projectId = config.projectId;
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

      cards.push(Ext.create('Wif.setup.allocation.AllocationScenario', {
        project : this,
        isNew : false
      }));

      this.cardPanel.add(cards);
      _.log(this, 'first panel activated');
      cards[0].setActive(true);

      _.log(this, 'components created');
    }
    //    catch (err) {
    //    	_.log(this, "Error in setting up ProjectWizard", err);
    //    }
  },

  remoteUpdate : function(callback) {
    var me = this;
    _.log(me, 'remoteUpdate', me.projectId, me.definition);

    function success(remote, id, data) {
      // me.setLoading(false);
      me.demandId = id;
      
      _.log(me, 'demand setup done', data); 
      if (callback) {
        callback();
      }

      // Tell everyone that the project list changed.
      Wif.eventBus.projectsChanged();
    }

    function failure(remote, status) {
      _.log(me, 'demand setup failed', status);
      // me.setLoading(false);
      Ext.Msg.alert('Error', 'Could not save the demand setup information');
      if (callback) {
        callback();
      }
    }

    var remoteObject = Ext.create('Wif.RESTObject', {
      urlBase : Wif.endpoint + 'projects/' + me.projectId + '/demand/setup/',
      data : me.definition,
      singletonObject : true,
      listeners : {
        putsuccess : success,
        postsuccess : success,
        postfail : failure,
        putfail : function(remote, id, status) {
          failure(remote, status);
        }
      },
      putfail : function(remote, status) {
      }
    });
    remoteObject.push();
  }
});
