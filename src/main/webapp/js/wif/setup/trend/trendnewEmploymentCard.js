Ext.define('Wif.setup.trend.trendnewEmploymentCard', {
	extend : 'Ext.form.Panel',
  project : null,
  title : 'Employment Trends',
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
  
    this.Output2 = [];
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
        
        this.gridfields.push(field);
        this.modelfields.push(sortfields[i]);
    }

  	_.log(me, 'sortFields',  sortfields);
    _.log(me, 'modelFields1',  this.modelfields);
    _.log(me, 'gridFields',  this.gridfields);
    

    var storeData = [];
    
    var sectors = definition.sectors;
    for (var i=0; i <sectors.length; i++)
    	{
	    	 var mjsonStr='{';
	   	   mjsonStr = mjsonStr + '\"_id\" :' + '\"' + sectors[i].label +'\",';
	   	   mjsonStr = mjsonStr + '\"item\" :' + '\"' + sectors[i].label +'\",';
	       for (var m = 2; m < me.modelfields.count(); m++)
	       {      
	      	    var myear=me.modelfields[m];
	      	    mjsonStr = mjsonStr + '\"' + myear + '\"' + ':0,';
	       }
   	     mjsonStr = mjsonStr.substring(0,mjsonStr.length-1) + '}';  
  		  storeData.push(JSON.parse(mjsonStr));
   	  
    	}
    
       
    this.model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: this.modelfields    
     });
    
    this.store = Ext.create('Ext.data.Store', {
    	model: this.model,
    	data : storeData
    });
    

     
    this.grid = Ext.create('Ext.grid.Panel', {

    	//title: 'Projection Population',
      selType: 'cellmodel',
      border : 0,
      margin : '0 5 5 5',
      store : this.store,
      height : 400,
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
    
   // var cmbData=[];
    var cmbData ={};
    var rows = definition.demographicTrends;
    
//    if (definition.demographicTrends2 == undefined)
//  	{
//  	definition.demographicTrends2= definition.demographicTrends;
//  	}

    //this.Output2 = definition.demographicTrends;
    
    //var rows = this.Output2;

    var st='[';
    for (var i = 0; i< rows.length; i++) 
   	{
    	 st = st + '{\"label\":' + '\"' + rows[i].label+ '\"},';
   	}
    st = st.substring(0,st.length-1) + ']'; 
    if (st == ']')
  	{
  	   st = '[]';
  	}
 
    this.cmbStore = Ext.create('Ext.data.Store', {
    	//autoLoad : true,
      fields: ['label'],
      data : JSON.parse(st)
  });
    

    this.cmb=Ext.create('Ext.form.field.ComboBox', {
	    extend : 'Aura.Util.RemoteComboBox',
      fieldLabel: 'Choose Trend',
      //width: 500,
      labelWidth: 200,
      store: this.cmbStore,
      //data : cmbData,
      queryMode: 'local',
      displayField: 'label',
      valueField: 'label',        
      autoLoad : false,
      multiSelect : false,
      forceSelection: true,
      projectId : null,
      editable : true,
      allowBlank : false,
      emptyText : "Choose Trendo",
      //renderTo: Ext.getBody()
      listeners: { 
      	 change: function (cb, newValue, oldValue, options) {
           console.log(newValue, oldValue);
           if (oldValue != undefined){
          	  me.saveGrid(oldValue);               
           }
            me.loadGrid(newValue);
         }
      }
  });
    
    this.cmb.bindStore(this.cmbStore);
    
    
    var enumDistrictFieldSet = Ext.create('Ext.form.FieldSet', {
      columnWidth : 0.5,
      title : 'Trends',
      collapsible : true,
      margin : '15 5 5 0',
      defaults : {
        bodyPadding : 10,
        anchor : '90%'
      },
      items : [this.cmb]
    });
    
    
    
    this.items = [enumDistrictFieldSet,this.grid];
    
    this.callParent(arguments);
  },
  listeners : {
    activate : function() {
      _.log(this, 'activate');
      //this.build(this.fillcombo());
      this.build();
      
      
      var definition = this.project.getDefinition(); 
      this.Output2 = definition.demographicTrends;
      //this.Output2 = definition.demographicTrends;
      
//      if (definition.demographicTrends2 == undefined)
//    	{
//    	definition.demographicTrends2= definition.demographicTrends;
//    	}
//
//      this.Output2 = definition.demographicTrends2;
      
      
      
      //this.cmb.setValue("");
      //this.build(function() { this.fillcombo;  if (callback) { callback(); }});
    }
  },
  
  loadGrid : function(cmbValue) {	
    var me = this, projectId = this.project.projectId;
    me.isLoadingExisting = true;
   
    var definition = this.project.getDefinition();

    var storeDataNew = [];
       
    //if (definition.demographicTrends != undefined)
    if (this.Output2 != undefined)
    {
	    //var mainrows = definition.demographicTrends;
	    var mainrows = this.Output2;
	    //for projection population 
		   var lsw1 = false;
 		 
 		  var storeData = [];
 		  
 	    var sectors = definition.sectors;
 	    for (var i=0; i <sectors.length; i++)
 	    	{
 		    	 var mjson0Str='{';
 		   	   mjson0Str = mjson0Str + '\"_id\" :' + '\"' + sectors[i].label +'\",';
 		   	   mjson0Str = mjson0Str + '\"item\" :' + '\"' + sectors[i].label +'\",';
 		       for (var m = 2; m < me.modelfields.count(); m++)
 		       {      
 		      	    var myear=me.modelfields[m];
 		      	    mjson0Str = mjson0Str + '\"' + myear + '\"' + ':0,';
 		       }
 	   	     mjson0Str = mjson0Str.substring(0,mjson0Str.length-1) + '}';  
 	  		  storeData.push(JSON.parse(mjson0Str));
 	   	  
 	    	}
 		  
		  
 	    this.store.removeAll();
 	    this.grid.getSelectionModel().deselectAll();
 	    this.store.loadData(storeData);	 
 	    this.grid.reconfigure(this.store, this.gridfields);
 		   

      this.store.each(function(record,idx){
        val = record.get('_id');
 
       var totalRows =  mainrows.count(); 
       for (var l = 0; l < totalRows; l++)
       {      
           if (mainrows[l].label == cmbValue)    
           {
//                   var cnt0= mainrows[l].demographicData.count();
//                   for (var j = 0; j < cnt0; j++)
//                    {      
//                          if (mainrows[l].demographicData[j]["@class"] == ".EmploymentDemographicData" )
//                          {
                            var sectors = definition.sectors;
                       	    for (var i=0; i <sectors.length; i++)
                       	    	{
	                         	     var jsonStr='{';
	                     		   	    jsonStr = jsonStr + '\"_id\" :' + '\"' + sectors[i].label +'\",';
	                     		   	    jsonStr = jsonStr + '\"item\" :' + '\"' + sectors[i].label +'\",';
	                     		   	    
	                     		       if (val == sectors[i].label)
                                 {
//                                      if (lsw1 == false)
//                                      {   
                                            for (var m = 0; m < me.modelfields.count(); m++)
                                            {
                                                    var cnt01 = mainrows[l].demographicData.count();
                                                    for (var v = 0; v < cnt01; v++)
                                                    {      
                                                      if (mainrows[l].demographicData[v]["@class"] == ".EmploymentDemographicData" )
                                                        {
                                                           if ( me.modelfields[m] == mainrows[l].demographicData[v].projectionLabel)
                                                           {       
                                                          	    
                                                                var myear=me.modelfields[m];
                                                                if ( mainrows[l].demographicData[v].sectorLabel == sectors[i].label)
                                                                	{
                                                                jsonStr = jsonStr + '\"' + myear + '\"' + ':' + mainrows[l].demographicData[v].employees + ',';
                                                                	}
                                                            }//end if ( me.modelfields[m]
                                                         }//end if (mainrows[l]
                                                     }//end for (var v = 0
                                               }//end for (var m = 0
			                                         jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}'; 
			                                         storeDataNew.push(JSON.parse(jsonStr));       
			                                         lsw1 = true;
                                       //}//end if lsw
                                  }//end if (sectors[i].label)
                       	    	}// end for sectors
                                  
                                  
                          //}//end if (mainrows[l].demographicData[j]["@class"]
                   //} //end for (var j = 0
           }//end if (mainrows[l].label == cmbValue)    
                
       }//end for (var l = 0)
     
   }); //end this.store
 	    
 	    
 	    
    }//end if definition.demographicTrends
    
   
    if (storeDataNew.length>0)
    	{
		    this.store.removeAll();
		    this.grid.getSelectionModel().deselectAll();
		    this.store.loadData(storeDataNew);	 
		    this.grid.reconfigure(this.store, this.gridfields);

    	}
    
    
     return true;
   
  }, //end build function
  
  
  saveGrid : function(cmbValue) {	
    var me = this, projectId = this.project.projectId;
    me.isLoadingExisting = true;
   
    var definition = this.project.getDefinition();

    var storeDataNew = [];
		    
		    var demographicData = [];
		    //saving projection population
		    var jsonStrTotal='';
		  	 for (var m = 2; m < this.modelfields.count(); m++)
		     {
//		  		  jsonStr='{';
//		  		  jsonStr = jsonStr + '\"@class\" :' + '\".EmploymentDemographicData\",';
//		  		  jsonStr = jsonStr + '\"projectionLabel\" :\"' +this.modelfields[m] + '\",'; 
		 	 
		  	    var i = 0;
		  	    
		  	    var sectors = definition.sectors;
       	    for (var z=0; z <sectors.length; z++)
       	    	{
       	    	
			       	    jsonStr='{';
			 		  		  jsonStr = jsonStr + '\"@class\" :' + '\".EmploymentDemographicData\",';
			 		  		  jsonStr = jsonStr + '\"projectionLabel\" :\"' +this.modelfields[m] + '\",'; 
       	    	    var slbl = sectors[z].label;
       	    	    
       	    	   this.store.each(function(record,idx){
  		  	         i = i + 1;  
  		  	         //var x= '\"' +record.get('_id') + '\"';
  		  	         if (record.get('_id') == slbl)
  		  	        	 {
  		  	        	      jsonStr = jsonStr + '\"sectorLabel\" :\"' +slbl + '\",'; 
			  		  	         var x1 =  ':' + 0 +',';
			  		  	         if (record.get(me.modelfields[m]) =='' || record.get(me.modelfields[m]) ==null)
			  		  	        	 { 
			  		  	        	     x1 =  ':' + 0 +',';
			  		  	        	 }
			  		  	         else
			  		  	        	 {  
			  		  	        	    x1 =  ':' + record.get(me.modelfields[m]) +',';
			  		  	        	 }
			  		  	        
			  		  	          jsonStr = jsonStr + '\"employees\"' + x1; 
  		  	        	  }	 
	  		  	        });
		  		  	     jsonStr = jsonStr.substring(0,jsonStr.length-1);
		  		  	     jsonStr = jsonStr + '}'; 
		  		  	     
		  		  	     jsonStrTotal = jsonStrTotal + jsonStr + ',';
		  		  	     //jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}';
		  		  	     demographicData.push(JSON.parse(jsonStr));
       	    	}
		  	    
		  	    
		 
		     }
  	     
  	     var demographicTrends = [];
  	     jsonStrTotal = jsonStrTotal.substring(0,jsonStrTotal.length-1);
  	     var strNew = '[{';
  	     //strNew = strNew + '\"label\" :' + '\"' + me.cmb.getValue() + '\",';
  	     strNew = strNew + '\"label\" :' + '\"' + cmbValue + '\",';
  	     var strOld = '\"' + 'demographicData' + '\"' + ':[' + jsonStrTotal +']';
  	     strNew = strNew + strOld + '}]';  	     
  	     demographicTrends.push(JSON.parse(strNew));
  	     
  	     
  	     for (var l = 0; l < this.Output2.count(); l++)
  	    	 {
//  	    	     if (this.Output2[l].label == cmbValue)
//  	    	    	 {
//  	    	    	    //this.Output2[l].demographicData.add = JSON.parse('[' + jsonStrTotal + ']'); 
//  	    	    	 for(var t=0; t<this.Output2[l].demographicData.count(); t++)
//  	    	    		 {
//  	    	    		 if (this.Output2[l].demographicData[t]["@class"] == ".EmploymentDemographicData")
//  	    	    			 {
//  	    	    		        this.Output2[l].demographicData.removeAt(t);
//  	    	    			 }
//  	    	    		 }
//  	    	    	 }
  	    	      //this.Output2[l].demographicData.add(JSON.parse('[' + jsonStrTotal + ']'));
  	    	     //// this.Output2[l].demographicData = JSON.parse('[' + jsonStrTotal + ']');
  	    	 }
  	     
  	     
 	       var emp =[];
  	     
  	     
  	     emp.push(JSON.parse('[' + jsonStrTotal + ']'));
  	     
  	     for (var l = 0; l < this.Output2.count(); l++)
  	    	 {
  	    	 
  	    	     if (this.Output2[l].label == cmbValue)
  	    	    	 {
  	    	    	     ///this.Output[l].demographicData = JSON.parse('[' + jsonStrTotal + ']');
  	    	    	 }
  	    	  
  	    	 
		    	     if (this.Output2[l].label == cmbValue)
		  	    	 {
		  	    	    //this.Output[l].demographicData.add = JSON.parse('[' + jsonStrTotal + ']'); 
				  	    	 for(var t=0; t<this.Output2[l].demographicData.count(); t++)
				  	    		 {
				  	    		 if (this.Output2[l].demographicData[t]["@class"] == ".EmploymentDemographicData")
				  	    			 {
				  	    			      
				  	    		        ////this.Output[l].demographicData.removeAt(t);
				  	    			 }
				  	    		
						  	    	 else if (this.Output2[l].demographicData[t]["@class"] == ".ResidentialDemographicData")
						  	    	 {
						  	    		   emp[0].push(this.Output2[l].demographicData[t]);
						  	    	 }
				  	    		 }
				  	    }
		  	          //////this.Output[l].demographicData.add(JSON.parse('[' + jsonStrTotal + ']'));
  	    	 
  	    	 }	
  	     
  	     for (var l = 0; l < this.Output2.count(); l++)
	    	 {
	    	 
	    	     if (this.Output2[l].label == cmbValue)
	    	    	 {
	    	    	     this.Output2[l].demographicData = emp[0];
	    	    	 }
	    	 }
  	     
  	     
  	     
  	     
  	     var ccc=0;
     return true;
   
  }, //end build
  
  build : function() {	
    var me = this, projectId = this.project.projectId;
    me.isLoadingExisting = true;

   
    var definition = this.project.getDefinition();

    
    if (definition.demographicTrends != undefined)
    //if(this.Output2 != undefined)	
    {
    var rows = definition.demographicTrends;
    //var rows = this.Output2;
    var st='[';    
    for (var i = 0; i< rows.length; i++) 
   	{
    	 st = st + '{\"label\":' + '\"' + rows[i].label+ '\"},';
   	}
    st = st.substring(0,st.length-1) + ']';  
    
    var arr=[];
    arr.push(JSON.parse(st));
    this.cmbStore.removeAll();
    this.cmbStore.load(JSON.parse(st));
    this.cmb.store.loadData(JSON.parse(st),false);
    this.cmb.bindStore(this.cmbStore);
    }

     return true;
   
  }, //end build function
  

  
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

    if (me.cmb.getValue() != undefined){
 	   me.saveGrid(me.cmb.getValue());               
  }
   
    
    var definition = me.project.getDefinition(); 

    Ext.merge(definition, {
          demographicTrends:this.Output2
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
