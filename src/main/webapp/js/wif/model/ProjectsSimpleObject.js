Ext.define('Wif.model.ProjectsSimpleObject', {
	mixins: { observable: 'Ext.util.Observable' },
	requires: [ 'Wif.RESTObject' ],
    remoteObject: null,
    constructor: function(config) {
      var me = this;
      if (config) {
    	  Ext.apply(me, config);
      }
  	  me.addEvents(['beforeverify', 'afterverify', 'changed', 'failure']);
	  if (!me.hasListeners) {
	    me.hasListeners = new me.HasListeners();
	  }
	  me.mixins.observable.constructor.call(this);
      me.remoteObject = Ext.create('Wif.RESTObject', {
          urlBase: wifUiConfig.endpoint + 'projects/'
        , data: null
        , timeout: 10000
        , listeners: {
           getsuccess: function(remote, data) {
             me.fireEvent('changed', me, data);
           },
           getfail: function(remote, status) {
             me.fireEvent('failure', status);
           },
           afterverify: function(remote, data) {
         	 me.fireEvent('afterverify', me, data);
           }
        }
      });
      Wif.eventBus.on('projectsChanged', function() {
    	 me.remoteObject.forceVerify(); 
      });
    },
     verify: function() {
       var me = this;
       me.fireEvent('beforeverify', me);
       me.remoteObject.verify();
     }
});