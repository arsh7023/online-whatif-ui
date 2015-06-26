/*
 * @class Wif.setup.DemandShow
 *
 * Showing Setup Values.
 * Ali

Ext.require([ 
    'Ext.Window.*', 
    'Ext.grid.*', 
    'Ext.data.*' 
    ]);


 */

Ext.define('Wif.setup.demand.DemandShow', {
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
    console.log('DemandShow.constructor', config, this);
    this.definition.docType = 'DemandConfig';
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
    
      //http://localhost:8080/aurin-wif/projects/DemonstrationTestID/demand/setup
	  var myurl=Wif.endpoint + 'projects/' + projectId + '/demand/setup/';	  
	 
	
	  /*
	  var store =	Ext.create('Ext.data.Store', {
		  fields: ['key', 'name']          
				});

	  
	  var store1 =	Ext.create('Ext.data.Store', {
	           model: 'Usermodel1' 
					});

	  var store2 =	Ext.create('Ext.data.Store', {
          model: 'Usermodel2' 
				});
	  
	  
	    	
    	this.grid1= Ext.create('Ext.grid.Panel', {
      	    title: '',
      	    store: store1,
      	    
      	    columns: [{ text: 'label',  dataIndex: 'label' }
      	        //{ text: 'totalPopulationFeatureFieldName',  dataIndex: 'totalPopulationFeatureFieldName' }

      	    ],
      	    height: 100,
      	    width: 100
      	   
      	});
      	
     	this.grid2= Ext.create('Ext.grid.Panel', {
      	    title: '',
      	    store: store2,  	    
      	    columns: [{ text: 'code',  dataIndex: 'code' }
      	        //{ text: 'totalPopulationFeatureFieldName',  dataIndex: 'totalPopulationFeatureFieldName' }

      	    ],
      	    height: 100,
      	    width: 100
      	   
      	});
    	 
     	*/


    	 this.lbl = Ext.create('Ext.form.Label', {
    	        forId: 'lblID',
    	        html: '<h1>Demand Setup Info has been created!<br>Please click button below for downloading Demand Setup Info</h1><br>',
    	        margin: '0 0 0 10'
    	    });

    	this.btndownload= Ext.create('Ext.Button', {
    		    text: 'Download',
    		    renderTo: Ext.getBody(),
    		    handler: function() {
    		    	
    		    	//win.setLoading(true);
    		    	//win.setLoading('Downloading ...');
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
                  
                 
    		        
                  //win.setLoading(false);
                  //alert('Download Completed!');
    	
    		    }
    		});
    	
     	 this.lbl2 = Ext.create('Ext.form.Label', {
 	        forId: 'lblID2',
 	        html: '<br><br><h1>If you want to create new Demand Setup click button below <br>Warning: All Demand Setup Will be lost!</h1>	<br><br>',
 	        margin: '0 0 0 10'
 	    });
     	 
   
     	this.btndelete= Ext.create('Ext.Button', {
		    text: 'Delete & Continue',
		    renderTo: Ext.getBody(),
		    handler: function() {
		        //alert('You clicked the button!');
		        //delete will write later.
		        
		        //DELETE /projects/{project}/demand/setup/
		
                Ext.Msg.show({
                    title : 'Delete & Continue',
                    msg : '<h1>This will delete the demand setup. Would you like to continue?<h1>',
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
        		    	     , url: Wif.endpoint + 'projects/' + projectId + '/demand/setup/'
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
        				        var wizard = Ext.create('Wif.setup.demand.DemandWizard', {
        				              projectId : projectId, definition: me.definition, isnew : me.isnew
        				            });
        				            _.log(me, 'demand setup', wizard);
        				            wizard.build();
                      }
                    }
                  });
		        
		        		        
		      
		    }
		});    	 
    	 
         var win = Ext.create('Ext.Window', {
             title : 'Demand Setup',
             width : 300,
             height : 300,
             //layout : 'fit',
             items:[this.lbl, this.btndownload, this.lbl2, this.btndelete]
           });
           _.log(this, 'window created');
           //this.win.show();
    	 
    	//Ext.getCmp('txt_totalPopulationFeatureFieldName').setValue(store1.getAt(0).get('totalPopulationFeatureFieldName')); 

    	function showNo() {
    		//alert(cnt);
    		 console.log('in showNo');
    		//win.close();
		
		    var wizard = Ext.create('Wif.setup.demand.DemandWizard', {
	              projectId : projectId, definition: me.definition, isnew : me.isnew
	            });
	            _.log(me, 'demand setup', wizard);
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

	     		//win.show();	     
	     		me.isnew = true;
	     		me.lbl.setText('No Demand Setup Info');
	     		showNo();

	     	
	    	} else {
	    		
	    		_.log(me, 'me.definition.enumerationDistrictFeatureFieldName', data.enumerationDistrictFeatureFieldName);
	     		//me.definition.enumerationDistrictFeatureFieldName = data.enumerationDistrictFeatureFieldName;
	    		//reads data from rest service and assigns to definition
	     		me.definition = data;
	    		me.isnew = false;
	     		//win.show();
	     		showNo();
	     		
	     		
	    		//me.lbl.setText('Demand Setup Info has already created!<br>Download Demand Setup Info');
	    		
		        //var rows1 = data.localJurisdictions;
		        
		        //var options = _.translate3(data, translators);
		        /*
		    	store1.on('datachanged', function () {
		    		store.getCount();
		    	})
		    	*/	
		        
		        /*
		        store1.removeAll();
		        store1.loadData(rows1);
		    
		        var rows2 = data.sectors;
		         store2.removeAll();
	            store2.loadData(rows2);
	            */    	
	            //console.log('ROWS', rows1, rows2);
	        	
	            
	    	}

	    	  

	      }

	      Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
	   
	
      
      _.log(this, 'complete wizard');

    //http://localhost:8080/aurin-wif/projects/DemonstrationTestID/demand/setup/
      _.log(this, 'components created');
    }
    //    catch (err) {
    //    	_.log(this, "Error in setting up ProjectWizard", err);
    //    }
  }
//end build
  
});//ext.define.demand.show

