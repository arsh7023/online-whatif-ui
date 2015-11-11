Ext.define('Wif.setup.demandnew.demandnewResidentialCurrentCard', {
	extend : 'Ext.form.Panel',
  requires: [
             'Ext.data.*',
             'Ext.grid.*',
             'Ext.tree.*',
             'Ext.ux.CheckColumn',
             'Wif.RESTObject'
           ],
  project : null,
  title : 'Residential Current Data',
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
   	modelfields.push("associatedALUs");
   	modelfields.push("numberOfHousingUnits");
   	modelfields.push("density");
   	modelfields.push("breakdownDensity");
   	modelfields.push("vacancyRate");
   	//modelfields.push("infillRate");
   	
//    var gfield_id0 = {
//        text : "id",
//        dataIndex : "_id",
//        hidden: true
//      };     	
    var gfield_id1 = {
        text : "Number Of HousingUnits",
        dataIndex : "numberOfHousingUnits",
        flex: 1,
        editor: {
          xtype: 'numberfield',
          allowBlank: false
         }
      }; 
    var gfield_id2 = {
        text : "Density",
        dataIndex : "density",
        flex: 1,
        editor: {
          xtype: 'numberfield',
          allowBlank: false
         }
      };   
    var gfield_id3 = {
        text : "Breakdown Density",
        dataIndex : "breakdownDensity",
        flex: 1,
        editor: {
          xtype: 'numberfield',
          allowBlank: false
         }
      };  
    var gfield_id4 = {
        text : "vacancyRate",
        dataIndex : "vacancyRate",
        flex: 1,
        editor: {
          xtype: 'numberfield',
          allowBlank: false
         }
      };
//    var gfield_id5 = {
//        text : "infillRate",
//        dataIndex : "infillRate",
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
     
    this.combostore = Ext.create('Ext.data.Store', {
      fields : ["_id","label"],
      data: this.comboDataNew
   });
 
    this.assocLuCbox = Ext.create('Aura.Util.RemoteComboBox', {
      extend : 'Ext.form.field.ComboBox',
      fields : ["_id", "label", "featureFieldName"],
      valueField : "label",
      displayField : "label",
      emptyText : "Select Existing Land Uses",
      multiSelect : false,
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
    
    var gfield = {
     		xtype: 'gridcolumn',
         text : "Residential Landuse",
         flex : 1,
         dataIndex : "associatedALUs",
         editor: this.assocLuCbox
       };

      //this.gridfields.push(gfield_id0);
      this.gridfields.push(gfield);
      this.gridfields.push(gfield_id1);
      this.gridfields.push(gfield_id2);
      this.gridfields.push(gfield_id3);
      this.gridfields.push(gfield_id4);
      //this.gridfields.push(gfield_id5);
      
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
  	 	 	 	      		"label" : "",
  	 	 		          //"associatedALUs" : [""]
  	                 "associatedALUs" : []
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
   
      this.items = [SaveBtn, this.grid];
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

    me.assocLuCbox.load(projectId);
    
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

		    val_id1 = record.get('numberOfHousingUnits');  
		    val_id2 = record.get('density');  
		    val_id3 = record.get('breakdownDensity');  
		    val_id4 = record.get('vacancyRate');  
		    //val_id5 = record.get('infillRate');  
		    
		    val1 = record.get('associatedALUs');
		    val2 = "";

		 	  for (var i = 0; i < me.scenarioRows.count(); i++)
		 		{
		 	  	if (me.scenarioRows[i].label == val1)
		 	  		{
		 	  		    val2 = me.scenarioRows[i]._id;
		 	  		}
		 		}
		    
		    plannedALUs =[];
		   str= str + '{' + '\"' + 'numberOfHousingUnits' + '\"' + ':' +  val_id1 + ',';
		   str= str + '\"' + 'density' + '\"' + ':' +  val_id2 + ',';
		   str= str + '\"' + 'breakdownDensity' + '\"' + ':' +  val_id3 + ',';
		   str= str + '\"' + 'vacancyRate' + '\"' + ':' +  val_id4 + ',';
		   //str= str + '\"' + 'infillRate' + '\"' + ':' +  val_id5 + ',';		   
		   str= str + '\"' + 'residentialLUId' + '\"' + ':'  + '\"' + val2 + '\"';
       
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
  	 
     Ext.merge(definition.currentDemographic, {
    	 residentialCurrentData : JSON.parse(str)
	    });
  	 
  	 me.project.setDefinition(definition);
  	 
     ////////////newnew
  	 /*
     console.log('about to update demandnewResidentialCurrentCard: ');
     function success(remote, id, data) {
  
       Ext.merge(definition, {
       	_rev: data._rev
       });    
       console.log('update demandnewResidentialCurrentCard SUCCESS, new revision is: '+ data._rev);
       
     }

     function failure(remote, status) {
       console.log('update demandnewResidentialCurrentCard FAILED, status is: '+ status);
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
	    if (!(definition.currentDemographic == undefined))
	    {
	        var rows = definition.currentDemographic.residentialCurrentData;
		      for (var i = 0; i< rows.length; i++) 
		      	{
		      	
						 	  for (var j = 0; j < me.scenarioRows.count(); j++)
						 		{
						 	  	if (me.scenarioRows[j]._id == rows[i].residentialLUId)
						 	  		{
								 	  	  var datafield = {
							            	//"associatedALUs" : rows[i].fieldName,
							            	"associatedALUs" : me.scenarioRows[j].label,
							  	      		"numberOfHousingUnits" : rows[i].numberOfHousingUnits,
							  	      		"density" : rows[i].density,
							  	      		"breakdownDensity" : rows[i].breakdownDensity,
							  	      		"vacancyRate" : rows[i].vacancyRate
							  	      		//"infillRate" : rows[i].infillRate
							 	          };	 	  	 
		
							 	        me.storeDataNew.push(datafield);
						 	  		}
						 		}
		      	
		          
		      	
		      	}
		 		}
  	  
	 	  for (var i = 0; i < me.scenarioRows.count(); i++)
	 		{
  	

         var datacmb = {
        		"_id" :  me.scenarioRows[i]._id,
      		  "label" : me.scenarioRows[i].label
         };
	 	      
	        me.comboDataNew.push(datacmb);
	       // me.storeDataNew.push(datafield);
	 		}
	 	 
	 	 //me.storeDataNew.push(datafield0);	 	 
	 	  me.store.removeAll();
	 	  
	 	 me.combostore.removeAll();
	 	  
	 	  if (me.combostore.data.length==0)
		  { 	   
			 	 me.combostore.loadData(me.comboDataNew);
	  	}	 
	 	  
		 	me.store.loadData(me.storeDataNew);		 	

		 	
		 	 this.grid.reconfigure(me.store, me.gridfields);
	 	 
	   	if (callback) { callback(); }
  }
  
  
});

