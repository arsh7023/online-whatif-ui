Ext.define('Wif.setup.SuitabilityLuCard', {
  extend: 'Aura.util.SyncGrid'
, project: null
, title: 'Suitability Land Uses Setup'
, assocLuCbox: null
, assocLuColIdx: 1
, model: null
, pendingChanges: null
, sortKey: 'label'

, constructor: function (config) {
    var me = this;

    this.preconstruct();
    Ext.apply(this, config);
    var projectId = me.project.projectId;

    /*
    {
      "id": 80,
      "scoreLabel": "SCORE_1",
      "label": "Residential",
      "featureFieldName": "SCORE_1"
    }*/

    this.model = Ext.define('Wif.setup.SluModel', {
      extend: 'Ext.data.Model'
    , idProperty: '_id'
    , fields: [
        { name: 'checked'
        , type: 'bool'
        , defaultValue: false
        }
      , { name: '_id'
        , type: 'string'
        , defaultValue: null
        , useNull: true
        }
      , { name: '_rev'
        , type: 'string'
        , defaultValue: null
        , useNull: true
        }
      , { name: 'docType'
        , type: 'string'
        , defaultValue: 'SuitabilityLU'
        }
      , { name: 'featureFieldName'
        , type: 'string'
        , defaultValue: ''
        }
      , { name: 'label'
        , type: 'string'
        , defaultValue: ''
        }
      , { name: 'projectId'
        , type: 'string'
        , defaultValue: this.project.projectId
        }
      , { name: 'associatedALUs'
        , type: 'object'
        }
      , { name: 'associated'
        , type: 'auto'
        , convert: function (value, record) {
            _.log(me, 'convert alus 1', arguments);
            var alus = value || record.get('associatedALUs');
            _.log(me, 'convert alus 2', alus, record);
            if (alus) {
              var alusArr = [];
              for (var alu in alus) {
                alusArr.push(alus[alu]);
              }
              _.log(me, 'convert alus 3', alusArr);
              return alusArr;
            }
            return [];
          }
        }
      ]
    });

    this.store = Ext.create('Aura.data.SyncStore', {
      model: this.model
    , serviceParams: {
        xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + projectId + '/suitabilityLUs/'
      , headers: {
          'X-AURIN-USER-ID': Wif.userId
        }
      }
    , inTranslators: [
      ]
    , outTranslators: [
        { getter: '_id' }
      , { getter: '_rev' }
      , { getter: 'docType' }
      , { getter: 'projectId' }
      , { getter: 'label' }
      , { getter: 'featureFieldName' }
      , { getter: 'associatedLUs' }
      ]
    });

    this.assocLuCbox = Ext.create('Aura.Util.RemoteComboBox', {
      extend: 'Ext.form.field.ComboBox'
    , fields: ["_id", "label", "featureFieldName"]
    , valueField: "label"
    , displayField: "label"
    , emptyText: "Select Existing Land Uses"
    , multiSelect: true
    , forceSelection: true
    , typeAhead: false
    , editable: false
    , queryMode: 'local'
    , displayTpl: '<tpl for=".">' + // for multiSelect
                    '{label}<tpl if="xindex < xcount">,</tpl>' +
                  '</tpl>'
    , listConfig: {
        getInnerTpl: function() {
            return '<div class="x-combo-list-item"><img src="' +
            Ext.BLANK_IMAGE_URL +
            '" class="chkCombo-default-icon chkCombo" /> {label} </div>';
        }
      }
    , serviceParams: {
        xdomain: "cors"
      , url : Wif.endpoint + 'projects/' + projectId + '/allocationLUs/'
      , method: "get"
      , params: null
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      }
    });

    this.columns.splice(this.insertIdx, 0 // insert after first column
    , { header: 'Land Use Label'
      , dataIndex: 'label'
      , sortable: false	
      , flex: 1
      , editor: {
          allowBlank: false
        }
      }
    , { header: 'Associated LU'
      , dataIndex: 'associated'
      , flex: 2
      , stopSelection: false
      , editor: this.assocLuCbox
      , sortable: false	
      }
    );

    this.callParent(arguments);
  }
, listeners: {
    activate: function() {
      _.log(this, 'activate');
      this.build();
    }
  }

, enterByNavigation: function() {
	this.project.updateCouchRevision();
  }

, build: function () { // replace parent
    var me = this
      , projectId = this.project.projectId;

    _.log(me, 'build', me, projectId);
    me.store.serviceParams.url = Wif.endpoint + 'projects/' +
      projectId + '/suitabilityLUs/';
    me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' +
      projectId + '/allocationLUs/';
    me.assocLuCbox.load();
    
    me.store.massageBeforeStore = function(record) {
    	record.projectId = projectId;
    };
    
    me.mask = Ext.create('Ext.LoadMask', this, {msg: "Please wait while the remote data is updated ..."});

    me.store.on('remotechanged', function () {
      me.mask.hide();
    });
    me.store.on('remoteerror', function () {
      me.mask.hide();
      alert('Some problem occur in the server.');
    });

    me.on('beforeedit', function(editor, e) {
      _.log(this, 'beforeedit', editor, e);
      me.pendingChanges = null;
      return true;
    });

    me.on('edit', function(editor, e) {
      _.log(this, 'edit', editor, e);
      var record = e.record;

      if (me.assocLuColIdx === e.colIdx) {
        // handle associated Lu separately


        var newValue = e.value
          , oldValue = e.originalValue
          , results = _.diff(oldValue, newValue)
          , removed = results[0]
          , added = results[1]
          , grid = e.grid
          , cbox = grid.assocLuCbox
          , cboxStore = cbox.store
          , suitabilityLuId = record.get('_id');

        // temporary bu fixes
        if (_.isEqual(results, me.pendingChanges)) {
          _.log(me, 'assocLu edit have been sent previously', results);
          return false;
        }
        me.pendingChanges = results;

        if (!suitabilityLuId ) {
          record.set('asssociatedLu', []); // reset
          alert('You need to assign a label first!');

          return false;
        }
        _.log(me, 'assocLu edit', results, e);


        var serviceParamsBase = {
          xdomain: "cors"
        , url:  Wif.endpoint + 'projects/' +
        		projectId + '/suitabilityLUs/' +
                suitabilityLuId + '/associatedLUs/'
        , headers: {
            'X-AURIN-USER-ID': Wif.userId
          }
        };

        var callback = function () {
          _.log(me, 'handling alu updates done');
          me.fireEvent('remotechanged', me);
        };

        while (removed.length > 0) {
        	var prevcb = callback;
           	var newcb = function(aluLabel,cb) {

            	var cboxRecord = cboxStore.findRecord('label', aluLabel);
            	if (!cboxRecord) {
            		return cb;
            	}
            	
            	var aluId = cboxRecord.get('_id');
            	
        		return function () {
        	          var serviceParams = Ext.clone(serviceParamsBase);
        	          serviceParams.method = 'delete';
        	          serviceParams.url += aluId;

        	          function serviceHandler(data,status) {
                          if (cb) { cb(); }
                      }
        	          Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
        		};
        	};
        	callback = newcb(removed.pop(), prevcb);
        }
        while (added.length > 0) {
        	var prevcb = callback;
           	var newcb = function(aluLabel,cb) {

            	var cboxRecord = cboxStore.findRecord('label', aluLabel);
            	if (!cboxRecord) {
            	    return cb;
            	}

            	var aluId = cboxRecord.get('_id');
        		return function () {
        	          var serviceParams = Ext.clone(serviceParamsBase);
        	          serviceParams.method = 'put';
        	          serviceParams.url += aluId;

        	          function serviceHandler(data,status) {
                          if (cb) { cb(); }
                      }
        	          Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
        		};
        	};
        	callback = newcb(added.pop(), prevcb);
        }
        
        if (callback) {
        	callback();
        }
     
        return true;
      } // handle assocLuCol

      if (record.phantom) { // need to add new record (POST)
        me.mask.show();
        _.log(this, 'call remoteAdd', Ext.clone(record), Ext.clone(record.data));
        me.store.remoteAdd(record);
      } else if (record.dirty) { // need to update record (PUT)
        me.mask.show();
        _.log(this, 'call remoteUpdate', Ext.clone(record), Ext.clone(record.data));
        me.store.remoteUpdate(record);
      }

      return true;
    });
    me.mask.show();
    me.store.remoteList();
  }

});
