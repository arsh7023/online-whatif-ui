Ext.define('Wif.setup.demandnew.demandnewProjectionCard', {
	extend : 'Ext.form.Panel',
  requires: [
             'Ext.data.*',
             'Ext.grid.*',
             'Ext.tree.*',
             'Ext.ux.CheckColumn',
             'Wif.RESTObject'
           ],
  project : null,
  //title : 'Projection Years (including current year)',//claudia
  title : 'Projection Years',
  storeDataNew : [],
  isEditing: true, 
  isLoadingExisting: true,
  scenarioRows :[],
  comboDataNew :[],
    
  constructor : function(config) {
    var me = this;
    Ext.apply(this, config);
    var projectId = me.project.projectId;
    
    var isnew = me.project.isnew;
    me.isLoadingExisting = true;

    this.gridfields = [];
   	var modelfields = [];
   	modelfields.push("year");
    var gfield_id = {
        text : "year",
        dataIndex : "year",
        editor: {
          xtype: 'textfield',
          allowBlank: false
         }
      };   
    var delColumns = 
         {
           xtype : 'actioncolumn',
           width : 26,
           header: '',
           sortable : false,
           items : [{
             iconCls : 'wif-grid-row-delete',
             tooltip : 'Delete',
             handler : function(grid, rowIndex, colIndex) {
               grid.store.removeAt(rowIndex);
             }
           }]
         };
     
    this.combostore = Ext.create('Ext.data.Store', {
      fields : ["year"],
      data: this.comboDataNew
   });
 
   

    this.gridfields.push(gfield_id);
    this.gridfields.push(delColumns);
    
    
    this.model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: modelfields , 
      validations : [{
        type : 'format',
        field : 'year',
        matcher : /^[12][0-9]{3}$/  ///^\d{4}$/
      }]
     });
    
    this.store = Ext.create('Ext.data.Store', {
    	model: this.model,
    	data : this.storeDataNew
    });
    
    var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
    	clicksToEdit: 1
  });
    var cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit : 1
    });
  
   this.grid =  Ext.create('Ext.grid.Panel', {
      store: this.store,
      //selType: 'cellmodel',
      columns : this.gridfields,
      height: 500,
      width: 800,
      flex: 1,
     
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
	 	 	 	      		"year" : ""
	 	 		        };
	          	 store.insert(gridCount,datafield);
	          	 cellEditor.startEdit(gridCount, 0);

	         }
         }],
       }],
      plugins: [cellEditor]

  });
 
   /////////////////////
   var SaveBtn = Ext.create('Ext.Button', {
       text: 'Save',
       margin: '5 5 8 5',
       scale: 'small',
       handler: function() {  
     	    
       	   me.validate(function() {
     	      
       		 var waitingMsg = Ext.MessageBox.wait('Saving...', 'Saving');       	     
               Ext.merge(me.project.definition, {
               	includeTrends: false
               });
               
 
               Ext.Ajax.request({
                   url: Wif.endpoint + 'projects/' + me.project.projectId + '/demand/setup/',
                   method: 'put',
                   jsonData: me.project.definition,
                   headers: {
                       "X-AURIN-USER-ID": 'aurin',
                   },
                   success: function(response) {
                       console.log('demand setup updated.');
                       waitingMsg.hide();
                       var jresp = Ext.JSON.decode(response.responseText);
                       me.project.definition._rev = jresp._rev;
                       Ext.MessageBox.show({
                           title: 'Message',
                           msg: "Updated",
                           buttons: Ext.MessageBox.OK,
                       });
                      
                   },
                   failure: function(response, options) {

                       waitingMsg.hide();
                       var jresp = response.responseText;
                       Ext.MessageBox.alert(jresp);
                   }

               });
       		   
            });
        }//handler
   });      
   //////////////////////
   
    this.items = [SaveBtn,this.grid];
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
     
       me.storeDataNew = [];
		 	var definition = me.project.getDefinition(); 
	    if (!(definition.projections == undefined))
	    {
	        var rows = definition.projections;
		      for (var i = 0; i< rows.length; i++) 
		      	{
	      	   //claudia new if
	      	   if (definition.baseYear != rows[i].year)
	      	  	{ 
			            var datafield = {
			  	      		"year" : rows[i].year
			 	          };		  	
			 	          me.storeDataNew.push(datafield);
		        	}
	      	   //end claudia
		      	
		      	}
		 		}
 	 
	 	  me.store.removeAll();
	 	  
		 	me.store.loadData(me.storeDataNew);		 	

		 	
		 	 this.grid.reconfigure(me.store, me.gridfields);
   
  },
  
  fillcombo : function(callback) {
  	var me = this;
  	
  	  me.storeDataNew = [];
  	  
		 	var definition = me.project.getDefinition(); 
	    if (!(definition.projections == undefined))
	    {
	        var rows = definition.projections;
		      for (var i = 0; i< rows.length; i++) 
		      	{
		      	   //claudia new if
		      	   if (definition.baseYear != rows[i].year)
		      	  	 {
				            var datafield = {
				  	      		"year" : rows[i].year
				 	          };	 	  	
		 	              me.storeDataNew.push(datafield);
		      	  	 }
		      	   //end claudia
		      	
		      	}
		 		}
 	 
	 	  me.store.removeAll();
	 	  
		 	me.store.loadData(me.storeDataNew);		 	

		 	
		 	 this.grid.reconfigure(me.store, me.gridfields);
	 	 
	   	if (callback) { callback(); }
  },
  
  validate : function(callback) {

  	
    var me = this, gridValid = true;
    
    
    var newprojection=[];
    me.store.each(function(record,idx) {
     if (!record.isValid()) {
       _.log(this, 'validate', 'record is not valid');
       gridValid = false;
     }
     else
     {
     	var ar = {
               "year": record.get('year'),
               "label": record.get('year')
                };
     	newprojection.push(ar);
     }
   });
    var definition = me.project.getDefinition();
    
    //claudia new change
    if (!(definition.baseYear == undefined))
    	{
  	  var ar = {
        "year": definition.baseYear,
        "label": definition.baseYear
         };
  	  newprojection.push(ar);
    	}
    
    var gap=0;
    var obj = newprojection;
    if (obj.length>1)
    {	
	    ar =[];
	    for (var j = 0; j < obj.length; j++)
	    {
	    	 ar.push(obj[j].year);
	    }
	    ar.sort();
	    
	    if (ar[0] < definition.baseYear)
	    {
	    	gridValid = false;
	    }
	    
	    gap = ar[1] - ar[0];
	    if (gap == 0)
	    	{
	    	    gridValid = false;
	    	}
	    for (var j = 1; j < ar.length; j++)
	    {
	    	if (ar[j] - ar[j-1] != gap )
	    		{
	    	   	gridValid = false;
	    		}
	    }
    }
    
    //end claudia
    
    
   if (!gridValid) {
     Ext.Msg.alert('Status', 'Years for projections should be from 1000 to 2999 and greater than current year! , Projection years gap must be equal to First projection year - Curren year which is :' + gap);
     return false;
   }
   
   Ext.merge(definition, {
     
     projections : newprojection
   });

   //delete later
//   Ext.merge(definition, {
//   	employmentPastTrendInfos: []
//   });
   
   if (definition.employmentGrowthRates == undefined)
	 {
     Ext.merge(definition, {
      	employmentGrowthRates: []
      });
	 }
  
   
   if (definition.demographicTrends == undefined)
  	 {
		   Ext.merge(definition, {
		   	demographicTrends: []
		   });
  	 }
   
   Ext.merge(definition, {
   	localJurisdictions: []
   });
   
//   Ext.merge(definition, {
//   	sectors: []
//   });        
   
   Ext.merge(definition, {
   	includeTrends: false
   });
   
   //Enum Population Fields
   Ext.merge(definition, {
  	 totalPopulationFeatureFieldName: ""
   });
   
   Ext.merge(definition, {
  	 numberOfHouseholdsFeatureFieldName: ""
    });
   Ext.merge(definition, {
  	 numberOfHousingUnitsFeatureFieldName: ""
    });
   //
   
   
   me.project.setDefinition(definition);
   
   ////////////newnew
   /*
   console.log('about to update demandnewProjectionCard: ');
   function success(remote, id, data) {

     Ext.merge(definition, {
     	_rev: data._rev
     });    
     console.log('update demandnewProjectionCard SUCCESS, new revision is: '+ data._rev);
     
   }

   function failure(remote, status) {
     console.log('update demandnewProjectionCard FAILED, status is: '+ status);
     return false;
   }	
		
		var remoteObject = Ext.create('Wif.RESTObject', {
     //urlBase : Wif.endpoint + 'projects/' + form.project.projectId + '/demandnew/setup/',
     urlBase : Wif.endpoint + 'projects/' + me.project.projectId	+ '/demand/setup/',
     data : me.project.getDefinition(),
     id : definition._id,
     singletonObject : true,
     listeners : {
       putsuccess : success,
       postsuccess : success,
       postfail : failure,
       putfail : failure
     }
   });
   remoteObject.pushali();   
   */
   //////////////end newnew
   
   
   _.log(this, 'validate', 'me.project.getDefinition()', me.project.getDefinition());
   
   if (callback) {
     _.log(this, 'callback');
     callback();
   }
   return true;
 

  }
  
});
