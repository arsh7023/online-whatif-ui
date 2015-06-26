Ext.require([
  'Ext.selection.CellModel',
  'Ext.grid.*',
  'Ext.data.*',
  'Ext.util.*',
  'Ext.state.*',
  'Ext.form.*',
  'Ext.ux.CheckColumn']);

Ext.Loader.setPath('Ext.ux', 'https://apps.aurin.org.au/assets/js/extjs-4.1.0/ux');

Ext.override(Ext.data.AbstractStore, {
  indexOf : Ext.emptyFn
});

Ext.onReady(function() {

  Ext.QuickTips.init();

  var navigate = function(panel, direction) {
    // This routine could contain business logic required to manage the navigation steps.
    // It would call setActiveItem as needed, manage navigation button state, handle any
    // branching logic that might be required, handle alternate actions like cancellation
    // or finalization, etc.  A complete wizard implementation could get pretty
    // sophisticated depending on the complexity required, and should probably be
    // done as a subclass of CardLayout in a real-world implementation.
    var layout = panel.getLayout();
    layout[direction]();
    Ext.getCmp('move-prev').setDisabled(!layout.getPrev());
    Ext.getCmp('move-next').setDisabled(!layout.getNext());
  };

  var cards = [];

  cards[0] = Ext.create('Ext.form.Panel', {
    id : 'project',
    bodyPadding : 5,
    layout : 'anchor',
    border : 0,

    // The fields
    defaultType : 'textfield',
    items : [{
      fieldLabel : 'Project Name',
      name : 'first'
      //allowBlank: false
    }, {
      fieldLabel : 'Units',
      name : 'last'
      //allowBlank: false
    }, Ext.create('Ext.form.field.ComboBox', {
      typeAhead : true,
      multiSelect: true,
      store : [['Suitability', 'Suitability'], ['Land Use', 'Land Use'], ['Employment', 'Employment']],
      fieldLabel : 'Analysis Option',
      lazyRender : true,
      listClass : 'x-combo-list-small',
      name : 'analType'
      //allowBlank: false
    }), {
      xtype : 'fieldcontainer',
      layout : 'hbox',
      fieldLabel : 'Unified Area Zone',
      items : [{
        xtype : 'filefield',
        id : 'form-file',
        emptyText : 'Select a UAZ file',
        name : 'data-path',
        buttonText : 'Browse ...',
      }, {
        xtype : 'button',
        text : 'Upload',
        handler : function() {
          var form = this.up('form').getForm();
          if (form.isValid()) {
            form.submit({
              url : 'https://dev-api.aurin.org.au/mservices/upload/file/ivow',
              method : 'POST',
              waitMsg : 'Uploading your data...',
              success : function(fp, o) {
                //Ext.Msg.alert('Success', 'Processed file "' + o.result.file + '" on the server');
                console.log(fp, o);
                Ext.Msg.alert('Success', 'Processed file on the server');
              }
            });
          }
        }
      }]
    }],

    // Reset and Submit buttons
    /*buttons: [{
     text: 'Reset',
     handler: function() {
     this.up('form').getForm().reset();
     }
     }, {
     text: 'Submit',
     formBind: true, //only enabled once the form is valid
     disabled: true,
     handler: function() {
     var form = this.up('form').getForm();
     if (form.isValid()) {
     form.submit({
     success: function(form, action) {
     Ext.Msg.alert('Success', action.result.msg);
     },
     failure: function(form, action) {
     Ext.Msg.alert('Failed', action.result.msg);
     }
     });
     }
     }
     }],*/
  });

  Ext.define('Aura.form.workflow.employment.LevelComboBox', {
    extend: 'Ext.form.field.ComboBox',
    typeAhead: true,
    typeAheadDelay: 50,
    triggerAction: 'all',
    selectOnTab: true,
    valueField: "value",
    displayField: "label",
    emptyText : "Select Existing Land Uses",
    multiSelect: true,
    lazyRender: true,
    listClass: 'x-combo-list-small',
    forceSelection: true,
    editable: false,
    queryMode: 'local',
    constructor : function (config) {
      Ext.apply(this, config);
      this.callParent(arguments);
    },
    listConfig : {
      getInnerTpl : function() {
          return '<div class="x-combo-list-item"><img src="' + Ext.BLANK_IMAGE_URL + '" class="chkCombo-default-icon chkCombo" /> ]] {label} </div>';
      }
    }
  });

  var eluCombo = Ext.create('Aura.form.workflow.employment.LevelComboBox', {
    store : Ext.create( 'Ext.data.Store', {
      //autoDestroy: true, // destroy the store if the grid is destroyed
      fields: ['value', 'label'],
      autoLoad: true,
      proxy: {
        type: 'memory',
        reader: {
          type: 'json'
        }
      },
      data:
      [
        {label:'Residential', value:'Residential'},
        {label:'Industrial', value:'Industrial'}
      ],


      constructor: function (config) {
        this.proxy.url = config.url;
        Ext.apply(this, config);
        this.callParent(arguments);
      }
    }),
      listeners: {
        change: function () {
          console.log('COMBOBOX listeners change', arguments);
        }
      },
  });
  /*
  eluCombo = Ext.create('Ext.ux.form.LovCombo', {
    store : Ext.create( 'Ext.data.Store', {
      //autoDestroy: true, // destroy the store if the grid is destroyed
      fields: ['value', 'label'],
      autoLoad: true,
      proxy: {
        type: 'memory',
        reader: {
          type: 'json'
        }
      },
      data:
      [
        {label:'Residential', value:'Residential'},
        {label:'Industrial', value:'Industrial'}
      ],
      constructor: function (config) {
        //this.proxy.url = config.url;
        Ext.apply(this, config);
        this.callParent(arguments);
      }
    })

  });*/

  console.log(eluCombo);
  Ext.define('EluModel', {
    extend: 'Ext.data.Model',
    fields: [{
      name: 'checked',
      type: 'bool'
    }, {
      name: 'label',
      type: 'string'
    }, {
      name: 'value',
      type: 'auto'
    }]
  });

  // create the Data Store
  var store = Ext.create('Ext.data.Store', {
    // destroy the store if the grid is destroyed
    autoDestroy: true,
    autoSync: true, // avoid dirty
    model: 'EluModel',
    proxy: {
      type: 'memory',
      reader: {
        type: 'json'
      }
    }
  });

  var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
    clicksToEdit: 1
  });

  // create the grid and specify what field you want
  // to use for the editor at each header.
  var grid = Ext.create('Ext.grid.Panel', {
    store: store,
    viewConfig:{
      markDirty:false
    },
    columns: [
    {
      xtype: 'checkcolumn',
      dataIndex: 'checked',
      width: 30,
      stopSelection: false
    }, {
      header: 'Label',
      dataIndex: 'label',
      width: 200,
      editor: {
        allowBlank: false
      }
    }, {
      header: 'Value',
      dataIndex: 'value',
      width: 200,
      editor: eluCombo
    }, {
      xtype: 'actioncolumn',
      width: 30,
      sortable: false,
      items: [{
        //icon: '../shared/icons/fam/delete.gif',
        tooltip: 'Delete Plant',
        handler: function (grid, rowIndex, colIndex) {
          store.removeAt(rowIndex);
        }
      }]
    }],
    selModel: {
      selType: 'cellmodel'
    },
    renderTo: Ext.getBody(),
    width: 600,
    height: 400,
    border: 0,
    tbar: [{
      text: 'Add New Item',
      handler: function () {
        // Create a model instance
        var r = Ext.create('EluModel', {
          level0: '',
          price: 0
        });
        gridCount = grid.getStore().getCount();
        store.add(r);
        cellEditing.startEditByPosition({
          row: gridCount,
          column: 0
        });
      }
    }],
    plugins: [cellEditing]
  });

  grid.on('beforeedit', function(editor, e) {
    console.log(e);

    if (e.colIdx === 2) {
      var field = e.field;
      var row = e.record;
      value = e.value;
      console.log('xxx',editor, e, value, e.field, eluCombo);
      //eluCombo.setValue(value.split(','));

    }

    return true;
  });

  grid.on('edit', function(editor, e) {
    console.log(editor, e);

    return true;
  });

  Ext.create('Ext.panel.Panel', {
    title : 'Example Wizard',
    width : 600,
    height : 400,
    layout : 'card',
    bodyStyle : 'padding:0px',
    defaults : {
      // applied to each contained panel
      border : false
    },
    // just an example of one possible navigation scheme, using buttons
    bbar : [{
      id : 'move-prev',
      text : 'Back',
      handler : function(btn) {
        navigate(btn.up("panel"), "prev");
      },
      disabled : true
    }, '->', // greedy spacer so that the buttons are aligned to each side
    {
      id : 'move-next',
      text : 'Next',
      handler : function(btn) {
        navigate(btn.up("panel"), "next");
      }
    }],
    // the panels (or "cards") within the layout
    items : [
    grid
    , {
      id : 'card-1',
      html : '<p>Step 2 of 3</p>'
    }, {
      id : 'card-2',
      html : '<h1>Congratulations!</h1><p>Step 3 of 3 - Complete</p>'
    }],
    renderTo : Ext.getBody()
  });

});