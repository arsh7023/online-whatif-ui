Ext.define('Wif.analysis.manualdemand.ManualDemandScenario', {
  requires: [
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*',
    'Ext.ux.CheckColumn',
    'Wif.RESTObject'
  ]

, projectId: null
, project: null
, label: ''
, scenarioId: null
, scenarioData: {}
, scenarioPostData: null
, scenarioColumns: {}
, scenarioRows :{}

, constructor: function (config) {
    Ext.QuickTips.init();
    Ext.override(Ext.data.AbstractStore, {
      indexOf: Ext.emptyFn
    });
    Ext.apply(this, config);
  }
,
   
  scenarioPostDataBuild: function () {
    _.log(this, 'scenarioPostDataBuild', this, this.project);

    var me = this
      , areaRequirements = me.project.areaRequirements;
    
      _.log(me, "Preparing posting data", areaRequirements);

       me.scenarioPostData = {
      label: me.label
    //, docType: "ManualDemandScenario"
    , docType: "DemandOutcome"	
    , projectId: me.projectId
    , areaRequirements : me.project.areaRequirements
    };
    if (me.scenarioId != null) {
      me.scenarioPostData._id = me.scenarioId;
    }

    _.log(me, 'scenarioPostDataBuild', me.scenarioPostData, me);
  
    return me.scenarioPostData;
  }



, remoteAdd: function (callback) {

    var me = this;
    _.log(me, 'about to remoteAdd', callback);
    //me.scenarioPostDataBuild();
    Ext.Msg.show({
        title: 'Creating ...',
        msg: 'Creating Manual demand Scenario',
        icon: Ext.Msg.INFO
      });
    
    
     me.scenarioPostData = {
        label: me.label
      //, docType: "ManualDemandScenario"
      , docType: "DemandOutcome"
      , projectId: me.projectId
      , areaRequirements : []
      };
    

    //"/{projectId}/manualDemandScenarios
    var remoteObject = Ext.create('Wif.RESTObject',
      { urlBase: Wif.endpoint + 'projects/' + me.projectId + '/manualDemandScenarios/'
      , data: me.scenarioPostData
      , listeners:
        { postsuccess: function(remote, id, data) {
            Ext.Msg.hide();
            _.log(me, 'scenario created', data);
            me.scenarioId = data._id;
            me.scenarioData = data;
            if (callback) { callback(); }
            
            // Tell everyone that the project list changed.
            Wif.eventBus.projectsChanged();
     }
        }
        , postfail: function(remote, status) {
            _.log(me, 'scenario creation failed', status);
            Ext.Msg.alert('Error', 'Could not create a manual demand scenario');
            if (callback) { callback(); }
          }
        }
    );

    remoteObject.post();
  }

, remoteUpdate: function (callback) {

    var me = this;
    if (!me.scenarioId) {
      _.log(me, 'scenario has not been added', me);
      me.remoteAdd(callback);
      return;
    }

    //me.scenarioPostDataBuild();

    var serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + me.projectId + '/manualDemandScenarios/' + me.scenarioId
        , method: "put"
        , params: me.scenarioPostData
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

    Ext.Msg.show({
      title: 'Loading ...',
      msg: 'Updating manual Demand Scenario',
      icon: Ext.Msg.INFO
    });

    function serviceHandler(data, status) {
      Ext.Msg.hide();
      _.log(me, 'manual demand updated', data);
      if (callback) { callback(); }
    }

    _.log(me, "Updating manual demand scenario", serviceParams.url, me.scenarioPostData);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, prepareScenario: function (callback) {
	_.log(me, '111111');
    var me = this
      , project = me.project;
     
    _.log(me, 'prepareScenario', project);

    me.remoteAdd(function() {
	    me.loadColumns(function() {
	    	me.loadRows( function () {
	    			me.loadMainData(function () {
	    		   if (callback) { callback(); }	
	    	  });
	      });
	    });
    });
    
  }


, prepareReadyScenario: function (callback) {
	_.log(me, '666666');
    var me = this
      , project = me.project;
    _.log(me, 'prepareReadyScenario', project);

  me.loadColumns(function() {
  	me.loadRows( function () {
  			me.loadMainData(function () {
  		   if (callback) { callback(); }	
  	  });
    });
  });

  }

, prepareStore: function () {

    var me = this;
       
    this.store = Ext.create('Ext.data.Store', {
      model : this.model,
      data: me.scenarioData
    });
  }

,  show: function (callback) {
    var me = this;
     //, scenarioData = me.scenarioData;
    Ext.QuickTips.init();

    _.log(me, 'about to show', me);

   
   	var gridfields = [];
   	var modelfields = [];
   	modelfields.push("_id");
   	modelfields.push("land use");
    var gfield_id = {
        text : "_id",
        dataIndex : "_id",
        hidden: true
      };   	
    var gfield = {
        text : "land use",
        dataIndex : "land use"
      };

    gridfields.push(gfield_id);
    gridfields.push(gfield);
   	
    
    
    var rows = me.scenarioColumns.projections.sort();
   	_.log(me, 'projections', me.scenarioColumns.projections);
   	
   	var sortfields = [];
   	
  	for (var i = 0; i < rows.count(); i++)
    {	                  
       sortfields.push(rows[i].label);
     }

  	sortfields.sort();
  //for (var i = 0; i < rows.count(); i++)
  	for (var i = 1; i < sortfields.count(); i++)
    {	          
      var field = {
          text : sortfields[i],
          dataIndex : sortfields[i],
          editor: 'numberfield',
          type: 'number'
        };
        
        gridfields.push(field);
        modelfields.push(sortfields[i]);
    }
//  	for (var i = 0; i < sortfields.count(); i++)
//    {	
//  	    modelfields.push(sortfields[i]);
//    }

  	_.log(me, 'sortFields',  sortfields);
    _.log(me, 'modelFields1',  modelfields);
    _.log(me, 'gridFields',  gridfields);


    var rowsData = me.scenarioRows;
    var storeData = [];
  	for (var j = 0; j < rowsData.count(); j++)
    {   
      var datafield = {
          "_id" : rowsData[j]._id,
          "land use" : rowsData[j].label,
        };
        
        storeData.push(datafield);
    }
    
    
    var model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: modelfields    
     });
    
    var store = Ext.create('Ext.data.Store', {
    	model: model,
    	data : storeData
    });
    
    var mainrows = me.scenarioData;
    store.each(function(record,idx){
      val = record.get('land use');
    
//  	 for (var k = 0; k < mainrows.count(); k++)
//       {   
	    	 for (var l = 0; l < mainrows.areaRequirements.count(); l++)
	       { 	  		 
	          if ( val == mainrows.areaRequirements[l].allocationLULabel)
	          	{          	
			         	 for (var m = 0; m < modelfields.count(); m++)
			           {
				            //if ( modelfields[m] == mainrows.areaRequirements[l].projection.label)
				            if ( modelfields[m] == mainrows.areaRequirements[l].projectionLabel)	
				          	{
				          	    record.set(modelfields[m],mainrows.areaRequirements[l].requiredArea);
				          	    record.commit();
				         	 	}	 
				         }
			        }
	         }
      // }
 
   });
    
    var grid = Ext.create('Ext.grid.Panel', {
//      selModel : {
//        selType : 'cellmodel'
//      },
    	title: 'Area requirements',
      selType: 'cellmodel',
      border : 0,
      margin : '0 5 5 5',
      store : store,
      height : 400,
      autoRender : true,
      columns : gridfields,
      flex: 1,
      viewConfig: {
        plugins: {
            ptype: 'gridviewdragdrop',
            dragText: 'Drag and drop to reorganize'
        }
       },
      plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
      
      //me.fields.push(data[i]);

    });
    
    var btn = Ext.create( "Ext.Button", {
      //xtype: 'button',
      style: { float: 'right' },
    	//renderTo: Ext.getBody(),
      text: 'Save',
      handler: function () {      
      	var areaRequirements=[];
      
           store.each(function(record,idx){                   		
		         	 for (var m = 2; m < modelfields.count(); m++)
		           {
			            if ( record.get(modelfields[m])> 0)
			          	{

			                  var ar = {
					            	  "@class": ".AreaRequirement",
					                "docType": "AreaRequirement",
			                		"allocationLUId": record.get('_id'),
			                    "allocationLULabel": record.get('land use'),
			                    "requiredArea": record.get(modelfields[m]),
			                    "unchangedArea": 0,
			                    "newArea": 0,
			                    "projectionLabel" : modelfields[m],
			                    "demandScenarioId" : me.scenarioId,
			                    "projection": {
			                        "year": modelfields[m],
			                        "label": modelfields[m]
			                         }
			                    };
			                    areaRequirements.push(ar);
			             }
			               
			         }
           });      	
      	
         me.scenarioPostData = {
            label: me.label
          , docType: "DemandOutcome"
          , projectId: me.projectId
          , areaRequirements : areaRequirements
          }; 
         me.remoteUpdate();
      }
    });
          
   
    var infoPanel = Ext.create('Ext.form.Panel', {
      header: false,
      bodyPadding: 5,
      frame: false,
      border: false,
      height: 30,
      region: 'north',
      layout: 'anchor',
      defaults: {
        labelAlign: 'right',
        labelWidth: 100,
        style: { float: 'left' }
      },
      defaultType: 'displayfield',
      items: [{
        fieldLabel: 'Scenario Name',
        name: 'first',
        value: '<b>' + me.scenarioData.label + '</b>',
      }, {
        fieldLabel: 'Analysis Type',
        name: 'last',
        value: '<b>Manual Demand</b>',
      }, btn]
    });
    //////////////////
    
    var store1 = Ext.create('Ext.data.Store', {
      storeId: 'simpsonsStore',
      fields: ['name'],
      data: [
          ["Lisa"],
          ["Bart"],
          ["Homer"],
          ["Marge"]
      ],
      proxy: {
          type: 'memory',
          reader: 'array'
      }
  });

 var grid1 = Ext.create('Ext.grid.Panel', {
      store: 'simpsonsStore',
      columns: [{
          header: 'Name',
          dataIndex: 'name',
          flex: true
      }],
      viewConfig: {
          plugins: {
              ptype: 'gridviewdragdrop',
              dragText: 'Drag and drop to reorganize'
          }
      },
      height: 200,
      width: 400,
      renderTo: Ext.getBody()
  });


    ////////////////////////////////
    var win = Ext.create( "Ext.window.Window", {
      title: 'Analysis - Manual Demand',
      closable: true,
      closeAction: 'hide',
      width: 900,
      height: 600,
      layout: 'border',
      plain: true,
      items:
        [
         infoPanel,
         grid
      ]
    });

    me.win = win;
    _.log(me, 'win.show', me);
   var component = win.show();
    _.log(me, 'win.show result', component);
    if (callback) { callback(); }
  }
 
, loadColumns: function (callback) {
  var me = this;
  _.log(me, 'loading columns', me);

    var serviceParams = {
        xdomain: "cors"
      //, url: Wif.endpoint + 'projects/' + me.projectId + '/manualdemand/setup/'
      , url: Wif.endpoint + 'projects/' + me.projectId + '/demand/setup/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
   _.log(me, 'loaded columns before', me);
    me.scenarioColumns = data;
    _.log(me, 'loaded columns after', me.scenarioColumns.projections);
    if (callback) { callback(); }
  }

   Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  
}

, loadRows: function (callback) {
	_.log(me, '333333');
  var me = this;
  _.log(me, 'loading rows', me);

  
  //, url: Wif.endpoint + 'projects/' + me.projectId + '/allocationLUs/'
    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/allocationLUsSuitabilityAssociated/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'loaded rows before', me);
    me.scenarioRows = data;
   
    _.log(me, 'loaded rows after', me.scenarioRows);
    //me.show();
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

}

, loadMainData: function (callback) {
	_.log(me, '44444');
  var me = this;
  _.log(me, 'loading Main rows', me);

    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/manualDemandScenarios/' + me.scenarioId
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'loaded main data before', me);
    me.scenarioData = data;
    me.label = data.label;
   
    _.log(me, 'loaded maina data after', me.scenarioData);
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

}

, launch: function () {
  var me = this;

//  me.project = Ext.create('Wif.Project', {
//    projectId: me.projectId
//  });

  function newScenario () {
  	_.log(me, 'newScenario');
    me.show();
  };

  function existingScenario (callback) {
  	
    me.prepareScenario();
    me.prepareStore();
    me.show();      

  };

//  me.project.load(function () {
    _.log(me, 'projectloaded', me);

    if (me.scenarioId) {
        
      	me.prepareReadyScenario(function() {
        	newScenario(); 
      	});
     } else {
      Ext.Msg.prompt('Name', 'Please enter a scenario name:', function(btn, text) {
        if (btn === 'ok') {
          me.label = text;
            me.prepareScenario(function() {
            	_.log(me, '2222222');
            	newScenario();
            });

        }
      });
    }
 // });

}//end lunch
  
});

