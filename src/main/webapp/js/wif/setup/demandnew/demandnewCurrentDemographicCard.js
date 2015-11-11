Ext.define('Wif.setup.demandnew.demandnewCurrentDemographicCard', {
	extend : 'Ext.form.Panel',
  project : null,
  title : 'Current Demographic',
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
    
    
    var currentConditionHash = {
        areaLabel : {
          name : 'areaLabel',
          label : 'Area Label'
        },
        baseYear : {
          name : 'baseYear',
          label : 'Current Year'
        }
      };

      /* -----------------------------------------
       * Create fields related to Base Year
       ------------------------------------------ */
      var curDateFromat = Ext.Date.format(new Date(), 'Y');
      var curDate = Ext.create('Ext.form.Text', {
        id : 'baseYear',
        labelWidth : 65,
        fieldLabel : currentConditionHash.baseYear.label,
        value : curDateFromat,
        regex : /^[12][0-9]{3}$/,
        regexText : 'Current year should be from 1000 to 2999!'
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
      
      var currentConditionFieldSet = Ext.create('Ext.form.FieldSet', {
        // columnWidth : 0.5,
        title : 'Current Condition',
        collapsible : true,
        margin : '15 5 5 5',
        defaults : {
          bodyPadding : 10,
          anchor : '20%'
        },
        items : [curDate]
      });
    
    
    var isnew = me.project.isnew;
    me.isLoadingExisting = true;
  
   	this.gridfields = [];
   	this.modelfields = [];
   	//this.modelfields.push("_id");
   	this.modelfields.push("item");
    this.modelfields.push("dvalue");
    var gfield_id = {
        name : "_id",
        dataIndex : "_id",
        hidden: true
      };   	
//    var gfield = {
//    		header : "item",
//    		name : "item",
//        dataIndex : "item",
//        type : 'string'
//      };

    var gfield = {
    		header : 'item',
        dataIndex : 'item',
        editor: {
          xtype: 'textfield',
          allowBlank: false
         }
      };

    
    var field = {
    		header : 'value',
        dataIndex : 'dvalue',
        editor: {
          xtype: 'numberfield',
          allowBlank: false
         }
      };
      
     

    
    //this.gridfields.push(gfield_id);
    this.gridfields.push(gfield);
    this.gridfields.push(field);

      var storeData = [];
     var datafield0 = {
        //"_id" : 'totalPopulation',
        "item" : 'Total Population',
        //"item" : 'totalPopulation',
        "dvalue" : 0
      };      
      storeData.push(datafield0);
      
        var datafield1 = {
           // "_id" : 'housingUnits',
            "item" : 'Housing Units',
        		//"item" : 'housingUnits',
            "dvalue" : 0
          };      
          storeData.push(datafield1);          
      var datafield22 = {
          //"item" : 'households',
          "item" : 'Households',
          "dvalue" : 0
      };      
      storeData.push(datafield22);  
      
      var datafield33 = {
          //"_id" : 'households',
          //"item" : 'vacancyRate',
          "item" : 'Vacancy Rate(0-1)',
          "dvalue" : 0
      };     
      storeData.push(datafield33);
      
    this.model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: this.modelfields    
     });
    
    this.store = Ext.create('Ext.data.Store', {
    	//autoLoad: true,
    	model: this.model,
    	data : storeData
    });
    
  
     
    this.grid = Ext.create('Ext.grid.Panel', {

    	title: 'Demographic Information',
      selType: 'cellmodel',
      border : 0,
      margin : '0 5 5 5',
      store : this.store,
      height : 125,	
      //autoLoad : true,
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
    this.items = [SaveBtn, currentConditionFieldSet, this.grid];
    
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

    var definition = this.project.getDefinition();
    
    //////
//    if (this.gridfields.length<3)
//    {	
//    	
//      var field = {
//          text : 'value',
//          dataIndex : 'dvalue',
//          editor: 'numberfield',
//          type: 'number'
//        };
//        
//        this.gridfields.push(field);
//        this.modelfields.push("dvalue");
//	    
//	    this.grid.reconfigure(this.store, this.gridfields);
//    }
    /////////
    
       
    if (definition.currentDemographic != undefined)
    {
      var mainrows = definition.currentDemographic;
    
      Ext.getCmp('baseYear').setValue(definition.baseYear);
      
      
      me.store.removeAll();
      this.grid.getSelectionModel().deselectAll();
	 	  
 	 	 var storeDataNew = [];
 	   var datafield0 = {
      		//"item" : 'totalPopulation',
      		"item" : 'Total Population',
          "dvalue" : mainrows.totalPopulation
        };      
  	    storeDataNew.push(datafield0); 	 	 
 	   var datafield1 = {
     		//"item" : 'housingUnits',
     		"item" : 'Housing Units',
         "dvalue" : mainrows.housingUnits
       };      
 	    storeDataNew.push(datafield1); 
  	   var datafield2 = {
  	     		//"item" : 'households',
  	     		"item" : 'Households',
  	         "dvalue" : mainrows.households
  	       };      
  	 	    storeDataNew.push(datafield2); 	 
  	 	    
  	      var datafield33 = {
  	          //"item" : 'vacancyRate',
  	          "item" : 'Vacancy Rate(0-1)',
  	          "dvalue" : mainrows.vacancyRate
  	      };      
  	      storeDataNew.push(datafield33);    
 	     	    
 	   	me.store.loadData(storeDataNew);	
 	   
 	    this.grid.reconfigure(me.store, this.gridfields);
   
 	   
       }//end if
    
    

     return true;
   
  },
  

  
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

    var definition = me.project.getDefinition(); 

    //var CurrentDemographic = [];
    //saving 
  		 var jsonStr='{';
  		  jsonStr = jsonStr + '\"label\" :' + '\"' + Ext.getCmp('baseYear').value +'\",';
  		  jsonStr = jsonStr + '\"year\" :' +Number(Ext.getCmp('baseYear').value) + ','; 
 	 
  	    var i = 0;
  	     this.store.each(function(record,idx){                   		
  	         i = i + 1;  
  	         var y ='';
  	         if (record.get('item') == 'Total Population')
  	        	 {
  	        	     y = 'totalPopulation'; 
  	        	 }
  	         if (record.get('item') == 'Housing Units')
	        	 {
	        	     y = 'housingUnits'; 
	        	 }
  	         if (record.get('item') == 'Households')
	        	 {
	        	     y = 'households'; 
	        	 }
  	         if (record.get('item') == 'Vacancy Rate(0-1)')
	        	 {
	        	     y = 'vacancyRate'; 
	        	 }  	         
  	         
  	         //var x= '\"' +record.get('item') + '\"'; 
  	         var x= '\"' +y + '\"'; 
  	         var x1 =  ':' + 0 +',';
  	         if (record.get('dvalue') =='' || record.get('dvalue') ==null)
  	        	 { 
  	        	     x1 =  ':' + 0 +',';
  	        	 }
  	         else
  	        	 {  
  	        	    x1 =  ':' + record.get('dvalue') +',';
  	        	 }
  	        
  	         jsonStr = jsonStr + x + x1;
  	         //landUseOrderMap.push('\"' +record.get('_id') + '\"' + ':' + i);
  	     });  
  	     jsonStr = jsonStr + '\"vacantLand\" : null ,';
  	     jsonStr = jsonStr + '\"gQPopulation\" : null }';
  	     //jsonStr = jsonStr.substring(0,jsonStr.length-1) + '}';
  	     //CurrentDemographic.push(JSON.parse(jsonStr));
 
       
     definition.baseYear = Number(Ext.getCmp('baseYear').value);
     _.log(this, 'validate definition.baseYear', definition.baseYear); 
    
    Ext.merge(definition, {
    	//demographicTrends1:[{demographicData : _.translate3(this.store.data.items, me.sectorTranslators)}]
    	currentDemographic: JSON.parse(jsonStr)
    });
    me.project.setDefinition(definition);
    
    
    _.log(this, 'before new validate', _.translate3(this.store.data.items, me.sectorTranslators), me.project.getDefinition());
    
    ////////////newnew
    /*
    console.log('about to update demandnewCurrentDemographicCard: ');
    function success(remote, id, data) {
 
      Ext.merge(definition, {
      	_rev: data._rev
      });    
      console.log('update demandnewCurrentDemographicCard SUCCESS, new revision is: '+ data._rev);
      
    }

    function failure(remote, status) {
      console.log('update demandnewCurrentDemographicCard FAILED, status is: '+ status);
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
    
    
    _.log(this, 'validate', _.translate3(this.store.data.items, me.sectorTranslators), me.project.getDefinition());

    if (callback) {
      _.log(this, 'callback');
      callback();
    }
    return true;
  }
});
