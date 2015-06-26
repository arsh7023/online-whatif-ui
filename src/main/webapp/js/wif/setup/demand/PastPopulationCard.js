Ext.define('Wif.setup.demand.PastPopulationCard', {
  extend : 'Ext.form.Panel',
  project : null,
  title : 'Past - Population',
  yearFields : [],

  constructor : function(config) {
    var me = this, colNum = 2;
    Ext.apply(this, config);
    _.log(me, 'constructor');

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
      for (var i = 1; i <= colNum; i++) {
        field = {
          name : 'year' + i,
          type : 'string',
        }
        fields.push(field);
        me.yearFields.push('year' + i);
      };

      _.log(me, 'modelFields', fields.length, fields);
      gridModel.setFields(fields);
    };

    setGridModelFields();
    _.log(me, 'gridModel', gridModel.getFields());

    /*
    var data = (function() {
      var data = [{
        label : 'Year',
        year1 : 'First Year',
        year2 : 'Second Year'
      }, {
        year1 : '2000',
        year2 : '2001'
      }, {
        label : 'Label',
        //code : 'Code',
        year1 : 'Employees',
        year2 : 'Employees'
      }, {
        label : 'Total Population'
      }, {
        label : 'Group Quarters Population Population'
      }, {
        label : 'Households'
      }, {
        label : 'Average Household Size'
      }];
      return data;
    })();
    */
    
    
        this.data = [{
          label : 'Year',
          year1 : 'First Year',
          year2 : 'Second Year'
        }, {
          year1 : '2000',
          year2 : '2001'
        }, {
          label : 'Label',
          //code : 'Code',
          year1 : 'Value',
          year2 : 'Value'
        }, {
          label : 'Total Population'
        }, {
          label : 'Group Quarters Population Population'
        }, {
          label : 'Households'
        }];//, {
          //label : 'Average Household Size'
       // }];


    this.store = Ext.create('Ext.data.Store', {
      storeId : 'store',
      model : 'GridModel',
      autoLoad: true,
      proxy : {
        type : 'memory'
      }//,
      //data : data
    });

    var cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit : 1
    });

    this.grid = Ext.create('Ext.grid.Panel', {
      selModel : {
        selType : 'cellmodel'
      },
      border : 0,
      margin : '0 5 5 5',
      store : this.store,
      height : 400,
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
        clicksToEdit : 1,
        listeners : {
          beforeedit : function(e, editor) {
            if (editor.rowIdx == 0 || editor.rowIdx == 2) {
              return false;
            }
          }
        }
      })]
    });

    gridColumns = function() {
      var years = _.translate3(_.range(1900, 2013), [{
        setter : function(obj, value) {
          obj.label = value;
          obj.value = value
        }
      }]);
      var cols = [];
      var col = {
        dataIndex : 'label',
        flex : 1,
      };
      cols.push(col);
      for (var i = 1; i <= colNum; i++) {
        col = {
          dataIndex : 'year' + i,
          flex : 1,
          getEditor : function(record) {
            if (record.get('label') === '') {
              var field = Ext.create('Aura.Util.SimpleComboBox', {
                fields : ['value', 'label'],
                valueField : "value",
                displayField : "label",
                data : years,
                matchFieldWidth : false,
                listConfig : {
                  width : 100
                }
              });
            } else {
              var field = Ext.create('Ext.form.field.Number', {
                selectOnFocus : true
              });
            }
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
    this.items = [this.grid];
    this.callParent(arguments);
  },

  listeners : {
    activate : function() {
      _.log(this, 'activate');
      this.build();
    }
  },
  
  build : function(callback) {
    var me = this, project = this.project;

    // if (me.project.demandId) {

    var rows = project.getDefinition().residentialPastTrendInfos;
    _.log(this, 'build', 'rows', rows);

    var srcRowGetter = 'label';
    var x = 0;
    function y() {
      return [me.yearFields[x++]];
    }

    var dstPropSetters = _.pluck3(_.hashify3(rows, 'label'), y);

    srcPropGetters = {
      'Year' : 'year',
      'Total Population' : 'totalPopulation',
      'Group Quarters Population Population' : 'gQPopulation',
      'Households' : 'households'
    };
    dstRowSetter = 'label';

    results = _.values(_.transpose3(rows, srcRowGetter, dstPropSetters, srcPropGetters, dstRowSetter));

    console.log("here",results);
    console.log(JSON.stringify(results, null, 2));
    
    store = me.store;
    store.removeAll();
    store.loadData(this.data); 
    this.grid.reconfigure(store, gridColumns());
    //ali
    
    store = me.store;
    store.each(function(record,idx){
        val = record.get('label');
      
    	 for (var i = 0; i < results.count(); i++)
         {
            
            if (results[i].label == val)
            	{
            	    record.set('year1',results[i].year1);
            	    record.set('year2',results[i].year2);	
            	    record.commit();
            	 	}	             
         }
   
     });
     
    //this.grid.reconfigure(store, gridColumns());
    if (callback) {
        callback();
      }
    //ali

  },

  
  validate : function(callback) {
    var me = this;
    var srcRowGetter = ['data', 'label'];
    var dstPropSetters = {
      'Total Population' : 'totalPopulation',
      'Group Quarters Population Population' : 'gQPopulation',
      'Households' : 'households'
    };
    srcPropGetters = {};
    if (me.store.data.items.length>0) //ali ?check later
    {
	    var yearRecord = me.store.data.items[1];
	    _.each(me.yearFields, function(yearField) {
	      var yearValue = yearRecord.get(yearField);
	      if (yearValue && yearValue !== 0) {
	        srcPropGetters[yearValue] = ['data', yearField];
	      }
	    });
	    var dstRowSetter = function(obj, value) {
	      obj.label = value;
	      obj.year = parseInt(value);
	    };
	
	    var results = _.values(_.transpose3(me.store.data.items, srcRowGetter, dstPropSetters, srcPropGetters, dstRowSetter));
	    _.log(this, 'validate', results);
    }
    var definition = me.project.getDefinition();
    Ext.merge(definition, {
      residentialPastTrendInfos : results
    });
    me.project.setDefinition(definition);
    _.log(this, 'validate', me.project.getDefinition());
    if (callback) {
      _.log(this, 'callback');
      callback();
    }
    return true;
  }
});
