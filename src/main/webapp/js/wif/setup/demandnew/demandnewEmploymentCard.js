Ext.define('Wif.setup.demandnew.demandnewEmploymentCard', {
	extend : 'Ext.form.Panel',
  project : null,
  title : 'Employment Information ',
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
   	this.modelfields.push('label');
   	var gfield = {
        header : 'Sector Label',
        dataIndex : 'label',
        name : 'label',
        type : 'string'
      };

    this.gridfields.push(gfield);
   	
    
    var rows =[];
    var sortfields = [];
    
    /*
    var definition = this.project.getDefinition();
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
*/


//    if (definition.sectors != undefined)
//    {
//    	for (var l = 0; l < definition.sectors.count(); l++)
//    		{
//    	    var datafield = {
//           "label" : definition.sectors[l].label
//         };
//    	    storeData.push(datafield);
//    		}
//    }

      
    this.model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: this.modelfields    
     });
    
//    this.store = Ext.create('Ext.data.Store', {
//    	model: this.model
//    	//data : storeData
//    });
    
    this.store = Ext.create('Ext.data.Store', {
      storeId : 'store',
      model : this.model,
      proxy : {
        type : 'memory'
      }
    });

     
    this.grid = Ext.create('Ext.grid.Panel', {

    	//title: 'Projection Population',
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
    
    //this.grid.reconfigure(this.store, this.gridfields);
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
    //
    
    var sectors = definition.sectors;
    
    _.log(this, 'build', sectors);
    _.each(sectors, function(sector) {
      var recordMatch = me.store.findRecord('label', sector.label);
      if (!recordMatch) {
        me.store.add(sector);
      }
    });
   
// 
//    var storeData = [];
//
//    if (definition.sectors != undefined)
//    {
//    	for (var l = 0; l < definition.sectors.count(); l++)
//    		{
//    	    var datafield = {
//           "label" : definition.sectors[l].label
//         };
//    	    storeData.push(datafield);
//    		}
//    }
//
//      
//    this.store.removeAll();
//    this.store.loadData(storeData);
//    this.grid.reconfigure(this.store, me.gridfields);
    

    if (definition.demographicTrends2 != undefined)
    {
    var mainrows = definition.demographicTrends2;
    //for projection population 
    this.store.each(function(record,idx){
      val = record.get('label');

   	 for (var l = 0; l < mainrows.count(); l++)
     { 	  
   		for (var j = 0; j < mainrows[l].demographicData.count(); j++)
      { 	 
   		 if (mainrows[l].demographicData[j]["@class"] == ".EmploymentDemographicData" )
   		 {        	
	         	 for (var m = 0; m < me.modelfields.count(); m++)
	           {
		            if ( me.modelfields[m] == mainrows[l].demographicData[j].projectionLabel)
		          	{
		            	  if (val == mainrows[l].demographicData[j].sectorLabel)
		            	  {
			          	    record.set(me.modelfields[m],mainrows[l].demographicData[j].employees);
			          	    record.commit();
		            	  }
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
    //var demographicTrends2 =[];
//    if (definition.demographicTrends2 == undefined)
//    {
//        Ext.merge(definition,{demographicTrends2 :[]});
//    }
    
    var demographicData = [];
    //saving projection population
    
  	 for (var m = 1; m < this.modelfields.count(); m++)
     {
  		 var jsonStr='{';
  		  jsonStr = jsonStr + '\"@class\" :' + '\".EmploymentDemographicData\",';
  		  jsonStr = jsonStr + '\"projectionLabel\" :\"' +this.modelfields[m] + '\",'; 
  		 
 	 
  	    var i = 0;
  	     this.store.each(function(record,idx){   
  	    	   var newStr='';
  	    	   newStr = jsonStr + '\"sectorLabel\" :\"' + record.get('label') + '\",'; 
  	         i = i + 1;  
  	         var x= '\"employees\"'; 
  	         var x1 =  ':' + 0 +',';
  	         if (record.get(me.modelfields[m]) =='' || record.get(me.modelfields[m]) ==null)
  	        	 { 
  	        	     x1 =  ':' + 0 +',';
  	        	 }
  	         else
  	        	 {  
  	        	    x1 =  ':' + record.get(me.modelfields[m]) +',';
  	        	 }
  	        
  	         newStr = newStr + x + x1;
  	         //landUseOrderMap.push('\"' +record.get('_id') + '\"' + ':' + i);
  	         newStr = newStr.substring(0,newStr.length-1) + '}';
  	  	     demographicData.push(JSON.parse(newStr));
  	     });      
  	     

 
     }
    
    
//  	if (definition.demographicTrends2 == undefined)
//  		{
//		    Ext.merge(definition, {
//		    	//demographicTrends2:[{demographicData : _.translate3(this.store.data.items, me.sectorTranslators)}]
//		          demographicTrends2:[{demographicData : demographicData}]
//		    });
//  		}
//  	else
//  		{
//  		  //
//  		 
//  		   var mainrows = definition.demographicTrends2;
//  			  
//	   		 for (var j = 0; j < mainrows[0].demographicData.count(); j++)
//	       { 	 
//	   		   if (mainrows[0].demographicData[j]["@class"] == ".EmploymentDemographicData" )
//	   		   {
//	   		  	definition.demographicTrends2[0].demographicData.removeAt(j);
//	   		   }
//	   		 }
//	   		 
//	   		definition.demographicTrends2[0].demographicData.add(demographicData);
//	     }
	   	 
     Ext.merge(definition, {
     	//demographicTrends21:[{demographicData : _.translate3(this.store.data.items, me.sectorTranslators)}]
           demographicTrends2:[{demographicData : demographicData}]
     });  	
  		  
//		    Ext.merge(definition.demographicTrends2, {
//		          demographicData : demographicData
//		    });    
  
    
    me.project.setDefinition(definition);
    _.log(this, 'validate', _.translate3(this.store.data.items, me.sectorTranslators), me.project.getDefinition());

    if (callback) {
      _.log(this, 'callback');
      callback();
    }
    return true;
  }
});
