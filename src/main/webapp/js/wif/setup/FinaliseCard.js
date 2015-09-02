Ext.define('Wif.setup.FinaliseCard', {
  extend: 'Ext.form.Panel'
, title: 'Finalise WhatIf Setup'
, bodyPadding: 5
, project: null
, layout: 'anchor'
, margin: 'auto'
, defaultType: 'textfield'
, fieldDefaults: {
    labelAlign: 'right'
  , labelWidth: 320
  , labelSeparator: ''
  , width: 700
  }
, unionAttrCbox: null
, mask: null
, serviceParams: null
, items: [
    { xtype: 'fieldcontainer'
    , height: 100
    , layout: 'hbox'
    , fieldLabel: ' '
    , items: [
        { xtype: 'button'
        , text: 'Finalise Setup'
        , handler: function() {
            var me = this
              , form = this.findParentByType('form')
              , mask = form.mask = Ext.create('Ext.LoadMask', me, {msg: "Please wait while the setup is finalised ..."});

            console.log('FIN', form);
            mask.show();

            function serviceHandler(data, status) {
              _.log(me, 'Finalizing', data, status);
              if (status && status === 200 && data == "") {
            	  Ext.MessageBox.alert('Finalised', 'Project setup is complete.');
            	  form.project.selfDestroy();
            	 
              }
              else {
            	  // TODO This code could be useful elsewhere.
            	  
            	  var matchTomcatErrorReport = /Apache Tomcat\/[0-9.]* - Error report/i;
            	  if (matchTomcatErrorReport.exec(data)) {
            		  var matchMessage = /^.*<b>message<\/b>\W*<u>(.*)<\/u>.*<b>description<\/b>\W*<u>(.*)<\/u>.*$/;
            		  var report = data.replace(matchMessage, "<blockquote><p>$1</p><p>$2</p></blockquote>");
            		  Ext.MessageBox.alert('Error', '<p>Finalization did not succeed. The server returned the following information:</p>' + report);
            	  }
            	  else {
            		  _.log(me, 'Finalization did not work', data, status);
            		  Ext.MessageBox.alert('Error', 'Finalization did not succeed for an unknown reason. Please contact the administrator of this tool.');
            	  }
              }
              mask.hide();
              form.project.selfDestroy();
              
              
            }
            _.log(me, 'Finalizing', form.serviceParams);
            Aura.data.Consumer.getBridgedService(form.serviceParams, serviceHandler, 0, 1);
          } // handler
        }
      ]
    }
  ]
, constructor: function (config) {
    var me = this;

    Ext.apply(me, config);
    me.callParent(arguments);
  }

, listeners: {
    activate: function() {
      _.log(this, 'activate');
      this.build();
    }
  }

, build: function () {
    var me = this,
        projectId = this.project.projectId;

    if (projectId) { // do this before callParent
      me.serviceParams = {
        xdomain: "cors"
      , url: Wif.endpoint + 'projects/' +  projectId + '/UAZ/'
      , method: "put"
      , params: me.project.factorList
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };
    }

  }

});