Ext.define('Wif.setup.demandnew.demandnewEmploymentPastTrendInfoCard', {
	extend : 'Ext.form.Panel',
  requires: [
             'Ext.data.*',
             'Ext.grid.*',
             'Ext.tree.*',
             'Ext.ux.CheckColumn',
             'Wif.RESTObject'
           ],
  project : null,
  title : 'Employment Past Trend Data (enter data for two previous years)',
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
    var definition = this.project.getDefinition();
    this.storeDataNew = [];
    this.gridfields = [];
   	this.modelfields = [];
   	
   	//modelfields.push("_id");
   	this.modelfields.push("year");
    var gfield_id1 = {
        text : "year",
        dataIndex : "year",
        editor: {
          xtype: 'numberfield',
          allowBlank: false
         }
      }; 
    
    this.gridfields.push(gfield_id1);
    
  
    
      this.model = Ext.define('User', {
        extend: 'Ext.data.Model',
        fields: this.modelfields    
       });
      
      this.store = Ext.create('Ext.data.Store', {
      	model: this.model,
      	data : this.storeDataNew,
      	 proxy : {
           type : 'memory'
         }
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
        selModel : {
          selType : 'cellmodel'
        },
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

    var definition = this.project.getDefinition();

    if (this.gridfields.length<2)
    {
    	////////////
      if (!(definition.employmentPastTrendInfos == undefined))
      {
      	  me.storeDataNew =[];
          var rows = definition.employmentPastTrendInfos;
         
  	      for (var i = 0; i< rows.length; i++) 
  	      	{

  	   			   	var datafield = {
  	   		      		"year" : rows[i].year,
  	   		         };
  	   			      me.storeDataNew.push(datafield);
  	      	}
  	      
  	      var cnt = this.store.data.length;
  		    if (cnt>0)
  		    	{
  		    	  this.store.removeAll();
  		    	}

  			 	   this.store.loadData(me.storeDataNew);	
        }
      //////////////////
    	
	   	var sectors = definition.sectors;
	   	if (sectors != undefined)
	   	{
	   		 for (var i = 0; i < sectors.count(); i++)
	   			 {
	   			   this.modelfields.push(sectors[i].label);
	   			   var gfield_id2 = {
	   	           text : sectors[i].label,
	   	           dataIndex : sectors[i].label,
	   	           editor: {
	   	             xtype: 'numberfield',
	   	             allowBlank: false
	   	            }		        
	   	         };  
	   			     this.gridfields.push(gfield_id2);
	   			 }
	
	   		}
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
	       this.gridfields.push(delColumns);
	       this.grid.reconfigure(this.store, this.gridfields);
    }
    
      
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
     var definition = me.project.getDefinition();
  	 me.store.each(function(record,idx){

		    val_id1 = record.get('year');  

		 	   str= str + '{' + '\"' + 'label' + '\"' + ':' + '\"' + val_id1 + '\"' + ',';
			   str= str + '\"' + 'year' + '\"' + ':' +  val_id1 + ',';
			   str= str + '\"' + 'employmentEntries' + '\": [';
			   	var sectors = definition.sectors;
			   	if (sectors != undefined)
			   	{
			   		for (var i = 0; i < sectors.count(); i++)
		   			 {

				          //str= str + '{\"' + sectors[i].label + '\"' + ':' +  record.get(sectors[i].label) + '},';	  
				          str= str + '{\"sectorLabel\"' + ':' +  '\"' + sectors[i].label + '\"' + ',';
				          if (record.get(sectors[i].label) == undefined)
				          	{
				          	  str= str + '\"employees\"' + ':0},';	
				          	}
				          else
				          	{
				          	str= str + '\"employees\"' + ':' +  record.get(sectors[i].label) + '},';	
				          	}
				          
				          

					   }
			   		str = str.substring(0,str.length-1);
			   	}
			   	str = str + ']';
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
  	 
  	 
  	 
     Ext.merge(definition, {
    	 employmentPastTrendInfos : JSON.parse(str)
	    });
  	 
  	 me.project.setDefinition(definition);
  	 
  	 
     ////////////newnew
  	 /*
     console.log('about to update demandnewEmploymenPastTrendInfotCard: ');
     function success(remote, id, data) {

       Ext.merge(definition, {
       	_rev: data._rev
       });    
       console.log('update demandnewEmploymenPastTrendInfotCard SUCCESS, new revision is: '+ data._rev);
       
     }

     function failure(remote, status) {
       console.log('update demandnewEmploymenPastTrendInfotCard FAILED, status is: '+ status);
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
		  var str='[';
	    if (!(definition.employmentPastTrendInfos == undefined))
	    {
	        var rows = definition.employmentPastTrendInfos;
	       
		      for (var i = 0; i< rows.length; i++) 
		      	{
 
		   			   	var sectors = definition.sectors;
		   			   	if (sectors != undefined)
		   			   	{
		   			   	 var lyear = rows[i].year;
		   			   	 
			   			   	var datafield = {
			   		      		"year" : rows[i].year,
			   		         };
			   			      me.storeDataNew.push(datafield);
		   			   	 
		   			   	 //var str='';
		   			   	  str= str + '{' + '\"' + 'year' + '\"' + ':' +  lyear;
		   			   	  
		   			   		for (var j = 0; j < sectors.count(); j++)
		   			   		{
		   			   		    
				   			   		for (var k = 0; k< rows[i].employmentEntries.length; k++) 
				  		      	{
				   			   			 if (rows[i].employmentEntries[k].sectorLabel == sectors[j].label)
				   			   				 {
				   			   			    	//str= str + ',\"' + rows[i].employmentEntries[k].sectorLabel + '\"' + ':' +  rows[i].employmentEntries[k].employees;
						   				 	  	  
				   			   				}
				  		      	}
				   			   	  
		   			   		 }
				   			   	
		   			   	   str = str + '},';
		   			   	   //me.storeDataNew.push(JSON.parse(str));
		   			   	}
		 	  		}
		      if (str != '[')
		      	{
		      str = str.substring(0,str.length-1);
		      	}
		        
		 		}
	 
	    str = str +']';
	    var cnt = this.store.data.length;
	    if (cnt>0)
	    	{
	    	  //this.store.removeAll();
	    	}
	
	    ///????//this.grid.getSelectionModel().deselectAll();
		 	//this.store.loadData(me.storeDataNew);	
	    //me.storeDataNew.push(JSON.parse(str));
		 	//this.store.loadData(JSON.parse(str));		 
	 	 //this.grid.reconfigure(this.store, me.gridfields);
	 	 
	 	 
	 	 this.store.each(function(record,idx){

		    val_id1 = record.get('year');  
		    
		    var rows = definition.employmentPastTrendInfos;
	       
	      for (var i = 0; i< rows.length; i++) 
	      	{
               
	   			   	var sectors = definition.sectors;
	   			   	if (sectors != undefined)
	   			   	{
	   			   	 var lyear = rows[i].year;
	   			   	 //var str='';
	   			   	 if (lyear == val_id1)
	   			   		 {
		
			   			   		for (var j = 0; j < sectors.count(); j++)
			   			   		{
			   			   		    
					   			   		for (var k = 0; k< rows[i].employmentEntries.length; k++) 
					  		      	{
					   			   			 if (rows[i].employmentEntries[k].sectorLabel == sectors[j].label)
					   			   				 {
					   			    	         record.set(rows[i].employmentEntries[k].sectorLabel,rows[i].employmentEntries[k].employees);
					   			   	          record.commit();
							   				 	  	  
					   			   				}
					  		      	}
					   			   	  
			   			   		 }
	   			   		 }
	   			   	}
	 	  		}
		    
 
			    							   		
	 	 });
	 	 
	 	 
	 	 
	   	if (callback) { callback(); }
  }
  
  
});

