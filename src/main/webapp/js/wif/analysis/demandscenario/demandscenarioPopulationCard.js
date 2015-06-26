Ext.define('Wif.analysis.demandscenario.demandscenarioPopulationCard', {
	requires : ['Wif.analysis.demandscenario.demandscenarioWizard'],
	extend : 'Ext.form.Panel',
  requires: [
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*',
    'Ext.ux.CheckColumn',
    'Wif.RESTObject'
  ],
  

	project : null,
	title : 'Population - Sectors',
	assocLuCbox : null,
	assocLuColIdx : 1,
	model : null,
	pendingChanges : null,
	sortKey : 'label',
	isEditing: true, 
	isLoadingExisting: true
	, projectId: null
	, label: ''
	, scenarioId: null
	, scenarioData: {}
	, scenarioPostData: null
	, scenarioColumns: {}
	, scenarioRows :{}
	, modelfields :{},
	
	constructor : function(config) {
		
	  var me = this;
	  Ext.apply(this, config);
	  me.projectId = me.project.projectId;
	  
	  me.isnew = me.project.isnew;
	  me.isLoadingExisting = true;
	
	  //me.prepareReadyScenario();
	 
	  me.prepareReadyScenario(function() {
	  	
	    this.grid = Ext.create('Ext.grid.Panel', {

	    	title: 'Area requirements',
	      selType: 'cellmodel',
	      border : 0,
	      margin : '0 5 5 5',
	      store : me.store,
	      height : 400,
	      autoRender : true,
	      columns : me.gridfields,
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
	  	
	    this.grid.reconfigure(me.store, me.gridfields);
	    config.project.win.items = this.grid;
		   // this.items = [this.grid];
			    //this.callParent(arguments);
	         config.project.callParent();
	  			 if (callback) { callback(); }	
	  	  });
	 
	  
//    this.model = Ext.define('User', {
//      extend: 'Ext.data.Model',
//      fields: this.modelfields    
//     });
//    
//   
//    this.store = Ext.create('Ext.data.Store', {
//    	model: this.model,
//    	data : storeData
//    });
    
	  
//	  this.grid = Ext.create('Ext.grid.Panel', {
//
//    	title: 'Area requirements',
//      selType: 'cellmodel',
//      border : 0,
//      margin : '0 5 5 5',
//      store : this.store,
//      height : 400,
//      autoRender : true,
//      columns : gridfields,
//      flex: 1,
//      viewConfig: {
//        plugins: {
//            ptype: 'gridviewdragdrop',
//            dragText: 'Drag and drop to reorganize'
//        }
//       },
//      plugins: [
//                Ext.create('Ext.grid.plugin.CellEditing', {
//                    clicksToEdit: 1
//                })
//            ]
//      
//
//    });
    
//	  this.items = [this.grid];
//		this.callParent(arguments);
	},
	
	
	listeners : {
	  activate : function() {
	  	
	    _.log(this, 'activate demandscenarioPopulationCard');
	    
	    this.build();
	    
	    
	  }
	}
	
	
	, prepareReadyScenario: function (callback) {
		_.log(me, '666666');
	    var me = this
	      , project = me.project;
	    _.log(me, 'prepareReadyScenario', project);

	  me.loadColumns(function() {
	  	me.loadRows( function () {
	  		   me.show(function () {
	  			 if (callback) { callback(); }	
	  	  });
	    });
	  });
	 

	  }

	, prepareStore: function () {

	    var me = this;
	       
//	    this.store = Ext.create('Ext.data.Store', {
//	      model : this.model,
//	      data: me.scenarioData
//	    });
	  }

	,  show: function (callback) {
	    var me = this;
	     //, scenarioData = me.scenarioData;
	    Ext.QuickTips.init();

	    _.log(me, 'about to show', me);

	   

	    
	   	me.gridfields = [];
	   	me.modelfields = [];
	   	me.modelfields.push("_id");
	   	me.modelfields.push("land use");
	    var gfield_id = {
	        text : "_id",
	        dataIndex : "_id",
	        hidden: true
	      };   	
	    var gfield = {
	        text : "land use",
	        dataIndex : "land use"
	      };

	    me.gridfields.push(gfield_id);
	    me.gridfields.push(gfield);
	   	
	    
	    
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
	        
	        me.gridfields.push(field);
	        me.modelfields.push(sortfields[i]);
	    }

	  	_.log(me, 'sortFields',  sortfields);
	    _.log(me, 'modelFields1',  me.modelfields);
	    _.log(me, 'gridFields',  me.gridfields);

	     

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
	    
	    this.model = Ext.define('User', {
	      extend: 'Ext.data.Model',
	      fields: me.modelfields    
	     });
	    
	   
	    this.store = Ext.create('Ext.data.Store', {
	    	model: this.model,
	    	data : storeData
	    });
	  	
	    me.store.loadData(storeData);

	    
	    var definition = this.project.getDefinition();
	    
	    if (!(definition.demanddataItems == undefined))
	    {
	        me.isLoadingExisting = false;
	    	  var mainrows = definition.demanddataItems;
	  	    me.store.each(function(record,idx){
	  	      val = record.get('land use');
	  	    
//	  	  	 for (var k = 0; k < mainrows.count(); k++)
//	  	       {   
	  		    	 for (var l = 0; l < mainrows.manualAreaRequirements.count(); l++)
	  		       { 	  		 
	  		          if ( val == mainrows.manualAreaRequirements[l].allocationLULabel)
	  		          	{          	
	  				         	 for (var m = 0; m < me.modelfields.count(); m++)
	  				           {
	  					            if ( me.modelfields[m] == mainrows.manualAreaRequirements[l].projection.label)
	  					          	{
	  					          	    record.set(me.modelfields[m],mainrows.manualAreaRequirements[l].requiredArea);
	  					          	    record.commit();
	  					         	 	}	 
	  					         }
	  				        }
	  		         }
	  	      // }
	  	 
	  	   });
	    }
	    
//	    this.grid = Ext.create('Ext.grid.Panel', {
//
//	    	title: 'Area requirements',
//	      selType: 'cellmodel',
//	      border : 0,
//	      margin : '0 5 5 5',
//	      store : this.store,
//	      height : 400,
//	      autoRender : true,
//	      columns : me.gridfields,
//	      flex: 1,
//	      viewConfig: {
//	        plugins: {
//	            ptype: 'gridviewdragdrop',
//	            dragText: 'Drag and drop to reorganize'
//	        }
//	       },
//	      plugins: [
//	                Ext.create('Ext.grid.plugin.CellEditing', {
//	                    clicksToEdit: 1
//	                })
//	            ]
//	      
//
//	    });   
	   
	    
//	    var grid = Ext.create('Ext.grid.Panel', {
//
//	    	title: 'Area requirements',
//	      selType: 'cellmodel',
//	      border : 0,
//	      margin : '0 5 5 5',
//	      store : this.store,
//	      height : 400,
//	      autoRender : true,
//	      columns : gridfields,
//	      flex: 1,
//	      viewConfig: {
//	        plugins: {
//	            ptype: 'gridviewdragdrop',
//	            dragText: 'Drag and drop to reorganize'
//	        }
//	       },
//	      plugins: [
//	                Ext.create('Ext.grid.plugin.CellEditing', {
//	                    clicksToEdit: 1
//	                })
//	            ]
//	      
//
//	    });
//	    
	 
	  
	    ////////////////////////////////
//	    var win = Ext.create( "Ext.window.Window", {
//	      title: 'Analysis - Manual Demand',
//	      closable: true,
//	      closeAction: 'hide',
//	      width: 900,
//	      height: 600,
//	      layout: 'border',
//	      plain: true,
//	      items:
//	        [
//	         grid
//	      ]
//	    });
//	    this.items = [grid];
	    //this.callParent(arguments);
//	    me.win = win;
//	    _.log(me, 'win.show', me);
//	   var component = win.show();
//	    _.log(me, 'win.show result', component);
	    if (callback) { callback(); }
	  }
	 
	, loadColumns: function (callback) {
	  var me = this;
	  _.log(me, 'loading columns', me);

	    var serviceParams = {
	        xdomain: "cors"
	      , url: Wif.endpoint + 'projects/' + me.projectId + '/manualdemand/setup/'
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

	
	, build: function () {
//	  var me = this;
//
//	  function newScenario () {
//		  	_.log(me, 'newScenario');
//		    me.show();
//		  };

	    _.log( 'buildloaded');

	   
	    //me.prepareReadyScenario();
	  
  		   
	},//end lunch
	

	validate : function(callback) {
	  var me = this, gridValid = true;
	  me.store.each(function(record) {
	    if (!record.isValid()) {
	      _.log(this, 'validate', 'record is not valid');
	      gridValid = false;
	    }
	  });
	
	  if (!gridValid) {
	    Ext.Msg.alert('Status', 'All fields should have values!');
	    return false;
	  }
	
	  var definition = me.project.getDefinition(); 
	  Ext.merge(definition, {
	    sectors : _.translate3(me.store.data.items, me.sectorTranslators)
	  });
	  me.project.setDefinition(definition);
	  _.log(this, 'validate', _.translate3(me.store.data.items, me.sectorTranslators), me.project.getDefinition());
	
	  if (callback) {
	    _.log(this, 'callback');
	    callback();
	  }
	  return true;
	}
  
});

