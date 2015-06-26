Ext.define('Wif.analysis.SuitabilityFactorStore', {
  requires: [
    'Ext.data.*'
  ],
  extend: 'Ext.data.TreeStore'
  , proxy:
	{ type: 'memory'
	, reader: { type: 'json' }
	}
  , construct: function() {
	  this.setRootNode({
		 text: "."
        , expanded: true
        , children: this.data
	  });
  }
});
