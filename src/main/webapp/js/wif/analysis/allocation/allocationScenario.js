Ext.define('Wif.analysis.allocation.allocationScenario', {
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
, scenarioData: null
, scenarioPostData: null
, scenarioColumns: {}
, allocationLUs :{}
, suitabilityScenarios :{}
, demandScenarios :{}
, demandScenariosnew :{}
, demandScenariosAll :{}
, unionAttribs :{}
, allocationLus :{}
, map : null
, wmsLayerName : null
, wmsStyleName : null
, serverURL : null
, aluColumns : []
, attr: null
, uniqueValues : []
, uniqueColors : []
, wmsdata : null
, dirty: false
, mysldBody : null


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
    , docType: "ManualDemandScenario"
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
        msg: 'Creating Allocation Scenario',
        icon: Ext.Msg.INFO
      });
    
    
     me.scenarioPostData = {
        label: me.label
	      , docType: "AllocationScenario"
	      , projectId: me.projectId
	      , suitabilityScenarioId: ""
	      , demandScenarioId: ""
	      , projectId: ""
	      , featureFieldName: ""
	      , manualdemandScenarioId: ""
	      , landUseOrderMap : {}
        , controlScenarioId: ""
        , ready: false
        , manual: true
      };
    

    //"/{projectId}/manualDemandScenarios
    var remoteObject = Ext.create('Wif.RESTObject',
      { urlBase: Wif.endpoint + 'projects/' + me.projectId + '/allocationScenarios/'
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
            Ext.Msg.alert('Error', 'Could not create a suitability scenario');
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
        , url: Wif.endpoint + 'projects/' + me.projectId + '/allocationScenarios/' + me.scenarioId
        , method: "put"
        , params: me.scenarioPostData
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

//    Ext.Msg.show({
//      title: 'Loading ...',
//      msg: 'Updating allocation Scenario',
//      icon: Ext.Msg.INFO
//    });

    function serviceHandler(data, status) {
      //Ext.Msg.hide();
      _.log(me, 'allocation Scenario updated', data);
      if (callback) { callback(); }
    }

    _.log(me, "Updating allocation scenario", serviceParams.url, me.scenarioPostData);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, prepareScenario: function (callback) {
	_.log(me, '111111');
    var me = this
      , project = me.project;
     
    _.log(me, 'prepareScenario', project);
    
    me.remoteAdd(function() {
	    me.loadsuitabilityScenarios(function() {
	    	me.loadallocationLUs( function () {
	    		me.loaddemandScenarios( function () {
	    			me.loaddemandScenariosnew( function () {
	    			me.loadunionAttribs( function () {
	    				me.loadAluColumns( function () {
	    			   me.loadMainData(function () {
	    		      if (callback) { callback(); }	
	    	   });
	        });
	       });
        });
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

    
    me.loadsuitabilityScenarios(function() {
    	me.loadallocationLUs( function () {
    		me.loaddemandScenarios( function () {
    			me.loaddemandScenariosnew( function () {
    			 me.loadunionAttribs( function () {
    			  me.loadAluColumns( function () {
    			   me.loadMainData(function () {
    		      if (callback) { callback(); }	
    	  });
       });
      });
     });
    });
   });
  });

  }

, prepareStore: function () {

//    var me = this;
//       
//    this.store = Ext.create('Ext.data.Store', {
//      model : this.model,
//      data: me.scenarioData
//    });
  }

,  show: function (callback) {
    var me = this;
    var scenarioData = me.scenarioData;
    Ext.QuickTips.init();

    _.log(me, 'about to show', me);

   
   	var gridfields = [];
   	var modelfields = [];
   	modelfields.push("order");
   	modelfields.push("_id");
   	modelfields.push("land use");
    var gfield_order = {
        text : "order",
        dataIndex : "order",
        hidden: true
      };
    var gfield_id = {
        text : "_id",
        dataIndex : "_id",
        hidden: true
      };   	
    var gfield = {
        text : "land use",
        dataIndex : "land use"
      };

    gridfields.push(gfield_order);
    gridfields.push(gfield_id);
    gridfields.push(gfield);
   	
    
    
    var rowsData = me.allocationLUs;	
    var storeData = [];
    var lsw = 0;
    if (JSON.stringify(me.scenarioData) == "{}")
    	{ 
    	    lsw = 1;
    	}
    else
    	{
    	if (JSON.stringify(me.scenarioData.landUseOrderMap) == "{}")
    		{
    		lsw = 1;
    		}
    	}
    if (lsw == 0)
    	{
  	     var obj = me.scenarioData.landUseOrderMap;
  	     var x = 0;
         for (var prop in obj) {
             if (obj.hasOwnProperty(prop)) { 
            	    x =  obj[prop];
             }
             for (var j = 0; j < rowsData.count(); j++)
            	{
            	    if (rowsData[j]._id == prop)
            	    	{
            	         var datafield = {
            	          "order"	: x,	 
            	          "_id" : rowsData[j]._id,
            	          "land use" : rowsData[j].label,
            	        };
            	        
            	        storeData.push(datafield);
            	    	}
            	}
         }

    	}
    else
    	{
		  	for (var j = 0; j < rowsData.count(); j++)
		    {   
		      var datafield = {
		      		"order" : j+1,
		          "_id" : rowsData[j]._id,
		          "land use" : rowsData[j].label,
		        };
		        
		        storeData.push(datafield);
		    }
    	}
    
    
    var model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: modelfields    
     });
    
    var store = Ext.create('Ext.data.Store', {
    	model: model,
    	data : storeData,
    	sorters : ['order']
    });
    
    var mainrows = me.scenarioData;
    
 // The data store containing the list of states
    var suitabilityStore = Ext.create('Ext.data.Store', {
        fields: ['_id','label'],
        data : me.suitabilityScenarios
    });
    
    me.demandScenariosAll = me.demandScenarios.add(me.demandScenariosnew);
    
    
    var demandStore = Ext.create('Ext.data.Store', {
    	fields: ['_id','label'],
      //data : me.demandScenarios
      data : me.demandScenariosAll
    });
    
    // Create the combo box, attached to the states data store
    var enumDistrictFieldSet = Ext.create('Ext.form.FieldSet', {
      columnWidth : 0.5,
      title : 'Define Allocation Scenario Information',
      collapsible : true,
      margin : '15 5 5 0',
      defaults : {
        bodyPadding : 10,
        anchor : '90%'
      }
    });
    
   var cmbSuitability=Ext.create('Ext.form.field.ComboBox', {
  	    extend : 'Aura.Util.RemoteComboBox',
        fieldLabel: 'Choose suitability scenario',
        //width: 500,
        labelWidth: 200,
        store: suitabilityStore,
        data : me.suitabilityScenarios,
        //queryMode: 'local',
        displayField: 'label',
        valueField: '_id',        
        autoLoad : false,
        multiSelect : false,
        forceSelection: true,
        projectId : null,
        editable : true,
        allowBlank : false,
        emptyText : "Choose suitability scenario",
        //renderTo: Ext.getBody()
        listeners: { 
          select: function() {
             me.dirty = true;
             
             Ext.MessageBox.show({
               title:'WARNING',
               msg: "Please make sure  the selected suitablity is the lastest suitability scenario executed, before allocation compute analysis !",
               buttons: Ext.MessageBox.OK,
               icon: Ext.MessageBox.WARNING
             });
          }
        }
    });
   
   var cmbDemand=Ext.create('Ext.form.field.ComboBox', {
	    extend : 'Aura.Util.RemoteComboBox',
     fieldLabel: 'Choose demand scenario or demand outcome',
     //width: 500,
     labelWidth: 200,
     store: demandStore,
     //data : me.demandScenarios,
     data : me.demandScenariosAll,
     //queryMode: 'local',
     displayField: 'label',
     valueField: '_id',        
     autoLoad : false,
     multiSelect : false,
     forceSelection: true,
     projectId : null,
     editable : true,
     allowBlank : false,
     emptyText : "Choose manual demand scenario",
     //renderTo: Ext.getBody()
     listeners: { 
       select: function() {
          me.dirty = true;
       }
     }
  });
   

   var attribData = []; 
   var datafield = {
  		 "_id" : "None",
       "label" : "None"
     };
 	
 	attribData.push(datafield);
   
	for (var j = 0; j < me.unionAttribs.count(); j++)
 {   
   var datafield = {
  		 "_id" : me.unionAttribs[j]._id,
       "label" : me.unionAttribs[j].label
     };
     
   attribData.push(datafield);
 }

	
	
	var attribStore = Ext.create('Ext.data.Store', {
		fields: ['_id','label'],
    data : attribData
});
	
	 var cmbSpatial=Ext.create('Ext.form.field.ComboBox', {
	    extend : 'Aura.Util.RemoteComboBox',
   fieldLabel: 'Choose Control Scenario',
   //width: 500,
   labelWidth: 200,
   //fields: ['name'],
   data : attribData,
   //queryMode: 'local',
   store: attribStore,
   displayField: 'label',
   valueField: '_id',       
   autoLoad : false,
   multiSelect : false,
   //forceSelection: true,
   projectId : null,
   editable : true,
   //allowBlank : false,
   emptyText : "Choose Control Scenario",
   //renderTo: Ext.getBody()
   listeners: { 
     select: function() {
        me.dirty = true;
     }
   }
 });
	 

    var grid = Ext.create('Ext.grid.Panel', {
//      selModel : {
//        selType : 'cellmodel'
//      },
    	title: 'Select LandUse Order (use Drag and Drop)',
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
              ,listeners: {
              	drop: function(node, data, dropRec, dropPosition) { 
                    me.dirty = true;
                    grid.reconfigure(store, gridfields);
                }	
          }
       }
    });
    
    cmbSuitability.setValue(mainrows.suitabilityScenarioId);
    cmbDemand.setValue(mainrows.manualdemandScenarioId);
    cmbSpatial.setValue(mainrows.controlScenarioId);
    
    // Save Button
    var btn = Ext.create( "Ext.Button", {
      //xtype: 'button',
      style: { float: 'right' },
    	//renderTo: Ext.getBody(),
      text: 'Save',
      handler: function () {    
      	var landUseOrderMap=[];
      	var json = { };
      	var landUseOrderMapstr='{';
      	var jsonStr='';
          var i = 0;
           store.each(function(record,idx){                   		
	             i = i + 1;  
	             var x= '\"' +record.get('_id') + '\"'; 
	             var x1 =  ':' + i +',';
	             landUseOrderMapstr = landUseOrderMapstr + x + x1;
	             jsonStr = jsonStr + x + x1;
	             //landUseOrderMap.push('\"' +record.get('_id') + '\"' + ':' + i);
           });      
           ;
           var res = landUseOrderMapstr.substring(0,landUseOrderMapstr.length-1)+'}';
           //var res1 = landUseOrderMap.substring(0,landUseOrderMap.length-2)+'}';
           json[0] = jsonStr.substring(0,landUseOrderMapstr.length-1);	
           landUseOrderMap.push(res.substring(2,res.length-1));
           
      	
         me.scenarioPostData = {
            label: me.label
          , docType: "AllocationScenario"
          , projectId: me.projectId
  	      , suitabilityScenarioId: cmbSuitability.getValue()
  	      , demandScenarioId: ""
  	      , featureFieldName: me.label
  	      , manualdemandScenarioId: cmbDemand.getValue()
  	      //, landUseOrderMap : res
  	      , landUseOrderMap : JSON.parse(res)
          , controlScenarioId: cmbSpatial.getValue()
          , ready: false
          , manual: true
          }; 
         me.remoteUpdate();
      }
    });
    
    var btnCompute = Ext.create( "Ext.Button", {
      //xtype: 'button',
      style: { float: 'right' },
    	//renderTo: Ext.getBody(),
      text: 'Compute Analysis',
      handler: function () {    
//     	 var newCardId = newCard.getItemId();
//  	   if (newCardId == 'mapPanel') {
//  	  	 var map = me.map;
//  	 		if (!map) {
//  	 		return;
//  	 		}
 		
      	me.dirty =true;
  	    savedata(function(){
  	     me.remoteUpdate(function() {	
  	 	    me.getWmsInfo(function() {
  	 	  	 me.computeAnalysis(function(){
  		       me.setWmsLayer(function(){
  		      	 
//    		       me.attr = me.aluColumns[0].boxLabel; //first column ALU_2016	
//    		       me.loaduniqeColors(function(){        		      	
//       		    	var jsonnew =me.uniqueColors;
//      		    	var strjsonnew="";
//      		    	for (var i1= 0; i1 < jsonnew.length; i1++)
//      		    		{
//      		    		  if (i1 < jsonnew.length-1)
//      		    		  	{
//      		    		  	    strjsonnew = strjsonnew + jsonnew[i1] + ",";
//      		    		  	}
//      		    		  else
//      		    		  	{
//      		    		  	    strjsonnew = strjsonnew + jsonnew[i1];
//      		    		  	}
//      		    		}
//      		    	
//      		    	console.log("strjsonnew is: " + strjsonnew);
//  		      
//      		    //commented below by ali for new checkbox version
//   		      //var rg = mapFormPanel.down('radiogroup');
//   		     var rg = mapFormPanel.down('checkboxgroup');
//   		      
//   		      
//  		     // me.attr = rg.getValue().rb;
//  		      
//  		     // mapFormPanel.down('checkboxgroup').items.items[0].getValue()
//  		     me.attr = mapFormPanel.down('checkboxgroup').items.items[0].boxLabel;
//  		      
//  		      me.loaduniqeValues(function(){
//  		    	var json =me.uniqueValues;
//  		    	var strjson="";
//  		    	for (var i= 0; i < json.length; i++)
//  		    		{
//  		    		  if (i < json.length-1)
//  		    		  	{
//  		    		       strjson = strjson + json[i] + ",";
//  		    		  	}
//  		    		  else
//  		    		  	{
//  		    		  	    strjson = strjson + json[i] ;
//  		    		  	}
//  		    		}
//  		    	var suitabilityScoreRanges = {
//  	    		    featureFieldName: me.attr
//  	    		    , choroplethRange: strjson
//  	    		  };
//  		    	   
//  		    	    //commented below by ali for new checkbox version
//  	    		    //me.map.setSldnew(2, suitabilityScoreRanges,strjsonnew, function(sldBody) {
//  	    		    me.map.addLayerMCEColorPlette(mapFormPanel.down('checkboxgroup').items.items[0].getValue(),suitabilityScoreRanges, strjsonnew, function(mciSld) {	
//  	    		    	
//  	    		       // update the legend here
//  	    		    	
//  	    		    	console.log('mciSld: ' + mciSld);
//  	    		    	
//  	    		       //var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(sldBody));
//  	    		       var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(mciSld));
//  	    		      
//  	    		       
// 	    		    		if (strjsonnew=="")
//    		    			{
// 	    		    			mapFormPanel.down('panel').update(legendHtml);
//     		    			}
//  	    		       
//  	    		    });
//  	    		    me.map.refresh();
//  	    		    if (callback) { callback(); }
//  		       });        		    	
//  		      });
  		      	 
  		      	 
          			var tweetRecursive = function (n) {
           	      if (n < me.aluColumns.length) {//
           	          // tweet function                //mapFormPanel.down('checkboxgroup')
           	      	updateAllocationSelectorNew(n,true,mapRadioPanel1.down('checkboxgroup').items.items[n].boxLabel, function(e,r) {
           	              if (!e) {
           	                 tweetRecursive(n + 1);
           	               }
           	           });        
           	       }
           	    };
           	  //start the recursive function
           	  tweetRecursive(0);
  		      	 
  		      	 
  	       });
  	      });
  	     });
  	     });  
  	    });
  	    
  	   }//end handler
     
   
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
        fieldLabel: 'Analysis Name',
        name: 'first',
        value: '<b>' + me.scenarioData.label + '</b>',
      }, {
        fieldLabel: 'Analysis Type',
        name: 'last',
        value: '<b>Allocation</b>',
      },
      {
        xtype: 'button',
        style: { float: 'right'},
        text: 'PDF Report',
        handler: function () {
          me.ReportPDF();
        }
      },
      {
        xtype: 'button',
        style: { float: 'right' },
        text: 'Excel Report',
        handler: function () {
          me.ReportXLS();
        }
      }, 
//      {
//        xtype: 'button',
//        style: { float: 'right' },
//        text: 'HTML Report',
//        handler: function () {
//          me.downloadReport();
//        }
//      },
        btnCompute,btn]
    });
    //////////////////
    

    
    //map panel
//    var mapFormPanel = Ext.create('Ext.form.Panel', {
//      width: 180,
//      region: 'west',
//      header: false,
//      bodyPadding: 5,
//      frame: false,
//      border: true,
//      split: true,
//      layout: 'anchor',
//      defaults: {
//        labelAlign: 'left',
//        labelWidth: 0
//      },
//      items: [
//              
////              {
////        xtype: 'radiogroup',
////        itemId: 'sluRadioGroup',
////        columns: 1,
////        vertical: true,
////        items: me.aluColumns,
////        listeners: {
////          change: function (field, nv) {
////          
////          	//updateAllocationSelector();
////     	   
////          	
////          }
////        }
////      }
//              
//              ,
//      
//      //new
//      {
//        xtype: 'checkboxgroup',
//        itemId: 'sluCheckGroup',
//        columns: 1,
//        vertical: true,
//        items: me.aluColumns,
//        listeners: {
//        	change: function(checkbox, checked) {
//
//         			var tweetRecursive = function (n) {
//         	      if (n < me.aluColumns.length) {
//         	      	  
//         	      		this.OnOffAllocationSelectorNew(n,checkbox.items.get(n).value,checkbox.items.get(n).boxLabel, function(e,r) {//O
//         	              if (!e) {
//         	                 tweetRecursive(n + 1);
//         	               }
//         	           });        
//         	       }
//         	    };
//
//         	  //start the recursive function
//         	  tweetRecursive(0);
//
//          	
//          }
//        }
//      },
//      
//      {
//        xtype: 'panel',
//        width: 200,
//        height: 600,
//        html: '' //sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s" />', me.serverURL, me.wmsLayerName)
//        }
//      ]
//    });
    
    var mapFormPanel = Ext.create('Ext.form.Panel', {

     width: 300,
     height: 600,
     autoScroll: true,
     region: 'west',
     header: false,
     bodyPadding: 5,
     frame: false,
     border: true,
     split: true,
     layout: 'anchor',
     defaults: {
       labelAlign: 'left',
       labelWidth: 0
     },
     items: [
 
	      {
	       xtype: 'panel',
	       width: 300,
	       height: 550,
	       html: '' //sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s" />', me.serverURL, me.wmsLayerName)
	       }
     ]
   });
    
  
    
    var mapRadiLabel1 = {
        xtype: 'label',
        text: "Layers",
        forId: 'mapRadioLabel1',
        margin: '9 0 0 2',
        //width: '20%'
    };
    
    var mapRadioPanel1 = Ext.create('Ext.form.Panel', {
      //width: 215,//435,
      //width: '100%',
      flex: 1,
      //height: 170,
      region: 'west',
      header: false,
      bodyPadding: 5,
      frame: false,
      border: false,
      split: true,
      layout: 'anchor',
      defaults: {
          labelAlign: 'left',
          labelWidth: 0
      },
      items: [
          mapRadiLabel1, {
              xtype: 'checkboxgroup',
              itemId: 'sluCheckGroup',
              columns: 1,
              vertical: true,
              items: me.aluColumns,
              listeners: {
              	change: function(checkbox, checked) {

               			var tweetRecursive = function (n) {
               	      if (n < me.aluColumns.length) {
               	      	  
               	      		this.OnOffAllocationSelectorNew(n,checkbox.items.get(n).value,checkbox.items.get(n).boxLabel, function(e,r) {//O
               	              if (!e) {
               	                 tweetRecursive(n + 1);
               	               }
               	           });        
               	       }
               	    };

               	  //start the recursive function
               	  tweetRecursive(0);

                	
                }
          
              }

             
          }

      ]
  });
    
    
    
    var mapRadiLabel2 = {
        xtype: 'label',
        text: "Basemap",
        forId: 'mapRadioLabel2',
        margin: '9 0 0 2',
        //width: '20%'
    };
    
    var mapRadioPanel2 = Ext.create('Ext.form.Panel', {
      //width: 215,//435,
      //width: '100%',
      flex: 1,
      //height: 175,
      //region: 'west',
      header: false,
      bodyPadding: 5,
      frame: false,
      border: false,
      split: true,
      layout: 'anchor',
      defaults: {
          labelAlign: 'left',
          labelWidth: 0
      },
      items: [
          mapRadiLabel2, {
              xtype: 'radiogroup',
              //fieldLabel: 'Basemap',
              itemId: 'radioLayerGroup',
              //width: 220,
              //flex: 1,
              //height: 35,
              bodyPadding: 2,
              //itemCls: 'chkcss',
              // Arrange checkboxes into two columns, distributed vertically
              columns: 1,
              vertical: true,
              items: [{
                      boxLabel: 'OSM',
                      name: 'grb',
                      inputValue: '1',
                      checked: true
                  }, {
                      boxLabel: 'Google Maps',
                      name: 'grb',
                      inputValue: '2'
                  }, {
                      boxLabel: 'Google Satellite',
                      name: 'grb',
                      inputValue: '3'
                  }, {
                      boxLabel: 'Google Terrain',
                      name: 'grb',
                      inputValue: '4'
                  }, {
                      boxLabel: 'Google Hybrid',
                      name: 'grb',
                      inputValue: '5'
                  }, {
                    boxLabel: 'Stamen Toner',
                    name: 'grb',
                    inputValue: '6'
                }, {
                  boxLabel: 'Stamen Watercolor',
                  name: 'grb',
                  inputValue: '7'
              }

              ],
              listeners: {

                  change: function(field, newValue, oldValue) {


                      switch (newValue['grb']) {
                          case "1":
                              map.setBaseLayer(map.layers[0]);
                              break;
                          case "2":
                              map.setBaseLayer(map.layers[1]);
                              break;
                          case "3":
                              map.setBaseLayer(map.layers[2]);
                              break;
                          case "4":
                              map.setBaseLayer(map.layers[3]);
                              break;
                          case "5":
                              map.setBaseLayer(map.layers[4]);
                              break;
                          case "6":
                            map.setBaseLayer(map.layers[5]);
                            break;   
                          case "7":
                            map.setBaseLayer(map.layers[6]);
                            break;  


                      }

                  }

              } //end listener

          }

      ]
  });
    
   
    var mapCheckRadio = Ext.create('Ext.form.Panel', {
      //width: 435,
    	 width: 300,
      height: 250,
      layout: {
          type: 'hbox',
          align: 'stretch',
          autoScroll: true,
      },
      items: [


          mapRadioPanel1,
          mapRadioPanel2

      ]
  });
    
    var mapFormPanels = Ext.create('Ext.form.Panel', {
      //width: 435,
      width: 435,
      height: 200,
      bodyPadding: 5,
      margins: '5 5 5 5',
      layout: {
          type: 'hbox',
          align: 'stretch',
          autoScroll: true,
      },
      items: [
          mapCheckRadio,
          mapFormPanel
          
          //mapFormPanel2
      ]
  });
    
    
    updateAllocationSelector = function () {

  	    var map = me.map;
	      //var rg = mapFormPanel.down('radiogroup');
	      var rg = mapRadioPanel1.down('radiogroup');
	    
	      me.attr = rg.getValue().rb;
	      map.removeLayer();
	      map.refresh();
	      if (me.attr == '-888')
	      	{
//	      	   map.removeLayer();
//	      	   map.refresh();
	      	}
	      else
	      	{
//	  	 	  me.getWmsInfo(function() {
//	 	  	  me.setWmsLayer(function(){
	      	
		       me.attr = me.aluColumns[0].boxLabel; //first column ALU_2016	
		       me.loaduniqeColors(function(){        		      	
   		    	var jsonnew =me.uniqueColors;
  		    	var strjsonnew="";
  		    	for (var i1= 0; i1 < jsonnew.length; i1++)
  		    		{
  		    		  if (i1 < jsonnew.length-1)
  		    		  	{
  		    		  	    strjsonnew = strjsonnew + jsonnew[i1] + ",";
  		    		  	}
  		    		  else
  		    		  	{
  		    		  	    strjsonnew = strjsonnew + jsonnew[i1];
  		    		  	}
  		    		}
  		    	console.log("strjsonnew is: " + strjsonnew);
	      	
  		    	me.attr = rg.getValue().rb;
		        me.loaduniqeValues(function(){
			    	var json =me.uniqueValues;
			    	var strjson="";
			    	for (var i= 0; i < json.length; i++)
			    		{
//			    		  if (json[i] != ' ')
//			    		  {
			    		  if (i < json.length-1)
			    		  	{
			    		       strjson = strjson + json[i] + ",";
			    		  	}
			    		  else
			    		  	{
			    		  	    strjson = strjson + json[i] ;
			    		  	}
			    		  //}
			    		}
		
			    	 var suitabilityScoreRanges = {
		    		    featureFieldName: me.attr
		    		   
		    		   , choroplethRange: strjson
		    		  };
			    	   
		    		    //map.setSld(2, suitabilityScoreRanges, function(sldBody) {
		    		    	map.setSldnew(2, suitabilityScoreRanges,strjsonnew, function(sldBody) {
		    		       // update the legend here
		    		       var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(sldBody));
		    		       //mapFormPanel.down('panel').update(legendHtml);
	 	    		    		if (strjsonnew=="")
	    		    			{
	 	    		    			mapFormPanel.down('panel').update(legendHtml);
	     		    			}
		    		       
		    		    });
	    		       map.refresh();
			      
	    		        if (callback) { callback(); }
		           }); 
			       });
//		       });
	      	  }
 
    };
////////
    
    	 updateAllocationSelectorNew = function (nq,param, boxlabel, callback) {	

    		 console.log(nq);
    		 
	    var map = me.map;
      //var rg = mapFormPanel.down('checkboxgroup');
      //me.attr = rg.getValue().rb;

      if (boxlabel == 'none')
      	{

      	}
      else
      	{

      	
	       //me.attr = me.aluColumns[0].boxLabel; //first column ALU_2016	
	       me.attr = boxlabel; //
	       me.loaduniqeColors(nq,function(){        		      	
 		    	var jsonnew =me.uniqueColors;
		    	var strjsonnew="";
		    	for (var i1= 0; i1 < jsonnew.length; i1++)
		    		{
		    		  if (i1 < jsonnew.length-1)
		    		  	{
		    		  	    strjsonnew = strjsonnew + jsonnew[i1] + ",";
		    		  	}
		    		  else
		    		  	{
		    		  	    strjsonnew = strjsonnew + jsonnew[i1];
		    		  	}
		    		}
		    	console.log("strjsonnew is: " + strjsonnew); //unique colors 
      	
		    	//me.attr = rg.getValue().rb;
	        me.loaduniqeValues(function(){ //unique values in the table for a field; like "ALU_2015"
		    	var json =me.uniqueValues;
		    	var strjson="";
		    	for (var i= 0; i < json.length; i++)
		    		{
//		    		  if (json[i] != ' ')
//		    		  {
		    		  if (i < json.length-1)
		    		  	{
		    		       strjson = strjson + json[i] + ",";
		    		  	}
		    		  else
		    		  	{
		    		  	    strjson = strjson + json[i] ;
		    		  	}
		    		  //}
		    		}
	
		    	 var suitabilityScoreRanges = {
	    		    featureFieldName: me.attr
	    		   
	    		   , choroplethRange: strjson //unique values in the table for a field
	    		  };
		    	   
	    		    
	    		    	//map.setSldnew(2, suitabilityScoreRanges,strjsonnew, function(sldBody) {
		    	 
		    	       if (nq==0)
		    	      	{
		    	      	 var mciSld = "";
		    		    		map.addLayerMCEColorPlette0(param,suitabilityScoreRanges, strjsonnew,boxlabel,  function(mciSld) {
		    		    			
		    		    			console.log("mciSld in first year " +  mciSld);
				    		       // update the legend here
					    		       var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(mciSld));
					    		       //mapFormPanel.down('panel').update(legendHtml);
				 	    		    	
				 	    		    			mapFormPanel.down('panel').update(legendHtml);
		    		    		});
		    		    		
		    	      	} 
		    	       else
		    	       {	 
		    	      	   var mciSld = "";
		    	      	   console.log("unique values in the table for a field" +  me.attr + " is: " + strjson); //unique fields 
		    	      	   //strjsonnew : colors like: FWater@#b6f7fd
			    		    		map.addLayerMCEColorPlette(param,suitabilityScoreRanges, strjsonnew,boxlabel,  function(mciSld) {
			    		    			
			    		       // update the legend here
				    		       var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(mciSld));
				    		       //mapFormPanel.down('panel').update(legendHtml);
			 	    		    	if (nq == 0)	//if (strjsonnew=="")
		    		    			{
			 	    		    			mapFormPanel.down('panel').update(legendHtml);
		     		    			}
				    		       
				    		    	});
	    		    		
		    	         }
	    		    		//comment by ali
		    		    	//map.refresh();
		      
    		        if (callback) { callback(); }
	           }); 
		       });
//	       });
      	  }
      //if (callback) { callback(); }

  };    
    
 
  
	 OnOffAllocationSelectorNew = function (nq,param, boxlabel, callback) {	

		 console.log(nq);
		 
  var map = me.map;

  if (boxlabel == 'none')
  	{

  	}
  else
  	{
      if (nq == 0)
      {
      	  map.OnOffLayerProperty(param,boxlabel);
      }
      else
      {	
    	    map.OnOffLayerMCEColorPlette(param,boxlabel);
      }
		  if (callback) { callback(); }

  	}

};    
    
    
////////
    

    
    ///////////
    enumDistrictFieldSet.add(cmbSuitability);
    enumDistrictFieldSet.add(cmbDemand);
 	  enumDistrictFieldSet.add(cmbSpatial);
  	enumDistrictFieldSet.add(grid);
///////////
    Ext.define('Wif.mapPanel', {
      xtype: 'Wif.mapPanel',
      extend: 'Ext.panel.Panel',
      border: true,
      split: true,
      
      html: "<div id='map1-body' style='width:100%;hight:100%'></div>",
      region: 'center',
      width: '100%',
      height: 800,
      maximized: true,
      
      
      initComponent: function () {
        this.callParent(arguments);
      },
      afterFirstLayout : function () {
        this.callParent();
        //me.getWmsInfo(this.createMap());
        this.createMap();
      },
      createMap: function() {
	     var bbox = eval(me.project.bbox);
	     if (bbox.length == 1) {
	     bbox = bbox[0];
	     }

	      //me.serverURL = "http://localhost:7000/geoserver/";
        this.map = Ext.create('Wif.analysis.Map', {
          olMapId: this.body.dom.id
        //, wmsLayerName: me.wmsLayerName
        //, serverURL: me.serverURL
        , projectId: me.projectId
        //, scenarioId: "9170d7a410a0934424fef86231038cad"
        , srs: me.project.srs
        , bbox: bbox
        });
        me.map = this.map;
        //me.map.setWms(me.wmsLayerName, me.serverURL);
        
        console.log("CREATEMAP", this.map, me.map);
      },
      afterComponentLayout : function(w, h){
        this.callParent(arguments);
        this.redraw();
       },
      redraw: function(){
        // var map = this.map;
        //setTimeout( function() { map.updateSize();}, 200);
      }
    });

    
////////new function
savedata = function (callback) {    
	var landUseOrderMap=[];
	var json = { };
	var landUseOrderMapstr='{';
	var jsonStr='';
    var i = 0;
     store.each(function(record,idx){                   		
         i = i + 1;  
         var x= '\"' +record.get('_id') + '\"'; 
         var x1 =  ':' + i +',';
         landUseOrderMapstr = landUseOrderMapstr + x + x1;
         jsonStr = jsonStr + x + x1;
         //landUseOrderMap.push('\"' +record.get('_id') + '\"' + ':' + i);
     });      
     ;
     var res = landUseOrderMapstr.substring(0,landUseOrderMapstr.length-1)+'}';
     //var res1 = landUseOrderMap.substring(0,landUseOrderMap.length-2)+'}';
     json[0] = jsonStr.substring(0,landUseOrderMapstr.length-1);	
     landUseOrderMap.push(res.substring(2,res.length-1));
     
	
   me.scenarioPostData = {
      label: me.label
    , docType: "AllocationScenario"
    , projectId: me.projectId
    , suitabilityScenarioId: cmbSuitability.getValue()
    , demandScenarioId: ""
    , featureFieldName: me.label
    , manualdemandScenarioId: cmbDemand.getValue()
    //, landUseOrderMap : res
    , landUseOrderMap : JSON.parse(res)
    , controlScenarioId: cmbSpatial.getValue()
    , ready: false
    , manual: true
    }; 
   //me.remoteUpdate();
   if (callback) { callback(); }
};

    ////////////////////////////////
    var win = Ext.create( "Ext.window.Window", {
      title: 'Analysis - Allocation',
      closable: true,
      closeAction: 'hide',
      width: 900,
      height: 600,
      maximized: true, //new ali
      layout: 'border',
      plain: true,
      listeners:{
        close:function()
        {
        	 Ext.getCmp('map1').destroy();
        }
        
      },
      items:
        [infoPanel, {
          frame: false,
          border: false,
          region: 'center',
          xtype: 'tabpanel',
          width: '100%',
          height: '100%',
          defaults: {
            layout: 'fit'
          },
          layoutOnTabChange: true,
          layout: 'fit',
          listeners: {
           beforetabchange: function(panel, newCard, oldCard, eOpts) {
          	 if (cmbSuitability.getValue() == null || cmbDemand.getValue() == null)
        		 {
          		 //var newCardId = newCard.getItemId();
          		 Ext.Msg.show({
                 title: 'Incomplete',
                 msg: 'Please choose suitability and demand scenarios. ' ,
                 buttons: Ext.Msg.OK
                 });

                 return newCard.title != 'Map';
         
        		 }
           },
           tabchange: function (tabPanel, newCard, oldCard, eOpts ) {
          	 
             console.log('tab changed!');
          	 var newCardId = newCard.getItemId();
        	   if (newCardId == 'mapPanel') {
        	  	 var map = me.map;
        	 		if (!map) {
        	 		return;
        	 		}
        	 		//me.getWmsInfo(setWmsLayer);
        	 		
        	    savedata(function(){
        	     me.remoteUpdate(function() {
        	 	    me.getWmsInfo(function() {
        	 	  	 me.computeAnalysis(function(){
        		       me.setWmsLayer(function(){
//        		    	//getWmsLayers; if (callback) { callback(); }
//        		    //, choroplethRange: JSON.stringify('{1000,8000}')
//        		    	//me.computeAnalysis(function(){
//        		    	//var radiovalue=  Ext.getCmp('sluRadioGroup').items.get(0).getGroupValue();
//        		      	 
//        		       me.attr = me.aluColumns[0].boxLabel; //first column ALU_2016	
//        		       me.loaduniqeColors(function(){        		      	
// 	        		    	var jsonnew =me.uniqueColors;
//	        		    	var strjsonnew="";
//	        		    	for (var i1= 0; i1 < jsonnew.length; i1++)
//	        		    		{
//	        		    		  if (i1 < jsonnew.length-1)
//	        		    		  	{
//	        		    		  	    strjsonnew = strjsonnew + jsonnew[i1] + ",";
//	        		    		  	}
//	        		    		  else
//	        		    		  	{
//	        		    		  	    strjsonnew = strjsonnew + jsonnew[i1];
//	        		    		  	}
//	        		    		}
//        		      	 
//        		      	 console.log("strjsonnew is: " + strjsonnew);
//        		      	 
//        		      	 
//	        		      //var rg = mapFormPanel.down('radiogroup');
//	        		      //var rg = mapFormPanel.down('checkboxgroup');
//	        		      
//	        			     // mapFormPanel.down('checkboxgroup').items.items[0].getValue()
//	         		     me.attr = mapFormPanel.down('checkboxgroup').items.items[0].boxLabel;
//	        		      
//	        		      //me.attr = rg.getValue().rb;
//	        		      console.log("me.attr is: " + me.attr);
//	        		      //me.attr = "ALU_2015";
//	        		      me.loaduniqeValues(function(){
//	        		    	//var json='{1000,8000}';
//	        		    	var json =me.uniqueValues;
//	        		    	var strjson="";
//	        		    	for (var i= 0; i < json.length; i++)
//	        		    		{
//	        		    		  if (i < json.length-1)
//	        		    		  	{
//	        		    		       strjson = strjson + json[i] + ",";
//	        		    		  	}
//	        		    		  else
//	        		    		  	{
//	        		    		  	    strjson = strjson + json[i] ;
//	        		    		  	}
//	        		    		}
//
//	        		    	 var suitabilityScoreRanges = {
//	        	    		    featureFieldName: me.attr
//	        	    		   //,choroplethRange: "10000,5000"
//	        	    		   , choroplethRange: strjson
//	        	    		  };
//
//	     	    		          //commented below by ali for new checkbox version
//	        	    		    	//map.setSldnew(2, suitabilityScoreRanges,strjsonnew, function(sldBody) {
//	     	    		          me.map.addLayerMCEColorPlette(mapFormPanel.down('checkboxgroup').items.items[0].getValue(),suitabilityScoreRanges, strjsonnew,me.attr, function(mciSld) {	
//	     	    		          	
//	     	    		          	//console.log('mciSld in tabchange:' + mciSld);
//	        	    		    		
//	     	    		          	//commented line below by ali
//	        	    		    		//if (me.aluColumns[0].boxLabel == rg.getValue().rb)
//	        	    		    			if (me.aluColumns[0].boxLabel == mapFormPanel.down('checkboxgroup').items.items[0].boxLabel)
//	        	    		    			{
//	        	    		    			    //me.mysldBody = sldBody;
//	        	    		    			    me.mysldBody = mciSld;
//	        	    		    			}
//	        	    		       // update the legend here
//	        	    		    		
//	        	    		    		
//	        	    		    		if (strjsonnew!="")
//	        	    		    			{
//		        	    		    		
//	        	    		    			 //commented below by ali for new checkbox version
//		 	        	    		       // var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(me.mysldBody));
//		 	        	    		       var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(mciSld));
//		 	        	    		        mapFormPanel.down('panel').update(legendHtml);
//	        	    		    			}
//	        	    		    		else
//	        	    		    			{		
//	        	    		    		    //commented below by ali for new checkbox version
//		 	        	    		        //var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(sldBody));
//		 	        	    		       var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(mciSld));
//		 	        	    		        //var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s&legend_options=forceLabels:on" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(me.mysldBody));
//		 	        	    		        mapFormPanel.down('panel').update(legendHtml);
//	        	    		    			}
//
//	        	    		       
//		        	    		    });
//	        	    		      map.refresh();
//        	    		    if (callback) { callback(); }	
//        		        });        		    	
//        		       });
        		      	 
        		      	 //////new for loop 
               			for (var i = 0; i <3; i++)
              			{
             				
               				(function (i) {

               		      })(i);

              			}
               			
               			
               			var tweetRecursive = function (n) {
               	      if (n < me.aluColumns.length) {//
               	          // tweet function
               	      	                                   //mapFormPanel.down('checkboxgroup');
               	      	updateAllocationSelectorNew(n,true,mapRadioPanel1.down('checkboxgroup').items.items[n].boxLabel, function(e,r) {
               	              if (!e) {
               	                 tweetRecursive(n + 1);
               	               }
               	           });        
               	       }
               	    };

               	  //start the recursive function
               	  tweetRecursive(0);
               	  
                 
               	  me.map.addLayerProperty(me.aluColumns, me.project.suitabilityLus, me.wmsStyleName);
                	 	
        		      	 
        		      	 
        	        });
        	       });
        	      });
        	     });  
        	    }); 
        	   }//end if (newCardId == 'mapPanel') {
           }//end tabchanged
          },
          items:
          [
//            { xtype: 'panel',
//              itemId: 'convertibleLuPanel',
//              title: 'Information',
//              xtype: 'panel',
//              items: [enumDistrictFieldSet]
//            },
//            { xtype: 'panel',
//              itemId: 'mapPanel',
//              title: 'Map',
//              layout: 'border',
//              split: true,
//
//              items: [
//
////                mapCheckRadio,
////                mapFormPanel
//                mapFormPanels
//                
//               , 
//              
//                  { xtype: 'Wif.mapPanel',
//                   region: 'center'
//                  }
//                ]
//             }

           
            { 
            	xtype: 'panel',
              itemId: 'convertibleLuPanel',
              title: 'Information',
              xtype: 'panel',
              items: [enumDistrictFieldSet]
            },
            { 
	            xtype: 'panel',
	            itemId: 'mapPanel',
	            title: 'Map',
	            layout: 'border',
	            split: true,
	            items: [
	                    
//	                      {
//	                        region: 'north',
//	                        height: 45,
//	                        split: true,
//	                        items: [
//	                        ]
//	                    }
	                      , {
	                        region: 'west',
	                        autoScroll: true,
	                        border: true,
	                        width: '22%',
	                        //height : 200,
	                        items: [
	                        		mapCheckRadio,
														  mapFormPanel,
	
	                        ],
	
	                        split: true,
	                        resizable: false,
	                        bodyPadding: 13
	                    },
	                    {
	                        region: 'east',
	                        autoScroll: true,
	                        xtype: 'panel',
	                        width: '78%',
	                        items: [
	
	                            {
	                                xtype: 'Wif.mapPanel',
	                                width: '100%',
	                                //height: '100%',
	                                id: 'map1',
	                                html: "<div id='map1' style='width:100%'></div>",
	                                 region: 'center'
	                            }
	                        ],
	                        split: true,
	                        resizable: false,
	                        bodyPadding: 13
	                    }	                    
	                    

	                  ]
            
	            
                }
       



          ]
      }]
    });



    me.win = win;
    _.log(me, 'win.show', me);
   var component = win.show();
    _.log(me, 'win.show result', component);
    if (callback) { callback(); }
  }
 

,setWmsLayer :function (callback) {
 var me = this;
 
   //commented line below by ali for changing to checkboxes
   //me.map.setWms(me.wmsLayerName, me.serverURL);
    me.map.setWmsNew(me.wmsLayerName, me.serverURL);
  if (callback) { callback(); }
}

, getWmsInfo: function (callback) {

	  var me = this
	    , serviceParams = {
	        xdomain: "cors"
	      , url: Wif.endpoint + 'projects/' + this.projectId + '/allocationScenarios/' + this.scenarioId + '/wmsinfo'
	      , method: "get"
	      , params: null
	      , headers: {
	        "X-AURIN-USER-ID": Wif.userId
	        }
	      };
	
	  function serviceHandler(data, status) {
	    
	    _.log(me, 'getWmsInfo', data, this);
	    me.wmsLayerName = data.workspaceName + ':' + data.layerName;
	    me.wmsStyleName = data.layerName;

      me.serverURL = data.serverURL;
      //me.serverURL = me.serverURL.replace(/\/([A-z]+)\/$/, '/' + data.workspaceName + '/');
      me.serverURL = me.serverURL + data.workspaceName + '/';
	    if (callback) { callback(); }
	  }
	
	  Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
	}


, loadsuitabilityScenarios: function (callback) {
  var me = this;
  _.log(me, 'loading suitabilityScenarios', me);

    var serviceParams = {
        xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/suitabilityScenarios/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
   _.log(me, 'loaded suitabilityScenarios before', me);
    me.suitabilityScenarios = data;
    _.log(me, 'loaded suitabilityScenarios after', me.suitabilityScenarios);
    if (callback) { callback(); }
  }

   Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  
}

, loadallocationLUs: function (callback) {
	_.log(me, '333333');
  var me = this;
  _.log(me, 'loading allocationLUs', me);

  //
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
    _.log(me, 'loaded allocationLUs before', me);
    me.allocationLUs = data;
   
    _.log(me, 'loaded allocationLUs after', me.allocationLUs);
    //me.show();
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

}

, loadMainData: function (callback) {
	_.log(me, '44444');
  var me = this;
  _.log(me, 'loading allocationScenarios rows', me);

    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/allocationScenarios/' + me.scenarioId
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'loaded allocationScenarios data before', me);
    me.scenarioData = data;
    me.label = data.label;
    
    _.log(me, 'loaded allocationScenarios data after', me.scenarioData);
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

}

, loaddemandScenarios: function (callback) {
	_.log(me, '44444');
  var me = this;
  _.log(me, 'loading manualDemandScenarios rows', me);

    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/manualDemandScenarios/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'loaded manualdemandScenarios data before', me);
    me.demandScenarios = data;
   
    _.log(me, 'loaded manualdemandScenarios data after', me.demandScenarios);
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

},

 loaddemandScenariosnew: function (callback) {
	_.log(me, '44444');
  var me = this;
  _.log(me, 'loading DemandScenarios rows', me);

    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/demandScenarios/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'loaded demandScenarios data before', me);
    me.demandScenariosnew = data;
   
    _.log(me, 'loaded demandScenarios data after', me.demandScenarios);
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

},

 loadunionAttribs: function (callback) {
	_.log(me, '44444');
  var me = this;
  _.log(me, 'loading AllocationControlScenarios rows', me);

    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/AllocationControlScenarios/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'loaded AllocationControlScenarios data before', me);
    me.unionAttribs = data;
   
    _.log(me, 'loaded AllocationControlScenarios data after',  me.unionAttribs);
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

},

loadAluColumns: function (callback) {
	_.log(me, '44444');
  var me = this;
  _.log(me, 'loading ALU columns', me);

    var serviceParams = {
       xdomain: "cors"
      //, url: Wif.endpoint + 'projects/' + me.projectId + '/AllocationConfigs/setup/'
      , url: Wif.endpoint + 'projects/' + me.projectId + '/demand/setup/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'loading ALU columns data before', me);
    
    /*
      var obj = data.allocationColumnsMap;
      
      me.aluColumns=[];
      ar =[];
      for (var prop1 in obj) {
      	ar.push(prop1);
       }
      ar.sort();
    
      var i = 0;  
      for (var j = 0; j < ar.length; j++)
      {
       
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) { 
          // or if (Object.prototype.hasOwnProperty.call(obj,prop)) for safety...
          	if (prop == ar[j])
          		{
		          	if (i==0)
		          		{
		          		    sluSelection = {boxLabel: obj[prop], name: 'rb', inputValue: obj[prop], checked: true};
		          		}
		          	else
		          		{
		          		    sluSelection = {boxLabel: obj[prop], name: 'rb', inputValue: obj[prop]};
		          		}  
		          	  i = i + 1;
		          	  me.aluColumns.push(sluSelection);
          		}
            }
          }
      	}
      	*/

    me.aluColumns=[];
    var obj = data.projections;
    ar =[];
    for (var j = 0; j < obj.length; j++)
    {
    	 ar.push("ALU_"+obj[j].label);
    }
    ar.sort();
    
    var i = 0;
    for (var j = 0; j < ar.length; j++)
    {
      	if (i==0)
      		{
      		    sluSelection = {boxLabel: ar[j], name: 'rb', inputValue: ar[j], checked: true};
      		}
      	else
      		{
      		    sluSelection = {boxLabel: ar[j], name: 'rb', inputValue: ar[j], checked: true};
      		}  
      	  i = i + 1;
      	  me.aluColumns.push(sluSelection);

     }

    
    
    sluSelectionNone = {boxLabel: "none", name: 'rb', inputValue: -888};
    //me.aluColumns.push(sluSelectionNone);
    //me.aluColumns.sort();
    _.log(me, 'loaded unionAttributes data after',  me.aluColumns);
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

}


, launch: function () {
  var me = this;

  me.project = Ext.create('Wif.Project', {
    projectId: me.projectId
  });

  function newScenario () {
  	_.log(me, 'newScenario');
    me.show();
    //me.show(function() { me.updateMapStyle();  if (callback) { callback(); } });
  };

  function existingScenario (callback) {
  	
    me.prepareScenario();
    me.prepareStore();
    me.show();      

  };

  me.project.load(function () {
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
  });

}//end lunch

, computeAnalysis: function (callback) {

  var me = this;
  if (me.dirty == true){ 
	  var serviceParams = {
	        xdomain: "cors"
	      , url: Wif.endpoint + 'projects/' + me.projectId + '/allocationScenarios/' + me.scenarioId + '/asyncOutcome'
	      , method: "post"
	      //, params: analysisParam
	      , headers: {
	        "X-AURIN-USER-ID": Wif.userId
	        }
	      };
	
	  me.win.setLoading('Please wait for the analysis to complete ...');
	  
	  function serviceHandler(data, status) {
	    _.log(me, 'analysis result in wms', 'xxx');
	
	//    me.analysisPresent = true;
	//    me.analysisInSync = true;
	//    me.analysisBroken = false;
	
	    me.wmsdata="";
	    me.waitingForWms(function () {
	      _.log(me, 'finish waiting for wms');
	      me.win.setLoading(false);
	      if (me.wmsdata == 'success') {
	      	me.dirty = false;
	        if (callback) { callback(); }
	      }  
	    });
	   
	//    me.win.setLoading(false);
	//    if (callback) { callback(); }
	  }
	
	  function analyse () {
	    _.log(me, 'start analysis');
	    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
	  }
	  
		
	  analyse();
	}
  else //if dirty
	{
	    if (callback) { callback(); }
	}
  //me.remoteUpdate(analyse);
}

, waitingForWms: function (callback) {
  var me = this
    , serviceParams = {
        xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + this.projectId + '/allocationScenarios/' + this.scenarioId + '/status'
      , method: "get"
      , params: null
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      }
    , checkCount = 0;

  function serviceHandler(data) {
  		console.log('WAITINGFORWMS', data);
  		//checkcount was 50
      if (!data || !data.status || data.status === 'failed' || checkCount > 150) {
          _.log(me, 'wms failed', me);
          //me.updateAnalysisState('erroneous');
          me.win.setLoading(false);
          var reason = 'I have no idea.';
          if (!data || !data.status) {
           reason = 'The server did not report the status of the operation.';
          } else if (data.status === 'failed') {
           reason = 'Creating map layer failed.';
          } else if (checkCount > 150) {
           reason = 'The operation timed out.';
          }
		     Ext.Msg.show({
		     title: 'Failed',
		     msg: 'No map information was generated. The reason is: ' + reason,
		     buttons: Ext.Msg.OK
       });
          return;
    }
    checkCount++;
    if (data.status === 'running') {
      setTimeout(polling, 15000);
      me.wmsdata = 'running';
      return;
    } else if (data.status === 'success') {
    	//return;
      me.wmsdata = 'success'; 
    	if (callback) { callback(); }
       // me.getWmsInfo(callback);
    } 
    //newali
    else 
    {
    	 Ext.Msg.show({
		     title: 'Warning',
		     msg: data.status,
		     buttons: Ext.Msg.OK
       });
	    me.wmsdata = 'success'; 
	  	if (callback) { callback(); }
     }

    //me.updateAnalysisState(data.status);
  }

  me.win.setLoading('Please wait for analysis to complete ...');

  function polling(callback) {
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    
  }

  //was 3000
  //polling(function(){return;});
  setTimeout(polling, 3000);
  
},

loaduniqeValues: function (callback) {
	_.log(me, '77777');
  var me = this;
  _.log(me, 'loading uniqueValues ', me);

    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/unionAttributes/'  + me.attr + '/values'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'loaded uniqueValues data before', me);
    me.uniqueValues = data;
   
    _.log(me, 'loaded uniqueValues data after',  me.uniqueValues);
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

},

loaduniqeColors: function (nq,callback) {
	
	if (nq ==0)
	{	
			_.log(me, '77777');
		  var me = this;
		  _.log(me, 'loading uniqueColors ', me);
		
		    var serviceParams = {
		       xdomain: "cors"
		      , url: Wif.endpoint + 'projects/' + me.projectId + '/unionAttributes/'  + me.attr + '/colors'
		      , method: "get"
		      , headers: {
		        "X-AURIN-USER-ID": Wif.userId
		        }
		      };
		
		
		
		  function serviceHandler(data, status) {
		    _.log(me, 'loaded uniqueColors data before', me);
		    me.uniqueColors = data;
		   
		    _.log(me, 'loaded uniqueColors data after',  me.uniqueColors);
		   if (callback) { callback(); }
		  }
		
		    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
	}
	else
	{
		if (callback) { callback(); }
	}	

}

//@RequestMapping(method = RequestMethod.GET, value = "/{id}/unionAttributes/{attr}/values", produces = "application/json")

,downloadReport: function() {

	var me = this;
	      var projectId = me.projectId;
	      var scenarioId = me.scenarioId;
	      var url = Wif.endpoint + 'projects/' + projectId
	      + '/allocationScenarios/' + scenarioId + '/html';
	    	//window.location.href = url
	    	
	    	//window.open(url,'_blank');
	    	window.open(Aura.getDispatcher + 'url=' + url);

	  },
	  
ReportPDF: function() {
	  var me = this;
	       var projectId = me.projectId;
	       var scenarioId = me.scenarioId;
	       var url = Wif.endpoint + 'projects/' + projectId
	       + '/allocationScenarios/' + scenarioId + '/pdfnew';
	 
	     	//window.open(url,'_blank');
	      window.open(Aura.getDispatcher + 'url=' + url);
	   },
	   
ReportXLS: function() {
	  var me = this;
	       var projectId = me.projectId;
	       var scenarioId = me.scenarioId;
	       var url = Wif.endpoint + 'projects/' + projectId
	       + '/allocationScenarios/' + scenarioId + '/xlsnew';
	       
	       console.log('Download xls path is: ' + Aura.getDispatcher + 'url=' + url);
	 
	     	//window.open(url,'_blank');
	      window.open(Aura.getDispatcher + 'url=' + url);
	   },

  
});

