Ext.define('Wif.analysis.demandscenario.DemandScenario', {
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
    , docType: "DemandScenarioNew"
    , projectId: me.projectId
    //, manualAreaRequirements : me.project.manualAreaRequirements
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
        msg: 'Creating demand Scenario',
        icon: Ext.Msg.INFO
      });
    
    
     me.scenarioPostData = {
        label: me.label
      , docType: "DemandScenarioNew"
      , projectId: me.projectId
      //, manualAreaRequirements : []
      };
    

    //"/{projectId}/manualDemandScenarios
    var remoteObject = Ext.create('Wif.RESTObject',
      { urlBase: Wif.endpoint + 'projects/' + me.projectId + '/demandScenarioNews/'
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
        , url: Wif.endpoint + 'projects/' + me.projectId + '/demandScenarioNews/' + me.scenarioId
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
	    		me.loadEmployment( function () {
	    			me.loadMainData(function () {
	    		   if (callback) { callback(); }	
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
    ///////////////////////////////
    
    me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + me.projectId + '/allocationLUsSuitabilityAssociated/';
    me.assocLuCbox.load();
    
  //me.assocLuCbox.load(me.projectId);
    
  me.loadColumns(function() {
  	me.loadRows( function () {
  		me.loadEmployment( function () {
  			me.loadMainData(function () {
  		   if (callback) { callback(); }	
  	  });
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
   	modelfields.push("item");
    var gfield_id = {
        text : "_id",
        dataIndex : "_id",
        hidden: true
      };   	
    var gfield = {
        text : "item",
        dataIndex : "item"
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
  	for (var i = 0; i < sortfields.count(); i++)
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
    var storeData1 = [];
    /*
  	for (var j = 0; j < rowsData.count(); j++)
    {   
      var datafield = {
          "_id" : rowsData[j]._id,
          "land use" : rowsData[j].label,
        };
        
        storeData.push(datafield);
    }
    */
     var datafield = {
        "_id" : 'totalPopulation',
        "item" : 'Total Population',
      };      
      storeData.push(datafield);
      
     var datafield1 = {
          "_id" : 'gqPopulation',
          "item" : 'Group Quarter Population',
      };      
      storeData.push(datafield1);
    
      var datafield2 = {
          "_id" : 'avgHouseholdSize',
          "item" : 'Avergare Household Size',
      };      
      storeData.push(datafield2);
      
      var datafield21 = {
          "_id" : 'vacancyRate',
          "item" : 'Vacancy Rate',
        };      
      storeData1.push(datafield21);
        
      var datafield22 = {
            "_id" : 'infillRate',
            "item" : 'Infill Rate',
          };      
      storeData1.push(datafield22);   
        
      
      
    var model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: modelfields    
     });
    
    var store = Ext.create('Ext.data.Store', {
    	model: model,
    	data : storeData
    });
    
    var store1 = Ext.create('Ext.data.Store', {
    	model: model,
    	data : storeData1
    });
    
    var mainrows = me.scenarioData;
    //for projection population 
    store.each(function(record,idx){
      val = record.get('_id');
    
         /*
	    	 for (var l = 0; l < mainrows.manualAreaRequirements.count(); l++)
	       { 	  		 
	          if ( val == mainrows.manualAreaRequirements[l].allocationLULabel)
	          	{          	
			         	 for (var m = 0; m < modelfields.count(); m++)
			           {
				            if ( modelfields[m] == mainrows.manualAreaRequirements[l].projection.label)
				          	{
				          	    record.set(modelfields[m],mainrows.manualAreaRequirements[l].requiredArea);
				          	    record.commit();
				         	 	}	 
				         }
			        }
	         }
	         */
   	 for (var l = 0; l < mainrows.demandDataItems.count(); l++)
     { 	  		 
        if ( val == mainrows.demandDataItems[l].itemID)
        	{          	
	         	 for (var m = 0; m < modelfields.count(); m++)
	           {
		            if ( modelfields[m] == mainrows.demandDataItems[l].itemYear)
		          	{
		          	    record.set(modelfields[m],mainrows.demandDataItems[l].itemValue);
		          	    record.commit();
		         	 	}	 
		         }
	        }
       }
   });
    
    //for vacancy/infill rate 
    store1.each(function(record,idx){
    val = record.get('_id');
     
   	 for (var l = 0; l < mainrows.demandDataItems.count(); l++)
     { 	  		 
        if ( val == mainrows.demandDataItems[l].itemID)
        	{          	
	         	 for (var m = 0; m < modelfields.count(); m++)
	           {
		            if ( modelfields[m] == mainrows.demandDataItems[l].itemYear)
		          	{
		          	    record.set(modelfields[m],mainrows.demandDataItems[l].itemValue);
		          	    record.commit();
		         	 	}	 
		         }
	        }
       }
    });    
    

     
    var grid = Ext.create('Ext.grid.Panel', {
//      selModel : {
//        selType : 'cellmodel'
//      },
    	title: 'Projection Population',
      selType: 'cellmodel',
      border : 0,
      margin : '0 5 5 5',
      store : store,
      height : 125,
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
    
    var grid1 = Ext.create('Ext.grid.Panel', {
//    selModel : {
//      selType : 'cellmodel'
//    },
  	title: 'Vacancy/Infill',
    selType: 'cellmodel',
    border : 0,
    margin : '0 5 5 5',
    store : store1,
    height : 125,
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
    
    ////////////////////////////////////////////////////////////
    //////Land Use 
    this.gridfields3 = [];
   	var modelfields3 = [];
   	this.comboDataNew3 =[];
   	this.storeDataNew3 = [];
   	//modelfields2.push("label");
   	modelfields3.push("associatedALUs");
 
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
     
    this.combostore3 = Ext.create('Ext.data.Store', {
      fields : ["label"],
      data: this.comboDataNew3
   });
 

    
    var gfield3 = {
     		xtype: 'gridcolumn',
         text : "Land Use",
         width: 50,
         flex : 2,
         dataIndex : "associatedALUs",
         editor: this.assocLuCbox
       };

      //this.gridfields.push(gfield_id);
      this.gridfields3.push(gfield3);
      

    	sortfields.sort();
    	for (var i = 0; i < sortfields.count(); i++)
      {	    
    		var groupfields =[];
    		
    		
        var fieldA = {
            text : 'Percentage',
            dataIndex : sortfields[i]+'pct',
            editor: 'numberfield',
            type: 'number'
          };
        var fieldB = {
            text : 'Acres needs',
            dataIndex : sortfields[i]+'acr',
            editor: 'numberfield',
            type: 'number'
          };
        
        groupfields.push(fieldA);
        groupfields.push(fieldB);
        var columnfield = {
        		    text:sortfields[i],
        		    columns: groupfields
        		    };
          
          //this.gridfields3.push(field);
          this.gridfields3.push(columnfield);
          //modelfields3.push(sortfields[i]);
          modelfields3.push(sortfields[i]+'pct');
          modelfields3.push(sortfields[i]+'acr');
      }
      
      
      this.gridfields3.push(delColumns3);
      
      
      this.model3 = Ext.define('User', {
        extend: 'Ext.data.Model',
        fields: modelfields3    
       });
      
      //for land use

      var isChecking = [];
      var finishedChecking = false;
    	 for (var l = 0; l < mainrows.demandDataItems.count(); l++)
      { 	  		
    		 var x = mainrows.demandDataItems[l].itemID;
    		 if ( x == 'avgHouseholdSize' || x == 'totalPopulation'  || x == 'gqPopulation'  || x == 'infillRate' || x == 'vacancyRate')
    			 {
    			 
    			 }
    		 else
    			 {
    			    var lbl = mainrows.demandDataItems[l].itemLabel;
    			    var a = isChecking.indexOf(lbl.substring(0,lbl.length-4));
    			    if (a == -1)
    			    	{
    			    	    isChecking.push(lbl.substring(0,lbl.length-4));
    			    	    
    			    	    var str= '{' + '\"' + 'associatedALUs' + '\"' + ':'  + '\"' + lbl.substring(0,lbl.length-4) + '\"';
    	    			    for (var z = 0; z < mainrows.demandDataItems.count(); z++)
    	    			    	{
    	    			       	  var lbl2 = mainrows.demandDataItems[z].itemLabel;
	    	      			       if (lbl2.substring(0,lbl2.length-4) == lbl.substring(0,lbl.length-4))
	    	      			      	 {
	    	      			     	    if (lbl2.substring(lbl2.length,lbl2.length-3) == "pct")
	    	      		     	    	{
	    	      		     	        
	    	      		     	       str= str + ',\"' + mainrows.demandDataItems[z].itemYear + 'pct\"' + ':' + '\"' + mainrows.demandDataItems[z].itemValue + '\"';
	    	      			     	  	 
	    	      		     	    	}
	    	      		     	    if (lbl2.substring(lbl2.length,lbl2.length-3) == "acr")
	    	      	     	    	{
	    	      		     	    	
	    	      		     	    	str= str + ',\"' + mainrows.demandDataItems[z].itemYear + 'acr\"' + ':' + '\"' + mainrows.demandDataItems[z].itemValue + '\"';
	    	      		     	  	   
	    	      	     	    	}
    	      			      }
    	      			       
    	    			    	}
    	    			    str = str + '}';
    	    			    this.storeDataNew3.push(JSON.parse(str));
    			    	}
    			 }
      }
      
      var store3 = Ext.create('Ext.data.Store', {
      	model: this.model3,
      	data : this.storeDataNew3
      });
      
      //for Landuse 
      store3.each(function(record,idx){
      val = record.get('associatedALUs');

     	 for (var l = 0; l < mainrows.demandDataItems.count(); l++)
       { 	  		 
          if ( val == mainrows.demandDataItems[l].itemID)
          	{          	
  	         	 for (var m = 0; m < modelfields.count(); m++)
  	           {
  		            if ( modelfields[m] == mainrows.demandDataItems[l].itemYear)
  		          	{
  		          	    record.set(modelfields[m],mainrows.demandDataItems[l].itemValue);
  		          	    record.commit();
  		         	 	}	 
  		         }
  	        }
         }
      });         
      
      var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
      	clicksToEdit: 1
    });
      var cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit : 1
      });
    
     var grid3 =  Ext.create('Ext.grid.Panel', {
        store: store3,
        //selType: 'cellmodel',
        columnLines: true,
        title: 'Landuse needs',
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
    
    ///////////////////////////////////////////////////////////
    ////Employment
     
   	var gridfields4 = [];
   	var modelfields4 = [];
   	modelfields4.push("_id");
   	modelfields4.push("item");
   	modelfields4.push("label");
    var gfield_id4 = {
        text : "_id",
        dataIndex : "_id",
        hidden: true
      };   	
    var gfield4 = {
        text : "item",
        dataIndex : "item"
      };
    var gfield44 = {
        text : "label",
        dataIndex : "label"
      };

    gridfields4.push(gfield_id4);
    gridfields4.push(gfield4);
    gridfields4.push(gfield44);
    
    
    var rows4 = me.empRows;
   	_.log(me, 'projections', me.empRows);
   	
//   	var sortfields = [];
//  	for (var i = 0; i < rows.count(); i++)
//    {	                  
//       sortfields.push(rows[i].label);
//     }

  	sortfields.sort();
  	for (var i = 0; i < sortfields.count(); i++)
    {	          
      var field = {
          text : sortfields[i],
          dataIndex : sortfields[i],
          editor: 'numberfield',
          type: 'number'
        };
        
        gridfields4.push(field);
        modelfields4.push(sortfields[i]);
    }

    var storeData4 = [];	
    

    
  	for (var j = 0; j < rows4.sectors.count(); j++)
    {   
  		
      var datafieldSum = {
          "_id" : "sum",
          "item" : rows4.sectors[j].label,
          "label": "- Sum -"
          };
          storeData4.push(datafieldSum);
  		
  			  var obj =rows4.sectors[j].associatedALUs;
 	        var x = 0;
          for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) { 
           	    x =  obj[prop];
            }
            
            
            
           var datafield = {
           "_id" : prop,
           "item" : rows4.sectors[j].label,
           "label": x
           };
           storeData4.push(datafield);
  			}
          
          var datafieldempty = {
              "_id" : "empty",	
              "item" : rows4.sectors[j].label,
              "label": ""
              };
              storeData4.push(datafieldempty);
          
          var datafieldinfill = {
              "_id" : "infillRate",	
              "item" : rows4.sectors[j].label,
              "label": "Infill Rate"
              };
              storeData4.push(datafieldinfill);
        
       }
  	
   
     
    var model4 = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: modelfields4    
     });
    
    var store4 = Ext.create('Ext.data.Store', {
    	model: model4,
    	data : storeData4,
    	groupField: 'item'
    });
    
    //for employment 
    store4.each(function(record,idx){
    
    itemVal = record.get('item');
    val = record.get('_id');

   	 for (var l = 0; l < mainrows.demandEmpItems.count(); l++)
     { 	  		 
        if ( itemVal == mainrows.demandEmpItems[l].sectorName)
        	{   
        	   for (var z = 0; z < mainrows.demandEmpItems[l].sectorData.count(); z++)
        	   {  
        	  	   if (val == mainrows.demandEmpItems[l].sectorData[z].itemID)
        	  	   {	 
					         	 for (var m = 0; m < modelfields.count(); m++)
					           {
						            if ( modelfields[m] == mainrows.demandEmpItems[l].sectorData[z].itemYear)
						          	{
						          	    record.set(modelfields[m],mainrows.demandEmpItems[l].sectorData[z].itemValue);
						          	    record.commit();
						         	 	}	 
						         }
        	  	   }
        	   }
	        }
       }
    });
    
      
    var grid4 = Ext.create('Ext.grid.Panel', {
//      selModel : {
//        selType : 'cellmodel'
//      },
    	title: 'Projection Employment',
      selType: 'cellmodel',
      border : 0,
      margin : '0 5 5 5',
      store : store4,
      height : 125,
      autoRender : true,
      features: [{
        id: 'group',
        ftype: 'groupingsummary',
        groupHeaderTpl: '{name}',
        hideGroupedHeader: true,
        enableGroupingMenu: false
    }],
      columns : gridfields4,
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
     
     
     
    /////////////////////////////////////
    var btn = Ext.create( "Ext.Button", {
      //xtype: 'button',
      style: { float: 'right' },
    	//renderTo: Ext.getBody(),
      text: 'Save',
      handler: function () {      
      	var manualAreaRequirements=[];
      	
        var demandDataItems = [];
           //saving projection population
           store.each(function(record,idx){                   		
		         	 for (var m = 2; m < modelfields.count(); m++)
		           {
		         		 /*
			            if ( record.get(modelfields[m])> 0)
			          	{
			                var ar = {
			                		"allocationLUId": record.get('_id'),
			                    "allocationLULabel": record.get('land use'),
			                    "requiredArea": record.get(modelfields[m]),
			                    "projection": {
			                        "year": modelfields[m],
			                        "label": modelfields[m]
			                         }
			                    };
			                   manualAreaRequirements.push(ar);
			             }
			             */
			            if ( record.get(modelfields[m])> 0)
			          	{
			                var ar = {
			                		
			                	  "itemYear": modelfields[m],
			                    "itemLabel": record.get('item'),
			                    "itemValue": record.get(modelfields[m]),
			                    "itemID": record.get('_id'),
			                    "itemProjectionName": "YearBased"
			                    };
			                demandDataItems.push(ar);
			             }
			               
			         }
           }); 
           
           //saving infill/vacancy rate
           store1.each(function(record,idx){                   		
	         	 for (var m = 2; m < modelfields.count(); m++)
	           {
		            if ( record.get(modelfields[m])> 0)
		          	{
		                var ar = {
		                		
		                	  "itemYear": modelfields[m],
		                    "itemLabel": record.get('item'),
		                    "itemValue": record.get(modelfields[m]),
		                    "itemID": record.get('_id'),
		                    "itemProjectionName": "YearBased"
		                    };
		                demandDataItems.push(ar);
		             }
		               
		         }
           });  
           
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
             
          	 
	         	 for (var m = 2; m < modelfields.count(); m++)
	           {
		            if ( record.get(modelfields[m]+'pct')> 0)
		          	{
		                var ar = {
		                		
		                	  "itemYear": modelfields[m],
		                    "itemLabel": val + ':pct',
		                    "itemValue": record.get(modelfields[m]+'pct'),
		                    "itemID": id,
		                    "itemProjectionName": "YearBased"
		                    };
		                demandDataItems.push(ar);
		             }
		            if ( record.get(modelfields[m]+'acr')> 0)
		          	{
		                var ar = {
		                		
		                	  "itemYear": modelfields[m],
		                    "itemLabel": val + ':acr',
		                    "itemValue": record.get(modelfields[m]+'acr'),
		                    "itemID": id,
		                    "itemProjectionName": "YearBased"
		                    };
		                demandDataItems.push(ar);
		             }
		               
		         }
           });   
           //end land use
         
        //employment   
           
        var demandEmpItems = [];
        var sectorData = [];
        
        var itemVal="";
        var olditemVal = "";
        var lsw= true;
        store4.each(function(record,idx){    
           val = record.get('_id');
           itemVal = record.get('item');
           if (record.get('label') != '')
           {	 
          	 
	             if ((itemVal != olditemVal) && olditemVal != "")
	             {
		           	  var arOuter = {
		          	  		"sectorName" : olditemVal,
		          	  		"sectorData" : sectorData
		          	  }; 
		          	  demandEmpItems.push(arOuter);
		          	  sectorData = [];
		          	  lsw = true;
		          	
	             }
	         	   olditemVal = itemVal;
	         	  
		           lsw = false;          
		         	 for (var m = 2; m < modelfields.count(); m++)
		           {  
			            if ( record.get(modelfields[m])> 0)
			          	{
			                var ar = {
			                		
			                	  "itemYear": modelfields[m],
			                    "itemLabel": record.get('label'),
			                    "itemValue": record.get(modelfields[m]),
			                    "itemID": record.get('_id'),
			                    "itemProjectionName": "YearBased"
			                    };
			                sectorData.push(ar);
			             }
			          }

             }//end if
         }); 
        
         if (lsw == false)
        	 {
        	    var arOuter = {
       	  		 "sectorName" : olditemVal,
       	  	  	"sectorData" : sectorData
		        	 }; 
		       	  demandEmpItems.push(arOuter);
		       	  sectorData = [];
		       	  lsw = true;
        	 }
         //end employment
           
           
      	
         me.scenarioPostData = {
            label: me.label
          , docType: "DemandScenarioNew"
          , projectId: me.projectId
          , demandDataItems : demandDataItems 
          , demandEmpItems : demandEmpItems
          , manualAreaRequirements : manualAreaRequirements
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
    
    enumDistrictFieldSet.add(grid);
    enumDistrictFieldSet.add(grid1);
    //enumDistrictFieldSet.add(grid3);
    //var frameURL = 'http://localhost:8080/aurin-wif/projects/176bf47f1c37cd08814663e76b00843e/suitabilityScenarios/176bf47f1c37cd08814663e76b00c8ec/html';
    var frameURL =  Wif.endpoint + 'projects/' + me.projectId + '/demandScenarioNews/' + me.scenarioId + '/html';
    
//    this.myIFrame = Ext.create('Ext.Component', {
//      title: 'Report',
//      id:'mytheFrame',
//      style: {
//          width: '100%',
//          height: '100%'
//      },
//     // html: '<div style="width:100%;height:100%;overflow:scroll;-webkit-overflow-scrolling:touch;"><iframe style="width:100%;height:100%;" src="'+frameURL+'" onload="(function(){Ext.getCmp(\'thenavview\').setMasked(false);})()">Your device does not support iframes.</iframe></div>'
//      
//      html: '<div style="width:100%;height:100%;overflow:scroll;-webkit-overflow-scrolling:touch;"><iframe style="width:100%;height:100%;" src="'+frameURL+'" onload="(function(){Ext.getCmp(\'thenavview\').setMasked(false);})()">Your device does not support iframes.</iframe></div>'
//      
//      
//     });
    
//    this.myIFrame = new Ext.Component({
//      autoEl:{
//          id:'theFrame',
//          tag:'iframe',
//          border:false,
//          src:frameURL
//      }
//
//      ,setSrc: function(src) {
//          if (this.rendered) {
//              // equivalent to:
//              // document.getElementById('myIFramePanel').src = src;
//              Ext.get('theFrame').set({
//                  src: src
//              });
//          } else {
//              this.autoEl.src = src;
//          }
//      }
//  });
    
//    this.myIFrame= Ext.create('Ext.ux.IFrame',{
//    	id: 'theFrame',
//      src:frameURL,
//      title:'google'
//    });
    
//    this.myIFrame=Ext.define('Ext.ux.SimpleIFrame', {
//      extend: 'Ext.Panel',
//      alias: 'widget.simpleiframe',
//      src: frameURL,
//      //src: 'about:blank',
//      loadingText: 'Loading ...',	
//      initComponent: function(){
//        this.updateHTML();
//        this.callParent(arguments);
//      },
//      updateHTML: function() {
//        this.html='<iframe id="iframe-'+this.id+'"'+
//            ' style="overflow:auto;width:100%;height:100%;"'+
//            ' frameborder="0" '+
//            ' src="'+this.src+'"'+
//            '></iframe>';
//      },
//      reload: function() {
//        this.setSrc(this.src);
//      },
//      reset: function() {
//        var iframe=this.getDOM();
//        var iframeParent=iframe.parentNode;
//        if (iframe && iframeParent) {
//          iframe.src='about:blank';
//          iframe.parentNode.removeChild(iframe);
//        }
//
//        iframe=document.createElement('iframe');
//        iframe.frameBorder=0;
//        iframe.src=this.src;
//        iframe.id='iframe-'+this.id;
//        iframe.style.overflow='auto';
//        iframe.style.width='100%';	
//        iframe.style.height='100%';
//        iframeParent.appendChild(iframe);
//      },
//      setSrc: function(src, loadingText) {
//        this.src=src;
//        var iframe=this.getDOM();
//        if (iframe) {
//          iframe.src=src;
//        }
//      },
//      getSrc: function() {
//        return this.src;
//      },
//      getDOM: function() {
//        return document.getElementById('iframe-'+this.id);
//      },
//      getDocument: function() {
//        var iframe=this.getDOM();
//        iframe = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
//        return iframe.document;
//      },
//      destroy: function() {
//        var iframe=this.getDOM();
//        if (iframe && iframe.parentNode) {
//          iframe.src='about:blank';
//          iframe.parentNode.removeChild(iframe);
//        }
//        this.callParent(arguments);
//      },
//
//      //call this to manually change content.
//      //don't call until component is rendered!!!
//      update: function(content) {
//        this.setSrc('about:blank');
//        try {
//          var doc=this.getDocument();
//          doc.open();
//          doc.write(content);
//          doc.close();
//        } catch(err) {
//          // reset if any permission issues
//          this.reset();
//          var doc=this.getDocument();
//          doc.open();
//          doc.write(content);
//          doc.close();
//        }
//      }
//    });
    
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

           },
           tabchange: function (tabPanel, newCard, oldCard, eOpts ) {

          	 var newCardId = newCard.getItemId();
          	 if (newCardId == 'reportPanel') {
          		 //newCard.update('<div style="width:100%;height:100%;overflow:scroll;-webkit-overflow-scrolling:touch;"><iframe style="width:100%;height:100%;" src="'+'www.yahoo.com'+'" onload="(function(){Ext.getCmp(\'thenavview\').setMasked(false);})()">Your device does not support iframes.</iframe></div>')
          		 //newCard.innerHTML('<div style="width:100%;height:100%;overflow:scroll;-webkit-overflow-scrolling:touch;"><iframe style="width:100%;height:100%;" src="'+'www.yahoo.com'+'" onload="(function(){Ext.getCmp(\'thenavview\').setMasked(false);})()">Your device does not support iframes.</iframe></div>')
          		 //me.cmpFrame.setHTML('<div style="width:100%;height:100%;overflow:scroll;-webkit-overflow-scrolling:touch;"><iframe style="width:100%;height:100%;" src="'+'www.yahoo.com'+'" onload="(function(){Ext.getCmp(\'thenavview\').setMasked(false);})()">Your device does not support iframes.</iframe></div>');
          		 
          		 //var legendHtml = '<div style="width:100%;height:100%;overflow:scroll;-webkit-overflow-scrolling:touch;"><iframe style="width:100%;height:100%;" src="www.yahoo.com" onload="(function(){Ext.getCmp(\'thenavview\').setMasked(false);})()">Your device does not support iframes.</iframe></div>'
//          			 me.myIFrame.setSrc(legendHtml);
//          			 me.myIFrame.reload();
          			 
          			 //Ext.get('total').update(legendHtml);
          			 
          		 //me.myIFrame.update(legendHtml);
          		 //me.cmpFrame.update(legendHtml);
          			 
          			// var aFrame = Ext.getCmp('theFrame');
          		 //aFrame.contentWindow.location.reload();
//          		
          			// var aFrame1 = Ext.getCmp('mytheFrame');
          		 //var the_iframe = cmp.getEl().dom;	
//          		 the_iframe.contentWindow.location.reload();
//          	    aFrame.setHTML(legendHtml);
          		
          		   
          			 Ext.getDom('iframe-win').src = frameURL;
          			 
         	 		}
        	  
           }
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
  }
 
, loadColumns: function (callback) {
  var me = this;
  _.log(me, 'loading columns', me);

    var serviceParams = {
        xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/demandnew/setup/'
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

, loadEmployment: function (callback) {
	_.log(me, '6666');
  var me = this;
  _.log(me, 'loading Employment', me);

  
  //, url: Wif.endpoint + 'projects/' + me.projectId + '/allocationLUs/'
    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/demandnew/setup/'
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
      , url: Wif.endpoint + 'projects/' + me.projectId + '/demandScenarioNews/' + me.scenarioId
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

