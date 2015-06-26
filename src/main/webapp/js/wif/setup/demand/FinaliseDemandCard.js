Ext.define('Wif.setup.demand.FinaliseDemandCard', {
  extend : 'Ext.form.Panel',
  title : 'Finalise Demand Setup',
  bodyPadding : 5,
  project : null,
  layout : 'anchor',
  margin : 'auto',
  defaultType : 'textfield',
  fieldDefaults : {
    labelAlign : 'right',
    labelWidth : 320,
    labelSeparator : '',
    width : 700
  },
  mask : null,
  items : [{
    xtype : 'fieldcontainer',
    height : 100,
    layout : 'hbox',
    fieldLabel : ' ',
    items : [{
      xtype : 'button',
      text : 'Finalise Setup',
      handler : function() {
        var form = this.findParentByType('form');
        form.setLoading(true);
        
        function success(remote, id, data) {
          form.setLoading(false);
          // me.demandId = id;
          _.log('demand setup done', data);
          Ext.Msg.alert('Success', 'Demand setup information saved successfully');
          Wif.eventBus.projectsChanged();
        }

        function failure(remote, status) {
          _.log('demand setup failed', status);
          form.setLoading(false);
          Ext.Msg.alert('Error', 'Could not save the demand setup information');
        }	

        
        
        _.log('demandid', form.project.definition._id);
        var remoteObject = Ext.create('Wif.RESTObject', {
          urlBase : Wif.endpoint + 'projects/' + form.project.projectId + '/demand/setup/',
          data : form.project.definition,
          id : form.project.definition._id,
          singletonObject : true,
          listeners : {
            putsuccess : success,
            postsuccess : success,
            postfail : failure,
            putfail : function(remote, id, status) {
              failure(remote, status);
            }
          },
          putfail : function(remote, status) {
          }
        });
        remoteObject.push();
      }
    }
    //ali
    ,{
        xtype: 'button',
        style: { float: 'right' },
        text: 'Download Report',
        handler: function () {        	  
		// XXX This is ugly
        	
		      var downloadUri = wifUiConfig['appBase'] + 'DemandSetupReport';
		      //_.log('download report', downloadUri);

		      Aura.util.ResourceDownload.download({
		          method: 'get',
		          url: downloadUri,
		          params: {
		             url: Wif.endpoint + 'projects/' + projectId
		             + '/demand/setup/report/',
		             userId: Wif.userId,
		             fileName: projectId + '.csv'
		          }
		        });
		  }

        }     
    //test ali for download
    ]
  }],

  constructor : function(config) {
    var me = this;
    Ext.apply(me, config);
    me.callParent(arguments);
  },
  listeners : {
    activate : function() {
      _.log(this, 'activate');
      this.build();
    }
  },
  build : function() {
    var me = this, projectId = this.project.projectId;
    console.log(me, "definition", JSON.stringify(me.project.getDefinition()));
  }
});
