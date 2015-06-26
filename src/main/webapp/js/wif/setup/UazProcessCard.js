Ext.define('Wif.setup.UazProcessCard', {
  extend: 'Ext.form.Panel'
, title: 'UAZ Data Fields' //UNION File Setup
, bodyPadding: 5
, project: null
, layout: 'anchor'
, margin: 'auto'
, defaultType: 'textfield'
, fieldDefaults: {
    labelAlign: 'right'
  , labelWidth: 270
  , width: 700
  }
, unionAttrCbox: null
, areaCbox: null
, items: []
, constructor: function (config) {
    var me = this, cbox;

    Ext.apply(this, config);
    this.callParent(arguments);

    this.unionAttrCbox = Ext.create('Wif.setup.UnionAttrComboBox', {
      projectId:  me.project.projectId
    , fieldLabel: 'Select an attribute'
    , callback: function () {
    	me.setLoading(false);
    	if (me.project.definition.existingLUAttributeName != null) {
    		me.unionAttrCbox.setValue(me.project.definition.existingLUAttributeName);
    	}
      }
    , listeners: {
        change: function(cbox, newVal, oldVal) {
          me.project.definition.existingLUAttributeName = newVal;
          _.log(me, 'attribute cbox change', arguments, me.project.projectId, me.project.definition);
        }
      }
    });
    this.areaCbox = Ext.create('Wif.setup.UnionAttrComboBox', {
        projectId:  me.project.projectId
      , fieldLabel: 'Select an attribute'
      , callback: function () {
      	me.setLoading(false);
      	if (me.project.definition.areaLabel != null) {
      	    me.areaCbox.setValue(me.project.definition.areaLabel);
      	}
        }
      , listeners: {
          change: function(cbox, newVal, oldVal) {
            me.project.definition.areaLabel = newVal;
            _.log(me, 'area cbox change', arguments, me.project.projectId, me.project.definition);
          }
        }
      });

    this.add({ html: '<p>Select existing land use field:</p>', xtype: 'panel' });//Select which attribute represents the land use type
    this.add(this.unionAttrCbox);
    this.add({ html: '<p>Select area measurement field:</p>', xtype: 'panel' }); //Select which attribute represents the area
    this.add(this.areaCbox);
  }

, listeners: {
    activate: function() {
      _.log(this, 'activate');
      this.build();
    }
  }

, build: function () {
    var me = this;

    me.setLoading('Please wait for the server to process the UNION file ...');

    _.log(me, 'this.unionAttrCbox.setValue', this.unionAttrCbox, me.project.definition.existingLUAttributeName);
    
    _.log(me, 'this.unionAttrCbox.setValue', this.unionAttrCbox, me.project.definition.existingLUAttributeName);
    this.unionAttrCbox.load(me.project.projectId, function() {
        _.log(me, 'this.areaCbox.setValue', this.areaCbox, me.project.definition.areaLabel);
        me.areaCbox.load(me.project.projectId);
    });
  }

, validate: function (callback) {
    var me = this;

    me.setLoading('Please wait ...');
    
    _.log(me, 'UAZ update project', me.project);
    var serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + me.project.projectId
        , method: "put"
        , params: me.project.definition
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };
    
    function getServiceHandler(data, status) {
    	me.setLoading(false);
    	if (data) {
            me.project.definition = data;    		
    	}
        if (callback) callback();
    }

    function putServiceHandler(data, status) {
        _.log(me, 'UAZ update project', data, status);
    	serviceParams.method = 'get';
        Aura.data.Consumer.getBridgedService(serviceParams, getServiceHandler, 0);
    }
    Aura.data.Consumer.getBridgedService(serviceParams, putServiceHandler, 0);
  }
});