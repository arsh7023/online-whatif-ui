
Ext.define('Wif.setup.allocation.config.AllocationConfigShow', {
  demandId : null,
  requires : ['Wif.RESTObject'],
  definition : {},
  isnew : null,
  getDefinition : function() {
    return this.definition;
  },
  setDefinition : function(definition) {
    this.definition = definition;
  },
  getIsnew : function() {
    return this.isnew;
  },
  cardPanel : null,
  win : null,
  constructor : function(config) {
    Ext.apply(this, config);
    console.log('AllocationConfig.constructor', config, this);
    this.definition.docType = 'AllocationConfigs';
    if (config && config.projectId) {
      this.projectId = config.projectId;
      // = this.definition.projectId
    } else {
      this.projectId = null;
    }
  },
  build : function() { {
	  var me = this;
	  projectId = this.projectId;

      Ext.define('Usermodel1', {
  	    extend: 'Ext.data.Model',
  	    fields: [ 'label']
  	  });
      
      Ext.define('Usermodel2', {
    	    extend: 'Ext.data.Model',
    	    fields: [ 'code']
    	  });      
    
      //http://localhost:8080/aurin-wif/projects/DemonstrationTestID/AllocationConfigs/setup
	  var myurl=Wif.endpoint + 'projects/' + projectId + '/AllocationConfigs/setup/';	  

    	 this.lbl = Ext.create('Ext.form.Label', {
    	        forId: 'lblID',
    	        html: '<h1>AllocationConfigs Setup Info has been created!<br>Please click button below for downloading AllocationConfigs Setup Info</h1><br>',
    	        margin: '0 0 0 10'
    	    });

    	this.btndownload= Ext.create('Ext.Button', {
    		    text: 'Download',
    		    renderTo: Ext.getBody(),
    		    handler: function() {
    		    	
    		        var downloadUri = wifUiConfig['appBase'] + 'downloader?' +
                    _.encodeURL({
                      url: Wif.endpoint + 'projects/' + projectId + '/zipUAZ',
                      headers: JSON.stringify({
                        'X-AURIN-USER-ID': Wif.userId
                      }),
                      accept: 'application/zip',
                      fileName: 'demandsetup' + '.zip',
                      method: 'get'
                    });
                  _.log(me, 'save prj', projectId, downloadUri);
                  
                  Aura.util.ResourceDownload.download({
                      method: 'post',
                      url: downloadUri
                    });
                  
    		    }
    		});
    	
     	 this.lbl2 = Ext.create('Ext.form.Label', {
 	        forId: 'lblID2',
 	        html: '<br><br><h1>If you want to create new AllocationConfigs Setup click button below <br>Warning: All AllocationConfigs Setup Will be lost!</h1>	<br><br>',
 	        margin: '0 0 0 10'
 	    });
     	 
   
     	this.btndelete= Ext.create('Ext.Button', {
		    text: 'Delete & Continue',
		    renderTo: Ext.getBody(),
		    handler: function() {
	
		        //DELETE /projects/{project}/demand/setup/
		
                Ext.Msg.show({
                    title : 'Delete & Continue',
                    msg : '<h1>This will delete the AllocationConfigs setup. Would you like to continue?<h1>',
                    buttons : Ext.Msg.YESNO,
                    icon : Ext.Msg.QUESTION,
                    fn : function(btn) {
                      if (btn === 'yes') {
                    	  
                    	  /* temporarily comment
                    	  function serviceHandler1(data, status) {
        		    	      
        		    	      win.setLoading(false);
        		    	    }

                    	  
        		    	    var serviceParams1 = {
        		    	       xdomain: "cors"
        		    	     , url: Wif.endpoint + 'projects/' + projectId + '/AllocationConfigs/setup/'
        		    	     , method: "delete"
        		    	     , headers: {
        		    	       "X-AURIN-USER-ID": Wif.userId
        		    	     }
        		    	    };
        		    	    win.setLoading('Deleting ...');
        		    	    
        		    	      Aura.data.Consumer.getBridgedService(serviceParams1, serviceHandler1, 0, 1);
        		    	    */  
        		    	      
        		    	      //after delete
        		    	      win.close();
        		    	      console.log({
    				              projectId : projectId, definition: me.definition
  				            });
        		    	       //data available , pass projectID and definition to DemandWizard
        				        var wizard = Ext.create('Wif.setup.allocation.config.AllocationConfigsWizard', {
        				              projectId : projectId, definition: me.definition, isnew : me.isnew
        				            });
        				            _.log(me, 'AllocationConfigs setup', wizard);
        				            wizard.build();
                      }
                    }
                  });
		        
		        		        
		      
		    }
		});    	 
    	 
         var win = Ext.create('Ext.Window', {
             title : 'AllocationConfigs Setup',
             width : 300,
             height : 300,
             //layout : 'fit',
             items:[this.lbl, this.btndownload, this.lbl2, this.btndelete]
           });
           _.log(this, 'window created');
           //this.win.show();
    	 

    	function showNo() {
    		//alert(cnt);
    		 console.log('in showNo');
    		//win.close();
		
		    var wizard = Ext.create('Wif.setup.allocation.config.AllocationConfigWizard', {
	              projectId : projectId, definition: me.definition, isnew : me.isnew
	            });
	            _.log(me, 'AllocationConfigs setup', wizard);
	            wizard.build();
    		
    	}
      
      
	  var serviceParams = {
		    xdomain : "cors",
		    url : myurl,
		    method : "get",
		    params : null,
		    headers : {
		      "X-AURIN-USER-ID" : Wif.userId
		    }
		  };
		  
	  
	      function serviceHandler(data) {
	        
	    	  win.setLoading(false);
	    	//alert(rows);
	     	if (_.size(data) === 0)
	    	{
    
	     		me.isnew = true;
	     		me.lbl.setText('No AllocationConfigs Setup Info');
	     		showNo();

	     	
	    	} else {
	    		
	    		_.log(me, 'me.definition', data);
	    		//reads data from rest service and assigns to definition
	     		me.definition = data;
	    		me.isnew = false;
	     		//win.show();
	     		showNo();

	    	  }
	      }

	      Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    
      _.log(this, 'complete wizard');

    //http://localhost:8080/aurin-wif/projects/DemonstrationTestID/AllocationConfigs/setup/
      _.log(this, 'components created');
    }

  }
//end build
  
});//ext.define
