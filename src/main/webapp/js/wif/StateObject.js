Ext.define('Wif.StateObject',
  { requires:
	  [
	  ]
  , mixins:
    { observable: 'Ext.util.Observable'
    , state: 'Ext.state.Stateful'
    }
  , constructor: function(config) {
      var me = this;
      if (config)
      {
        Ext.apply(me, config);
      }
      else
      {
        config = {};
      }
      me.initialConfig = config;
      if (config.events)
      {
        me.addEvents(config.events);
      }
      if (!me.hasListeners)
      {
        me.hasListeners = new me.HasListeners();
      }
      me.mixins.observable.constructor.call(me);
      me.mixins.state.constructor.call(me, config);
      me.loader = me.getLoader();
    }
});