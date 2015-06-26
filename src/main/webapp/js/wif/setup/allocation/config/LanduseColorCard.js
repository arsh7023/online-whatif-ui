Ext.define('Wif.setup.allocation.config.LanduseColorCard', {
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
  title : 'Land Uses - Colors',
  storeData : [],
  isEditing: true, 
  isLoadingExisting: true,
  scenarioRows :[],
  comboData :[],
  gridValues : [],
    
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
   	modelfields.push("associatedColors");
    var gfield_id = {
        text : "label",
        dataIndex : "label",
      };   
    
     
    this.combostore = Ext.create('Ext.data.Store', {
      fields : ["label"],
      data: this.comboData
   });
    
   //
    
    
  
//    ////////////color picker
//    this.assocLuCbox = Ext.define('Ext.ux.form.field.ColorCombo', {
//      extend:'Ext.form.FieldContainer',
//      mixins:{
//          field:'Ext.form.field.Field'
//      },
//      alias: 'widget.xcolorcombo',
//   
//      //configurables
//      combineErrors: true,
//      msgTarget: 'under',
//      layout: 'hbox',
//      readOnly: false,
//   
//      // properties
//      colorValue: null,
//      /**
//       * @property dateField
//       * @type Ext.form.field.Date
//       */
//      colorField: null,
//   
//      initComponent: function(){
//          var me = this
//              ,i = 0
//              ,key
//              ,tab;
//   
//          me.items = me.items || [];
//   
//          me.colorField = Ext.create('Ext.form.field.Trigger', {
//              flex:1,
//              isFormField:false, //exclude from field query's
//              submitValue:false,
//              readOnly: me.readOnly,
//              onTriggerClick: function() {
//                me.picker.show();
//                me.picker.alignTo(me.colorField.inputEl);
//              }
//          });
//          me.items.push(me.colorField);
//   
//          me.picker = Ext.create('Ext.picker.Color', {
//            renderTo: document.body,
//            floating: true,
//            hidden: true,
//            style: {
//              backgroundColor: "#fff"
//            },
//            listeners: {
//              scope:this,
//              select: function(field, value, opts){
//                me.setValue(value);
//                me.picker.hide();
//              }
//            }
//          });
//          me.items.push(me.picker);
//   
//          for (; i < me.items.length; i++) {
//              me.items[i].on('focus', Ext.bind(me.onItemFocus, me));
//              me.items[i].on('blur', Ext.bind(me.onItemBlur, me));
//              me.items[i].on('specialkey', function(field, event){
//                  key = event.getKey();
//                  tab = key == event.TAB;
//   
//                  if (tab && me.focussedItem == me.dateField) {
//                      event.stopEvent();
//                      me.timeField.focus();
//                      return;
//                  }
//   
//                  me.fireEvent('specialkey', field, event);
//              });
//          }
//   
//          me.callParent();
//   
//          // this dummy is necessary because Ext.Editor will not check whether an inputEl is present or not
//          this.inputEl = {
//              dom: document.createElement('div'),
//              swallowEvent:function(){}
//          };
//   
//          me.initField();
//      },
//      focus:function(){
//          this.callParent(arguments);
//          this.colorField.focus();
//          var me = this;
//      },
//   
//      onItemFocus:function(item){
//          if (this.blurTask){
//              this.blurTask.cancel();
//          }
//          this.focussedItem = item;
//      },
//   
//      onItemBlur:function(item, e){
//          var me = this;
//          if (item != me.focussedItem){ return; }
//          // 100ms to focus a new item that belongs to us, otherwise we will assume the user left the field
//          me.blurTask = new Ext.util.DelayedTask(function(){
//              me.picker.hide();
//              me.fireEvent('blur', me, e);
//          });
//          me.blurTask.delay(100);
//      },
//   
//      getValue: function(){
//          var value = null
//              ,color = this.colorField.getSubmitValue();
//   
//          if (color){
//            value = this.colorField.getValue();
//          }
//          return value;
//      },
//   
//      getSubmitValue: function(){
////          var value = this.getValue();
////          return value ? Ext.Date.format(value, this.dateTimeFormat) : null;
//   
//          var me = this
//              ,value = me.getValue();
//   
//          return value;
//      },
//   
//      setValue: function(value){
//          this.colorField.setValue(value);
//      },
//      // Bug? A field-mixin submits the data from getValue, not getSubmitValue
//      getSubmitData: function(){
//          var me = this
//              ,data = null;
//   
//          if (!me.disabled && me.submitValue && !me.isFileUpload()) {
//              data = {};
//              data[me.getName()] = '' + me.getSubmitValue();
//          }
//          return data;
//      }
//  });
   /////////////////////////////////////////////////////////////
 
	    
//    this.assocLuCbox =  Ext.define('Ext.ux.ColorPickerCombo', {
//	      extend: 'Ext.form.field.Trigger',
//	      alias: 'widget.colorcbo',
//	      triggerTip: 'Please select a color.',
//	      onTriggerClick: function() {
//	        var me = this; 
//	        picker = Ext.create('Ext.picker.Color', {     
//	        pickerField: this,     
//	        ownerCt: this,    
//	        renderTo: document.body,     
//	        floating: true,    
//	        hidden: true,    
//	        focusOnShow: true,
//	        style: {
//	                  backgroundColor: "#fff"
//	              } ,
//	        listeners: {
//	                  scope:this,
//	                  select: function(field, value, opts){
//	                  me.setValue('#' + value);
//	                  //alert(value);
//	                  //me.inputEl.setStyle({backgroundColor:value});
//	                 //picker.hide();
//	      },
//	      show: function(field,opts){
//	        field.getEl().monitorMouseLeave(500, field.hide, field);
//	        }
//	              }
//	    });
//	           picker.alignTo(me.inputEl, 'tl-bl?');
//	           picker.show(me.inputEl);
//	      } 
//	    });
    

    
    
//    this.assocLuCbox =Ext.create('Ext.Component',{
//  
//    	return "<p style='vertical-align:top'> <input id='pcolor' style='' value=" + v +" type='color'/> RGB=("+v+")</p>"}
//      
//    });
    
//    this.assocLuCbox =Ext.create('Ext.picker.Color', {
//      value: '993300',  // initial selected color
//      renderTo: Ext.getBody(),
//      listeners: {
//          select: function(picker, selColor) {
//              alert(selColor);
//          }
//      }
//  });
    
//  this.assocLuCbox =Ext.define('Ext.ux.ColorField', {
//  value: '#000000',  // initial selected color
//  msgTarget: 'qtip',
//  fieldLabel: 'Foreground Color',
//  listeners: {
//      select: function(field, color) {
//          alert(color);
//      }
//  }
//});
  
//  this.assocLuCbox =new Ext.ux.ColorField({
//    value: '#000000',  // initial selected color
//    msgTarget: 'qtip',
//    fieldLabel: 'Foreground Color',
//    listeners: {
//        select: function(field, color) {
//            alert(color);
//        }
//    }
//  });
  
//  this.assocLuCbox  = new Ext.picker.Color( {
//  	value: '993300',  // initial selected color
//    listeners: {
//        select: function(picker, selColor) {
//            alert(selColor);
//        }
//    }
//});
//    
//    this.assocLuCbox = new Ext.picker.Color({
//    	fieldLabel: 'Color',
//    	id: 'color',
//    	width: 175,
//    	allowBlank: false
//    });
//    
//    var gfield = new Ext.ux.ColorField({fieldLabel: 'Foreground Color', value: '#000000', msgTarget: 'qtip'});
//    
//    gfield.on('select', function(field, color){
//       
//    });
   
    
  this.assocLuCbox  = new Aura.ux.colorpicker.ColorPickerField( {
	
});

   var gfield = {
   		 xtype: 'gridcolumn',
       text : "color",
       dataIndex : "associatedColors",  
       flex : 2,
       editor : this.assocLuCbox
     };   
   
   


    this.gridfields.push(gfield_id);
    this.gridfields.push(gfield);
    
    this.model = Ext.define('User', {
      extend: 'Ext.data.Model',
      fields: modelfields    
     });
    
    
    this.store = Ext.create('Ext.data.Store', {
    	model: this.model,
    	data : this.storeData
    });
    

  
   this.grid =  Ext.create('Ext.grid.Panel', {
      store: this.store,
      columns : this.gridfields,
      

      autoScroll: true,
      height: 600,
      width: 790,
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

     var definition = me.project.getDefinition(); 
     
     console.log(me.project);
     console.log(me.project.existingLUAttributeName);
     var fieldname = me.project.existingLUAttributeName;
     //fieldname ="allocationLUs";
     
     var waitingMsg = Ext.MessageBox.wait('Please wait loading data...', 'Loading');
     me.loadGridRows(fieldname ,function (){
    	 waitingMsg.hide();
    // me.loadRows( function () {
 			me.fillcombo(function () {
 		   if (callback) { callback(); }	
 	      });
     // });
     });
   
  },
  
  fillcombo : function(callback) {
  	var me = this;
  	  me.storeData = [];
  	  
  	  //grid rows	
	 	  for (var i = 0; i < me.gridValues.count(); i++)
	 		{


//	 	 	      var datafield = {
//	 		          "label" : me.gridValues[i],
//	 		          "associatedColors" : [""]
//	 		        };
//	 	  	
	  	    var f1 = me.gridValues[i].split("@");
	 	  	  var c1 =[];
	 	  	  c1.push( f1[1]);
	 	 	    var datafield = {
 		          "label" : f1[0], //me.gridValues[i]
 		          "associatedColors" :c1
 		        };
	 	 	      
	        me.storeData.push(datafield);
	 		}  	  
  	  
	 	  //combo values
	 	  /*
	 	  for (var i = 0; i < me.scenarioRows.count(); i++)
	 		{

	 	      var datacmb = {
	 	      		"_id" : me.scenarioRows[i]._id,
		          "label" : me.scenarioRows[i].label
		        };
	 	      
	        me.comboData.push(datacmb);
	 		}
  	 	  me.store.removeAll();
	 	  me.combostore.removeAll();
	 	 

		 	  if (me.combostore.data.length==0)
			  {

				 	  me.combostore.loadData(me.comboData);
			  }	*/
	 	  
	 	  	 	me.store.loadData(me.storeData);
	 		
	 	  	 
	 	 	 	var definition = me.project.getDefinition(); 
		    if (!(definition.colorALUs == undefined))
		    {
		        var rows = definition.colorALUs;
			      for (var i = 0; i< rows.length; i++) 
			      	{
			      	   var lbl =  rows[i].label;
		      	  	 var obj = rows[i].associatedColors;

				     	  	me.store.each(function(record,idx){
                  val = record.get('label');  
          		    if (val == lbl)
          		    {
          		         val1 = record.set('associatedColors', obj);
				               record.commit();
          		    }				             
				         }); 
			      	
			      	}
			 		}	 
	 	
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
		    val1 = record.get('associatedColors');
		    if (val1 == "")
		    	{
		    	val1 ="#FFFFFF"
		    	}
		    plannedALUs =[];
		   str= str + '{' + '\"' + 'label' + '\"' + ':' + '\"' + val + '\"' + ',' + '\"' + 'associatedColors' + '\"' + ':' + '\"' + val1 + '\"';
		    
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
  	 
     //str = str + ']';
  	 
  	 var definition = me.project.getDefinition(); 
  	 
     Ext.merge(definition, {
	    	colorALUs : JSON.parse(str)
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
  
  loadGridRows: function (fieldname,callback) {
   	_.log(me, '333333');
     var me = this;
     _.log(me, 'loading combo rows', me);

       var serviceParams = {
          xdomain: "cors"
         , url: Wif.endpoint + 'projects/' + me.project.projectId + '/unionAttributes/colorsforaluconfig/'  //unionAttributesfixed
         , method: "get"
         , headers: {
           "X-AURIN-USER-ID": Wif.userId
           }
         };


       _.log(me, 'URL', Wif.endpoint + 'projects/' + me.project.projectId + '/unionAttributes/colorsforaluconfig/');  //unionAttributesfixed
     function serviceHandler(data, status) {
       _.log(me, 'loaded combo rows before', me);
       me.gridValues = data;
           
       _.log(me, 'loaded combo rows after', me.gridValues);
      if (callback) { callback(); }
     }

       Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

   }
  
});
