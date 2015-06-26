Ext.define('Wif.analysis.SuitabilityConversionStore', {
  requires: [
    'Ext.data.*'
  ],
  extend: 'Ext.data.Store',
  autoSync: true,
  proxy:
    { type: 'memory'
    , reader: { type: 'json' }
    }
  , construct: function() {
	  this.root.children = this.data;
    }
});
