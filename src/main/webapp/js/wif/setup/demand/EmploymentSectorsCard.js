Ext.define('Wif.setup.demand.EmploymentSectorsCard', {
  extend : 'Aura.util.Grid',
  requires : ['Wif.setup.demand.DemandWizard'],
  project : null,
  title : 'Employment - Sectors',
  assocLuCbox : null,
  assocLuColIdx : 1,
  model : null,
  pendingChanges : null,
  sortKey : 'label',
  isEditing: true, 
  isLoadingExisting: true,
  
  constructor : function(config) {
    var me = this;
    this.preconstruct();
    Ext.apply(this, config);
    var projectId = me.project.projectId;
    
    var isnew = me.project.isnew;
    me.isLoadingExisting = true;

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
        
    this.model = Ext.define('Wif.setup.DemplModel', {
      extend : 'Ext.data.Model',
      idProperty : '_id',
      fields : [{
        name : 'code',
        type : 'string',
        defaultValue : ''
      }, {
        name : 'label',
        type : 'string',
        defaultValue : ''
      }, {
        name : 'featureFieldName',
        type : 'object'
      }, {
        name : 'associatedALUs',
        type : 'object',
        convert : function(value, record) {
        	
        	if (!me.isLoadingExisting) return value;
            _.log(me, 'convert asocs n1', arguments);
            var alus = value, aluLabel;
            var asocArr = [];
            _.log(me, 'convert asocs n2', alus);

            if (alus && !record.data.associated) {
              for (var alu in alus) {
                aluLabel = alus[alu];
                asocArr.push(aluLabel);
              }
              _.log(me, 'convert asoc 3', asocArr);
            }
            record.data.associated = asocArr;
            //record.set("associated", asocArr);
            //record.data.associated = asocArr.join(",");
            _.log(me, 'convert asoc 4', record, record.data.associated);
            return value;
          }
      }, {
        name : 'associated',
        type : 'auto',
        convert : function(value, record) {
        	_.log(me, 'convert alus 0', arguments, record.data, me);
        	 _.log(me, 'isnew', isnew);
        	//if (isnew == false) 
        		//{
        	     if (me.isLoadingExisting) return record.data.associated || value;
        		//}
        	//else
        		//{
        		   // if (me.isLoadingExisting) return record.data.associated || value;
        		//}
        	
          _.log(me, 'convert alus 1', arguments);
          var alus = value, aluLabel, aluId, aluRecord;
          var alusArr = [], alusObject = {};
          _.log(me, 'convert alus 2', alus, record);

          if (alus && me.assocLuCbox.store) {
            for (var alu in alus) {
              aluLabel = alus[alu];
              aluRecord = me.assocLuCbox.findRecordByValue(aluLabel);
              aluId = aluRecord.get('_id');
              alusArr.push(aluLabel);
              alusObject[aluId] = aluLabel;
            }
            _.log(me, 'convert alus 3', alusArr);
          }
          record.data.associatedALUs = alusObject;
         	
      	     
      		
          return alusArr;
        		//}
        }
      }],
      validations : [{
        type : 'presence',
        field : 'code'
      }, {
        type : 'presence',
        field : 'label'
      }, {
        type : 'presence',
        field : 'featureFieldName'
      }, {
        type : 'length',
        field : 'associatedALUs',
        min : 1
      }]
    });

    this.store = Ext.create('Ext.data.Store', {
      model : this.model,
    });

    this.sectorTranslators = [{
      getter : ['data', 'label'],
      setter : 'label'
    }, {
      getter : ['data', 'code'],
      setter : 'code'
    }, {
      getter : ['data', 'featureFieldName'],
      setter : 'featureFieldName'
    }, {
      getter : ['data', 'associatedALUs'],
      setter : 'associatedALUs'
    }];

    this.unionAttrCbox = Ext.create('Wif.setup.UnionAttrComboBox', {
      fields : ["_id", "label", "featureFieldName"],
      valueField : "label",
      displayField : "label",
      projectId : this.project.projectId
    });

    this.columns.splice(this.insertIdx, 0// insert after first column
    , {
      header : 'Code',
      dataIndex : 'code',
      flex : 1,
      editor : {
        allowBlank : false
      }
    }, {
      header : 'Label',
      dataIndex : 'label',
      flex : 1,
      editor : {
        allowBlank : false
      }
    }, {
      header : 'Union Attributes',
      dataIndex : 'featureFieldName', //was unionAttr
      flex : 2,
      stopSelection : false,
      editor : this.unionAttrCbox
    }, {
      header : 'Associated LU',
      dataIndex : 'associated', //was associated
      flex : 2,
      stopSelection : false,
      editor : this.assocLuCbox
    });
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

    //me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/allocationLUs/';
   // me.assocLuCbox.load(function() {this.fillcombo();  if (callback) { callback(); } });
    
    
    me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/allocationLUs/';
    me.assocLuCbox.load();

    me.unionAttrCbox.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/unionAttributes/';
    me.unionAttrCbox.load();

    me.store.massageBeforeStore = function(record) {
      record.projectId = projectId;
    };
    
    //ali
    var definition = this.project.getDefinition();
    
    if (!(definition.sectors == undefined))
    {
        var rows = definition.sectors;
        me.getSelectionModel().deselectAll();
        me.store.removeAll();
        me.store.on('datachanged', function () {
    	  me.isLoadingExisting = false;
       });    
       me.store.loadData(rows);
    	}
    else
    	{
      var rows = {};
      me.getSelectionModel().deselectAll();
      me.store.removeAll();
      me.store.on('datachanged', function () {
  	  me.isLoadingExisting = false;
     });    
     me.store.loadData(rows);
    	}
    
    
   // this.fillcombo();
    /*
    me.store.on('datachanged', function () {
  	   me.assocLuCbox.serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/allocationLUs/';
  	   me.assocLuCbox.store.on('datachanged', function () {
  		    
  		   
  	   });
   	   me.assocLuCbox.load();
   	   
    });
    */
    //this.fillcombo();
    //end 

     return true;
   
  },
  
  fillcombo : function() {  
	    var me = this;
	    var definition = this.project.getDefinition();
	    var rows = definition.sectors;
	     me.store.each(function(record,idx){
		    val = record.get('code');     
	        for (var i = 0; i < rows.count(); i++)
	        {	          
	        	if (val == rows[i].code)
	        		{
	        		     
			  	         for (var j = 0; j < Object.values(rows[i].associatedALUs).count(); j++)
				         {    
			  	        	   var lbl = Object.values(rows[0].associatedALUs)[j];
			        		   
			  	        	 alusObject = {};
			  	               me.assocLuCbox.store.each(function(record,idx){  	            
				  	               x= record[1];
				  	                if (x == lbl){
				  	            	 alusObject.push(x);
				  	               }	
			  	               });
			  	               
			  	        	   	  	          
			  	               //var aluId = '_id=8cd9063337f510deee0ff56f7208ecd9';
			  	               //alusObject[aluId] = 'Education'; 

				         }
			  	          //record.set('associated',alusObject);
			  	          record.associatedALUs = alusObject;
			  	          record.commit();
			  	         
		         }
	        }
	        
	    }); 
	    // me.store.load()

	     
	   return true;
  },
  
  enterByNavigation : function()
  {
  	
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
    Ext.merge(definition, {
      sectors : _.translate3(me.store.data.items, me.sectorTranslators)
    });
    me.project.setDefinition(definition);
    _.log(this, 'validate', _.translate3(me.store.data.items, me.sectorTranslators), me.project.getDefinition());

    if (callback) {
      _.log(this, 'callback');
      callback();
    }
    return true;
  }
});
