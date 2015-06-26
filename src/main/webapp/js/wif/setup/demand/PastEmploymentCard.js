Ext.define('Wif.setup.demand.PastEmploymentCard', {
  requires : ['Wif.setup.demand.DemandWizard'],
  extend : 'Ext.form.Panel',
  project : null,
  title : 'Past - Employment',
  yearFields : [],
  firstLoad : false,

  constructor : function(config) {
    var me = this, colNum = 2;
    Ext.apply(this, config);

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

    this.grid = Ext.create('Ext.grid.Panel', {
      selModel : {
        selType : 'cellmodel'
      },
      hideHeaders : false,
      cls : 'gridNoHeader',
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

    var gridColumns = function() {
      var years = _.translate3(_.range(1900, 2013), [{
        setter : function(obj, value) {
          obj.label = value;
          obj.value = value
        }
      }]);
      var cols = [];
      var col = {
        dataIndex : 'code',
        flex : 1
      };
      cols.push(col);
      col = {
        dataIndex : 'label',
        flex : 1
      }
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
      this.build();
    }
  },

  build : function() {
    var me = this, store = me.store, sectors = me.project.getDefinition().sectors;
    if (!me.firstLoad) {
      me.firstLoad = true;
      store.add({
        label : 'Year',
        year1 : 'First Year',
        year2 : 'Second Year'
      }, {
        year1 : '2000',
        year2 : '2001'
      }, {
        label : 'Label',
        code : 'Code',
        year1 : 'Employees',
        year2 : 'Employees'
      });
    }
    _.each(sectors, function(sector) {
      var recordMatch = store.findRecord('code', sector.code);
      if (!recordMatch) {
        store.add(sector);
      }
    });
    var xx = me.project.getDefinition().employmentPastTrendInfos;
    _.log(this, 'here33', xx);
    var emp= me.project.getDefinition().employmentPastTrendInfos;
    store.each(function(record,idx){
	       val = record.get('label');
	       
  	         for (var i = 0; i < emp.count(); i++)
	         {  	  	        	 
  	        	for (var j = 0; j < emp[i].employmentEntries.count(); j++) 
  	        		{
  	        		   if (emp[i].year =='2000')			            
			            {
  	        			    if (emp[i].employmentEntries[j].sectorLabel == val)
			            	{
			            	    record.set('year1',emp[i].employmentEntries[j].employees);
			            	}
			            }
  	        		   else if (emp[i].year =='2001')
  	        		    {
 	        			    if (emp[i].employmentEntries[j].sectorLabel == val)
			            	{
			            	    record.set('year2',emp[i].employmentEntries[j].employees);
			            	}
			            }
  	        		}
	         }
	         record.commit();

    	   });
  },

  validate : function(callback) {
    var me = this;
    var srcRowGetter = ['data', 'label'];
    var propSetFunc = function(label) {
      return function(obj, value, objSrc) {
        if (!obj.employmentEntries)
          obj.employmentEntries = [];
        obj.employmentEntries.push({
          sectorLabel : label,
          employees : value
        })
      };
    };
    var dstPropSetters = {}
    var sectors = me.project.getDefinition().sectors;
    _.each(sectors, function(sector) {
      var sectorLabel = sector.label;
      dstPropSetters[sectorLabel] = propSetFunc(sectorLabel);
    });

    srcPropGetters = {};
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
    var definition = me.project.getDefinition();
    Ext.merge(definition, {
      'employmentPastTrendInfos' : results
    });
    me.project.setDefinition(definition);
    _.log(this, 'validate', me.project.getDefinition());
    if (callback) {
      callback();
    }
    return true;
  }
});
