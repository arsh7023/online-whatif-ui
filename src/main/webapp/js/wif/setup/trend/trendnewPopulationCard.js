Ext.define('Wif.setup.trend.trendnewPopulationCard', {
	extend : 'Ext.form.Panel',
  project : null,
  title : 'Demogrhapic Trends',
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
  
    this.Output = [];
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
       
    if (definition.projections==undefined)
    	{
    	alert("Please complete demand setup first");
    	}
    
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
    
    var jsonStr='{';
	  jsonStr = jsonStr + '\"_id\" :' + '\"totalPopulation\",';
	  jsonStr = jsonStr + '\"item\" :' + '\"totalPopulation\",';
	  
    var jsonStr1='{';
	  jsonStr1 = jsonStr1 + '\"_id\" :' + '\"housingUnits\",';
	  jsonStr1 = jsonStr1 + '\"item\" :' + '\"housingUnits\",';
	  
    var jsonStr2='{';
	  jsonStr2 = jsonStr2 + '\"_id\" :' + '\"averageHouseholdSize\",';
	  jsonStr2 = jsonStr2 + '\"item\" :' + '\"averageHouseholdSize\",';
	  
    for (var m = 2; m < me.modelfields.count(); m++)
    {      
   	    var myear=me.modelfields[m];
  		  jsonStr = jsonStr + '\"' + myear + '\"' + ':0,';
  		  jsonStr1 = jsonStr1 + '\"' + myear + '\"' + ':0,';
  		  jsonStr2 = jsonStr2 + '\"' + myear + '\"' + ':0,';
    
    }
    jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}';  
	  storeData.push(JSON.parse(jsonStr));
	  jsonStr1 = jsonStr1.substring(0,jsonStr1.length-1) + '}';      		  
	  storeData.push(JSON.parse(jsonStr1));
	  jsonStr2 = jsonStr2.substring(0,jsonStr2.length-1) + '}';   		  
	  storeData.push(JSON.parse(jsonStr2));
  
      
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
    
   // var cmbData=[];
    var cmbData ={};
    
//    if (definition.demographicTrends1 == undefined)
//  	{
//  	definition.demographicTrends1= definition.demographicTrends;
//  	}

    //this.Output = definition.demographicTrends;
    
    var rows = definition.demographicTrends;
    //var rows = this.Output;

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
//        ,
//        select: function() {
//           me.dirty = true;
//           me.loadGrid();
//        }
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
      this.Output = definition.demographicTrends;
      //this.Output = definition.demographicTrends
//      if (definition.demographicTrends1 == undefined)
//      	{
//      	definition.demographicTrends1= definition.demographicTrends;
//      	}
//
//        this.Output = definition.demographicTrends1;
      
      //this.build(function() { this.fillcombo;  if (callback) { callback(); }});
    }
  },
  
  loadGrid : function(cmbValue) {	
    var me = this, projectId = this.project.projectId;
    me.isLoadingExisting = true;
   
    var definition = this.project.getDefinition();

    var storeDataNew = [];
       
    //if (definition.demographicTrends != undefined)
    if (this.Output != undefined)
    {
	    //var mainrows = definition.demographicTrends;
	    var mainrows = this.Output;
	    //for projection population 
		   var lsw1 = false;
 		   var lsw2 = false;
 		   var lsw3 = false;
 		   
 		   
 		  var storeData = [];
 	     var json0Str='{';
 		  json0Str = json0Str + '\"_id\" :' + '\"totalPopulation\",';
 		  json0Str = json0Str + '\"item\" :' + '\"totalPopulation\",';
 		  
 	    var json0Str1='{';
 		  json0Str1 = json0Str1 + '\"_id\" :' + '\"housingUnits\",';
 		  json0Str1 = json0Str1 + '\"item\" :' + '\"housingUnits\",';
 		  
 	    var json0Str2='{';
 		  json0Str2 = json0Str2 + '\"_id\" :' + '\"averageHouseholdSize\",';
 		  json0Str2 = json0Str2 + '\"item\" :' + '\"averageHouseholdSize\",';
 		  
 	    for (var m = 2; m < me.modelfields.count(); m++)
 	    {      
 	   	    var myear=me.modelfields[m];
 	  		  json0Str = json0Str + '\"' + myear + '\"' + ':0,';
 	  		  json0Str1 = json0Str1 + '\"' + myear + '\"' + ':0,';
 	  		  json0Str2 = json0Str2 + '\"' + myear + '\"' + ':0,';
 	    
 	    }
 	    json0Str = json0Str.substring(0,json0Str.length-1) + '}';  
 		  storeData.push(JSON.parse(json0Str));
 		  json0Str1 = json0Str1.substring(0,json0Str1.length-1) + '}';      		  
 		  storeData.push(JSON.parse(json0Str1));
 		  json0Str2 = json0Str2.substring(0,json0Str2.length-1) + '}';   		  
 		  storeData.push(JSON.parse(json0Str2));
 		  
 	    this.store.removeAll();
 	    this.grid.getSelectionModel().deselectAll();
 	    this.store.loadData(storeData);	 
 	    this.grid.reconfigure(this.store, this.gridfields);
 		   
 		   
 		   
 		   
//	    this.store.each(function(record,idx){
//	      val = record.get('_id');
//	
//	   	 for (var l = 0; l < mainrows.count(); l++)
//	     { 	 
//	   		//if (mainrows[l].label == me.cmb.getValue()) 
//	   			if (mainrows[l].label == cmbValue) 	
//	   		{
//	   		for (var j = 0; j < mainrows[l].demographicData.count(); j++)
//	      { 	 
//		   		 if (mainrows[l].demographicData[j]["@class"] == ".ResidentialDemographicData" )
//		   		 {
//	           var jsonStr='{';
//	     		   jsonStr = jsonStr + '\"_id\" :' + '\"totalPopulation\",';
//	     		   jsonStr = jsonStr + '\"item\" :' + '\"totalPopulation\",';
//	     		   
//	           var jsonStr1='{';
//	     		   jsonStr1 = jsonStr1 + '\"_id\" :' + '\"housingUnits\",';
//	     		   jsonStr1 = jsonStr1 + '\"item\" :' + '\"housingUnits\",';
//	     		   
//	           var jsonStr2='{';
//	     		   jsonStr2 = jsonStr2 + '\"_id\" :' + '\"averageHouseholdSize\",';
//	     		   jsonStr2 = jsonStr2 + '\"item\" :' + '\"averageHouseholdSize\",';
//	     		   
//
//	     		   
//		   			 if (val == 'totalPopulation')
//		   			 {
//		   				  if (lsw1 == false)
//		   				  {	
//				   				for (var m = 0; m < me.modelfields.count(); m++)
//				           {
//				   					 var cnt = mainrows.count();
//					   				 for (var x = 0; x < cnt; x++)
//					   		     { 	 
//					   					 var cnt01 = mainrows[x].demographicData.count();
//					   		   		 for (var v = 0; v < cnt01; v++)
//					   		       { 	 
//					   		   		   if (mainrows[x].demographicData[v]["@class"] == ".ResidentialDemographicData" )
//						   		   		 {
//							   		   			if ( me.modelfields[m] == mainrows[x].demographicData[v].projectionLabel)
//								          	{		
//								            	  var myear=me.modelfields[m];
//									         		  jsonStr = jsonStr + '\"' + myear + '\"' + ':' + mainrows[x].demographicData[v][val] + ',';
//								          	}//end if ( me.modelfields[m] 
//						   		   		  }//end if (mainrows[x]
//					   		        }//end for (var v = 0
//					   		      }//end for (var x = 0
//					   		   	}//end for (var m = 0
//				         	  jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}';  
//			         		  storeDataNew.push(JSON.parse(jsonStr));		
//			         		  lsw1 = true;
//		   				   }//end if lsw
//			         }//end if (val == 'totalPopulation')
//		   			 
//		   			 if (val == 'housingUnits')
//		   			 {
//		   				  if (lsw2 == false)
//		   				  {	
//				   				for (var m = 0; m < me.modelfields.count(); m++)
//				           {		   					
//				   					 var cnt = mainrows.count();
//					   				 for (var x = 0; x < cnt; x++)
//					   		     { 	  
//					   					 var cnt01 = mainrows[x].demographicData.count();
//					   		   		 for (var v = 0; v < cnt01; v++)
//					   		       { 	 
//					   		   		   if (mainrows[x].demographicData[v]["@class"] == ".ResidentialDemographicData" )
//						   		   		 {
//							   		   			if ( me.modelfields[m] == mainrows[x].demographicData[v].projectionLabel)
//								          	{		
//								            	  var myear=me.modelfields[m];
//									         		  jsonStr1 = jsonStr1 + '\"' + myear + '\"' + ':' + mainrows[x].demographicData[v][val] + ',';
//								          	}//end if ( me.modelfields[m] 
//						   		   		  }//end if (mainrows[x]
//					   		        }//end for (var v = 0
//					   		      }//end for (var x = 0
//					   		   	}//end for (var m = 0
//				         	  jsonStr1 = jsonStr1.substring(0,jsonStr1.length-1) + '}';  
//			         		  storeDataNew.push(JSON.parse(jsonStr1));		
//			         		  lsw2 = true;
//		   				   }
//			         }//end if (val == 'totalPopulation')		   			 
//
//		   			 if (val == 'averageHouseholdSize')
//		   			 {
//		   				  if (lsw3 == false)
//		   				  {	
//				   				for (var m = 0; m < me.modelfields.count(); m++)
//				           {		   					
//				   					 var cnt = mainrows.count();
//					   				 for (var x = 0; x < cnt; x++)
//					   		     { 	  
//					   					 var cnt01 = mainrows[x].demographicData.count();
//					   		   		 for (var v = 0; v < cnt01; v++)
//					   		       { 	 
//					   		   		   if (mainrows[x].demographicData[v]["@class"] == ".ResidentialDemographicData" )
//						   		   		 {
//							   		   			if ( me.modelfields[m] == mainrows[x].demographicData[v].projectionLabel)
//								          	{		
//								            	  var myear=me.modelfields[m];
//									         		  jsonStr2 = jsonStr2 + '\"' + myear + '\"' + ':' + mainrows[x].demographicData[v][val] + ',';
//								          	}//end if ( me.modelfields[m] 
//						   		   		  }//end if (mainrows[x]
//					   		        }//end for (var v = 0
//					   		      }//end for (var x = 0
//					   		   	}//end for (var m = 0
//				         	  jsonStr2 = jsonStr2.substring(0,jsonStr2.length-1) + '}';  
//			         		  storeDataNew.push(JSON.parse(jsonStr2));	
//			         		  lsw3 = true;
//		   				   }
//			         }//end if (val == 'totalPopulation')		   			 
//		   			 
//  					   				
//			   				
//	   				 }//end if (mainrows[l].demographicData[j]["@class"]
//	        } //end for (var j = 0
//	      }//end for (var l = 0)
//	     }
//	    
//     }); //end this.store
 	    
 	 
      this.store.each(function(record,idx){
        val = record.get('_id');
 
       var totalRows =  mainrows.count(); 
       for (var l = 0; l < totalRows; l++)
       {      
             //if (mainrows[l].label == me.cmb.getValue())
           if (mainrows[l].label == cmbValue)    
           {
                   var cnt0= mainrows[l].demographicData.count();
                   for (var j = 0; j < cnt0; j++)
                    {      
                          if (mainrows[l].demographicData[j]["@class"] == ".ResidentialDemographicData" )
                          {
		                         var jsonStr='{';
		                              jsonStr = jsonStr + '\"_id\" :' + '\"totalPopulation\",';
		                              jsonStr = jsonStr + '\"item\" :' + '\"totalPopulation\",';
		                             
		                         var jsonStr1='{';
		                              jsonStr1 = jsonStr1 + '\"_id\" :' + '\"housingUnits\",';
		                              jsonStr1 = jsonStr1 + '\"item\" :' + '\"housingUnits\",';
		                             
		                         var jsonStr2='{';
		                              jsonStr2 = jsonStr2 + '\"_id\" :' + '\"averageHouseholdSize\",';
		                              jsonStr2 = jsonStr2 + '\"item\" :' + '\"averageHouseholdSize\",';
		                         
     
                         
                                  if (val == 'totalPopulation')
                                  {
                                       if (lsw1 == false)
                                       {   
                                             for (var m = 0; m < me.modelfields.count(); m++)
                                             {
                                                     var cnt01 = mainrows[l].demographicData.count();
                                                     for (var v = 0; v < cnt01; v++)
                                                     {      
                                                       if (mainrows[l].demographicData[v]["@class"] == ".ResidentialDemographicData" )
                                                         {
                                                            if ( me.modelfields[m] == mainrows[l].demographicData[v].projectionLabel)
                                                            {       
                                                                 var myear=me.modelfields[m];
                                                                 jsonStr = jsonStr + '\"' + myear + '\"' + ':' + mainrows[l].demographicData[v][val] + ',';
                                                             }//end if ( me.modelfields[m]
                                                          }//end if (mainrows[x]
                                                      }//end for (var v = 0
                                                }//end for (var m = 0
			                                         jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}'; 
			                                         storeDataNew.push(JSON.parse(jsonStr));       
			                                         lsw1 = true;
                                        }//end if lsw
                                   }//end if (val == 'totalPopulation')
                                  
                                  if (val == 'housingUnits')
                                  {
                                       if (lsw2 == false)
                                       {   
                                             for (var m = 0; m < me.modelfields.count(); m++)
                                             {
                                                     var cnt01 = mainrows[l].demographicData.count();
                                                     for (var v = 0; v < cnt01; v++)
                                                     {      
                                                       if (mainrows[l].demographicData[v]["@class"] == ".ResidentialDemographicData" )
                                                         {
                                                            if ( me.modelfields[m] == mainrows[l].demographicData[v].projectionLabel)
                                                            {       
                                                                 var myear=me.modelfields[m];
                                                                 jsonStr1 = jsonStr1 + '\"' + myear + '\"' + ':' + mainrows[l].demographicData[v][val] + ',';
                                                             }//end if ( me.modelfields[m]
                                                          }//end if (mainrows[x]
                                                      }//end for (var v = 0
                                                }//end for (var m = 0
			                                         jsonStr1 = jsonStr1.substring(0,jsonStr1.length-1) + '}'; 
			                                         storeDataNew.push(JSON.parse(jsonStr1));       
			                                         lsw2 = true;
                                        }//end if lsw2
                                   }//end if (val == 'housingUnits')    
                                  
                                  
                                  if (val == 'averageHouseholdSize')
                                  {
                                       if (lsw3 == false)
                                       {   
                                             for (var m = 0; m < me.modelfields.count(); m++)
                                             {
                                                     var cnt01 = mainrows[l].demographicData.count();
                                                     for (var v = 0; v < cnt01; v++)
                                                     {      
                                                       if (mainrows[l].demographicData[v]["@class"] == ".ResidentialDemographicData" )
                                                         {
                                                            if ( me.modelfields[m] == mainrows[l].demographicData[v].projectionLabel)
                                                            {       
                                                                 var myear=me.modelfields[m];
                                                                 jsonStr2 = jsonStr2 + '\"' + myear + '\"' + ':' + mainrows[l].demographicData[v][val] + ',';
                                                             }//end if ( me.modelfields[m]
                                                          }//end if (mainrows[x]
                                                      }//end for (var v = 0
                                                }//end for (var m = 0
			                                         jsonStr2 = jsonStr2.substring(0,jsonStr2.length-1) + '}'; 
			                                         storeDataNew.push(JSON.parse(jsonStr2));       
			                                         lsw3 = true;
                                        }//end if lsw3
                                   }//end if (val == 'averageHouseholdSize')                                      
                                  
                                  
                          }//end if (mainrows[l].demographicData[j]["@class"]
                   } //end for (var j = 0
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
		    
		    /*
		    var demographicData = [];
		    //saving projection population
		    var jsonStrTotal='';
		  	 for (var m = 2; m < this.modelfields.count(); m++)
		     {
		  		  jsonStr='{';
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
		  	     jsonStr = jsonStr + '\"vacantLand\" : null,'; 
		  	     jsonStr = jsonStr + '\"gQPopulation\" : 1}'; 
		  	     
		  	     jsonStrTotal = jsonStrTotal + jsonStr + ',';
		  	     //jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}';
		  	     demographicData.push(JSON.parse(jsonStr));
		 
		     }
  	     
  	     var demographicTrends = [];
  	     jsonStrTotal = jsonStrTotal.substring(0,jsonStrTotal.length-1);
  	     var strNew = '[{';
  	     //strNew = strNew + '\"label\" :' + '\"' + me.cmb.getValue() + '\",';
  	     strNew = strNew + '\"label\" :' + '\"' + cmbValue + '\",';
  	     var strOld = '\"' + 'demographicData' + '\"' + ':[' + jsonStrTotal +']';
  	     strNew = strNew + strOld + '}]';
  	     
  	     demographicTrends.push(JSON.parse(strNew));
  	     var ccc=0;
		    
		    	*/
    	}
    
    
//    
//    // var cmbData=[];
//    var rows = definition.demographicTrends;
//    var st='[';    
//    for (var i = 0; i< rows.length; i++) 
//   	{
//    	 st = st + '{\"label\":' + '\"' + rows[i].label+ '\"},';
//   	}
//    st = st.substring(0,st.length-1) + ']';  
//    
//    var arr=[];
//    arr.push(JSON.parse(st));
//    this.cmbStore.removeAll();
//    //this.cmbStore.loadData(JSON.parse(st));	
//    //this.cmb.store.loadData(JSON.parse(st),false);	
//    //this.cmb.reset();
//     
//    
//    //var comboStore = this.cmb.store;
//
//    //comboStore.loadData(JSON.parse(st), false);
//    this.cmbStore.load(JSON.parse(st));
//    this.cmb.store.loadData(JSON.parse(st),false);
//    this.cmb.bindStore(this.cmbStore);

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
		  		  jsonStr='{';
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
		  	     jsonStr = jsonStr + '\"vacantLand\" : null,'; 
		  	     jsonStr = jsonStr + '\"gQPopulation\" : 1}'; 
		  	     
		  	     jsonStrTotal = jsonStrTotal + jsonStr + ',';
		  	     //jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}';
		  	     demographicData.push(JSON.parse(jsonStr));
		 
		     }
  	     
  	     var demographicTrends = [];
  	     jsonStrTotal = jsonStrTotal.substring(0,jsonStrTotal.length-1);
  	     var strNew = '[{';
  	     //strNew = strNew + '\"label\" :' + '\"' + me.cmb.getValue() + '\",';
  	     strNew = strNew + '\"label\" :' + '\"' + cmbValue + '\",';
  	     var strOld = '\"' + 'demographicData' + '\"' + ':[' + jsonStrTotal +']';
  	     strNew = strNew + strOld + '}]';  	     
  	     demographicTrends.push(JSON.parse(strNew));
  	     
  	     var emp =[];
  	     
  	     
  	     emp.push(JSON.parse('[' + jsonStrTotal + ']'));
  	     
  	     for (var l = 0; l < this.Output.count(); l++)
  	    	 {
  	    	 
  	    	     if (this.Output[l].label == cmbValue)
  	    	    	 {
  	    	    	     ///this.Output[l].demographicData = JSON.parse('[' + jsonStrTotal + ']');
  	    	    	 }
  	    	  
  	    	 
		    	     if (this.Output[l].label == cmbValue)
		  	    	 {
		  	    	    //this.Output[l].demographicData.add = JSON.parse('[' + jsonStrTotal + ']'); 
				  	    	 for(var t=0; t<this.Output[l].demographicData.count(); t++)
				  	    		 {
				  	    		 if (this.Output[l].demographicData[t]["@class"] == ".ResidentialDemographicData")
				  	    			 {
				  	    			      
				  	    		        ////this.Output[l].demographicData.removeAt(t);
				  	    			 }
				  	    		
						  	    	 else if (this.Output[l].demographicData[t]["@class"] == ".EmploymentDemographicData")
						  	    	 {
						  	    		   emp[0].push(this.Output[l].demographicData[t]);
						  	    	 }
				  	    		 }
				  	    }
		  	          //////this.Output[l].demographicData.add(JSON.parse('[' + jsonStrTotal + ']'));
  	    	 
  	    	 }
  	     
  	     for (var l = 0; l < this.Output.count(); l++)
	    	 {
	    	 
	    	     if (this.Output[l].label == cmbValue)
	    	    	 {
	    	    	     this.Output[l].demographicData = emp[0];
	    	    	 }
	    	 }
  	     
  	     
  	     var ccc=0;
     return true;
   
  }, //end build
  
  build : function() {	
    var me = this, projectId = this.project.projectId;
    me.isLoadingExisting = true;

   
    var definition = this.project.getDefinition();


    
    /*
    var storeDataNew = [];
       
    if (definition.demographicTrends != undefined)
    {
	    var mainrows = definition.demographicTrends;
	    //for projection population 
		   var lsw1 = false;
 		   var lsw2 = false;
 		   var lsw3 = false;
	    this.store.each(function(record,idx){
	      val = record.get('_id');
	
	   	 for (var l = 0; l < mainrows.count(); l++)
	     { 	  
	   		for (var j = 0; j < mainrows[l].demographicData.count(); j++)
	      { 	 
		   		 if (mainrows[l].demographicData[j]["@class"] == ".ResidentialDemographicData" )
		   		 {
	           var jsonStr='{';
	     		   jsonStr = jsonStr + '\"_id\" :' + '\"totalPopulation\",';
	     		   jsonStr = jsonStr + '\"item\" :' + '\"totalPopulation\",';
	     		   
	           var jsonStr1='{';
	     		   jsonStr1 = jsonStr1 + '\"_id\" :' + '\"housingUnits\",';
	     		   jsonStr1 = jsonStr1 + '\"item\" :' + '\"housingUnits\",';
	     		   
	           var jsonStr2='{';
	     		   jsonStr2 = jsonStr2 + '\"_id\" :' + '\"averageHouseholdSize\",';
	     		   jsonStr2 = jsonStr2 + '\"item\" :' + '\"averageHouseholdSize\",';
	     		   

	     		   
		   			 if (val == 'totalPopulation')
		   			 {
		   				  if (lsw1 == false)
		   				  {	
				   				for (var m = 0; m < me.modelfields.count(); m++)
				           {		   					
					   				 for (var x = 0; x < mainrows.count(); x++)
					   		     { 	  
					   		   		 for (var v = 0; v < mainrows[x].demographicData.count(); v++)
					   		       { 	 
					   		   		   if (mainrows[x].demographicData[v]["@class"] == ".ResidentialDemographicData" )
						   		   		 {
							   		   			if ( me.modelfields[m] == mainrows[x].demographicData[v].projectionLabel)
								          	{		
								            	  var myear=me.modelfields[m];
									         		  jsonStr = jsonStr + '\"' + myear + '\"' + ':' + mainrows[x].demographicData[v][val] + ',';
								          	}//end if ( me.modelfields[m] 
						   		   		  }//end if (mainrows[x]
					   		        }//end for (var v = 0
					   		      }//end for (var x = 0
					   		   	}//end for (var m = 0
				         	  jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}';  
			         		  storeDataNew.push(JSON.parse(jsonStr));		
			         		  lsw1 = true;
		   				   }//end if lsw
			         }//end if (val == 'totalPopulation')
		   			 
		   			 if (val == 'housingUnits')
		   			 {
		   				  if (lsw2 == false)
		   				  {	
				   				for (var m = 0; m < me.modelfields.count(); m++)
				           {		   					
					   				 for (var x = 0; x < mainrows.count(); x++)
					   		     { 	  
					   		   		 for (var v = 0; v < mainrows[x].demographicData.count(); v++)
					   		       { 	 
					   		   		   if (mainrows[x].demographicData[v]["@class"] == ".ResidentialDemographicData" )
						   		   		 {
							   		   			if ( me.modelfields[m] == mainrows[x].demographicData[v].projectionLabel)
								          	{		
								            	  var myear=me.modelfields[m];
									         		  jsonStr1 = jsonStr1 + '\"' + myear + '\"' + ':' + mainrows[x].demographicData[v][val] + ',';
								          	}//end if ( me.modelfields[m] 
						   		   		  }//end if (mainrows[x]
					   		        }//end for (var v = 0
					   		      }//end for (var x = 0
					   		   	}//end for (var m = 0
				         	  jsonStr1 = jsonStr1.substring(0,jsonStr1.length-1) + '}';  
			         		  storeDataNew.push(JSON.parse(jsonStr1));		
			         		  lsw2 = true;
		   				   }
			         }//end if (val == 'totalPopulation')		   			 

		   			 if (val == 'averageHouseholdSize')
		   			 {
		   				  if (lsw3 == false)
		   				  {	
				   				for (var m = 0; m < me.modelfields.count(); m++)
				           {		   					
					   				 for (var x = 0; x < mainrows.count(); x++)
					   		     { 	  
					   		   		 for (var v = 0; v < mainrows[x].demographicData.count(); v++)
					   		       { 	 
					   		   		   if (mainrows[x].demographicData[v]["@class"] == ".ResidentialDemographicData" )
						   		   		 {
							   		   			if ( me.modelfields[m] == mainrows[x].demographicData[v].projectionLabel)
								          	{		
								            	  var myear=me.modelfields[m];
									         		  jsonStr2 = jsonStr2 + '\"' + myear + '\"' + ':' + mainrows[x].demographicData[v][val] + ',';
								          	}//end if ( me.modelfields[m] 
						   		   		  }//end if (mainrows[x]
					   		        }//end for (var v = 0
					   		      }//end for (var x = 0
					   		   	}//end for (var m = 0
				         	  jsonStr2 = jsonStr2.substring(0,jsonStr2.length-1) + '}';  
			         		  storeDataNew.push(JSON.parse(jsonStr2));	
			         		  lsw3 = true;
		   				   }
			         }//end if (val == 'totalPopulation')		   			 
		   			 
  					   				
			   				
	   				 }//end if (mainrows[l].demographicData[j]["@class"]
	        } //end for (var j = 0
	      }//end for (var l = 0)
	    
     }); //end this.store
    }//end if definition.demographicTrends
    
    this.store.removeAll();
    this.grid.getSelectionModel().deselectAll();
    this.store.loadData(storeDataNew);	 
    this.grid.reconfigure(this.store, this.gridfields);
    
    */
    
    if (definition.demographicTrends != undefined)
    //if (this.Output != undefined)
    {
    var rows = definition.demographicTrends;
    //var rows = this.Output;
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

    
//    Ext.merge(definition, {
//      id: definition._id
//    });
    
    Ext.merge(definition, {
          //demographicTrends:this.Output
          demographicTrends:this.Output
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
