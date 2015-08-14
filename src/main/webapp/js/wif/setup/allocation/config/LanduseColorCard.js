Ext.define('Wif.setup.allocation.config.LanduseColorCard', {
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
  title : 'Land Uses - Colors',
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
   	modelfields.push("associatedColors");
    var gfield_id = {
        text : "label",
        dataIndex : "label",
      };   
    
     
    this.combostore = Ext.create('Ext.data.Store', {
      fields : ["label"],
      data: this.comboData
   });
    
 
    
  this.assocLuCbox  = new Aura.ux.colorpicker.ColorPickerField( {
	
  });
  

   var gfield = {
   		xtype: 'gridcolumn',
       text : "color",
       dataIndex : "associatedColors",  
       flex : 4,
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
      

      autoScroll: true,
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

     var definition = me.project.getDefinition(); 
     
     console.log(me.project);
     console.log(me.project.existingLUAttributeName);
     var fieldname = me.project.existingLUAttributeName;
     //fieldname ="allocationLUs";
     
     var waitingMsg = Ext.MessageBox.wait('Please wait loading data...', 'Loading');
     me.loadGridRows(fieldname ,function (){
    	 waitingMsg.hide();
    // me.loadRows( function () {
 			me.fillcombo(function () {
 		   if (callback) { callback(); }	
 	      });
     // });
     });
   
  },
  
  fillcombo : function(callback) {
  	var me = this;
  	  me.storeData = [];
  	  
  	  //grid rows	
	 	  for (var i = 0; i < me.gridValues.count(); i++)
	 		{


//	 	 	      var datafield = {
//	 		          "label" : me.gridValues[i],
//	 		          "associatedColors" : [""]
//	 		        };
//	 	  	
	  	    var f1 = me.gridValues[i].split("@");
	 	  	  var c1 =[];
	 	  	  c1.push( f1[1]);
	 	 	    var datafield = {
 		          "label" : f1[0], //me.gridValues[i]
 		          "associatedColors" :c1
 		        };
	 	 	      
	        me.storeData.push(datafield);
	 		}  	  
  	  
		 	  
	 	  	me.store.loadData(me.storeData);
	 		
	 	  	 
	 	 	 	var definition = me.project.getDefinition(); 
		    if (!(definition.colorALUs == undefined))
		    {
		        var rows = definition.colorALUs;
			      for (var i = 0; i< rows.length; i++) 
			      	{
			      	   var lbl =  rows[i].label;
		      	  	 var obj = rows[i].associatedColors;

				     	  	me.store.each(function(record,idx){
                  val = record.get('label');  
          		    if (val == lbl)
          		    {
          		         val1 = record.set('associatedColors', obj);
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
		    val1 = record.get('associatedColors');
		    if (val1 == "")
		    	{
		    	val1 ="#FFFFFF"
		    	}
		    plannedALUs =[];
		   str= str + '{' + '\"' + 'label' + '\"' + ':' + '\"' + val + '\"' + ',' + '\"' + 'associatedColors' + '\"' + ':' + '\"' + val1 + '\"';
		    
  	    if (indx < cnt)
		    	{
		  
		    		 str= str + '},';
		    	}
				else
		     {
					str= str + '}';
		     }

		   
		     indx = indx + 1;

	    });
  	 
  	 str= str + ']';
  	 
     //str = str + ']';
  	 
  	 var definition = me.project.getDefinition(); 
  	 
     Ext.merge(definition, {
	    	colorALUs : JSON.parse(str)
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
         , url: Wif.endpoint + 'projects/' + me.project.projectId + '/unionAttributes/colorsforaluconfig/'  //unionAttributesfixed
         , method: "get"
         , headers: {
           "X-AURIN-USER-ID": Wif.userId
           }
         };


       _.log(me, 'URL', Wif.endpoint + 'projects/' + me.project.projectId + '/unionAttributes/colorsforaluconfig/');  //unionAttributesfixed
     function serviceHandler(data, status) {
       _.log(me, 'loaded combo rows before', me);
       me.gridValues = data;
           
       _.log(me, 'loaded combo rows after', me.gridValues);
      if (callback) { callback(); }
     }

       Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

   }
  
});
