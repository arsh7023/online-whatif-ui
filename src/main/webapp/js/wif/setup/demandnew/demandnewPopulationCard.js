Ext.define('Wif.setup.demandnew.demandnewPopulationCard', {
	extend : 'Ext.form.Panel',
  project : null,
  title : 'Population ',
  assocLuCbox : null,
  assocLuColIdx : 1,
  model : null,
  pendingChanges : null,
  sortKey : 'label',
  isEditing: true, 
  isLoadingExisting: true,
  
  constructor : function(config) {
    var me = this;
    Ext.apply(this, config);
    var projectId = me.project.projectId;
    
    var isnew = me.project.isnew;
    me.isLoadingExisting = true;
  
   	this.gridfields = [];
   	this.modelfields = [];
   	this.modelfields.push("_id");
   	this.modelfields.push("item");
    var gfield_id = {
        text : "_id",
        dataIndex : "_id",
        hidden: true
      };   	
    var gfield = {
        text : "item",
        dataIndex : "item"
      };

    this.gridfields.push(gfield_id);
    this.gridfields.push(gfield);
   	
    
    var definition = this.project.getDefinition();
    
    var rows =[];
    var sortfields = [];
    
    /*
    var rows = definition.projections.sort();
   	_.log(me, 'projections', rows);
   	
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
        this.modelfields.push(sortfields[i]);
    }

  	_.log(me, 'sortFields',  sortfields);
    _.log(me, 'modelFields1',  this.modelfields);
    _.log(me, 'gridFields',  gridfields);
    */

    var storeData = [];
     var datafield = {
        "_id" : 'totalPopulation',
        "item" : 'Total Population',
      };      
      storeData.push(datafield);
      
      var datafield = {
          "_id" : 'totalPopulation',
          "item" : 'Total Population',
        };      
        storeData.push(datafield);    
        
        var datafield0 = {
            "_id" : 'housingUnits',
            "item" : 'Housing Units',
          };      
          storeData.push(datafield0);          
      
     var datafield1 = {
          "_id" : 'gQPopulation',
          "item" : 'Group Quarter Population',
      };      
      storeData.push(datafield1);
    
      var datafield2 = {
          "_id" : 'averageHouseholdSize',
          "item" : 'Avergare Household Size',
      };      
      storeData.push(datafield2);
      
      var datafield22 = {
          "_id" : 'households',
          "item" : 'Households',
      };      
      storeData.push(datafield22);      
      
    this.model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: this.modelfields    
     });
    
    this.store = Ext.create('Ext.data.Store', {
    	model: this.model,
    	data : storeData
    });
    

     
    this.grid = Ext.create('Ext.grid.Panel', {

    	title: 'Projection Population',
      selType: 'cellmodel',
      border : 0,
      margin : '0 5 5 5',
      store : this.store,
      height : 125,
      autoRender : true,
      columns : this.gridfields,
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
    
    this.grid.reconfigure(this.store, this.gridfields);
    this.items = [this.grid];
    
    this.callParent(arguments);
  },
  listeners : {
    activate : function() {
      _.log(this, 'activate');
      //this.build(this.fillcombo());
      this.build();
      
      //this.build(function() { this.fillcombo;  if (callback) { callback(); }});
    }
  },
  build : function() {	
    var me = this, projectId = this.project.projectId;
    me.isLoadingExisting = true;

//   
//    me.store.massageBeforeStore = function(record) {
//      record.projectId = projectId;
//    };
    
    var definition = this.project.getDefinition();
    
    //////
    if (this.gridfields.length<3)
    {	
	    var rows = definition.projections.sort();
	   	_.log(me, 'projections', rows);
	   	
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
	        
	        this.gridfields.push(field);
	        this.modelfields.push(sortfields[i]);
	    }
	
	  	_.log(me, 'sortFields',  sortfields);
	    _.log(me, 'modelFields1',  this.modelfields);
	    _.log(me, 'gridFields',  this.gridfields);
	    
	    this.grid.reconfigure(this.store, this.gridfields);
    }
    /////////
    
    
    
    
    if (definition.demographicTrends1 != undefined)
    {
    var mainrows = definition.demographicTrends1;
    //for projection population 
    this.store.each(function(record,idx){
      val = record.get('_id');

   	 for (var l = 0; l < mainrows.count(); l++)
     { 	  
   		for (var j = 0; j < mainrows[l].demographicData.count(); j++)
      { 	 
   		 if (mainrows[l].demographicData[j]["@class"] == ".ResidentialDemographicData" )
   		 {
        	
	         	 for (var m = 0; m < me.modelfields.count(); m++)
	           {
		            if ( me.modelfields[m] == mainrows[l].demographicData[j].projectionLabel)
		          	{
		          	    record.set(me.modelfields[m],mainrows[l].demographicData[j][val]);
		          	    record.commit();
		         	 	}	 
		         }
	        }
        }
       }
     });
    }//end if
    
    

     return true;
   
  },
  

  
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
    //var demographicTrends1 =[];
//    if (definition.demographicTrends1 == undefined)
//    {
//        Ext.merge(definition,{demographicTrends1 :[]});
//    }
    
    var demographicData = [];
    //saving projection population
    
  	 for (var m = 2; m < this.modelfields.count(); m++)
     {
  		 var jsonStr='{';
  		  jsonStr = jsonStr + '\"@class\" :' + '\".ResidentialDemographicData\",';
  		  jsonStr = jsonStr + '\"projectionLabel\" :\"' +this.modelfields[m] + '\",'; 
 	 
  	    var i = 0;
  	     this.store.each(function(record,idx){                   		
  	         i = i + 1;  
  	         var x= '\"' +record.get('_id') + '\"'; 
  	         var x1 =  ':' + 0 +',';
  	         if (record.get(me.modelfields[m]) =='' || record.get(me.modelfields[m]) ==null)
  	        	 { 
  	        	     x1 =  ':' + 0 +',';
  	        	 }
  	         else
  	        	 {  
  	        	    x1 =  ':' + record.get(me.modelfields[m]) +',';
  	        	 }
  	        
  	         jsonStr = jsonStr + x + x1;
  	         //landUseOrderMap.push('\"' +record.get('_id') + '\"' + ':' + i);
  	     });  
  	     jsonStr = jsonStr + '\"vacantLand\" : null }';
  	     //jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}';
  	     demographicData.push(JSON.parse(jsonStr));
 
     }
    
    
    
    Ext.merge(definition, {
    	//demographicTrends1:[{demographicData : _.translate3(this.store.data.items, me.sectorTranslators)}]
          demographicTrends1:[{demographicData : demographicData}]
    });
    me.project.setDefinition(definition);
    _.log(this, 'validate', _.translate3(this.store.data.items, me.sectorTranslators), me.project.getDefinition());

    if (callback) {
      _.log(this, 'callback');
      callback();
    }
    return true;
  }
});
