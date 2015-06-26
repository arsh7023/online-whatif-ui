Ext.define('Wif.desktop.ProjectRestore', {
	constructor : function(config) {
	},
	win : null,
	build : function() {
		var me = this;
		this.win = Ext.create('Ext.Window', {
			title : 'Restore Project'
		});

		var form = Ext.create('Ext.form.Panel', {
			width: 400,
			bodyPadding: '10 10 0',
			items : [ {
				xtype : 'filefield',
				emptyText : 'Select file',
				name : 'file',
				buttonText : 'Browse ...'
			}, {
				xtype : 'button',
				text : 'Restore',
				handler : function() {
					var form = this.up('form').getForm();
					me.restore(form);
				}
			} ]
		});

		this.win.add([ form ]);
		this.win.show();
	},
	
	restoreDone: function() {
		this.win.destroy();
	    Wif.eventBus.projectsChanged();
	},

	restore : function(form) {
		var me = this;
		var filename = form.findField('file').getValue();
		if (filename == "") {
			Ext.Msg.alert('No file selected',
							'You need to select a file to upload first.');
			return;
		}

		if (form.isValid()) {
			var restoreUrl = Wif.endpoint + 'projects/restore';
			var url = wifUiConfig['appBase']
					+ '/projectRestore?url='
					+ _.encodeURLComponent(restoreUrl);
			form.submit({
				standardSubmit : true,
				url : url,
				method : 'POST',
				waitMsg : 'Restoring the project...',
				success : function(form, action) {
					_.log(this, 'success', form, action);
					Ext.Msg.alert('Success',
						'The project was restored correctly.');
					me.restoreDone();
				},
				failure : function(form, action) {
					_.log(this, 'failure', form, action);
					Ext.Msg.alert('Failure',
							'There was a problem in restoring the project.');
					me.restoreDone();
				}
			});
		}
	}
});
