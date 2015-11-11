Ext.define('Wif.setup.demandnew.demandnewResidentialPastTrendInfoCard', {
	extend : 'Ext.form.Panel',
  requires: [
             'Ext.data.*',
             'Ext.grid.*',
             'Ext.tree.*',
             'Ext.ux.CheckColumn',
             'Wif.RESTObject'
           ],
  project : null,
  title : 'Residential Past Trend Data (enter data for two previous years)',
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
   	
   	//modelfields.push("_id");
   	modelfields.push("year");
   	modelfields.push("totalPopulation");
   	modelfields.push("households");
   	//modelfields.push("gQPopulation");

  	
    var gfield_id1 = {
        text : "year",
        dataIndex : "year",
        editor: {
          xtype: 'numberfield',
          allowBlank: false
         }
      }; 
    var gfield_id2 = {
        text : "Total Population",
        dataIndex : "totalPopulation",
        editor: {
          xtype: 'numberfield',
          allowBlank: false
         }
      };   
    var gfield_id3 = {
        text : "Households",
        dataIndex : "households",
        editor: {
          xtype: 'numberfield',
          allowBlank: false
         }
      };  
//    var gfield_id4 = {
//        text : "Group Quarter Population",
//        dataIndex : "gQPopulation",
//        editor: {
//          xtype: 'numberfield',
//          allowBlank: false
//         }
//      };

    
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
     
  
      this.gridfields.push(gfield_id1);
      this.gridfields.push(gfield_id2);
      this.gridfields.push(gfield_id3);
      //this.gridfields.push(gfield_id4);
      
      this.gridfields.push(delColumns);
      
      
      this.model = Ext.define('User', {
        extend: 'Ext.data.Model',
        fields: modelfields    
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
  	 	 	 	      		"year" : "",
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

      
    me.loadRows( function () {
			me.fillcombo(function () {
		   if (callback) { callback(); }	
	      });
     });

     return true;
   
  },
 
  enterByNavigation : function()
  {
  	
  },
  

  validate : function(callback) {
  	 var me = this;
     
     var cnt = me.store.data.length;
     var indx = 1;
     var str='[';
  	 me.store.each(function(record,idx){

 
		    val_id1 = record.get('year');  
		    val_id2 = record.get('totalPopulation');  
		    val_id3 = record.get('households');  
		    //val_id4 = record.get('gQPopulation');  
		    
		   str= str + '{' + '\"' + 'label' + '\"' + ':' + '\"' + val_id1 + '\"' + ',';
		   str= str + '\"' + 'year' + '\"' + ':' +  val_id1 + ',';
		   str= str + '\"' + 'totalPopulation' + '\"' + ':' +  val_id2 + ',';
		   str= str + '\"' + 'households' + '\"' + ':' +  val_id3 + ',';
		   str= str + '\"' + 'gQPopulation' + '\"' + ':1';
       
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
  	 str = str +"]";
  	 

  	 
  	 var definition = me.project.getDefinition(); 
  	 
     Ext.merge(definition, {
    	 residentialPastTrendInfos : JSON.parse(str)
	    });
  	 
  	 me.project.setDefinition(definition);
  	 
     ////////////newnew
  	 /*
     console.log('about to update demandnewResidentialPastTrenInfoCard: ');
     function success(remote, id, data) {
  
       Ext.merge(definition, {
       	_rev: data._rev
       });    
       console.log('update demandnewResidentialPastTrenInfoCard SUCCESS, new revision is: '+ data._rev);
       
     }

     function failure(remote, status) {
       console.log('update demandnewResidentialPastTrenInfoCard FAILED, status is: '+ status);
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
  
  fillcombo : function(callback) {
  	var me = this;
  	
  	  me.storeDataNew = [];
  	  
		 	var definition = me.project.getDefinition(); 
	    if (!(definition.residentialPastTrendInfos == undefined))
	    {
	        var rows = definition.residentialPastTrendInfos;
		      for (var i = 0; i< rows.length; i++) 
		      	{
		      	
	      	
				 	  	  var datafield = {
			            	//"associatedALUs" : rows[i].fieldName,
			            	"year" : rows[i].year,
			  	      		"totalPopulation" : rows[i].totalPopulation,
			  	      		"households" : rows[i].households
			  	      		//"gQPopulation" : rows[i].gQPopulation,
			 	          };	 	  	 

			 	        me.storeDataNew.push(datafield);
		 	  		}
		 		}
	 
	 	  me.store.removeAll();
		 	me.store.loadData(me.storeDataNew);		 	
	 	 this.grid.reconfigure(me.store, me.gridfields);
	 	 
	   	if (callback) { callback(); }
  }
  
  
});

