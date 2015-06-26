// XXX This is fairly inelegant, and could probably be better done
// with a proxy or membrane.
Ext.define('Wif.model.ProjectsSimpleModel', {
	mixins: { observable: 'Ext.util.Observable' },
	requires: [ 'Wif.model.ProjectsSimpleObject' ],

    constructor: function(config) {
      var me = this;
      if (config) {
    	  Ext.apply(me, config);
      }
      me.onBeforeVerify = null;
      me.onAfterVerify = null;
      me.onChanged = null;
      me.onFailure = null;
  	  me.addEvents(['beforeverify', 'afterverify', 'changed', 'failure']);
	  if (!me.hasListeners) {
	    me.hasListeners = new me.HasListeners();
	  }
	  me.mixins.observable.constructor.call(this);
	  me.hook();
    },
    verify: function() {
      Wif.projectsSimpleObject.verify();
    },
    hook: function() {
      var me = this;

      var remoteObject = Wif.projectsSimpleObject;
      
      if (!me.onBeforeVerify) {
        me.onBeforeVerify = function(remote) {
      	  me.fireEvent('beforeverify', this);
        };
        remoteObject.on('beforeverify', me.onBeforeVerify);      
      }
      if (!me.onAfterVerify) {
        me.onAfterVerify = function(remote, data) {
      	  me.fireEvent('afterverify', this, data);
        };
        remoteObject.on('afterverify', me.onAfterVerify);
      }
      if (!me.onChanged) {
        me.onChanged = function(remote, data) {
      	  me.fireEvent('changed', me, data);
        };
        remoteObject.on('changed', me.onChanged);
      }
      if (!me.onFailure) {
        me.onFailure = function(remote, data) {
      	  me.fireEvent('failure', me, data);
        };
        remoteObject.on('failure', me.onFailure);
      }
    },
    unhook: function() {
      var me = this;
      var remoteObject = Wif.projectsSimpleObject;
      if (me.onBeforeVerify) {
    	  remoteObject.un('beforeverify', me.onBeforeVerify);
        me.onBeforeVerify = null;
	  }
	  if (me.onAfterVerify) {
		  remoteObject.un('afterverify', me.onAfterVerify);
        me.onAfterVerify = null;
      }
      if (me.onChanged) {
    	  remoteObject.un('changed', me.onChanged);
        me.onChanged = null;
      }
      if (me.onFailure) {
    	  remoteObject.un('failure', me.onFailure);    	
        me.onAfterVerify = null;
      }
    },
    destroy: function() {
      this.unhook();
    }
});

