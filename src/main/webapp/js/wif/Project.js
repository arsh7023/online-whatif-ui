Ext.define('Wif.Project', {

  projectId: null
, projectData: null
, projectFactorsData: null
, projectAllocationLusData: null

, projectName: null
, studyArea: null
, bbox: null
, srs: null

, allocationLus: null
, suitabilityLus: null
, associatedLus: null
, factors: null

, sluIds: null
, sluFields: null
, modelFields: null
, modelName: null

, constructor: function (config) {

    Ext.apply(this, config);
  }

/*, load: function (callback) {
    var me = this;

    if (!me.projectId) {
      _.log(me, 'load project', me);
      return;
    }
    var serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + me.projectId
        , method: "get"
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };
    
    Ext.Msg.show({
      title: 'Loading ...',
      msg: 'Loading Project Setup',
      icon: Ext.Msg.INFO,
    });
    


    function serviceHandler(projectData, status) {
      function factorsServiceHandler(factorsData, status) {
    	  function alusServiceHandler(alusData, status) {
    		  Ext.Msg.hide();
              me.projectData = projectData;
              me.projectFactorsData = factorsData;
              me.projectAllocationLusData = alusData;    		  
              me.prepareProject();
              me.genModel();
              if (callback) { callback(); }
    	  }    	  
          var serviceParams = {
                  xdomain: "cors"
                , url: Wif.endpoint + 'projects/' + me.projectId + '/allocationLUs'
                , method: "get"
                , headers: {
                  "X-AURIN-USER-ID": Wif.userId
                  }
                };
          Aura.data.Consumer.getBridgedService(serviceParams, alusServiceHandler, 0);      
      }
      var serviceParams = {
              xdomain: "cors"
            , url: Wif.endpoint + 'projects/' + me.projectId + '/factors'
            , method: "get"
            , headers: {
              "X-AURIN-USER-ID": Wif.userId
              }
            };
      Aura.data.Consumer.getBridgedService(serviceParams, factorsServiceHandler, 0);      
    }
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }
*/

, load: function (callback) {
		
  var me = this;

  if (!me.projectId) {
    _.log(me, 'load project', me);
    return;
  }
  
  
	me.loadColumns(function() {
	  me.loadRows1( function () {
			me.loadMainData1(function () {
				//me.loadother(function () {
				 me.prepareProject();
				 me.genModel();
		    if (callback) { callback(); }	
	    });
	   });
  	});
	//});
  
 
}



//ali

, loadother: function (callback) {
  var me = this;
  _.log(me, 'project loading other', me);

//  me.prepareProject();
//  me.genModel();

  me.prepareProject(function() {
	  me.genModel( function () {
	  	Ext.Msg.hide();
		    if (callback) { callback(); }	
	    });
	   }); 
 }

, loadColumns: function (callback) {
  var me = this;
  _.log(me, 'project loading columns', me);

    var serviceParams = {
        xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/allocationLUs/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
   _.log(me, 'project loaded columns before', me);
   me.projectAllocationLusData = data;
    _.log(me, 'project  loaded columns after', me.projectData);
    if (callback) { callback(); }
  }

   Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  
}

, loadRows1: function (callback) {
	_.log(me, '333333');
  var me = this;
  _.log(me, 'loading rows', me);

  
  //, url: Wif.endpoint + 'projects/' + me.projectId + '/allocationLUs/'
    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId + '/factors/'
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'project loaded rows before', me);
    me.projectFactorsData = data;
   
    _.log(me, 'project loaded rows after', me.projectFactorsData);
    //me.show();
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

}

, loadMainData1: function (callback) {
	_.log(me, '44444');
  var me = this;
  _.log(me, 'project loading Main rows', me);

    var serviceParams = {
       xdomain: "cors"
      , url: Wif.endpoint + 'projects/' + me.projectId
      , method: "get"
      , headers: {
        "X-AURIN-USER-ID": Wif.userId
        }
      };


  function serviceHandler(data, status) {
    _.log(me, 'project loaded main data before', me);
    me.projectData =  data;
   
    _.log(me, 'project loaded maina data after', me.projectData);
   if (callback) { callback(); }
  }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);

}

///////////////////////
, prepareProject: function (callback) {

    var me = this
      , i, j
      , projectData = me.projectData
      , suitabilityLus = projectData.suitabilityLUs
      , allocationLus = _.hashify3(me.projectAllocationLusData, '_id')
      , associatedLus = {}
      , factors = me.projectFactorsData;

    me.projectName = projectData.name;
    me.studyArea = projectData.studyArea;
    me.bbox = projectData.bbox;
    me.srs = projectData.srs;

    modelFields = [{
      name: 'property',
      type: 'string'
    }, {
      name: 'type',
      type: 'string'
    }, {
      name: 'group',
      type: 'string'
    }, {
      name: 'aluId',
      type: 'string'
    }, {
      name: 'key',
      type: 'auto'
    }, {
      name: 'meta',
      type: 'auto'
    }, {
      name: 'groupIdx',
      type: 'auto'
    }, {
      name: 'children',
      type: 'auto'
    }];

    /*

    "suitabilityLUs" : [ {
      "id" : 81,
      "scoreLabel" : "SCORE_2",
      "label" : "Mixed Use",
      "featureFieldName" : "SCORE_2",
      "associatedALUs" : {
        "35" : "Regional Retail",
        "33" : "Local Retail"
      }
    }, ...

    */

    var sluIds = [], sluFields = [];

    for (i = 0, j = suitabilityLus.length; i < j; i++) {
      var slu   = suitabilityLus[i];
      // var label = slu.label;
      var alus  = slu.associatedALUs;
      var id    = slu._id;
      var fName = 'f' + id;

      associatedLus[id] = alus;
      sluIds.push(id);
      sluFields.push(fName);
      modelFields.push({
        name: fName
      , type: 'auto'
      });
      modelFields.push({
        name: 'f' + id +'disable'
      , type: 'auto'
      });
    }

    this.suitabilityLus = suitabilityLus;
    this.allocationLus = allocationLus;
    this.associatedLus = associatedLus;
    this.factors = factors;

    this.sluIds = sluIds;
    this.sluFields = sluFields;
    this.modelFields = modelFields;
    
    if (callback) { callback(); }
  }

, genModel: function (callback) {
    var me = this
      , modelName = 'Wif.analysis.SuitabilityScenarioModel' + me.projectId;
    _.log(me, 'Creating model', modelName, me.modelFields);

    Ext.define(modelName, {
      extend: 'Ext.data.Model',
      fields: me.modelFields
    });

    this.modelName = modelName;
    if (callback) { callback(); }
    //return modelName;
  }

});
