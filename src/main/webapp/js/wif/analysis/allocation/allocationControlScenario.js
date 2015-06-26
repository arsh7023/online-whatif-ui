Ext.define('Wif.analysis.allocation.allocationControlScenario', {
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
      , manualAreaRequirements = me.project.manualAreaRequirements;
    
      _.log(me, "Preparing posting data", manualAreaRequirements);

       me.scenarioPostData = {
      label: me.label
    , docType: "AllocationControlScenario"
    , projectId: me.projectId
    , manualAreaRequirements : me.project.manualAreaRequirements
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
        msg: 'Creating Allocation Control Scenario',
        icon: Ext.Msg.INFO
      });
    
    
     me.scenarioPostData = {
        label: me.label
      , docType: "AllocationControlScenario"
      , projectId: me.projectId
      , infrastructureUses : []
      , plannedlandUseControl: false
      , infrastructureControl: false
      , growthPatternControl: false
//      , InfrastructureControlLabels : [""]
//      , GrowthPatternControlLabels : [""]
      };
    

    //"/{projectId}/AllocationControlScenarios
    var remoteObject = Ext.create('Wif.RESTObject',
      { urlBase: Wif.endpoint + 'projects/' + me.projectId + '/AllocationControlScenarios/'
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
            Ext.Msg.alert('Error', 'Could not create a allocation control scenario');
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

    var serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + me.projectId + '/AllocationControlScenarios/' + me.scenarioId
        , method: "put"
        , params: me.scenarioPostData
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

    Ext.Msg.show({
      title: 'Loading ...',
      msg: 'Updating Allocation Control Scenario',
      icon: Ext.Msg.INFO
    });

    function serviceHandler(data, status) {
      Ext.Msg.hide();
      _.log(me, 'Allocation Control Scenario', data);
      if (callback) { callback(); }
    }

    _.log(me, "Allocation Control Scenario", serviceParams.url, me.scenarioPostData);
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
   	modelfields.push("landuseName");
 	
    var gfield = {
        text : "land use",
        dataIndex : "landuseName"
      };

    gridfields.push(gfield);
    
    
    var rows = me.scenarioColumns.infrastructureALUs;
   	_.log(me, 'infrastructureALUs', me.scenarioColumns.infrastructureALUs);
   	
   	var sortfields = [];
  	for (var i = 0; i < rows.count(); i++)
    {	                  
       sortfields.push(rows[i].label);
     }

  	for (var i = 0; i < sortfields.count(); i++)
    {	          
      var field = {
          text : sortfields[i],
          dataIndex : sortfields[i],
          editor: new Ext.form.field.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            selectOnTab: true,
            store: [
                ['N/A','N/A'],
                ['Required','Required'],
                ['Excluded','Excluded']
            ],
            value:'N/A',
            lazyRender: true,
            listClass: 'x-combo-list-small'
        })
        };
        
        gridfields.push(field);
        modelfields.push(sortfields[i]);
    }
  	_.log(me, 'sortFields',  sortfields);
    _.log(me, 'modelFields1',  modelfields);
    _.log(me, 'gridFields',  gridfields);


    var rowsData = me.scenarioRows;
    var storeData = [];
  	for (var j = 0; j < rowsData.count(); j++)
    {   
      var datafield = {
          "landuseName" : rowsData[j].label,
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
      val = record.get('landuseName');
    
    	  for (var n = 0; n < modelfields.count(); n++)
        {			  
     		    record.set(modelfields[n+1],'N/A');
     		    record.commit();
        }
  
	    	 for (var l = 0; l < mainrows.infrastructureUses.count(); l++)
	       { 	  		 
	          if ( val == mainrows.infrastructureUses[l].landuseName)
	          	{          	
			         	 for (var m = 1; m < modelfields.count(); m++)
			           {			  
			         	    	var obj = mainrows.infrastructureUses[l].infrastructureMap;
				              for (var prop in obj) {
				              	if (prop == modelfields[m])
				              	{
				              		    x =  obj[prop];
				              		    record.set(modelfields[m],x);
					          	        record.commit();
				              	}
				              } 
				               
				         }
			        }
	         }
 
   });
    

    
    var grid = Ext.create('Ext.grid.Panel', {
    	title: 'Infrastructure Uses (only required if Infrastructure control box is ticked above)',
      selType: 'cellmodel',
      border : 0,
      margin : '0 5 5 5',	
      store : store,
      height : 400,
      autoRender : true,
      columns : gridfields,
      autoScroll:true,
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

    });
    
    var chkgridfields = [];
   	var chkmodelfields = [];
   	chkmodelfields.push("control");
   	chkmodelfields.push("selectcontrol");
 	
    var chkgfield1 = {
        text : "control",
        dataIndex : "control",
        width : 180
      };
    
    var chkgfield2 = {
      xtype: 'checkcolumn',
      header: 'select',
      dataIndex: 'selectcontrol',
      width: 55,
      stopSelection: false
     };

    chkgridfields.push(chkgfield1);
    chkgridfields.push(chkgfield2);
    
    var chkmodel = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: chkmodelfields    
     });
    
    var chkdatafield1 = {
        "control" : "plannedlandUseControl",
        "selectcontrol" : false
      };
    var chkdatafield2 = {
        "control" : "growthPatternControl",
        "selectcontrol" : false
      };
    var chkdatafield3 = {
        "control" : "infrastructureControl",
        "selectcontrol" : false
      };
    var chkstoreData = [];
    
    chkstoreData.push(chkdatafield1);
    //new commented   
    //chkstoreData.push(chkdatafield2);
    //chkstoreData.push(chkdatafield3);    
    
    //new
    for (var i = 0; i < rows.count(); i++)
    {	                  
       var chkdatafieldnew = {
           "control" : "infrastructure: " + rows[i].label,
           "selectcontrol" : false
         };
       
         chkstoreData.push(chkdatafieldnew);
    }

    var rowsnew = me.scenarioColumns.growthPatternALUs;
    for (var i = 0; i < rowsnew.count(); i++)
    {	                  
       var chkdatafieldnew = {
           "control" : "growthPattern: " + rowsnew[i].label,
           "selectcontrol" : false
         };
       
         chkstoreData.push(chkdatafieldnew);
    }       
    //end new
    
    
    var chkstore = Ext.create('Ext.data.Store', {
    	model: chkmodel,
    	data : chkstoreData
    });
    
    var checkgrid = Ext.create('Ext.grid.Panel', {
    	title: 'select controls',
      selType: 'cellmodel',
      border : 0,
      margin : '0 5 5 5',	
      store : chkstore,
      height : 240,
      autoRender : true,
      columns : chkgridfields,
      flex: 1,
      plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]

    });
    
    chkstore.each(function(record,idx){
      val = record.get('control');
    
      if (val == "plannedlandUseControl")
      	{
      	    record.set("selectcontrol",mainrows.plannedlandUseControl);
      	    record.commit();
      	}
      
      /*
      if (val == "growthPatternControl")
    	{
    	    record.set("selectcontrol",mainrows.growthPatternControl);
    	    record.commit();
    	}
      if (val == "infrastructureControl")
    	{
    	    record.set("selectcontrol",mainrows.infrastructureControl);
    	    record.commit();
    	} 
    	*/  
      
      
      if (val.substring(0,15) == 'infrastructure:')
      {
     	  // _.log(me, 'substring(16)', val.substring(16));
      	  if (mainrows.infrastructureControlLabels != undefined)
      	  	{
		  	      for (var ind=0; ind <= mainrows.infrastructureControlLabels.count(); ind ++)
		  	      	{
	  	      	     if (val.substring(16) == mainrows.infrastructureControlLabels [ind])
	  	      	    	 {
	  	      	    	     record.set("selectcontrol",true);   
	  	      	    	     record.commit();
	  	      	    	 }
		  	      	}
      	  	}
      }

      if (val.substring(0,14) == 'growthPattern:')
      {
     	  // _.log(me, 'substring(16)', val.substring(16));
      	if (mainrows.growthPatternControlLabels != undefined)
      	{	
  	      for (var ind=0; ind <= mainrows.growthPatternControlLabels.count(); ind ++)
  	      	{
	      	     if (val.substring(15) == mainrows.growthPatternControlLabels [ind])
	      	    	 {
	      	    	     record.set("selectcontrol",true);   
	      	    	     record.commit();
	      	    	 }
  	      	}
      	}
      }      
      
   });
    
    var btn = Ext.create( "Ext.Button", {
      //xtype: 'button',
      style: { float: 'right' },
    	//renderTo: Ext.getBody(),
      text: 'Save',
      handler: function () {      
      	var infrastructureUses=[];
      
           store.each(function(record,idx){      
          	   var	str=  '{' + '\"' + 'landuseName' + '\"' + ':' + '\"' + record.get('landuseName') + '\"' + ',' + '\"' + 'infrastructureMap' + '\"' + ':' + '{';
		         	 for (var m = 1; m < modelfields.count(); m++)
		           {
		         	    if (m< modelfields.count() - 1)
		         	    	{
		         	    	    str = str + '\"' + modelfields[m] + '\"' + ':' + '\"' + record.get(modelfields[m]) + '\"' +',';
		         	    	}
		         	    else
		         	    	{
	         		          str = str + '\"' + modelfields[m] + '\"' + ':' + '\"' + record.get(modelfields[m]) + '\"}';
		         	    	}
			         }
	              str = str + '}';
	              infrastructureUses.push(JSON.parse(str));	
           });   
           
           var ch1 = false;
           var ch2 = false;
           var ch3 = false;
           
           var infrastructureControlLabels=[];
           var growthPatternControlLabels = [];
           
           chkstore.each(function(record,idx){
             val = record.get('control');
           
//           	_.log(me, 'substring(0,15)', val.substring(0,15));
//          	_.log(me, 'substring(0,16)', val.substring(0,16));
          	
          	//_.log(me, 'substring(14)', val.substring(14));
           	//"control" : "growthPattern: " + rowsnew[i].label,
             if (val.substring(0,15) == 'infrastructure:')
             {
            	 _.log(me, 'substring(16)', val.substring(16));
            	   if (record.get("selectcontrol") == true)
            	  	 {
            	  	      ch3 = true;
            	  	      infrastructureControlLabels.push(val.substring(16));
            	  	 }
             }
             if (val.substring(0,14) == 'growthPattern:')
          	 {
            	 _.log(me, 'substring(15)', val.substring(15));
	          	   if (record.get("selectcontrol") == true)
	        	  	 {
	        	  	      ch2 = true;
	        	  	      growthPatternControlLabels.push(val.substring(15));
	        	  	 }
          	 }
             
             
            if (val == "plannedlandUseControl")
            {
           	   ch1= record.get("selectcontrol");
            }
            /*
            if (val == "growthPatternControl")
           	{
            	 ch2= record.get("selectcontrol");
            }
            if (val == "infrastructureControl")
           	{
            	 ch3= record.get("selectcontrol");
           	}*/      
          
          });
      	
           //////new, fix it later
//           var	strNew=  '{' + '\"' + 'label' + '\"' + ':' + '\"' + me.label + '\"' + ','
//                        + '\"' + 'docType' + '\"' + ':' + '\"' + 'AllocationControlScenario' + '\"' + ',' 
//                        + '\"' + 'projectId' + '\"' + ':' + '\"' + me.projectId + '\"' + ','
//                        + '{';
//         	 for (var m = 1; m < modelfields.count(); m++)
//           {
//         	    if (m< modelfields.count() - 1)
//         	    	{
//         	    	    strNew = strNew + '\"' + modelfields[m] + '\"' + ':' + '\"' + record.get(modelfields[m]) + '\"' +',';
//         	    	}
//         	    else
//         	    	{
//       		          strNew = strNew + '\"' + modelfields[m] + '\"' + ':' + '\"' + record.get(modelfields[m]) + '\"}';
//         	    	}
//	         }
//            strNew = strNew + '}';
            ///////
           
           
         me.scenarioPostData = {
            label: me.label
          , docType: "AllocationControlScenario"
          , projectId: me.projectId
          , infrastructureUses : infrastructureUses
          , plannedlandUseControl: ch1
          , growthPatternControl: ch2
          , infrastructureControl: ch3
          , infrastructureControlLabels :infrastructureControlLabels
          , growthPatternControlLabels : growthPatternControlLabels
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
        fieldLabel: 'Scenario Type',
        name: 'last',
        value: '<b> Allocation Control Scenario</b>',
      }, btn]
    });

    var chkPanel = Ext.create('Ext.form.Panel', {
      header: false,
      bodyPadding: 5,
      frame: false,
      border: false,
      height: 180,
      width: 300,
      autoScroll:true,
      region: 'north',
      layout: 'anchor',
      defaultType: 'displayfield',
      items: [checkgrid]

    });

    
    ////////////////////////////////
    var win = Ext.create( "Ext.window.Window", {
      title: 'Allocation Control Scenario',
      closable: true,
      closeAction: 'hide',
      width: 900,
      height: 600,
      layout: 'border',
      plain: true,
      items:
        [
         infoPanel,  
         chkPanel,
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
      , url: Wif.endpoint + 'projects/' + me.projectId + '/AllocationConfigs/setup/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
   _.log(me, 'loaded columns before', me);
    me.scenarioColumns = data;
    _.log(me, 'loaded columns after', me.scenarioColumns.infrastructureALUs);
    if (callback) { callback(); }
  }

   Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  
}

, loadRows: function (callback) {
	_.log(me, '333333');
  var me = this;
  _.log(me, 'loading rows', me);

   //allocationLUsSuitabilityAssociated
    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/allocationLUs/'
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
      , url: Wif.endpoint + 'projects/' + me.projectId + '/AllocationControlScenarios/' + me.scenarioId
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

