Ext.define('Wif.RESTObject',
  { mixins: { observable: 'Ext.util.Observable' }
  , urlBase: null
  , id: null
  , data: null
  , timeout: null
  , unverified: true
  , singletonObject: false
  , constructor: function(config) {
    if (config) {
      Ext.apply(this, config);
    }
    else {
    config = {};
    }
    if (!this.urlBase) {
    this.urlBase = '/';
    }
    this.addEvents(['beforeget', 'getsuccess', 'getfail',
                'beforeput', 'putsuccess', 'putfail',
                'beforepost', 'postsuccess', 'postfail',
                'afterverify']);
    if (!this.hasListeners) {
      this.hasListeners = new this.HasListeners();
    }
    this.mixins.observable.constructor.call(this);
    }
  , push: function() {
	  var me = this;
	  if (me.id != null) {
		  me.put();
	  }
	  else {
		  me.post();
	  }
  }
  
  //new push
  , pushali: function() {
	  var me = this;
	  if (me.id != null) {
		  me.putali();
	  }
	  else {
		  me.post();
	  }
  }
  
  , put: function() {
    var me = this;
    var theUrl = this.urlBase;
    if (!me.singletonObject) {
    	theUrl += this.id;
    }
    me.fireEvent('beforeput', me, me.id, me.data);
      var serviceParams = {
              xdomain: "cors"
            , url: theUrl
            , method: "put"
            , params: me.data
            , headers: {
              "X-AURIN-USER-ID": Wif.userId
              }
            };
    function serviceHandler(data, status) {
    if ((status === 200 || status === 201) && data) {
          me.fireEvent('putsuccess', me, me.id, me.data);
    }
    else {
          me.fireEvent('putfail', me, me.id, status);
    }
    }
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    }
  
  //new put
  , putali: function() {
    var me = this;
    var theUrl = this.urlBase;
    if (!me.singletonObject) {
    	theUrl += this.id;
    }
    me.fireEvent('beforeput', me, me.id, me.data);
      var serviceParams = {
              xdomain: "cors"
            , url: theUrl
            , method: "put"
            , params: me.data
            , headers: {
              "X-AURIN-USER-ID": Wif.userId
              }
            };
    function serviceHandler(data, status) {
    if ((status === 200 || status === 201) && data) {
          me.fireEvent('putsuccess', me, me.id, data);
    }
    else {
          me.fireEvent('putfail', me, me.id, status);
    }
    }
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    }
  //new put
  
  , post: function() {
    var me = this;
    me.fireEvent('beforepost', me, me.data);
      var serviceParams = {
              xdomain: "cors"
            , url: this.urlBase
            , method: "post"
            , params: me.data
            , headers: {
              "X-AURIN-USER-ID": Wif.userId
              }
            };
    function serviceHandler(data, status) {
    if ((status === 200 || status === 201) && data) {
          if ('id' in data) {
            me.id = data.id;
          } else if ('_id' in data) {
            me.id = data['_id'];
          } else if (!me.singletonObject) {
            me.id = 'tempID';
            alert('Failure in getting ID');
          }

          if ('_id' in data) {
        	  me.data = data;
          }
          me.fireEvent('postsuccess', me, me.id, me.data);
    }
    else {
          me.fireEvent('postfail', me, status);
    }
    }
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    }
  , get: function() {
    var me = this;
    var theUrl = this.urlBase;
    if (!me.singletonObject && this.id) {
    	theUrl += this.id;
    }
    me.fireEvent('beforeget', me);
      var serviceParams = {
              xdomain: "cors"
            , url: theUrl
            , method: "get"
            , params: null
            , headers: {
              "X-AURIN-USER-ID": Wif.userId
              }
            };
    function serviceHandler(data, status) {
    if ((status === 200 || status === 201) && data) {
          me.data = data;
          if (me.unverified) {
            me.fireEvent('afterverify', me, data);
            me.unverified = false;
          }
          if (me.timeout) {
        setTimeout(function() { me.unverified = true; }, me.timeout);
      }
          me.fireEvent('getsuccess', me, data);
    }
    else {
          me.fireEvent('getfail', me, me.id, status);
    }
    }
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    }
  , verify: function() {
      if (this.unverified) {
        this.get();
      }
      else {
        this.fireEvent('afterverify', this, this.data);
      }
    }
  , forceVerify: function() {
    this.invalidate();
      this.verify();
    }
  , invalidate: function() {
    this.unverified = true;
    }
  }
);