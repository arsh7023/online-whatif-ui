Ext.define('Wif.setup.trend.trendnewShow', {
	demandId: null,
	requires: [ 'Wif.RESTObject' ],
	definition: {},
	isnew: null,
	getDefinition: function() {
		return this.definition;
	},
	setDefinition: function(definition) {
		this.definition = definition;
	},
	getIsnew: function() {
		return this.isnew;
	},
	cardPanel: null,
	win: null,
	constructor: function(config) {
		Ext.apply(this, config);
		console.log('demandnewShow.constructor', config, this);
		//this.definition.docType = 'DemandConfigNew';
		this.definition.docType = 'DemandConfig';
		if (config && config.projectId) {
			this.projectId = config.projectId;
			// = this.definition.projectId
		} else {
			this.projectId = null;
		}
	},
	build: function() {
		{
			var me = this;
			projectId = this.projectId;

			//http://localhost:8080/aurin-wif/projects/DemonstrationTestID/demand/setup
			//var myurl = Wif.endpoint + 'projects/' + projectId
			//		+ '/demandnew/setup/';
			var myurl = Wif.endpoint + 'projects/' + projectId
			+ '/demand/setup/';

			var win = Ext.create('Ext.Window', {
				title: ' Demand Setup',
				width: 300,
				height: 300,
				//layout : 'fit',
				items: [ this.lbl, this.btndownload, this.lbl2, this.btndelete ]
			});
			_.log(this, 'window created');
			//this.win.show();

			//Ext.getCmp('txt_totalPopulationFeatureFieldName').setValue(store1.getAt(0).get('totalPopulationFeatureFieldName')); 

			function showNo() {
				//alert(cnt);
				console.log('in showNo');
				//win.close();

				var wizard = Ext.create('Wif.setup.trend.trendnewWizard', {
					projectId: projectId,
					definition: me.definition,
					isnew: me.isnew
				});
				_.log(me, 'demand setup', wizard);
				wizard.build();

			}

			var serviceParams = {
				xdomain: "cors",
				url: myurl,
				method: "get",
				params: null,
				headers: {
					"X-AURIN-USER-ID": Wif.userId
				}
			};

			function serviceHandler(data) {

				win.setLoading(false);
				//alert(rows);
				if (_.size(data) === 0) {

					//win.show();	     
					me.isnew = true;
					//me.lbl.setText('No Manual Demand Setup Info');
					showNo();

				} else {

					_.log(me, 'me.definition', data);
					me.definition = data;
					me.isnew = false;
					
					showNo();

				}

			}

			Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

			//showNo();
			_.log(this, 'complete wizard');

			//http://localhost:8080/aurin-wif/projects/DemonstrationTestID/demand/setup/
			_.log(this, 'components created');
		}

	}
//end build

});
