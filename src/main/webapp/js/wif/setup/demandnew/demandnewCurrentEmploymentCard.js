Ext.define('Wif.setup.demandnew.demandnewCurrentEmploymentCard', {
  //requires : ['Wif.setup.demand.DemandWizard'],
  extend : 'Ext.form.Panel',
  project : null,
  title : 'Current - Employment',
  yearFields : [],
  firstLoad : false,

  constructor : function(config) {
    var me = this, colNum = 1;
    Ext.apply(this, config);

    /* ---------------
     * Create Hash Map
     ----------------- */

//    var currentConditionHash = {
//      areaLabel : {
//        name : 'areaLabel',
//        label : 'Area Label'
//      },
//      baseYear : {
//        name : 'baseYear',
//        label : 'Base Year'
//      }
//    };

    /* -----------------------------------------
     * Create fields related to Base Year
     ------------------------------------------ */
//    var curDateFromat = Ext.Date.format(new Date(), 'Y');
//    var curDate = Ext.create('Ext.form.Text', {
//      id : 'baseYear',
//      labelWidth : 65,
//      fieldLabel : currentConditionHash.baseYear.label,
//      value : curDateFromat,
//      regex : /^[12][0-9]{3}$/,
//      regexText : 'Current year should be from 1000 to 2999!'
//    });

//    var currentConditionFieldSet = Ext.create('Ext.form.FieldSet', {
//      // columnWidth : 0.5,
//      title : 'Current Condition',
//      collapsible : true,
//      margin : '15 5 5 5',
//      defaults : {
//        bodyPadding : 10,
//        anchor : '20%'
//      },
//      items : [curDate]
//    });

    var gridModel = Ext.define('GridModel', {
      extend : 'Ext.data.Model'
    });

    var setGridModelFields = function() {
      var fields = [];
      var field = {
        name : 'label',
        type : 'string'
      };
      fields.push(field);
      field = {
        name : 'code',
        type : 'string'
      };
      fields.push(field);

      for (var i = 1; i <= colNum; i++) {
        field = {
          name : 'year' + i,
          type : 'string',
        }
        fields.push(field);
        me.yearFields.push('year' + i);
      };
      gridModel.setFields(fields);
    };

    setGridModelFields();

    this.store = Ext.create('Ext.data.Store', {
      storeId : 'store',
      model : 'GridModel',
      proxy : {
        type : 'memory'
      }
    });

    this.sectorTranslators = [{
      getter : ['data', 'label'],
      setter : 'sectorLabel'
    }, {
      getter : ['data', 'year1'],
      setter : 'employees'
    }];

    this.grid = Ext.create('Ext.grid.Panel', {
      selModel : {
        selType : 'cellmodel'
      },
      hideHeaders : false,
      border : 0,
      margin : '5 5 5 5',
      store : this.store,
      height : 500,
      autoRender : true,
      columns : [],
      viewConfig : {
        stripeRows : false,
        getRowClass : function(record, index) {
          if (record.get('label') === 'Year' || record.get('label') === 'Label') {
            return 'header-row'
          } else {
            return 'normal-row'
          }
        }
      },
      plugins : [Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit : 1
      })]
    });

    var gridColumns = function() {
      var years = _.translate3(_.range(1990, 2000), [{
        setter : function(obj, value) {
          obj.label = value;
          obj.value = value
        }
      }]);
      var cols = [];
      var col = {
        header : 'Code',
        dataIndex : 'code',
        flex : 1
      };
      cols.push(col);
      col = {
        header : 'Label',
        dataIndex : 'label',
        flex : 1
      }
      cols.push(col);
      for (var i = 1; i <= colNum; i++) {
        col = {
          header : 'Number of Employees',
          dataIndex : 'year' + i,
          flex : 2,
          getEditor : function(record) {
            var field = Ext.create('Ext.form.field.Number', {
              selectOnFocus : true
            });
            return Ext.create('Ext.grid.CellEditor', {
              field : field
            });
          }
        }
        cols.push(col);
      };
      return cols;
    }	
    this.grid.reconfigure(this.store, gridColumns());

    //this.items = [currentConditionFieldSet, this.grid];
    this.items = [this.grid];
    this.callParent(arguments);
  },

  listeners : {
    activate : function() {
      this.build(this.updateStore);
    }
  },

  build : function(callback) {
    var me = this, store = me.store, sectors = me.project.getDefinition().sectors;
   
    _.log(this, 'build', sectors);
    _.each(sectors, function(sector) {
      var recordMatch = store.findRecord('code', sector.code);
      if (!recordMatch) {
        store.add(sector);
      }
    });
    
    //ali
    //
    if (me.project.getDefinition().currentDemographic != undefined)
    {
    	var emp= me.project.getDefinition().currentDemographic.employmentCurrentDatas;
	    store.each(function(record,idx){
		      val = record.get('label');
	         
		         for (var i = 0; i < emp.count(); i++)
		         {
		            
		            if (emp[i].sectorLabel == val)
		            	{
		            	    record.set('year1',emp[i].employees);
		            	   // record.commit();
		            	}
		             
		         }
	
		     record.commit();
		   });
    }
    
    if (callback) {
        callback();
      }
  },
  
  //ali
  updateStore : function() {
	  /*
	  var store = this.store;
	  store.each(function(record,idx){
	      val = record.get('code');
	      if(val == "code1"){
	         record.set('year1','1000');
	      }
	      else {
	         record.set('year1','2000');
	      }
	      record.commit();
	   });
	//console.log(store);
	 this.grid.reconfigure(store);
	this.grid.getView().refresh();
	*/
  },

  validate : function(callback) {
    var me = this;
    var results = _.translate3(me.store.data.items, me.sectorTranslators);
    _.log(this, 'validate', results);

    var definition = me.project.getDefinition();
    
//    definition.baseYear = Number(Ext.getCmp('baseYear').value);
//    _.log(this, 'validate definition.baseYear', definition.baseYear);
    Ext.merge(definition, {
      'currentDemographic' : {
        'employmentCurrentDatas' : results
          }
      });
    
    /*
    Ext.merge(definition, {
      
        'employmentCurrentDataNew' : results
          
    });
    */

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
