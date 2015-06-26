Ext.define('Wif.setup.SuFactorLabels', {
  extend: 'Aura.util.SyncGrid'
, project: null
, unionAttrCbox: null
, title: 'Factor Labels'
, currentlyEditing: null

, changeUnionAttr: function(cbox,newValue) {
  }

, constructor: function (config) {
    _.log(this, 'factor labels constructor');
    Ext.apply(this, config);
    this.preconstruct();
    var me = this;

    var cbox = Ext.create('Wif.setup.UnionAttrComboBox', {
      autoLoad: false
    , multiSelect: false
    , editable: true
    , allowBlank: false
    , projectId:  this.project.projectId
    , listeners: {
    	change: function(cbox,newValue,oldValue,opts) {
    	    me.changeUnionAttr(cbox,newValue);
    	}
    }
    , callback: function () {
        //me.mask.hide();
      }
    });
    this.unionAttrCbox = cbox;

    this.columns.splice(this.insertIdx, 0 // insert after first column
    , { header: 'UNION Column'
      , dataIndex: 'featureFieldName'
      , flex: 1
      , align: 'right'
      , editor: cbox
      }
    , { header: 'Factor Label'
      , dataIndex: 'label'
      , flex: 2
      , editor: {
          allowBlank: false
        }
      }
    );

    this.model = Ext.define('Wif.setup.FactorLabelModel', {
      extend: 'Ext.data.Model'
    , idProperty: '_id'
    , fields: [
        { name: '_id'
        , type: 'auto'
        , defaultValue: null
        , useNull: true
        }
      , { name: '_rev'
        , type: 'auto'
        , defaultValue: null
        , useNull: true
        }
      , { name: 'featureFieldName'
        , type: 'string'
        , defaultValue: ''
        }
      , { name: 'label'
        , type: 'string'
        , defaultValue: ''
        }
      , { name: 'docType'
    	, type: 'string'
        , defaultValue: 'Factor'
        }
      , { name: 'projectId'
    	, type: 'string'
    	, defaultValue: me.projectId
    	}
      , { name: 'factorTypes'
    	, type: 'auto'
    	, defaultValue: []
    	}
      ]
    });

    this.store = Ext.create('Aura.data.SyncStore', {
      model: 'Wif.setup.FactorLabelModel'
    , serviceParams: {
        xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + this.project.projectId + '/factors/'
      , headers: {
          'X-AURIN-USER-ID': Wif.userId
        }
      }
    , inTranslators: [
      ]
    , outTranslators: [
        { getter: '_id' }
      , { getter: '_rev' }
      , { getter: 'label' }
      , { getter: 'featureFieldName' }
      , { getter: 'factorTypes' }
      , { getter: 'docType' }
      , { getter: 'projectId' }
      ]
    });

    this.callParent(arguments);
  }
, build: function () {
    var me = this
      , projectId = this.project.projectId;

    if (projectId) { // do this before callParent
      this.store.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/factors/';
      this.store.massageBeforeStore = function(record) {
    	record.projectId = projectId;
      };
    }
    this.callParent(arguments);

    me.unionAttrCbox.load(projectId);
  }

, updateCurrentFactor: function(callback) {
	var me = this;
    _.log(me, 'Update current factor', me.currentlyEditing);
    if (me.currentlyEditing) {
    	me.store.remoteUpdate(me.currentlyEditing, callback);
    }
    else if (callback) {
    	callback();
    }
  }
});
