/*
 * @class Wif.setup.SuitabilityFactorsCard
 *
 * SU factors card for the project setup wizard.
 *
 */

Ext.define('Wif.setup.SuitabilityFactorsCard', {
  requires: ['Wif.setup.SuFactorLabels','Wif.setup.SuFactorValues']
, extend: 'Ext.panel.Panel'
, project: null
, layout: {
    type: 'border',
    padding: 5
  }
, factorLabels: null
, factorValues: null
, defaults: {
    // applied to each contained panel
    border: false
  }
, listeners: {
    activate: function() {
      _.log(this, 'activate');
      this.factorLabels.build();
    }
  }

, constructor: function (config) {
    Ext.apply(this, config);
    this.callParent(arguments);

	var me = this;
    var suFactorValues = Ext.create('Wif.setup.SuFactorValues', {
      region: 'east'
    , flex: 1
    , project: me.project
    , parentCard: this
    , split: true
    , border: false
    , listeners: {
    	changed: function() {
    	  _.log(me, 'SuFactorValues changed');
    	  me.factorValuesChanged();
    	}
    }
    });
    this.factorValues = suFactorValues;

    var suFactorLabels = Ext.create('Wif.setup.SuFactorLabels', {
      region: 'center'
    , flex: 1
    , split: true
    , border: false
    , project: this.project
    , listeners: {
        select: function (selModel, record, index) {
          var attributeName = record.get('featureFieldName');
          suFactorValues.setTitle('Factor Values for ' + attributeName);
          suFactorValues.rebuild(record);
          this.currentlyEditing = record;
        }
      }
    });
    me.factorLabels = suFactorLabels;
    
    suFactorLabels.store.on('remotedelete', function() {
    	me.project.updateCouchRevision();
    	me.selectSensibleDefault();
    });
    
    me.add([suFactorLabels, suFactorValues]);
    me.selectSensibleDefault();
  }

, factorValuesChanged: function() {
	var me = this;
	me.factorLabels.updateCurrentFactor(function() {
		me.project.updateCouchRevision();
	});
  }

, selectSensibleDefault: function() {
	var suFactorValues = this.factorValues;
	suFactorValues.setTitle('Factor Values');
	suFactorValues.rebuild(null);
  }

, enterByNavigation: function() {
	// If entering, clear the factor values panel.
	this.currentlyEditing = null;
	this.selectSensibleDefault();
	this.project.updateCouchRevision();
  }

, validate: function (callback) {
    var me = this
      , factorList = [];

    me.factorLabels.store.each(function (record) {
      var ffn = record.get('featureFieldName');
      _.log(me, 'Store record', record, ffn);
      factorList.push(ffn);
    });
    me.project.factorList = factorList;
    if (callback) { callback(); }

    return true;
  }

});

