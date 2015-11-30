Ext.define('Wif.setup.demandnew.FinalisedemandnewCard', {
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
        
        /*
        var newdif1 = form.project.definition.demographicTrends1[0].demographicData;
        var newdif2 = form.project.definition.demographicTrends2[0].demographicData;
        
        var newdif=[];
        newdif.add(newdif1);
        newdif.add(newdif2);
        
        Ext.merge(form.project.definition, {
              demographicTrends:[{demographicData : newdif}]
        });
        
        
        "employmentPastTrendInfos": [],
        "employmentGrowthRates": [],
        "demographicTrends": []
        "localJurisdictions": [],
        "sectors" : [],
        "includeTrends": false
        */
        
 
//        Ext.merge(form.project.definition, {
//              _id: form.project.projectId
//        });
//        
        
        //////newnewnewnew
        Ext.merge(form.project.definition, {
         	includeTrends: true
         });
        /////////end newnewnew
        
        
        form.project.setDefinition(form.project.definition);
        
        var x = 0;
        
        function success(remote, id, data) {
          form.setLoading(false);
          // me.demandId = id;
          _.log('demand setup done', data);
          Ext.Msg.alert('Success', 'Demand setup information saved successfully');
          //Wif.eventBus.projectsChanged();
        }

        function failure(remote, status) {
          _.log('demand setup failed', status);
          form.setLoading(false);
          Ext.Msg.alert('Warning', 'Demand data saved - no automatic trends.');
        }	

        
        
        
        
        _.log('demandid', form.project.definition._id);
        var remoteObject = Ext.create('Wif.RESTObject', {
          //urlBase : Wif.endpoint + 'projects/' + form.project.projectId + '/demandnew/setup/',
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
