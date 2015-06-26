Ext.define('Wif.setup.demandnew.demandnewPercentageEmploymentCard', {
  //requires : ['Wif.setup.demand.DemandWizard'],
  extend : 'Ext.form.Panel',
  project : null,
  title : 'Percentage of Employment for each associated land use.',
  yearFields : [],
  firstLoad : false,
  autoScroll: true,
  constructor : function(config) {
    var me = this;
    Ext.apply(this, config);


     
    ////nnnnn
   	this.gridfields4 = [];
   	this.modelfields4 = [];
   	this.modelfields4.push("_id");
   	this.modelfields4.push("item");
   	this.modelfields4.push("label");
   	this.modelfields4.push("percentage");
    
    var gfield_id4 = {
        text : "_id",
        dataIndex : "_id",
        hidden: true
      }; 
    var gfield4 = {
        text : "Sector",
        dataIndex : "item"
      };
    var gfield44 = {
        text : "landuse",
        dataIndex : "label"
      };
    var field45 = {
        text : "percentage",
        dataIndex : "percentage",
        editor: 'numberfield',
        type: 'number'
      };

    this.gridfields4.push(gfield_id4);
    this.gridfields4.push(gfield4);
    this.gridfields4.push(gfield44);
    this.gridfields4.push(field45);
 
    this.model4 = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: this.modelfields4    
     });
    
    this.storeData4 = [];
   

    
    this.store4 = Ext.create('Ext.data.Store', {
    	model: this.model4,
    	data : this.storeData4,
    	groupField: 'item'
    });

    this.grid4 = Ext.create('Ext.grid.Panel', {
  	title: 'Employment Sectors',
    selType: 'cellmodel',
    border : 0,
    margin : '0 5 5 5',
    store : this.store4,
    //height : 550,
    autoScroll:true,
    autoRender : true,
    features: [{
      id: 'group',
      ftype: 'groupingsummary',
      groupHeaderTpl: '{name}',
      hideGroupedHeader: true,
      enableGroupingMenu: false
  }],
    columns : this.gridfields4,
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


    //this.items = [currentConditionFieldSet, this.grid];
    this.items = [this.grid4];
    this.callParent(arguments);
  },

  listeners : {
    activate : function() {
      this.build();
    }
  },

  build : function(callback) {
    var me = this;
    var definition = me.project.getDefinition();
    if (definition.sectors != undefined) 
    {	
    	
	    var rows4 = definition.sectors;
	    this.storeData4 = [];
	   	for (var j = 0; j < rows4.count(); j++)
	    {   
	  		
	         /*var datafieldSum = {
	          "_id" : "sum",
	          "item" : rows4[j].label,
	          "label": "- Sum -"
	          };
	         this.storeData4.push(datafieldSum);*/
	  		
	  			  var obj =rows4[j].associatedALUs;
	 	        var x = 0;
	          for (var prop in obj)
	          {
		            if (obj.hasOwnProperty(prop))
		            { 
		           	    x =  obj[prop];
		            }
		            var y = 0.0;
		            if (rows4[j].associatedALUsPercentage != undefined) 
		            {
		            	if (rows4[j].associatedALUsPercentage != null) 
		            	{
					            var obj2 =rows4[j].associatedALUsPercentage;
						 	        
						 	        if (obj2.hasOwnProperty(prop))
							        { 
							           	y =  obj2[prop];
							        }
		               }
			           
	              }
		            
		  
		           var datafield = {
		           "_id" : prop,
		           "item" : rows4[j].label,
		           "label": x,
		           "percentage" : y
		           };
		           this.storeData4.push(datafield);
	  			  }
	          
	          //var datafieldempty = {
	          //    "_id" : "empty",	
	          //    "item" : rows4[j].label,
	          //    "label": ""
	          //    };
	          //this.storeData4.push(datafieldempty);
	          
	       
	     }
    }//end if
    
    var ix= 0;
    this.store4.each(function(record,idx)
    { 
    	ix = ix + 1;
     });
    if (ix==0)
    	{
		    //this.store4.add(this.storeData4);
    	   this.store4.loadData(this.storeData4);
		    this.grid4.reconfigure(this.store4, this.gridfields4);
    	}
       
    if (callback) {
        callback();
      }
  },
  
  //ali
  updateStore : function() {
	},

  validate : function(callback) {
    var me = this, gridValid = true;;
   // var results = _.translate3(me.store.data.items, me.sectorTranslators);
   

    var definition = me.project.getDefinition();
    
    var itemDesc = "";
    var sumValue = 0;
    var store = this.grid4.store;
    for (var  inx = 0; inx < store.data.items.count(); inx++)
    {
    	
    //store.each(function(record,idx)
    //{    
      //val = record.get('_id');
      val = store.data.items[inx].data._id;
      //itemVal = record.get('percentage');
      itemVal = store.data.items[inx].data.percentage;
      
      if (itemDesc == "")
      {
         //itemDesc = record.get('item');
         itemDesc = store.data.items[inx].data.item;
         sumValue = sumValue + itemVal;
      }
      else
      {
           if (store.data.items[inx].data.item != itemDesc)
          	{
          	  if ( sumValue >99.98 && sumValue <100.1 )
     	    	   {
          	  	 sumValue = 0; 	 
          	  	 sumValue = sumValue + itemVal;
     	    	    }
          	  else
          	  	{
          	  	     
          	  	     gridValid = false;
          	  	}
          	    //itemDesc = record.get('item');
          	    itemDesc = store.data.items[inx].data.item;
          	}
           else
          	{
          	 sumValue = sumValue + itemVal;
          	}
       } 
     
    } 
    if ( sumValue >99.98 && sumValue <100.1 )
	   {
    }
	  else
	  	{   
	  	    gridValid = false;
	  	}
    //});
    if (!gridValid) {
    	Ext.Msg.alert('Status', 'sum of the percentages for each sector must be 100');
    	//uncomment later
      //return false;
    }
      	
    
    //////
    
    itemDesc = "";
    sumValue = 0;
    var str = '';
    
    
    var allSectors = [];
    
    for (var  inx = 0; inx < store.data.items.count(); inx++)
    {
	      var  val = store.data.items[inx].data._id;
	      //itemVal = record.get('percentage');
	      itemVal = store.data.items[inx].data.percentage;
	      
	      if (itemDesc == "")
	      {
	         //itemDesc = record.get('item');
	         itemDesc = store.data.items[inx].data.item;
	         //str = '\"' + 'associatedALUsPercentage' + '\"' + ':' + '{';
	         str = '{';
	         str = str  + '\"' + val + '\"' + ':' + itemVal + ',';
	      }
	      else
	      {
	           if (store.data.items[inx].data.item != itemDesc)
	          	{
	          	     str = str.substring(0,str.length-1) + '}'; 
	          	     var newSectors =  definition.sectors;    
	          	     for ( var i=0 ; i < newSectors.count(); i++ )
	          	     	{
          	    	      if (newSectors[i].label == itemDesc)
          	    	      	{
          	     	           var sec = newSectors[i];
          	     	           Ext.merge(sec, {
          	     	          	associatedALUsPercentage : JSON.parse(str)
          	          		    });
          	     	          allSectors.push(sec);
          	    	      	}
	          	     	       
	          	     	}
	          	       
	          	    itemDesc = store.data.items[inx].data.item;
	          	    str = '{';
	          	    str = str  + '\"' + val + '\"' + ':' + itemVal + ',';
	          	    
	          	}
	           else
	          	{
	          	 str = str  + '\"' + val + '\"' + ':' + itemVal + ',';
	          	}
	       } 
     
    } 
    if (str != '')
    {
    
    	 str = str.substring(0,str.length-1) + '}'; 
	     var newSectors =  definition.sectors;    
	     for ( var i=0 ; i < newSectors.count(); i++ )
	     	{
    	      if (newSectors[i].label == itemDesc)
    	      	{
     	           var sec = newSectors[i];
     	            Ext.merge(sec, {
     	          	associatedALUsPercentage : JSON.parse(str)
          		    });
     	          allSectors.push(sec);
    	      	}
	     	       
	     	}
    	
    }
    
    Ext.merge(definition, {
      sectors : allSectors
    });
    
     me.project.setDefinition(definition);
    _.log(this, 'validate', me.project.getDefinition());
   
    ////////////newnew
    /*
    console.log('about to update demandnewCurrentEmploymentCard: ');
    function success(remote, id, data) {

      Ext.merge(definition, {
      	_rev: data._rev
      });    
      console.log('update demandnewCurrentEmploymentCard SUCCESS, new revision is: '+ data._rev);
      
    }

    function failure(remote, status) {
      console.log('update demandnewCurrentEmploymentCard FAILED, status is: '+ status);
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
	    return true;
    }

});
