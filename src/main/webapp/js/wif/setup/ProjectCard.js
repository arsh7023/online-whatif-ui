Ext.define('Wif.setup.ProjectCard', {
  extend: 'Ext.form.Panel'
, title: 'Project Setup'
, animCollapse: false
, isNew: false
, bodyPadding: 5
, project: null
, layout: 'anchor'
, border: 0
, autoRender: true
, margin: 'auto'
, defaultType: 'textfield'
, projectsData: null
, projectNames: null
, fieldDefaults: {
    labelAlign: 'right'
  , labelWidth: 270
  , width: 700
  }
, items: [
    { fieldLabel: 'Project Name'
    , name: 'upname'
    , value: 'What-If for ' + _.decodeURLComponent(Wif.userId)
      //, allowBlank: false
    }
  , { xtype: 'combobox'
    , typeAhead: true
    , multiSelect: false
    , store: [
        ['Suitability', 'Suitability'],
        ['Land Use', 'Land Use'],
        ['Land Use/Population', 'Land Use/Population'],
        ['Land Use/Population/Employment', 'Land Use/Population/Employment']
      ]
    , fieldLabel: 'Analysis Option'
    , listClass: 'x-combo-list-small'
    , name: 'analysisOption'
    , value: 'Suitability'
    //, allowBlank: false
    	,hidden:true //new ali
    }
  , { xtype: 'combobox'
    , typeAhead: true
    , multiSelect: false
    , store: [
        ['metric', 'Metric System'],
        ['us', 'US System'],
      ]
    , fieldLabel: 'Measurement Units'
    , listClass: 'x-combo-list-small'
    , name: 'originalUnits'
    , value: 'metric'
    //, allowBlank: false
    	,hidden:true //new ali
    }
  , { fieldLabel: 'Study Area'
    , name: 'studyArea'
    , value: ''
    }
  , { xtype: 'panel'
	, html: '<p>Reuse an existing UAZ file:</p>'
    }
  , { name: 'existingUnionFile'
    , xtype: 'gridpanel'
    , itemId: 'existingUnionFilePanel'
    , height: 210
    , columns:
      [ { text: 'Project name'
        , flex: 1
        , dataIndex: 'name'
        }
      , { text: 'Study area'
        , flex: 1
        , dataIndex: 'studyArea'
        }
      ]
    , listeners:
      { added: function(view, container, pos, options) {
    	    var me = this
    	      , serviceParams =
    	        { xdomain: "cors"
    	        , method: 'get'
    	        , params: null
    	        , url: Wif.endpoint + 'projects/'
    	        , headers: {
    	          "X-AURIN-USER-ID": Wif.userId
    	          }
    	        };
    	    
    	    function serviceHandler(data) {

    	      me.projectsData = Ext.create('Ext.data.Store',
    	        { storeId: 'projectsData'
    	        , fields:
    	      	  [ '_id'
    	          , 'name'
    	          , 'srs'
    	          , 'suitabilityConfig'
    	          , 'existingLUAttributeName'
    	          , 'areaLabel'
    	          , 'studyArea'
    	          , 'bbox'
    	          ]
    	        , proxy:
    	          { type: 'memory'
    	          , data: data
    	          , reader: 'json'
    	          }
    	        , autoLoad: true
    	        });
    	    	view.reconfigure(me.projectsData);
    	    }

    	    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
        }
      , selectionchange: function(view, selections, options) {
    	  _.log(view, selections[0]._id);
    	  var data = selections[0].data;
          var form = this.up('form').getForm();
          var project = form.project;
          project.definition.ownGeoDatastoreName = data.suitabilityConfig.unifiedAreaZone;
          project.definition.existingLUAttributeName = data.existingLUAttributeName;
          project.definition.areaLabel = data.areaLabel;
          project.definition.bbox = data.bbox;
          form.findField('fileUploaded').setValue('UAZ file selected.');
        }
      }
    }
  , { xtype: 'panel'
	, html: '<p>Or upload a new UAZ file:</p>'
	}
  , { xtype: 'fieldcontainer'
    , layout: 'hbox'
    , fieldLabel: 'New UAZ file'
    , itemId: 'newUnionFilePanel'
    , items: [
        { xtype: 'filefield'
        , emptyText: 'Select UAZ file'
        , name: 'file' // Needs to be data-path for middleware
        , buttonText: 'Browse ...'
        }
      , { xtype: 'button'
        , text: 'Upload'
        , handler: function() {
            var form = this.up('form').getForm();
            // var fileName = form.findField('data-path').getValue();

            var uploadUrl = Wif.endpoint + 'saveZip';
            var url = wifUiConfig['appBase'] + '/uploader?url=' + _.encodeURLComponent(uploadUrl);
            
            console.log(url);

            var filename = form.findField('file').getValue();
            if (filename == "") {
                Ext.Msg.alert('No file selected', 'Either file deleted or you need to select a file to upload first.');
            	return;
            }
            if (form.isValid()) {
              form.submit({
                standardSubmit: true
              , url: url
              , method: 'POST'
              , waitMsg: 'Uploading your data...'
              , success: function(form, action) {
                  _.log(this, form, action);
                  try {
                    var fname = action.result.filename
                      , project = form.project;

                    project.definition.localShpFile = fname;
                    project.definition.existingLUAttributeName = null;
                    // project.definition.bbox = '[' + jsonResponse.result.data.bbox.toString() + ']';
                    project.definition.ownGeoDatastoreName = null;
                    form.findField('fileUploaded').setValue('UAZ file uploaded.');
                    Ext.Msg.alert('Success', 'Shape file has been successfully uploaded.');
                  } catch (e) {
                    Ext.Msg.alert('Error', 'There was a problem in the JSON response');
                  }
                }
              , failure: function(form, action) {
                  _.log(this, form, action);
                  Ext.Msg.alert('Failure', 'There was a problem in uploading shape file.');
                }
              });
            }
          }
        }
      , { xtype: 'displayfield',
          name: 'fileUploaded',
          value: '',
          margin: '0 0 0 10' // (top, right, bottom, left)
        }
      ]
    }
  ]

, constructor: function (config) {

    Ext.apply(this, config);
    this.callParent(arguments);
    _.log(this, 'project card constructor');
    this.setLoading("Please wait for the server to process the data ...");
    this.remoteInit();
}
, enterByNavigation: function() {
	this.project.updateCouchRevision();
  }

, serviceParams: null
, remoteInit: function () {
    var me = this;

    me.serviceParams = {
      xdomain: "cors"
    , url: Wif.endpoint + 'projects/'
    , headers: {
      "X-AURIN-USER-ID": Wif.userId
      }
    };
  }

, remoteAdd: function (callback) {
    var me = this
      , serviceParams = Ext.clone(me.serviceParams)
      , form = me.getForm()
      , definition = me.project.definition;

    _.log(me, "remoteAdd me", me);
    _.log(me, "remoteAdd definition", me.project.definition);

   
    
    if (!definition.uazDataStoreURI && !definition.localShpFile && !definition.ownGeoDatastoreName) {
      Ext.Msg.alert('Failure', 'You need to select a shape file first.');
      me.setLoading(false);
      return;
    }

    definition.name = form.findField('upname').getValue();
    
    
    definition.analysisOption = form.findField('analysisOption').getValue();
    definition.originalUnits = form.findField('originalUnits').getValue();
    definition.studyArea = form.findField('studyArea').getValue();

    Ext.apply(serviceParams, {
      method: "post"
    , params: definition
    });

    function serviceHandler(data) {
      _.log(me, "remoteAdd data", data);
      if (data) {
    	me.project.definition = data;
    	me.project.projectId = data._id;
      }

      me.setLoading(false);
      if (callback) callback();
      
      // Tell everyone that the project list changed.
      Wif.eventBus.projectsChanged();
    }
    me.setLoading("Please wait for the server to process the UAZ file...");

    _.log(me, "remoteAdd", serviceParams);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }


////

, remoteCheckNames: function (callback) {
  var me = this
    , serviceParams = Ext.clone(me.serviceParams);
   
  Ext.apply(serviceParams, {
    method: "get"
  , params: null
  });
  serviceParams.url +=  '/projectNames/';

  function serviceHandler(data) {
    
  	   me.projectNames = data;
      if (callback) callback();
    
  }

  function polling() {
    _.log(me, "remoteCheckNames", serviceParams);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

  polling();
}


////


, remoteLoad: function (callback) {
    var me = this
      , serviceParams = Ext.clone(me.serviceParams)
      , form = me.getForm()
      , projectId = me.project.projectId;

    if (!projectId) { // new one, add a placeholder
      return;
    }

    Ext.apply(serviceParams, {
      method: "get"
    , params: null
    });
    serviceParams.url += projectId;

    function serviceHandler(data) {
      if (data) {
    	me.project.definition = data;
    	
    	var disable = data.ready ? true : false; // Coerce to bool
    	var panels = [];
    	panels.push(me.getComponent('existingUnionFilePanel'));
    	panels.push(me.getComponent('newUnionFilePanel'));
    	for (var p in panels) {
    		panels[p].setDisabled(disable);
    	}

        form.findField('upname').setValue(data.name);
        form.findField('studyArea').setValue(data.studyArea);
        form.findField('analysisOption').setValue(data.analysisOption);
        form.findField('originalUnits').setValue(data.originalUnits);
        
        me.project.definition.existingLUAttributeName = data.existingLUAttributeName;

        form.findField('fileUploaded').setValue('UAZ file uploaded.');
      }
      me.setLoading(false);
      if (callback) callback();
    }

    me.setLoading("Please wait for the server to retrieve the data ...");
    _.log("remoteLoad", serviceParams);

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, remoteUpdate: function (callback) {
    var me = this
      , serviceParams = Ext.clone(me.serviceParams)
      , form = me.getForm()
      , projectId = me.project.projectId
      , definition = me.project.definition;

    _.log(me, "remoteUpdate me", me);
    _.log(me, "remoteUpdate definition", me.project.definition);
    
    definition.name = form.findField('upname').getValue();
    definition.analysisOption = form.findField('analysisOption').getValue();
    definition.originalUnits = form.findField('originalUnits').getValue();
    definition.studyArea = form.findField('studyArea').getValue();

    Ext.apply(serviceParams, {
      method: "put"
    , params: definition
    });
    serviceParams.url += projectId;

    function serviceHandler(data) {
      me.setLoading(false);
      me.remoteLoad(callback);
    }
    me.setLoading("Please wait while the project info is updated ...");
    _.log(me, "remoteUpdate", serviceParams);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, remoteCheck: function (callback) {
    var me = this
      , serviceParams = Ext.clone(me.serviceParams)
      , projectId = me.project.projectId
      , timeout = 10000
      , maxTimeout = 120000;
      

    Ext.apply(serviceParams, {
      method: "get"
    , params: null
    });
    serviceParams.url += projectId + '/status/';

    function serviceHandler(data) {
      if (!data || !data.status) {
        _.log(me, 'remoteCheck.serviceHandler: setup fail', me, data);
        me.setLoading(false);
        if (callback) callback({success: false});
        return;
      }
      if (data.status === 'running') {
        setTimeout(polling, timeout);
        timeout = timeout * 2;
        if (timeout > maxTimeout) timeout = maxTimeout;
      } else if (data.status === 'success'){
        me.setLoading(false);
        if (callback) callback({success: true});
      }
    }

    me.setLoading("Please wait while the project is set up ...");

    function polling() {
      _.log(me, "remoteCheck", serviceParams);
      Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    }

    polling();
  }

, listeners: {
    activate: function() {
      _.log(this, 'project card activate');
      this.build();
    }
  }

, build: function () {
    _.log(this, 'project card build');
    this.remoteLoad();
  }

, validate: function (callback) {
    var me = this;

    function waitForSetup (status) {
      if (status.success) {
    	me.remoteLoad(callback);
      } else {
        Ext.Msg.alert('Error', 'There is a problem in setup');
      }
    }

    if (me.project.definition._id) {
      me.remoteUpdate(callback);
    } else {
    	  var lsw=true;
      	me.remoteCheckNames(function () {
      	var str=me.getForm().findField('upname').getValue().toLowerCase();
    		for (var i = 0; i< me.projectNames.length; i++ )
    		{
    			if (me.projectNames[i].toLowerCase() == str)
    				{
    				    lsw = false;
    				}
    			
    		}	
    		if (str.length == 0)
    		{
    			lsw = false;
    		}	
    		
    		if (lsw == true)
    		{	
	        me.remoteAdd(function () {
	        me.remoteCheck(waitForSetup);
	        });
    		}
    		else
    		{
    			Ext.Msg.alert('Error', 'Not duplicated project name needed!');
    		}	
    	});
    }
  }
});
