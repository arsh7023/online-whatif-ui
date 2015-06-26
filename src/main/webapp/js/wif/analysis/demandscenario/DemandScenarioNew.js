Ext.define('Wif.analysis.demandscenario.DemandScenarioNew', {
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
, empRows :{}
, frameData : ''

////////new    


, constructor: function (config) {
    Ext.QuickTips.init();
    Ext.override(Ext.data.AbstractStore, {
      indexOf: Ext.emptyFn
    });
    Ext.apply(this, config);

  }
,


 remoteAdd: function (callback) {

    var me = this;
    _.log(me, 'about to remoteAdd', callback);
    //me.scenarioPostDataBuild();
    Ext.Msg.show({
        title: 'Creating ...',
        msg: 'Creating demand Scenario',
        icon: Ext.Msg.INFO
      });
    
    
     me.scenarioPostData = {
        label: me.label
      , docType: "DemandScenario"
      , projectId: me.projectId
      , featureFieldName : me.label
      , demandInfos : []
      , localDatas : []
      , demographicTrendLabel : ""
      };
    

    //"/{projectId}/manualDemandScenarios
    var remoteObject = Ext.create('Wif.RESTObject',
      { urlBase: Wif.endpoint + 'projects/' + me.projectId + '/demandScenarios/'
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
            Ext.Msg.alert('Error', 'Could not create a demand scenario');
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
        , url: Wif.endpoint + 'projects/' + me.projectId + '/demandScenarios/' + me.scenarioId
        , method: "put"
        , params: me.scenarioPostData
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

    Ext.Msg.show({
      title: 'Loading ...',
      msg: 'Updating  Demand Scenario',
      icon: Ext.Msg.INFO
    });

    function serviceHandler(data, status) {
      Ext.Msg.hide();
      _.log(me, 'demand scenario updated', data);
      if (callback) { callback(); }
    }

    _.log(me, "Updating demand scenario", serviceParams.url, me.scenarioPostData);
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
	    		//me.loadEmployment( function () {
	    			me.loadMainData(function () {
	    		   if (callback) { callback(); }	
	    	  });
	      });
	     //});
     });
    });
    
  }

, fillassoCombo :  function (callback) {
	var me = this;

  me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + me.projectId + '/allocationLUsSuitabilityAssociated/';
  me.assocLuCbox.load();
  if (callback) { callback(); }
}


, prepareReadyScenario: function (callback) {
	_.log(me, '666666');
    var me = this
      , project = me.project;
    _.log(me, 'prepareReadyScenario', project);


    ///////////////////////////////
    

  //me.assocLuCbox.load(me.projectId);
    
  me.loadColumns(function() {
  	me.loadRows( function () {
  		//me.loadEmployment( function () {
  			me.loadMainData(function () {
  		   if (callback) { callback(); }	
  	  });
     //});
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
		    
		//    me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + me.projectId + '/allocationLUsSuitabilityAssociated/';
		//    me.assocLuCbox.load();
		    
		    var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
		    	clicksToEdit: 1
		  });
		    var cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
		      clicksToEdit : 1
		    });
		    
		   /////////////////////////////////////////////////////////////
		    ////employment sectors
		    
		    this.gridfields4 = [];
		   	var modelfields4 = [];
		   	this.comboDataNew4 =[];
		   	this.storeDataNew4 = [];
		   	modelfields4.push("sectorLabel");
		   	modelfields4.push("currentDensity");
		  	modelfields4.push("futureDensity");
		  	modelfields4.push("infillRate");
		  	
			  var empfield1 = {
					  text : "sectorLabel",
					  dataIndex : "sectorLabel",
					  type: 'string'
				   };
			  this.gridfields4.push(empfield1);
			  var empfield2 = {
					  text : "Current Density",
					  dataIndex : "currentDensity",
					  editor: 'numberfield',
					  tooltip : 'Ignition On',
					  //tooltip : 'Delete',
					  flex: 2,
					  type: 'number'
					  ,hidden: true	
				   };
			  this.gridfields4.push(empfield2);
			  var empfield3 = {
					  text : "Future Density",
					  dataIndex : "futureDensity",
					  editor: 'numberfield',
					  flex: 2,
					  type: 'number'
					  ,hidden: true
				   };
			  this.gridfields4.push(empfield3);
			  var empfield4 = {
					  text : "Infill Rate(0-1)",
					  dataIndex : "infillRate",
					  editor: 'numberfield',
					  flex: 2,
					  type: 'number'
		        ,renderer: function(value, meta, record) {
			          var element = record.get('infillRate');
			          meta.tdAttr = 'data-qtip="' + _.encodeHTML('Infill Rate') + '"';
			          return element;
			        }
				   };
			  this.gridfields4.push(empfield4);
			  
		
		   this.model4 = Ext.define('User', {
		    extend: 'Ext.data.Model',
		    fields: modelfields4    
		   });
		   
		   var emprows = me.scenarioColumns;
		   
		   
			 for (var l = 0; l < emprows.sectors.count(); l++)
		  { 	  		
		        var lbl = emprows.sectors[l].label;  		
		              
		  	    var str= '{' + '\"' + 'sectorLabel' + '\"' + ':'  + '\"' + lbl + '\"}'; 			    	
				    //this.storeDataNew4.push(JSON.parse(str));
				    var datafield = {
			          "sectorLabel" : lbl,
			          "currentDensity" : 0,
			          "futureDensity" : 0,
			          "infillRate" : 0
			        };
				    this.storeDataNew4.push(datafield);
					    	
		  }
		 
			 
		  var store4 = Ext.create('Ext.data.Store', {
		  	model: this.model4,
		  	data : this.storeDataNew4
		  });
		 
		  var empMainrows = me.scenarioData;  
		  store4.each(function(record,idx){    
			   val = record.get('sectorLabel');
				 for (var l = 0; l < empMainrows.demandInfos.count(); l++)
				 { 	  			 
						if ( empMainrows.demandInfos[l]["@class"] == ".EmploymentDemandInfo")
						{	 
							 if (empMainrows.demandInfos[l].sectorLabel == val)
								 {
								      record.set("currentDensity", empMainrows.demandInfos[l].currentDensity);
								      record.set("futureDensity", empMainrows.demandInfos[l].futureDensity);
								      record.set("infillRate", empMainrows.demandInfos[l].infillRate);
								      record.commit();
								      
								 }
						}
				 }
		  }); 
		  
			  var grid4 = Ext.create('Ext.grid.Panel', {
				title: 'Employment Sectors',
			  selType: 'cellmodel',
			  border : 0,
			  margin : '0 5 5 5',
			  store : store4,
			  height : 400,
			  autoRender : true,
			  columns : this.gridfields4,
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
		  
		 
			 ///////////////////////////////////////////////
			  
			   /////////////////////////////////////////////////////////////
		    ////claudia new landuse 
		    
		    this.gridfields5= [];
		   	var modelfields5 = [];
		   	this.comboDataNew5 =[];
		   	this.storeDataNew5 = [];
		   	modelfields5.push("landuseID");
		   	modelfields5.push("landuseName");
		   	modelfields5.push("currentDensity");
		  	modelfields5.push("futureDensity");
		  	modelfields5.push("infillRate");
		  	
		  	 var empfield05 = {
						  text : "ID",
						  dataIndex : "landuseID",
						  editor: 'numberfield',
						  tooltip : 'Ignition On',
						  //tooltip : 'Delete',
						  flex: 2,
						  type: 'number'
						  ,hidden: true	
					   };
		  	this.gridfields5.push(empfield05);
		  	
			  var empfield15 = {
					  text : "landuse Name",
					  dataIndex : "landuseName",
					  type: 'string'
				   };
			  this.gridfields5.push(empfield15);
			  var empfield25 = {
					  text : "Current Density",
					  dataIndex : "currentDensity",
					  //editor: 'numberfield',
					  tooltip : 'Ignition On',
					  //tooltip : 'Delete',
					  flex: 2,
					  type: 'number'		
					  //,disabled: true	
				   };
			  this.gridfields5.push(empfield25);
			  var empfield35 = {
					  text : "Future Density",
					  dataIndex : "futureDensity",
					  editor: 'numberfield',
					  flex: 2,
					  type: 'number'
				   };
			  this.gridfields5.push(empfield35);
			  var empfield45 = {
					  text : "Infill Rate(0-1)",
					  dataIndex : "infillRate",
					  editor: 'numberfield',
					  hidden: true,
					  flex: 2,
					  type: 'number'
		        ,renderer: function(value, meta, record) {
			          var element = record.get('infillRate');
			          meta.tdAttr = 'data-qtip="' + _.encodeHTML('Infill Rate') + '"';
			          return element;
			        }
				   };
			  this.gridfields5.push(empfield45);
			  
		
		   this.model5 = Ext.define('User', {
		    extend: 'Ext.data.Model',
		    fields: modelfields5    
		   });
		   
		   var emprows = me.scenarioColumns;
		   
			 for (var l = 0; l < emprows.densityDemandInfo.count(); l++)
			  { 	  		
			        var lbl = emprows.densityDemandInfo[l].landuseName;  		
			              
			  	    var str= '{' + '\"' + 'landuseName' + '\"' + ':'  + '\"' + lbl + '\"}'; 			    	
					    //this.storeDataNew4.push(JSON.parse(str));
					    var datafield56 = {
					    		"landuseID" : emprows.densityDemandInfo[l].landuseID,
				          "landuseName" : lbl,
				          "currentDensity" : emprows.densityDemandInfo[l].currentDensity,
				          "futureDensity" : emprows.densityDemandInfo[l].futureDensity,
				          "infillRate" : emprows.densityDemandInfo[l].infillRate
				        };
					    this.storeDataNew5.push(datafield56);
						    	
			  }	 
			
		
		  var store5 = Ext.create('Ext.data.Store', {
		  	model: this.model5,
		  	data : this.storeDataNew5
		  });
		 
		  var empMainrows = me.scenarioData;  
		  store5.each(function(record,idx){    
			   val = record.get('landuseName');
				 for (var l = 0; l < empMainrows.densityDemandInfo.count(); l++)
				 { 	  			 
						
							 if (empMainrows.densityDemandInfo[l].landuseName == val)
								 {
								      record.set("currentDensity", empMainrows.densityDemandInfo[l].currentDensity);
								      record.set("futureDensity", empMainrows.densityDemandInfo[l].futureDensity);
								      record.set("infillRate", empMainrows.densityDemandInfo[l].infillRate);
								      record.commit();
								      
								 }
						
				 }
		  }); 
		  
			  this.grid5 = Ext.create('Ext.grid.Panel', {
				title: 'LandUse Density',
				itemId : 'grid5',
			  selType: 'cellmodel',
			  border : 0,
			  margin : '0 5 5 5',
			  store : store5,
			  height : 400,
			  autoRender : true,
			  columns : this.gridfields5,
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
			  
		
			  
			  
			/////////////////////////////////////////////////  
			  
			  
		  
		  
		  ///????//this.grid.getSelectionModel().deselectAll();
		 	//this.store.loadData(me.storeDataNew);	
		  //me.storeDataNew.push(JSON.parse(str));
		 	//this.store.loadData(JSON.parse(str));		 
			 //this.grid.reconfigure(this.store, me.gridfields);
		  
		    
		    ////////////////////////////////////////////////////////////
		    //////Land Use 
		    this.gridfields3 = [];
		   	var modelfields3 = [];
		   	this.comboDataNew3 =[];
		   	this.storeDataNew3 = [];
		   	modelfields3.push("associatedALUs");
		   	modelfields3.push("futureBreakdownByHType");
		  	modelfields3.push("currentDensity");
		  	modelfields3.push("futureDensity");
		  	modelfields3.push("futureVacancyRate");
		  	modelfields3.push("infillRate");
		
		    
		  var gfield0 = {
		   		xtype: 'gridcolumn',
		       text : "Land Use",
		       width: 50,
		       flex : 2,
		       dataIndex : "associatedALUs",
		       editor: this.assocLuCbox
		     };
		    this.gridfields3.push(gfield0);
		    
			  var field00 = {
					  text : "Future Breakdown by Household Type",
					  dataIndex : "futureBreakdownByHType",
					  editor: 'numberfield',
					  flex: 4,
					  type: 'number'
				   };
				  this.gridfields3.push(field00);    
		  	
			  var field1 = {
				  text : "Current Density",
				  dataIndex : "currentDensity",
				  editor: 'numberfield',
				  flex: 2,
				  type: 'number'
			   };
			  this.gridfields3.push(field1);
				 
			  var field2 = {
					  text : "Future Density",
					  dataIndex : "futureDensity",
					  editor: 'numberfield',
					  flex: 2,
					  type: 'number'
				   };
			  this.gridfields3.push(field2);
					 
			  var field3 = {
					  text : "Future Vacancy Rate(0-1)",
					  dataIndex : "futureVacancyRate",
					  editor: 'numberfield',
					  flex: 3,
					  type: 'number'
				   };
			  this.gridfields3.push(field3);				 
		  
			  var field4 = {
					  text : "Infill Rate(0-1)",
					  dataIndex : "infillRate",
					  editor: 'numberfield',
					  flex: 2,
					  type: 'number'
				   };
			  this.gridfields3.push(field4);		
		 
		    var delColumns3 = 
		         {
		           xtype : 'actioncolumn',
		           width : 26,
		           header: '',
		           flex : 1,
		           sortable : false,
		           items : [{
		             iconCls : 'wif-grid-row-delete',
		             tooltip : 'Delete',
		             handler : function(grid, rowIndex, colIndex) {
		               grid.store.removeAt(rowIndex);
		             }
		           }]
		         };
		    
		    this.gridfields3.push(delColumns3);
		    
		    this.combostore3 = Ext.create('Ext.data.Store', {
		      fields : ["label"],
		      data: this.comboDataNew3
		   });
		 
		    
		      
		      this.model3 = Ext.define('User', {
		        extend: 'Ext.data.Model',
		        fields: modelfields3    
		       });
		      
		      //for land use
		
		      var mainrows = me.scenarioData;
		     
		    	 for (var l = 0; l < mainrows.demandInfos.count(); l++)
		      { 	  		
		    		 
		    		 if ( mainrows.demandInfos[l]["@class"] == ".ResidentialDemandInfo")
		    		{	 
		            var id = mainrows.demandInfos[l].allocationLUId;  		
		            
		            var lbl="";
		            me.assocLuCbox.store.each(function(record,idx){  	            
		             x= record.get("_id");
		              if (x == id){
		          	    lbl = record.get("label");
		             }	
		             });
		            
		            
			    	    var str= '{' + '\"' + 'associatedALUs' + '\"' + ':'  + '\"' + lbl + '\"';
		    		     	        
		      		   str= str + ',\"futureBreakdownByHType\"' + ':' + '\"' + mainrows.demandInfos[l].futureBreakdownByHType + '\"';
		      		   str= str + ',\"currentDensity\"' + ':' + '\"' + mainrows.demandInfos[l].currentDensity + '\"';
		      		   str= str + ',\"futureDensity\"' + ':' + '\"' + mainrows.demandInfos[l].futureDensity + '\"';
		      		   str= str + ',\"futureVacancyRate\"' + ':' + '\"' + mainrows.demandInfos[l].futureVacancyRate + '\"';
		      		   str= str + ',\"infillRate\"' + ':' + '\"' + mainrows.demandInfos[l].infillRate + '\"';
			    			    	
		  			    str = str + '}';
		  			    this.storeDataNew3.push(JSON.parse(str));
		    		} 
		    			    	
		      }
		     
		      
		      var store3 = Ext.create('Ext.data.Store', {
		      	model: this.model3,
		      	data : this.storeDataNew3
		      });
		
		
		    
		     var grid3 =  Ext.create('Ext.grid.Panel', {
		        store: store3,
		        //selType: 'cellmodel',
		        columnLines: true,
		        title: 'Land Use',
		        columns : this.gridfields3,
		        height: 600,
		        width: 1000,
		        flex: 2,
		       
		         dockedItems: [{
		           xtype: 'toolbar',
		           items: [{
		               text:'Add New Item',
		               tooltip:'Add a new row',
		  	           handler : function() {
		  	          	
		                 var grid = this.findParentByType('grid');
		                 var store = grid.getStore();
		                 var gridCount = store.getCount();
		  	             var datafield = {
		  	                 "associatedALUs" : []
		  	 	 		        };
		  	          	 store.insert(gridCount,datafield);
		  	          	 cellEditor.startEdit(gridCount, 0);
		
		  	         }
		           }],
		         }],
		        plugins: [cellEditor]
		
		    });
		    
		     var demandStore = Ext.create('Ext.data.Store', {
		     	fields: ['_id','label'],
		       data : me.scenarioColumns.demographicTrends
		     });
		     
		     var cmbDemand=Ext.create('Ext.form.field.ComboBox', {
		 	    extend : 'Aura.Util.RemoteComboBox',
		      fieldLabel: 'Choose Demographic Trend',
		      //width: 500,
		      labelWidth: 200,
		      store: demandStore,
		      data : me.scenarioColumns.demographicTrends,
		      //queryMode: 'local',
		      displayField: 'label',
		      valueField: 'label',        
		      autoLoad : false,
		      multiSelect : false,
		      forceSelection: true,
		      projectId : null,
		      editable : true,
		      allowBlank : false,
		      emptyText : "Choose Demographic Trend",
		      //renderTo: Ext.getBody()
		      listeners: { 
		        select: function() {
		           me.dirty = true;
		        }
		      }
		   });
		     
		     cmbDemand.setValue(mainrows.demographicTrendLabel); 
		     
		     
		    ///////////////////////////////////////////////////////////
		
		     
		    /////////////////////////////////////
		    var btn = Ext.create( "Ext.Button", {
		      //xtype: 'button',
		      style: { float: 'right' },
		    	//renderTo: Ext.getBody(),
		      text: 'Save',
		      handler: function () {      
		      	
		        var demandInfos =[];
		        var demographicTrendLabel = "";
		      	
		
		           //saving land use           
		           store3.each(function(record,idx){    
		          	   val = record.get('associatedALUs');
			             var id=null;
			              me.assocLuCbox.store.each(function(record,idx){  	            
			               x= record.get("label");
			                if (x == val){
			            	    id = record.get("_id");
			               }	
			             });
		             
		              var ar =  {
		                "@class": ".ResidentialDemandInfo",
		                "allocationLUId": id,
		                "futureBreakdownByHType": record.get('futureBreakdownByHType'),
		                "currentDensity": record.get('currentDensity'),
		                "futureDensity": record.get('futureDensity'),
		                "futureVacancyRate": record.get('futureVacancyRate'),
		                "infillRate": record.get('infillRate'),
		                "residentialLUId": id
		                };
		              
		               demandInfos.push(ar);	 
		           });     
		           //end land use
		           
		           //saving Employment          
		           store4.each(function(record,idx){   
		              var ar =  {
		                "@class": ".EmploymentDemandInfo",
		                "sectorLabel": record.get('sectorLabel'),
		                "currentDensity": record.get('currentDensity'),
		                "futureDensity": record.get('futureDensity'),
		                "infillRate": record.get('infillRate'),
		                };              
		               demandInfos.push(ar);	 
		           });     
		           //end Employment 
		           
		           var densityDemandInfo=[];
		           //saving landuse density          
		           store5.each(function(record,idx){   
		              var ar =  {
		              	"landuseID": record.get('landuseID'),
		                "landuseName": record.get('landuseName'),
		                "currentDensity": record.get('currentDensity'),
		                "futureDensity": record.get('futureDensity'),
		                "infillRate": record.get('infillRate'),
		                };              
		              densityDemandInfo.push(ar);	 
		           });     
		           //end Employment 
		           
		
		         me.scenarioPostData = {
		            label: me.label
		          , docType: "DemandScenario"
		          , projectId: me.projectId
		          , demandInfos : demandInfos 
		          , localDatas : []
		          , demographicTrendLabel : cmbDemand.getValue()
		          , densityDemandInfo : densityDemandInfo
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
		        value: '<b>Demand Scenario</b>',
		      }, btn]
		    });
		    //////////////////
		    
		
		    ////////////////////////////////
    
		    var enumDistrictFieldSet = Ext.create('Ext.form.FieldSet', {
		      columnWidth : 0.5,
		      title : 'Define Demand Scenario Information',
		      collapsible : true,
		      margin : '15 5 5 0',
		      defaults : {
		        bodyPadding : 10,
		        anchor : '90%'
		      }
		    });
		    
		    enumDistrictFieldSet.add(cmbDemand);
		//    enumDistrictFieldSet.add(grid1);
		    
		    //var frameURL = 'http://localhost:8080/aurin-wif/projects/176bf47f1c37cd08814663e76b00843e/suitabilityScenarios/176bf47f1c37cd08814663e76b00c8ec/html';
		    //var frameURL =  Wif.endpoint + 'projects/' + me.projectId + '/demandScenarios/' + me.scenarioId + '/htmlOutcome';
		    
		    var myurl = Wif.endpoint + 'projects/' + me.projectId + '/demandScenarios/' + me.scenarioId + '/htmlOutcome';
		     
		    var frameURL = Aura.getDispatcher + 'url=' + myurl;
		    
		
		    if (typeof (Ext.getCmp('iframe-win')) != 'undefined') 
		    	{
		    Ext.getCmp('iframe-win').destroy();
		    	}
		    
		    //var win = Ext.create('Ext.tab.Panel', {
		    var win = Ext.create( "Ext.window.Window", {
		      title: 'Analysis - Demand',
		      closable: true,
		      closeAction: 'hide',
		      width: 900,
		      height: 600,
		      layout: 'border',
		      plain: true,
		      items:
		        [infoPanel, {
		          frame: false,
		          border: false,
		          region: 'center',
		          xtype: 'tabpanel',
		          defaults: {
		            layout: 'fit'
		          },
		          layoutOnTabChange: true,
		          layout: 'fit',
		          listeners: {
		           beforetabchange: function(panel, newCard, oldCard, eOpts) {
		          	 var newCardId = newCard.getItemId();
		          	 if (newCardId == 'reportPanel') {
		  		
		          		   
		          			 //Ext.getDom('iframe-win').src = frameURL;
		          			 
		          			// Ext.getDom('iframe-win').src = frameURL;
		          			// Ext.getDom('iframe-win').html =  Ext.getDom('iframe-win').src;
		          		 //_.log(me, 'iframe-win', Ext.getDom('iframe-win').src);
		          			// Ext.getDom('iframe-win').innerHTML = Ext.getDom('iframe-win').src;
		          			 //Ext.getDom('iframe-win').innerHTML =  this.items.get(3).el.getHTML();
		          			 //Ext.getDom('iframe-win').srcdoc =  this.items.get(3).el.getHTML();
		          			 
		         	 		}
		           },
		           tabchange: function (tabPanel, newCard, oldCard, eOpts ) {
		            
		          	 var newCardId = newCard.getItemId();
		          	 if (newCardId == 'reportPanel') {
		  		
		          		   
		          			 Ext.getDom('iframe-win').src = frameURL;
		          			 
		          			 Ext.getDom('iframe-win').src = frameURL;
		          			// Ext.getDom('iframe-win').html =  Ext.getDom('iframe-win').src;
		          		 _.log(me, 'iframe-win', Ext.getDom('iframe-win').src);
		          			 //Ext.getDom('iframe-win').innerHTML = Ext.getDom('iframe-win').src;
		          			 //Ext.getDom('iframe-win').innerHTML =  this.items.get(3).el.getHTML();
		          			 //Ext.getDom('iframe-win').srcdoc =  this.items.get(3).el.getHTML();
		          		 
		         	    me.loadColumnsNew(function() {
		         	    	Ext.getDom('iframe-win').srcdoc = me.frameData;
		        	    		   if (callback) { callback(); }	
		        	      });
		          		 
		          		 
		          			 
		          			 //Ext.getDom('iframe-win').innerHTML = document.getElementById('iframe-win').contentDocument.body.innerHTML;
		          			 var x = 0;
		         	 		}
		          	
		        	  
		           }
		//           ,afterrender: function(panel, newCard, oldCard, eOpts) {
		//          	 //var newCardId = newCard.getItemId();
		//          	 //if (newCardId == 'reportPanel') {
		//          	 Ext.getDom('iframe-win').innerHTML =  this.items.get(3).el.getHTML();
		//          	// }
		//           },
		          
		          },
		          items: [
		            { xtype: 'panel',
		              itemId: 'convertibleLuPanel',
		              title: 'Information',
		              xtype: 'panel',
		              items: [enumDistrictFieldSet]
		            },
		           { xtype: 'panel',
		              itemId: 'luPanel',
		              title: 'Land Use',
		              xtype: 'panel',
		              items: [grid3]
		            },
		            { xtype: 'panel',
		              itemId: 'empPanel',
		              title: 'Employment',
		              xtype: 'panel',
		              items: [grid4]
		            },
		            { xtype: 'panel',
		              itemId: 'desityPanel',
		              title: 'Density',
		              xtype: 'panel',
		              items: [this.grid5]
		            },
		            { xtype: 'panel',
		              itemId: 'reportPanel',
		              title: 'Report',
		              xtype: 'panel',
		              items: [
		//		             {
		//		              html: '<div style="width:100%;height:100%;overflow:scroll;-webkit-overflow-scrolling:touch;"><iframe style="width:100%;height:100%;" src="'+frameURL+'" onload="(function(){Ext.getCmp(\'thenavview\').setMasked(false);})()">Your device does not support iframes.</iframe></div>'
		//		             }
		
		//{id: 'total', xtype: 'box', autoEl: {html:frameURL,width:90} }
		                   //me.cmpFrame
		                  // me.myIFrame
		
		//										{
		//			                id: 'theFrame',
		//			                title: 'Project',
		//			                tabTip: 'Describe your launch project',
		//			                xtype: 'IFrame',
		//			                closable: false,
		//			                titleCollapse:true,
		//                   }
		
		
					{
					        xtype : "component",
					        id    : 'iframe-win' , // Add id
					        autoEl : {
					            tag : "iframe",
					            //src : frameURL
					            //src : frameURL
					            src : frameURL
					        }
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
  }//show
 
, loadColumns: function (callback) {
  var me = this;
  _.log(me, 'loading columns', me);

    var serviceParams = {
        xdomain: "cors"
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

, loadColumnsNew: function (callback) {
  var me = this;
  _.log(me, 'loading columns', me);

//    var serviceParams = {
//        xdomain: "cors"
//      , url: Wif.endpoint + 'projects/' + me.projectId + '/demandScenarios/' + me.scenarioId + '/htmlOutcome'
//      , method: "get"
//      , headers: {
//        "X-AURIN-USER-ID": Wif.userId
//        }
//      };
//
//
//  function serviceHandler(data, status) {
//   _.log(me, 'loaded columns before', me);
//    me.frameData = data;
//    _.log(me, 'loaded columns after', me.scenarioColumns.projections);
//    if (callback) { callback(); }
//  }
//
//   Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  var xmlhttp;
  if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
    }
  else
    {// code for IE6, IE5
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
  xmlhttp.onreadystatechange=function()
    {
    if (xmlhttp.readyState==4 && xmlhttp.status==200)
      {
    	 me.frameData=xmlhttp.responseText;
    	 if (callback) { callback(); }
      }
    }
  var myurl1 = Wif.endpoint + 'projects/' + me.projectId + '/demandScenarios/' + me.scenarioId + '/htmlOutcome';
  var frameURnewL = Aura.getDispatcher + 'url=' + myurl1;
  xmlhttp.open("GET",frameURnewL,true);
  xmlhttp.send();
  
}

, loadEmployment: function (callback) {
	_.log(me, '6666');
  var me = this;
  _.log(me, 'loading Employment', me);

  
  //, url: Wif.endpoint + 'projects/' + me.projectId + '/allocationLUs/'
    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/demand/setup/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'loaded emp rows before', me);
    me.empRows = data;
   
    _.log(me, 'loaded emp rows after', me.empRows);
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
      , url: Wif.endpoint + 'projects/' + me.projectId + '/demandScenarios/' + me.scenarioId
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
  
  this.assocLuCbox = Ext.create('Wif.setup.UnionAttrComboBox', {
    autoLoad: false
  , multiSelect: false
  ,fields : ["_id", "label", "featureFieldName"]
  ,valueField : "label"
  ,displayField : "label"
  //, width: 50
  , editable: true
  , allowBlank: false
  , projectId:  me.projectId
  , listeners: {
  	change: function(cbox,newValue,oldValue,opts) {
  	    //me.changeUnionAttr(cbox,newValue);
  	}
  }
  , callback: function () {
      //me.mask.hide();
    }
  }); 
  
  ////////new    
  this.assocLuCbox = Ext.create('Aura.Util.RemoteComboBox', {
    extend : 'Ext.form.field.ComboBox',
    fields : ["_id", "label", "featureFieldName"],
    valueField : "label",
    displayField : "label",
    emptyText : "Select Existing Land Uses",
    multiSelect : false,
    forceSelection : true,
    typeAhead : false,
    editable : false,
    queryMode : 'local',
    displayTpl : '<tpl for=".">' + // for multiSelect
    '{label}<tpl if="xindex < xcount">,</tpl>' + '</tpl>',
    listConfig : {
      getInnerTpl : function() {
        return '<div class="x-combo-list-item"><img src="' + Ext.BLANK_IMAGE_URL + '" class="chkCombo-default-icon chkCombo" /> {label} </div>';
      }
    },
    serviceParams : {
      xdomain : "cors",
      url : Wif.endpoint + 'projects/' + me.projectId + '/allocationLUs/',
      method : "get",
      params : null,
      headers : {
        "X-AURIN-USER-ID" : Wif.userId
      }
    }
  });
	
  me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + me.projectId + '/allocationLUsSuitabilityAssociated/';
  me.assocLuCbox.load();

  function newScenario () {
  	_.log(me, 'newScenario');

//    me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + me.projectId + '/allocationLUsSuitabilityAssociated/';
//    me.assocLuCbox.load();
    me.show();
    
	 
	  
    
//  	me.fillassoCombo(function() {
//  		me.show();
//  	});
   
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

