Ext.define('Wif.setup.allocation.config.PlannedLanduseDetailCard', {
	extend : 'Ext.form.Panel',
  requires: [
             'Wif.setup.allocation.config.AllocationConfigWizard',
             'Ext.data.*',
             'Ext.grid.*',
             'Ext.tree.*',
             'Ext.ux.CheckColumn',
             'Wif.RESTObject'
           ],
  project : null,
  title : 'Planned Land Uses - Details',
  storeData : [],
  isEditing: true, 
  isLoadingExisting: true,
  scenarioRows :[],
  comboData :[],
  gridValues : [],
    
  constructor : function(config) {
    var me = this;
    //this.preconstruct();
    Ext.apply(this, config);
    var projectId = me.project.projectId;
    
    var isnew = me.project.isnew;
    me.isLoadingExisting = true;

    this.gridfields = [];
   	var modelfields = [];
   	modelfields.push("label");
   	modelfields.push("associatedALUs");
    var gfield_id = {
        text : "label",
        dataIndex : "label",
      };   
    
     
    this.combostore = Ext.create('Ext.data.Store', {
      fields : ["_id", "label"],
      data: this.comboData
   });
    
   
   this.assocLuCbox = Ext.create('Aura.Util.RemoteComboBox', {
     extend : 'Ext.form.field.ComboBox',
     fields : ["_id", "label", "featureFieldName"],
     valueField : "label",
     displayField : "label",
     emptyText : "Select Existing Land Uses",
     multiSelect : true,
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
       url : Wif.endpoint + 'projects/' + projectId + '/allocationLUs/',
       method : "get",
       params : null,
       headers : {
         "X-AURIN-USER-ID" : Wif.userId
       }
     }
   });
    
    
//   var gfield = {
//    		xtype: 'gridcolumn',
//        text : "associatedALUs",
//        dataIndex : "associatedALUs",
////        editor: new Ext.form.field.ComboBox({
////          //typeAhead: true,
////          triggerAction: 'all',
////          selectOnTab: true,
//////          store: [
//////              ['Shade','Shade'],
//////              ['Mostly Shady','Mostly Shady'],	
//////              ['Sun or Shade','Sun or Shade'],
//////              ['Mostly Sunny','Mostly Sunny'],
//////              ['Sunny','Sunny']
//////          ],
////          multiSelect : true,
////          store : this.combostore,
////          lazyRender: true,
////          queryMode: 'local',
////          listClass: 'x-combo-list-small'
////      })
//   editor: {
//          xtype: 'combobox',
//          store: this.combostore,
//          multiSelect : true,
//          valueField : "label",
//          displayField : "label"
//      }
//   
//       // editor : this.assocLuCbox
//        //editor : this.multicombo
//      };
   
   var gfield = {
   		xtype: 'gridcolumn',
       text : "associatedALUs",
       dataIndex : "associatedALUs",  
       flex : 2,
       editor : this.assocLuCbox
     };   
   

    this.gridfields.push(gfield_id);
    this.gridfields.push(gfield);
    
    this.model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: modelfields    
     });
    
    
    this.store = Ext.create('Ext.data.Store', {
    	model: this.model,
    	data : this.storeData
    });
    

  
   this.grid =  Ext.create('Ext.grid.Panel', {
      store: this.store,
      columns : this.gridfields,
      height: 600,
      width: 790,
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
 
    this.items = [this.grid];
    this.callParent(arguments);
  },
  
  listeners : {
    activate : function() {
      _.log(this, 'activate');
      this.build();

    }
  },
  
  build : function() {	
     var me = this, projectId = this.project.projectId;
     me.isLoadingExisting = true;
     
     me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/allocationLUs/';
     me.assocLuCbox.load();
     
     var definition = me.project.getDefinition(); 
     var fieldname = definition.plannedALUsFieldName;
     //fieldname ="allocationLUs";
     var waitingMsg = Ext.MessageBox.wait('Please wait loading data...', 'Loading');
     me.loadGridRows(fieldname ,function (){
     me.loadRows( function () {
    	 waitingMsg.hide();
 			me.fillcombo(function () {
 		   if (callback) { callback(); }	
 	      });
      });
     });
   
  },
  
  fillcombo : function(callback) {
  	var me = this;
  	
   	
//	 	for (var j = 0; j < 1; j++)
//    {   
//      var datafield = {
//          "label" : j,
//          "associatedALUs" : j
//        };
//        
//      me.storeData.push(datafield);
//    }
	 	
	 	//me.store.data = me.storeData;
	   	//me.store.loadData(me.storeData);
  	  me.storeData = [];
  	  
  	  //grid rows	
	 	  for (var i = 0; i < me.gridValues.count(); i++)
	 		{

	 	 	      var datafield = {
	 		          "label" : me.gridValues[i],
	 		          "associatedALUs" : [""]
	 		        };
	 	  	
	        me.storeData.push(datafield);
	 		}  	  
  	  
	 	  //combo values
	 	  for (var i = 0; i < me.scenarioRows.count(); i++)
	 		{

//	 	 	      var datafield = {
//	 		          "label" : me.scenarioRows[i].label,
//	 		          "associatedALUs" : [""]
//	 		        };
	 	  	

	 	      var datacmb = {
	 	      		"_id" : me.scenarioRows[i]._id,
		          "label" : me.scenarioRows[i].label
		        };
	 	      
	        me.comboData.push(datacmb);
//	        me.storeData.push(datafield);
	 		}
  	  
	
 
	 	  me.store.removeAll();
	 	  me.combostore.removeAll();

		 	  if (me.combostore.data.length==0)
			  {

				 	  me.combostore.loadData(me.comboData);
			  }	
	 	  
	 	  	 	me.store.loadData(me.storeData);
	 		
	 	 	 	var definition = me.project.getDefinition(); 
		    if (!(definition.plannedALUs == undefined))
		    {
		        var rows = definition.plannedALUs;
			      for (var i = 0; i< rows.length; i++) 
			      	{
			      	   var lbl =  rows[i].label;
		      	  	 var obj = rows[i].associatedALUs;
					      
		      	  	 var asso="";
		     	       var x = 0;
		     	       var cnt = 0;
		     	       var arr=[];
		             for (var prop1 in obj) {
		                 cnt = cnt + 1;              
		             }
		     	       var indx = 1;
			           for (var prop in obj) {
			               if (obj.hasOwnProperty(prop)) { 
			              	    x =  obj[prop];
			               }
			               arr.push(x);
			               if (indx < cnt)
			              	 {
			              	     asso = asso + '\"' + x+ '\"' + ',';
			              	 }
			               else
			              	 {
			              	 asso = asso + '\"' + x+ '\"';
			              	 }
			               indx = indx + 1;
			               		               
			           }
			    	 	 
			           asso= asso +"";
				     	  	me.store.each(function(record,idx){
                  val = record.get('label');  
          		    if (val == lbl)
          		    {
          		         val1 = record.set('associatedALUs', arr);
				               record.commit();
          		    }				             
				         }); 
			      	
			      	}
			 		}	 	
	 	
	 	 this.grid.reconfigure(me.store, me.gridfields);
	 	 
	 	 
	 	 
	   	if (callback) { callback(); }
  },
  
  validate : function(callback) {
   var me = this;
   
     var cnt = me.store.data.length;
     var indx = 1;
     var str='[';
  	 me.store.each(function(record,idx){
		    val = record.get('label');   
		    val1 = record.get('associatedALUs');
		    plannedALUs =[];
		   str= str + '{' + '\"' + 'label' + '\"' + ':' + '\"' + val + '\"' + ',' + '\"' + 'associatedALUs' + '\"' + ':{';
		    
		    for (var i = 0; i < val1.count(); i++)
        {			    	
		      for (var j = 0; j < me.scenarioRows.count(); j++)
		    	 {
		    	    if (val1[i] == me.scenarioRows[j].label)
		    	    	{
		    	    	  if (i+1 < val1.count())
		    	    	  	{
		    	    	       str = str + '\"' + me.scenarioRows[j]._id + '\"' + ':' + '\"' +  me.scenarioRows[j].label + '\"' + ',';
		    	    	  	}
		    	    	  else
		    	    	  	{
		    	    	  	str = str + '\"' + me.scenarioRows[j]._id + '\"' + ':' + '\"' +  me.scenarioRows[j].label + '\"' + '}';
		    	    	  	}
		    	    	}
		      	}
         }
		    if (indx < cnt)
		    	{
		    	 if (val1.count() == 0)
		    		 {
		    		 str= str + '}},';
		    		 }
		    	 else
		      	{
			    	 if (val1[0]=="")
			    		 {
			    		 str= str + '}},';
			    		 }
			    	 else
			    		 {
			            str= str + '},';
			    		 }
		    	  }
		    	}
		    else
		    	{
		    	if (val1.count() == 0)
		    		{
		    		str= str + '}}';
		    		}
		    	else
		    		{
				    	 if (val1[0]=="")
			    		 {
			    		 str= str + '}}';
			    		 }
			    	 else
			    		 {
			            str= str + '}';
			    		 }
		    		}
		    	}
		   
		    indx = indx + 1;

	    });
  	 
  	 str= str + ']';
  	 
     //str = str + ']';
  	 
  	 var definition = me.project.getDefinition(); 
  	 
     Ext.merge(definition, {
	    	plannedALUs : JSON.parse(str)
	    });
  	 
  	 me.project.setDefinition(definition);
  	 
 	 if (callback) {
      callback();
    }
  	 
  },
  
  loadRows: function (callback) {
 	_.log(me, '333333');
   var me = this;
   _.log(me, 'loading rows', me);

     var serviceParams = {
        xdomain: "cors"
       , url: Wif.endpoint + 'projects/' + me.project.projectId + '/allocationLUs/'
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

 },
  
  loadGridRows: function (fieldname,callback) {
   	_.log(me, '333333');
     var me = this;
     _.log(me, 'loading combo rows', me);

       var serviceParams = {
          xdomain: "cors"
         , url: Wif.endpoint + 'projects/' + me.project.projectId + '/unionAttributes/' + fieldname + '/values/'
         , method: "get"
         , headers: {
           "X-AURIN-USER-ID": Wif.userId
           }
         };


       _.log(me, 'URL', Wif.endpoint + 'projects/' + me.project.projectId + '/unionAttributes/' + fieldname + '/values/');
     function serviceHandler(data, status) {
       _.log(me, 'loaded combo rows before', me);
       me.gridValues = data;
           
       _.log(me, 'loaded combo rows after', me.gridValues);
      if (callback) { callback(); }
     }

       Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

   }
  
});
