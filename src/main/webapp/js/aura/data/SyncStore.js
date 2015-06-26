/**
 * Store with static data
 * User will not be able to edit this store directly
 *
 */
Ext.define('Aura.data.SyncStore', {
  extend: 'Ext.data.Store'
, autoLoad: false
, proxy: {
    type: 'memory'
  , reader: {
      type: 'json'
    }
  }

, inTranslators: null
, outTranslators: null
, serviceParams: null
, idField: '_id'
, revField: '_rev'
, massageBeforeStore: null

, constructor: function (config) {
    Ext.apply(this, config);
    this.callParent(arguments);
    this.addEvents('remotechanged', 'remoteerror', 'remotedelete');
  }

, remoteUpdateRevision: function(record, callback) {
    var me = this;
    var serviceParams = Ext.clone(me.serviceParams);

    Ext.apply(serviceParams, {
      method: 'get'
    , params: null
    });
    serviceParams.url += record.get('_id');
  
  function serviceHandler(data, status) {
      _.log(me, 'remoteUpdateRevision rx', me, data, status);
    if (!data) {
      _.log(me, 'No data received', data, status);
      me.fireEvent('remoteerror', me);
      return;
    }

      try {
        record.set('_rev', data._rev);
      } catch(e) {
        _.log(me, 'something is wrong in loading data', data, e);
      }

    me.fireEvent('remotechanged', me);
    if (callback) { callback(); }
  }
    _.log(me, 'remoteUpdateRevision tx', serviceParams);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, remoteList: function () {
    var me = this
      , serviceParams = Ext.clone(me.serviceParams);

    Ext.apply(serviceParams, {
      method: "get"
    , params: null
    });

    function serviceHandler(data, status) {
        _.log(me, 'remoteList rx', me, data, status);
      if (!data) {
        _.log(me, 'No data received', data, status);
        me.fireEvent('remoteerror', me);
        return;
      }

      if (_.isEmpty(data)) {
        _.log(me, 'Empty data received', data, status);
      }

      try {
        me.getProxy().clear();
        me.removeAll();
        me.sync();
      } catch(e) {
        _.log(me, 'something is wrong in removing records', data);
      }
      if (!_.isEmpty(data)) {
        _.log(me, 'loaded data', data);
        try {
          me.loadData(data);
        } catch(e) {
          _.log(me, 'something is wrong in loading data', data, e);
        }
      }

      me.fireEvent('remotechanged', me);
    }
    _.log(me, 'remoteList tx', serviceParams);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, remoteAddInternal: function (record,callback) {
    var me = this
      , serviceParams = Ext.clone(me.serviceParams);

    record.phantom = false; // set it early even though the request might fail

    Ext.apply(serviceParams, {
      method: "post"
    , params: _.translate(record.data, me.outTranslators)
    });
    if (me.massageBeforeStore) {
    	me.massageBeforeStore(serviceParams.params);
    }

    // For some reason, Spring MVC doesn't like it when you pass
    // nulls. Just clear them instead.
    if (serviceParams.params._id != null) {
    	_.log(me, "For some reason _id is not null", serviceParams);
    	if (callback) {
    	    callback();	
    	}
    	return;
    }
    delete serviceParams.params._id;   	
    delete serviceParams.params._rev;    	
    
    function serviceHandler(data, status) {
      _.log(me, 'remoteAdd rx', record, me, data, status);
      if (!data || !data[me.idField]) {
    	_.log(me, "remoteAddInternal failed", serviceParams, data, status);
        record.phantom = true; // fail to add
        me.fireEvent('remoteerror', me);
        return;
      }
      record.set(me.idField, data[me.idField]);
      record.set(me.revField, data[me.revField]);
      if (callback) { callback(); }
    }
    _.log(me, 'remoteAdd tx', serviceParams);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, remoteAdd: function (record) {
    var me = this;
	me.remoteAddInternal(record, function () {
	      me.fireEvent('remotechanged', me);
	});
  }


, remoteUpdate: function (record, callback) {
    var me = this
      , serviceParams = Ext.clone(me.serviceParams);

    Ext.apply(serviceParams, {
      method: 'put'
    , params: _.translate(record.data, me.outTranslators)
    });
    serviceParams.url += record.get('_id');
    if (me.massageBeforeStore) {
    	me.massageBeforeStore(serviceParams.params);
    }

    function serviceHandler(data, status) {
        _.log(me, 'remoteUpdate rx', record, me, data, status);

      if (!data) {
        me.fireEvent('remoteerror', me);
        if (callback) { callback(); }
        return;
      }
      me.remoteUpdateRevision(record, function() {
    	  me.fireEvent('remoteChanged', me);
          if (callback) { callback(); }
      });
    }
    _.log(me, 'remoteUpdate tx', serviceParams);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, remoteZap: function (callback) {
    var me = this;
    
    var cb = function() {
    	me.fireEvent('remoteDelete', me);
    	if (callback) { callback(); }
    };

    var records = [];
    me.each(function (record) {
    	records.push(record);
    });
    
    while (records.length > 0) {
    	var prevcb = cb;
    	var rec = Ext.clone(records.pop());
    	var newcb = function(record,prevcb) {
    		return function () {
    			me.remoteDeleteInternal(record, prevcb);
    		};
    	};
    	cb = newcb(rec,prevcb);
    }
    cb();
  }

, remoteUpload: function (callback) {
    var me = this;

    var records = [];
    me.each(function (record) {
    	records.push(record);
    });
    var cb = function(record) {
        me.fireEvent('remotechanged', me);
        if (callback) {
        	callback();
        }
    };
	_.log(me, "remote uploading records", Ext.clone(records));
    while (records.length > 0) {
    	var prevcb = cb;
    	var rec = Ext.clone(records.pop());
    	var newcb = function(record,prevcb) {
    		_.log(me, "scheduling remote upload of record", rec);    		
    		return function () {
    			_.log(me, "remote uploading record", record);
    			me.remoteAddInternal(record, prevcb);
    		};
    	};
    	cb = newcb(rec,prevcb);
    }
    cb();
  }

, remotePush: function () {
    var me = this;

    me.each(function (record) {
      me.remoteUpdate(record);
    });
  }

, remoteDeleteInternal: function (record,callback) {
    var me = this
      , serviceParams = Ext.clone(me.serviceParams);

    Ext.apply(serviceParams, {
      method: 'delete'
    , params: null
    });
    serviceParams.url += record.get('_id');

    function serviceHandler(data, status) {
        _.log(me, 'remoteDelete rx', record, me, data, status);

      if (!data) {
        me.fireEvent('remoteerror', me);
        return;
      }
      else {
    	  me.fireEvent('remotechanged', me);
      }
      if (callback) {
    	  callback();
      }
    }
    _.log(me, 'remoteDelete tx', serviceParams);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, remoteDelete: function(record, callback) {
	var me = this;
	this.remoteDeleteInternal(record, function() {
		me.fireEvent('remotedelete', me);
		if (callback) { callback(); }
	});
}

});