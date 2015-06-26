Ext.define('Wif.setup.trend.trendnewTrendsInfoCard', {
	extend : 'Ext.form.Panel',
  requires: [
             'Ext.data.*',
             'Ext.grid.*',
             'Ext.tree.*',
             'Ext.ux.CheckColumn',
             'Wif.RESTObject'
           ],
  project : null,
  title : 'demographicTrend Names',
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
   	modelfields.push("label");
  	
    var gfield_id1 = {
        text : "demographicTrend Names",
        dataIndex : "label",
        editor: 'textfield',
        type: 'string'
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
     
  
      this.gridfields.push(gfield_id1);
      
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
     var rows = definition.demographicTrends;
     
     var arr=[];
  	 me.store.each(function(record,idx){
		    val_id1 = record.get('label');  
		    
		  	 var lsw = false;
		     for (var i = 0; i< rows.length; i++) 
		     	{
		    	   if (rows[i].label == val_id1)
		    	  	 {
		    	  	     lsw = true;
		    	  	     arr.push(rows[i]);
		    	  	 }
		    	   
		     	}
		     if (lsw == false) //not found 
		    	 {
		    	   str = "";
			    	 str= str + '{' + '\"' + 'label' + '\"' + ':' + '\"' + val_id1 + '\",'; 
			    	 str= str + '\"' + 'demographicData' + '\"' + ':' + '[]' + '}';	 
			    	 arr.push(JSON.parse(str));
		    	 } 
 
	    });
//  	 str = str.substring(0,str.length-1);
//  	 str = str +"]";
  	 

  	 
  	 
  	 
     Ext.merge(definition, {
    	 //label : JSON.parse(str)
    	 demographicTrends : arr
    	  
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
  
  fillcombo : function(callback) {
  	var me = this;
  	
  	  me.storeDataNew = [];
  	  
		 	var definition = me.project.getDefinition(); 
	    if (!(definition.demographicTrends == undefined))
	    {
	        var rows = definition.demographicTrends;
		      for (var i = 0; i< rows.length; i++) 
		      	{
  	
				 	  	  var datafield = {
			            	"label" : rows[i].label
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

