Ext.define('Wif.setup.ExistingLuCard', {
  extend: 'Aura.util.SyncGrid'
, requires: [
    'Aura.util.CheckColumnEditor'
  ]
, sortKey: 'featureFieldName'
, project: null
, title: 'Existing Land Uses.'//Land Uses Setup
, loadmask: null
, initValues: function() {
	_.log(this, 'ExistingLuCard.initValues', this);
    var // grid = this.findParentByType('grid')
      me = this
    , project = me.project
    , attrName = project.definition.existingLUAttributeName;

    var store = me.getStore()
      , serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + project.projectId + '/unionAttributes/' + attrName + '/values/'
        , method: "get"
        , params: null
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

    var fields = this.model.getFields();
    
    function serviceHandler(data) {

      if (!data) { return; }
      var rows = [];
      for (var i = 0, j = data.length; i < j; i++) {
    	var row = {};
    	fields.each(function(field) {
    		if (field.defaultValue != undefined) {
    		    row[field.name] = field.defaultValue;
    		} else {
    			row[field.name] = null;
    		}
    	});
    	row.label = data[i];
    	row.featureFieldName = data[i];
    	row.projectId = me.project.projectId;
        rows[i] = row;
      }
      // replace with everything and replace with new ones
      store.remoteZap(function() {
    	  store.removeAll();
    	  store.loadData(rows);
    	  store.remoteUpload(function() {
    		  me.loadmask.hide();
    	  });
      });
    }
    me.loadmask = Ext.create('Ext.LoadMask', me, {msg: 'Initialising ...'});
    me.loadmask.show();
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }
, enterByNavigation: function() {
	this.project.updateCouchRevision();
  }

, constructor: function (config) {
    var me = this;
    this.preconstruct();
    Ext.apply(this, config);
    
    var cbox = Ext.create('Wif.setup.LuFunctionComboBox', {
        listeners: {
        	change: function(cbox,newValue,oldValue,opts) {
        		_.log(me, 'LU function combo box change', cbox, newValue, oldValue, opts);
        	}
        }
    });
    this.luFunctionCbox = cbox;

    this.columns.splice(this.insertIdx, 0 // insert after first column
    , { header: 'Existing Land Use Label' //Land Use Value
      , dataIndex: 'featureFieldName'
      , width: 130 //100
      , editor: {
          allowBlank: false
        }
      }
    , { header: 'New Land Use Label' //Label
      , dataIndex: 'label'
      , flex: 1
      , editor: {
          allowBlank: false
        }
      }
    , { header: 'LU Function'
      , dataIndex: 'landUseFunction'
      , width: 180
      , editor: cbox
      , renderer: function(value) {
    	  return cbox.abbrevLabel(value);
        }
      }
    , { xtype: 'checkcolumn'
      , header: 'Not Dev.'
      , dataIndex: 'notDevelopable'
      , width: 70
      , stopSelection: false
      , listeners:{
          checkchange: function(checkColumn, rowIdx, isChecked){
            console.log(checkColumn, rowIdx, isChecked, checkColumn.getIndex());
            var grid = this.findParentByType('grid');
            var record = grid.store.getAt(rowIdx);

            record.dirty = true;
            var originalValue = record.data[checkColumn.dataIndex];
            record.data[checkColumn.dataIndex] = isChecked;

            var e = {
              grid: grid
            , record: record
            , field: checkColumn.dataIndex
            , value: isChecked
            , originalValue: originalValue
            , row: null
            , column: checkColumn
            , rowIdx: rowIdx
            , colIdx: 2
            };
            grid.cellEditor.fireEvent('edit', checkColumn, e);
          }
        }
      }
    , { xtype: 'checkcolumneditor'
      , header: 'New Presrv.'
      , dataIndex: 'newPreservation'
      , width: 70
      , stopSelection: false
      , hidden: true //new ali
      }
    );

    this.tbar.push(
      { text: 'Initialise Values'
      , handler: function() {
          // https://dev-api.aurin.org.au/aurin-wif/projects/1/unionAttributes/SCORE_1/values
          var grid = this.findParentByType('grid')
            , project = grid.project;

          _.log(me, 'initialise values', grid, project, me);
          if (!project.definition.existingLUAttributeName) return;

          Ext.Msg.show({
            title: 'Overwrite?',
            msg: 'This will remove all the existing data. Would you like to continue?',
            buttons: Ext.Msg.YESNOCANCEL,
            icon: Ext.Msg.QUESTION,
            fn: function (btn) {
              if (btn === 'yes'){
                me.initValues();
              }
            }
          });
        }
      }
    );

    this.model = Ext.define('Wif.setup.EluModel', {
      extend: 'Ext.data.Model'
    , idProperty: '_id'
    , fields: [
        { name: 'docType'
        , type: 'string'
        , defaultValue: 'AllocationLU'
        }
      , { name: '_id'
        , type: 'auto'
        , defaultValue: null
        }
      , { name: '_rev'
        , type: 'auto'
        , defaultValue: null
        }
      , { name: 'projectId'
        , type: 'string'
        , defaultValue: this.project.projectId
        }
      , { name: 'featureFieldName'
        , type: 'string'
        , defaultValue: ''
        }
      , { name: 'label'
        , type: 'string'
        , defaultValue: ''
        }
      , { name: 'notDevelopable'
        , type: 'bool'
        , defaultValue: false
        }
      , { name: 'newPreservation'
        , type: 'bool'
        , defaultValue: false
        }
      , { name: 'landUseFunction'
        , type: 'auto'
        , defaultValue: 'NOT_DEVELOPABLE_OR_UNDEFINED'
        }
      , { name: 'groupQuarters'
        , type: 'bool'
        , defaultValue: false
        }
      , { name: 'local'
          , type: 'bool'
          , defaultValue: false
          }
      , { name: 'newLU'
          , type: 'bool'
          , defaultValue: false
          }
      , { name: 'notDefined'
          , type: 'bool'
          , defaultValue: false
          }
      , { name: 'builtUp'
          , type: 'bool'
          , defaultValue: false
          }
      , { name: 'totalArea'
          , type: 'auto'
          , defaultValue: 0
          }
      , { name: 'sectors'
    	, type: 'auto'
    	, defaultValue: []
        }
      ]
    });

    var storeGetters = [];
    this.model.getFields().each(function(field) {
    	storeGetters.push({
    		getter: field.name
    	});
    });
    this.store = Ext.create('Aura.data.SyncStore', {
      model: 'Wif.setup.EluModel'
    , serviceParams: {
        xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + this.project.projectId + '/allocationLUs/'
      , headers: {
          'X-AURIN-USER-ID': Wif.userId
        }
      }
    , inTranslators: [
      ]
    , outTranslators: storeGetters
    });

    this.callParent(arguments);
  }

, listeners: {
    activate: function() {
      _.log(this, 'activate');
      this.build();
    }
  }

, build: function () {
    var me = this
      , projectId = this.project.projectId;

    if (projectId) { // do this before callParent
      me.store.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/allocationLUs/';
    }

    this.callParent(arguments);
  }

});