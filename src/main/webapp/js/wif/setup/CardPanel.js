Ext.define('Wif.setup.CardPanel', {
  extend: 'Ext.panel.Panel'
, layout: 'card'
, bodyStyle: 'padding:0px'
, defaults: {
    // applied to each contained panel
    border: false
  }
, callback: null
, bbar: [
    { text: 'Back'
    , cls: 'wif-wizard-btn-back'
    , handler: function(btn) {
        btn.up("panel").navigate("prev");
      }
    , disabled: true
    },
    '->', // greedy spacer so that the buttons are aligned to each side
    { text: 'Next'
    , cls: 'wif-wizard-btn-next'
    , handler: function(btn) {
        btn.up("panel").navigate("next");
      }
    }
  ]

, constructor: function (config) {
    Ext.apply(this, config);
    this.callParent(arguments);
  }

, navigate: function(direction) {

    var me = this
      , layout = this.getLayout()
      , activeItem = layout.getActiveItem();

    _.log(this, activeItem);

    function nav() {
      layout[direction]();
      me.down('button[cls=wif-wizard-btn-back]').setDisabled(!layout.getPrev());
      me.down('button[cls=wif-wizard-btn-next]').setDisabled(!layout.getNext());
      activeItem = layout.getActiveItem();
      if (activeItem && activeItem.enterByNavigation) {
    	  activeItem.enterByNavigation();
      }
    }

    if (activeItem && activeItem.validate) {
      activeItem.validate(nav);
      return;
    }
    nav();
  }
});
