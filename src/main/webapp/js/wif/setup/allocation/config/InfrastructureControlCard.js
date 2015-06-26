Ext.define('Wif.setup.allocation.config.InfrastructureControlCard', {
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
  title : 'Infrastructure Control Fields',
  storeDataNew : [],
  isEditing: true, 
  isLoadingExisting: true,
  scenarioRows :[],
  comboDataNew :[],
    
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
      fields : ["label"],
      data: this.comboDataNew
   });
 
    this.assocLuCbox = Ext.create('Wif.setup.UnionAttrComboBox', {
      autoLoad: false
    , multiSelect: false
    , editable: true
    , allowBlank: false
    , projectId:  this.project.projectId
    , listeners: {
    	change: function(cbox,newValue,oldValue,opts) {
    	    me.changeUnionAttr(cbox,newValue);
    	}
    }
    , callback: function () {
        //me.mask.hide();
      }
    });
    
//    this.assocLuCbox = Ext.create('Aura.Util.RemoteComboBox', {
//      extend : 'Ext.form.field.ComboBox',
//      fields : ["label"],
//      valueField : "label",
//      displayField : "label",
//      emptyText : "Select Existing Land Uses",
//      multiSelect : false,
//      forceSelection : true,
//      typeAhead : false,
//      editable : false,
//      queryMode : 'local',
//      displayTpl : '<tpl for=".">' + // for multiSelect
//      '{label}<tpl if="xindex < xcount">,</tpl>' + '</tpl>',
//      listConfig : {
//        getInnerTpl : function() {
//          return '<div class="x-combo-list-item"><img src="' + Ext.BLANK_IMAGE_URL + '" class="chkCombo-default-icon chkCombo" /> {label} </div>';
//        }
//      },
//      serviceParams : {
//        xdomain : "cors",
//        url : Wif.endpoint + 'projects/' + projectId + '/allocationLUs/',
//        method : "get",
//        params : null,
//        headers : {
//          "X-AURIN-USER-ID" : Wif.userId
//        }
//      }
//    });
    
    
//   var gfield = {
//    		xtype: 'gridcolumn',
//        text : "associatedALUs",
//        dataIndex : "associatedALUs",
//        editor: {
//          xtype: 'combobox',
//          store: this.combostore,
//          multiSelect : false,
//          valueField : "label",
//          displayField : "label"
//          }
//      };
//   
   var gfield = {
   		xtype: 'gridcolumn',
       text : "field name",
       flex : 2,
       dataIndex : "associatedALUs",
       editor: this.assocLuCbox
     };

    this.gridfields.push(gfield_id);
    this.gridfields.push(gfield);
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
     
//     me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/unionAttributes/';
//     me.assocLuCbox.load();
     me.assocLuCbox.load(projectId);
     
     
     
     me.loadRows( function () {
 			me.fillcombo(function () {
 		   if (callback) { callback(); }	
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
//      me.storeDataNew.push(datafield);
//    }
	 	
  	  me.storeDataNew = [];
  	  
		 	var definition = me.project.getDefinition(); 
	    if (!(definition.infrastructureALUs == undefined))
	    {
	        var rows = definition.infrastructureALUs;
		      for (var i = 0; i< rows.length; i++) 
		      	{
		            var datafield = {
		  	      		"label" : rows[i].label,
		 	             "associatedALUs" : rows[i].fieldName 
		 	          };	 	  	

		 	        me.storeDataNew.push(datafield);
		      	
		      	}
		 		}
  	  
	 	  for (var i = 0; i < me.scenarioRows.count(); i++)
	 		{
//         var datafield = {
// 	      		"label" : "test",
//	          "associatedALUs" : ["Commercial"]
//	        };	 	  	

         var datacmb = {
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
		   str= str + '{' + '\"' + 'label' + '\"' + ':' + '\"' + val + '\"' + ',' + '\"' + 'fieldName' + '\"' + ':'  + '\"' + val1 + '\"';
       
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
    	 infrastructureALUs : JSON.parse(str)
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
       , url: Wif.endpoint + 'projects/' + me.project.projectId + '/unionAttributes/'
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

 }
  
});
