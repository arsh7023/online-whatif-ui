Ext.define('Wif.setup.LuFunctionComboBox', {
	extend : 'Ext.form.field.ComboBox',
	xtype : 'lufunctioncombobox',
	typeAhead: true,
	typeAheadDelay: 50,
	triggerAction: 'all',
	selectOnTab: true,
	listClass: 'x-combo-list-small',
	multiSelect: false,
	editable: true,
	allowBlank: false,
	dataMap: null,
	abbrevLabel: function(key) {
		return this.dataMap[key].abbrevLabel;
	},
	constructor : function (config) {
		var model = Ext.define('Wif.setup.LuFunctionModel',
				{
			extend: 'Ext.data.Model',
			fields: [
			         {
			        	 name: 'enum',
			        	 type: 'string'
			         },
			         {
			        	 name: 'abbrevLabel',
			        	 type: 'string'
			         },
			         {
			        	 name: 'label',
			        	 type: 'string',
			        	 defaultValue: 'Factor'
			         }
			         ]
				});
		var data = [
		            {
		            	'enum': 'LBCS_1XXX',
		            	'abbrevLabel': 'Residential',
		            	'label': 'Residence or accommodation'
		            },
		            {
		            	'enum': 'LBCS_2XXX',
		            	'abbrevLabel': 'Sales/Services',
		            	'label': 'General sales or services'
		            },
		            {
		            	'enum': 'LBCS_3XXX',
		            	'abbrevLabel': 'Manufact/Wholesale',
		            	'label': 'Manufacturing and wholesale trade'
		            },
		            {
		            	'enum': 'LBCS_4XXX',
		            	'abbrevLabel': 'Transport/Commun',
		            	'label': 'Transportation, communication, information, and utilities'
		            },
		            {
		            	'enum': 'LBCS_5XXX',
		            	'abbrevLabel': 'Arts/Entertain/Rec',
		            	'label': 'Arts, entertainment, and recreation'
		            },
		            {
		            	'enum': 'LBCS_6XXX',
		            	'abbrevLabel': 'Educ/Pub Admin/Instit',
		            	'label': 'Education, public administration, health care, and other institutions'
		            },
		            {
		            	'enum': 'LBCS_7XXX',
		            	'abbrevLabel': 'Construction',
		            	'label': 'Construction-related businesses'
		            },
		            {
		            	'enum': 'LBCS_8XXX',
		            	'abbrevLabel': 'Mining/Extraction',
		            	'label': 'Mining and extraction establishments'
		            },
		            {
		            	'enum': 'LBCS_9XXX',
		            	'abbrevLabel': 'Ag/Forest/Fish',
		            	'label': 'Agriculture, forestry, fishing, and hunting'
		            },
		            {
		            	'enum': 'NOT_DEVELOPABLE_OR_UNDEFINED',
		            	'abbrevLabel': 'Not Develop/Not Defined',
		            	'label': 'Non-developable or unknown use'
		            }
		            ];
		var store = Ext.create('Ext.data.Store', {
			'fields': fields,
			'data': data,
			'model': model
		});

		var fields = config.fields || ['enum', 'abbrevLabel', 'label'];
		config.fields = fields;

		Ext.applyIf(config, {
			valueField: fields[0],
			displayField: fields[1],
			store: store,
			queryMode: 'local'
		});
		Ext.apply(this, config);

		this.callParent(arguments);

		var dataMap = {};
		for (var i in data) {
			var record = data[i];
			dataMap[record.enum] = record;
		}
		this.dataMap = dataMap;

		/*
		// ToolTip to give the full definition of a LU function
		this.tip = Ext.create('Ext.tip.ToolTip', {
			target: this,
			delegate: view.itemSelector,
			trackMouse: true,
			renderTo: Ext.getBody(),
			listeners: {
				beforeShow: function updateTipBody(tip) {
					tip.update(view.getRecord(tip.triggerElement).get('label'));
				}
			}
		});
		*/
	}
});
