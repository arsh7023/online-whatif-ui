Ext.define('Wif.analysis.SuitabilityScenario', {
  requires: [
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*',
    'Ext.ux.CheckColumn',
    'Aura.visual.BrewerPalette',
    'Wif.analysis.SuitabilityConversionStore',
    'Wif.analysis.SuitabilityFactorStore',
    'Wif.RESTObject'
  ]

, slider : null //ali
, lswSlider : false//ali

, factorMax: 100

, projectId: null
, project: null

, needAnalysis: false

, suitabilitySelector: null
, suitabilityScoreRanges: null


, label: ''
, scenarioId: null
, scenarioData: null
, scenarioPostData: null
, scenarioVals: null

, minmaxData: []

, ruleIds: null

, factorColumns: null
, conversionColumns: null

, factorData: null
, conversionData: null

, factorStore: null
, conversionStore: null

, firstColumnWidth: 250
, defColumnWidth: 100

, selectedBbox: null

, wmsStyles: null

, constructor: function (config) {
    Ext.QuickTips.init();
    Ext.override(Ext.data.AbstractStore, {
      indexOf: Ext.emptyFn
    });
    Ext.apply(this, config);
  }

, analysisPresent: false
, analysisInSync: false
, analysisBroken: false
, analysisStartedHere: false
, analysisInProgress: false
, dirty: false

, updateAnalysisState: function(newState) {
var me = this;
_.log(me, 'updateAnalysisState', newState);
me.analysisState();
me.analysisInProgress = false;
if (newState === 'not available') {
me.analysisPresent = false;
me.analysisInSync = false;
} else if (newState === 'erroneous') {
me.analysisPresent = false;
me.analysisBroken = true;
me.analysisInSync = false;
} else if (newState === 'running') {
        me.analysisPresent = false;
me.analysisInSync = false;
me.analysisBroken = false;
me.analysisInProgress = true;
} else if (newState === 'ready' || newState === 'success') {
me.analysisBroken = false;
me.analysisPresent = true;
me.analysisInSync = !me.dirty;
} else {
_.log(me, 'Unknown analysis state', newState);
}
me.analysisState();
  }

// XXX delete me after debugging
, analysisState: function() {
var me = this;
_.log(me, 'analysisPresent', me.analysisPresent);
_.log(me, 'analysisInSync', me.analysisInSync);
_.log(me, 'analysisBroken', me.analysisBroken);
_.log(me, 'analysisStartedHere', me.analysisStartedHere);
_.log(me, 'dirty', me.dirty);
  }


//, scenarioDataParse: function () {
//	  var me = this;
//	  me.findminmax(function() {
//	    me.scenarioDataParse(function() {
//	    });
//   });
//	    
//}

, findminmax: function (callback) {
	  var me = this;
	
	  if (!me.scenarioId) {
	    _.log(me, 'load scenario', me);
	    return;
	  }
	
	  console.log('inside findminmax');
	
	  var serviceParams = {
	        xdomain: "cors"
	      , url: Wif.endpoint + 'projects/' + me.projectId + '/suitabilityLUsScores/'
	      , method: "get"
	      , headers: {
	        "X-AURIN-USER-ID": Wif.userId
	        }
	      };
	
	
	  function serviceHandler(data, status) {
	  
	    console.log('findminmax', data);
	    me.minmaxData = data;
	    if (callback) { callback(); }
	  }
	
	  Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
}


, scenarioDataParse: function () {
    var me = this;

    console.log('start scenarioDataParse');
    
    var rows = this.scenarioData.suitabilityRules;
    //new
    var NewsuitabilityScoreRanges = {};
    
    var scenarioVals = {};
    for (var i in rows) {
      var row = rows[i], factors = {};
      
      //new
      var minSum = 0;
      var maxSum = 0;
      //
      
      
      for (var j in row.factorImportances) {
        var fi = row.factorImportances[j], factorTypes = {};
        
        //new 
        var headValue = fi.importance;
        var minValue = 10000;
        var maxValue = 0;
        var lsw= false;
        //new
       
        for (var k in fi.factorTypeRatings) {
          var ftr = fi.factorTypeRatings[k];
          factorTypes[_.keys(ftr.factorType)[0]] = {
            'score': ftr.score
          };
          
          //new
             if (ftr.score > 0 )
            	 {
            	     lsw = true;
            	 }
             if (ftr.score >= maxValue)
            	 {
            	     maxValue = ftr.score;
            	 }
             if (ftr.score <= minValue)
          	 {
            	 if (ftr.score >0)
            		 {
          	     minValue = ftr.score;
          	     }
          	 }
          
        }//end for (var k)
        //new        
        if (minValue == 10000) {
        	minValue = 1;
        }
        if (maxValue == 0) {
        	maxValue = 1;
        }    
        if (lsw == false)
        	{
	        	minValue=0;
	        	maxValue = 0;
        	}
        minSum = minSum  + (headValue * minValue);   
        maxSum = maxSum  + (headValue * maxValue);
        //new
   
        
        factors[_.keys(fi.factor)[0]] = {
          'importance': fi.importance,
          'factorTypes': factorTypes
        };
        
        
      }//end for (var j)
      
       //new
        for (var ii = 0; ii< me.project.suitabilityLus.length; ii++)
        	{
        	     if (me.project.suitabilityLus[ii]._id ==  _.keys(row.suitabilityLU)[0])
        	    	 {
        	          NewsuitabilityScoreRanges[_.keys(row.suitabilityLU)[0]] = {
        	           featureFieldName: me.project.suitabilityLus[ii].featureFieldName
        	         , choroplethRangeMin: minSum
        	         , choroplethRangeMax: maxSum
        	         };
        	    	 }    
        	}
        //
      
      
      scenarioVals[_.keys(row.suitabilityLU)[0]] = {
          'convertibles': row.convertibleLUs,
          'factors': factors
      };
    
    }//end for (var i in rows)
    
    this.scenarioVals = scenarioVals;

    var ruleIds = {};
    var suitabilityScoreRanges = {};

    var sluHash = _.hashify3(me.project.suitabilityLus, '_id');

    _.each(rows, function (rule, key) { // each rule
      var sluId = _.keys(rule.suitabilityLU)[0]
        , ruleId = {
          factors: {}
          };
      if (rule._id != null) {
     ruleId._id = rule._id;
      }

      var choroplethRange = 0;

      _.each(rule.factorImportances, function (factorImp, key) {
        var fId = _.keys(factorImp.factor)[0]
          , factorId = {};

        choroplethRange += parseFloat(factorImp.importance) * me.factorMax;

        factorId.types = {};
        _.each(factorImp.factorTypeRatings, function (factorType, key) {
          var ftId = _.keys(factorType.factorType)[0];
          factorId.types[ftId] = factorType._id;
        });
        ruleId.factors[fId] = factorId;
      });
      ruleIds[sluId] = ruleId;

      suitabilityScoreRanges[sluId] = {
        featureFieldName: sluHash[sluId].featureFieldName
      , choroplethRange: choroplethRange
      };
    });

    me.ruleIds = ruleIds;
    me.suitabilityScoreRanges = suitabilityScoreRanges;
    //new
    me.suitabilityScoreRanges = NewsuitabilityScoreRanges;
    
    _.log(me, 'NewsuitabilityScoreRanges start', NewsuitabilityScoreRanges, me);
    
    console.log('NewsuitabilityScoreRanges start' + NewsuitabilityScoreRanges);
  },
  
  verifyConvertibleLUs: function() {
      var me = this,
         suitabilityLus = me.project.suitabilityLus,
         ok = true;
       _.log(me, 'verifyConvertibleLus');
      for (var i in suitabilityLus) {
          var slu = suitabilityLus[i];
          var id = slu._id;
          var sluField = 'f' + id;
          var thisSluOk = false;
          me.conversionStore.each(function (record, index) {
         if (record.get(sluField)) {
         thisSluOk = true;
         }
         });
         ok = ok && thisSluOk;
      }
      return ok;
  },

  scenarioPostDataBuild: function () {
    _.log(this, 'scenarioPostDataBuild', this, this.project);

    var me = this
      , suitabilityLus = me.project.suitabilityLus
      , factors = me.project.factors
      , sluIds = me.project.sluIds
      , sluFields = me.project.sluFields;


    var factorStore = me.factorStore;
    var conversionStore = me.conversionStore;
    var ruleIds = me.ruleIds;
    var suitabilityRules = [];
    var choroplethRange = 0, suitabilityScoreRanges = {}, NewsuitabilityScoreRanges ={};
    _.log(me, "Preparing update factorStore", factorStore);
    _.log(me, "Preparing update conversionStore", conversionStore);
    _.log(me, "Preparing update suitabilityLus", suitabilityLus);
    _.log(me, "Preparing update factors", factors);
    _.log(me, "Preparing update sluIds", sluIds);
    _.log(me, "Preparing update sluFields", sluFields);
    _.log(me, "Preparing update ruleIds", ruleIds);

    for (var i in suitabilityLus) {
    	
      //new
      var minSum = 0;
      var maxSum = 0;
      //
    	
      var slu = suitabilityLus[i];
      var id = slu._id;
      var label = slu.label;
// var alus = slu.associatedALUs;
      var ffn = slu.featureFieldName;
      var sluField = 'f' + id;

      _.log(me, "suitabilityLu", i, slu);

      var suitabilityRule = {
        "suitabilityLU" : {}
      , "docType" : 'SuitabilityRule'
      };
      
      if (me.scenarioId != null) {
     suitabilityRule.scenarioId = me.scenarioId;
      }

      var convertibleLus = {};
      suitabilityRule.suitabilityLU[id] = label;

      if (ruleIds && ruleIds[id]._id) {
        suitabilityRule._id = ruleIds[id]._id;
      }

      var factorRecords = factorStore.getRootNode().childNodes;
      _.log(me, "factorRecords", factorRecords);
      var factorImportances = [];
      _.each(factorRecords, function (record, index) {
        var label = record.get('property')
          , key = record.get('key')
          , group = record.get('group')
          , factorImportance, factorTypeRatings = [], importance;

        importance = record.get(sluField);
        _.log(me, " factorRecord", index, record, label, key, group, importance);
        
        
        //new 
        var headValue = importance;
        var minValue = 10000;
        var maxValue = 0;
        //new
        

        factorImportance = {
          factor: {}
        , importance: importance
        };

        choroplethRange += parseFloat(importance) * me.factorMax;

        factorImportance.factor[key] = label;
        //new
        var lsw = false;
        var factorTypeRecords = record.childNodes;
        _.each(factorTypeRecords, function (record, index) {
          var label = record.get('property')
            , key2 = record.get('key')
            , factorTypeRating;

          factorTypeRating = {
            factorType: {}
          , score: record.get(sluField)
          };

          factorTypeRating.factorType[key2] = label;
          factorTypeRatings.push(factorTypeRating);
          

          //new
          if (record.get(sluField) > 0 )
        	 {
        	     lsw = true;
        	 }
          if (record.get(sluField) > maxValue)
         	 {
         	     maxValue = record.get(sluField);
         	 }
          if (record.get(sluField) < minValue)
	       	 {
	         	 if (record.get(sluField) >0)
	         		 {
	       	     minValue = record.get(sluField);
	       	     }
	       	 }
          //new
                
        }); // each factorType
        factorImportance.factorTypeRatings = factorTypeRatings;
        factorImportances.push(factorImportance);
        
        //new        
        if (minValue == 10000) {
        	minValue = 1;
        }
        if (maxValue == 0) {
        	maxValue = 1;
        }     
        if (lsw == false)
      	{
        	minValue=0;
        	maxValue = 0;
      	}
        minSum = minSum  + (headValue * minValue);   
        maxSum = maxSum  + (headValue * maxValue);
        //new
        
      }); // each factorRecord
      suitabilityRule.factorImportances = factorImportances;
      suitabilityScoreRanges[id] = {
        featureFieldName: ffn
      , choroplethRange: choroplethRange
      };
      
      //new
      NewsuitabilityScoreRanges[id] = {
          featureFieldName: ffn
        , choroplethRangeMin: minSum
        , choroplethRangeMax: maxSum
      };
      //new

      convertibleLus = {};
      conversionStore.each(function (record, index) {
        var label = record.get('property')
          , aluId = record.get('aluId');

        if (record.get(sluField)) {
          convertibleLus[aluId] = label;
        }
      });
      suitabilityRule.convertibleLUs = convertibleLus;
      suitabilityRules.push(suitabilityRule);
    } // for

    me.scenarioPostData = {
      label: me.label
    , docType: "SuitabilityScenario"
    , projectId: me.projectId
    , featureFieldName: me.label
    , suitabilityRules: suitabilityRules
    };
    if (me.scenarioId != null) {
      me.scenarioPostData._id = me.scenarioId;
    }

    _.log(me, 'scenarioPostDataBuild', me.scenarioPostData, me);
    me.suitabilityScoreRanges = suitabilityScoreRanges;
    
    //new
    me.suitabilityScoreRanges = NewsuitabilityScoreRanges;
    _.log(me, 'NewsuitabilityScoreRanges after change', NewsuitabilityScoreRanges, me);
    

    return me.scenarioPostData;
  }
 
  
, launch: function () {
    var me = this;

    me.project = Ext.create('Wif.Project', {
      projectId: me.projectId
    });

    function newScenario () {
      me.show();
    };

    function existingScenario (callback) {
    	
      me.prepareScenario();
      me.prepareStore();
      //me.show();   
      me.show(function() { me.checkWmsNew();  if (callback) { callback(); } });      
      //if (callback) { callback(); }
    };

    me.project.load(function () {
      _.log(me, 'projectloaded', me);
      me.selectedBbox = eval(me.project.bbox);
      if (me.selectedBbox.length == 1) {
     me.selectedBbox = me.selectedBbox[0];
      }
      if (me.scenarioId) {
//        _.log(me, 'launch - remoteLoad', me);
//        me.remoteLoad(existingScenario);
        
      	//newali
        me.findminmax(function() {
        	me.remoteLoad(existingScenario);  
        	//Ext.getCmp('conversionPanelId').getStore().load();
        });
        
        
        
       } else {
        Ext.Msg.prompt('Name', 'Please enter a scenario name:', function(btn, text) {
          if (btn === 'ok') {
            me.label = text;
            me.prepareScenario();
            me.prepareStore();
            me.remoteAdd(newScenario);
          }
        });
      }
    });

  }

, remoteAdd: function (callback) {

    var me = this;
    _.log(me, 'about to remoteAdd', callback);
    me.scenarioPostDataBuild();
    Ext.Msg.show({
        title: 'Creating ...',
        msg: 'Creating Suitability Scenario',
        icon: Ext.Msg.INFO
      });

    var remoteObject = Ext.create('Wif.RESTObject',
      { urlBase: Wif.endpoint + 'projects/' + me.projectId + '/suitabilityScenarios/'
      , data: me.scenarioPostData
      , listeners:
        { postsuccess: function(remote, id, data) {
            Ext.Msg.hide();
            _.log(me, 'scenario created', data);
            me.scenarioId = id;
            me.scenarioData = data;
            me.scenarioDataParse();
            if (callback) { callback(); }
            
            // Tell everyone that the project list changed.
            Wif.eventBus.projectsChanged();
     }
        }
        , postfail: function(remote, status) {
            _.log(me, 'scenario creation failed', status);
            Ext.Msg.alert('Error', 'Could not create a suitability scenario');
            if (callback) { callback(); }
          }
        }
    );

    remoteObject.post();
  }

, remoteUpdate: function (callback) {

	
    var me = this;
    
    //newali
    me.lswSlider = false;
    
    if (!me.scenarioId) {
      _.log(me, 'scenario has not been added', me);
      me.remoteAdd(callback);
      return;
    }

    me.scenarioPostDataBuild();

    var serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + me.projectId + '/suitabilityScenarios/' + me.scenarioId
        , method: "put"
        , params: me.scenarioPostData
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

    Ext.Msg.show({
      title: 'Loading ...',
      msg: 'Updating Suitability Scenario',
      icon: Ext.Msg.INFO
    });

    function serviceHandler(data, status) {
      Ext.Msg.hide();
      _.log(me, 'scenario updated', data);
      if (callback) { callback(); }
    }

    _.log(me, "Updating suitability scenario", serviceParams.url, me.scenarioPostData);
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, remoteLoad: function (callback) {
    var me = this;

    if (!me.scenarioId) {
      _.log(me, 'load scenario', me);
      return;
    }

    _.log(me, 'loading scenario', me);

    var cancelled = false
      , serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + me.projectId + '/suitabilityScenarios/' + me.scenarioId
        , method: "get"
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

    Ext.Msg.show({
      title: 'Loading ...',
      msg: 'Loading Suitability Scenario',
      icon: Ext.Msg.INFO,
      fn: function (btn) {
        cancelled = true;
      }
    });

    function serviceHandler(data, status) {
      Ext.Msg.hide();
      if (cancelled) return;
      _.log(me, 'loaded scenario', me);
      me.scenarioData = data;
      me.label = data.label;
      me.scenarioDataParse();
      if (callback) { callback(); }
    }

    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, prepareScenario: function () {

    var me = this
      , project = me.project
      , suitabilityLus = project.suitabilityLus
      , allocationLus = project.allocationLus
      , associatedLus = project.associatedLus
      , factors = project.factors
      , sluIds = project.sluIds.sort()
      , sluFields = []
      , paletteNum = (factors.length < 12) ? factors.length : 12;

    _.log(me, 'prepareScenario', project);

    var factorRenderer = function (value, metaData, record, row, col, store, gridView) {

      var groupIdx = record.get('groupIdx')
        , colorSet = Aura.visual.BrewerPalette.qualitative[paletteNum]['Set3'].colors
        , hexStr = colorSet[groupIdx]
        , hsl = d3.hsl(hexStr)
        , h = hsl.h, s = hsl.s, l = hsl.l
        , newL = l + 0.8*((100-value)*(1-l)/100)
        , background = d3.hsl(h, s, newL);

      if (record.get('type') === 'factor') {
        metaData.style = 'font-weight:bold;color:black;';
      } else {
        metaData.style = 'color:black;';
      }
      metaData.style += 'background-color:' + background.toString() + ';';
      
      //this.fireEvent('blur');
      return value;
    };

    var conversionRenderer = function (value, metaData, record, row, col) {
      var cssPrefix = Ext.baseCSSPrefix
        , cls = [cssPrefix + 'grid-checkheader']
        , sluField = sluFields[col-1];

      if (record.raw[sluField+'disable'] === true) {
        cls.push(cssPrefix + 'grid-checkheader-disabled');
      } if (value === true) {
        cls.push(cssPrefix + 'grid-checkheader-checked');
      } else if (value === false) {
        cls.push(cssPrefix);
      }
      return '<div class="' + cls.join(' ') + '">&#160;</div>';
    };

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
    _.log(me, 'creating column');

    // Creating column definition for Suitability Scenario
    var slu, id, label, fName, factorColumn, conversionColumn;
    var factorColumns = [{
      xtype: 'treecolumn',
      text: 'Factor',
      width: me.firstColumnWidth,
      sortable: true,
      dataIndex: 'property'
    }];

    var conversionColumns = [{
      text: 'Current Land Uses to be converted',
      sortable: true,
      width: me.firstColumnWidth,
      dataIndex: 'property'
    }];

    var sluSelection, suitabilitySelector = [];

    var alphabeticalOrdering = function(a,b) {
      var ka = a.label.toLowerCase();
      var kb = b.label.toLowerCase();
        if (ka < kb) return -1;
        if (ka > kb) return 1;
        return 0;
    };

    var inxd = 0;
    
    for (var i in suitabilityLus.sort(alphabeticalOrdering)) {
      slu = suitabilityLus[i];
      label = slu.label;
      id = slu._id;
      fName = 'f' + id;
      sluFields.push(fName);

      sluSelection = {boxLabel: label, name: 'rb', inputValue: id};
      //if (!i) sluSelection.checked = true;
      suitabilitySelector.push(sluSelection);

      factorColumn = {
        text: label
      , dataIndex: fName
      , width: me.defColumnWidth
      , editor: {
          xtype: 'numberfield',
          allowBlank: false,
          minValue: 0,
          maxValue: 100,
          step: 1
        }
      , align: 'right'
      , renderer: factorRenderer
      };
      
      
      ////// new slider
//      console.log('alllllllli');
//      //console.log(fName);
//      console.log(label);
//      console.log('dd' + label);

//      var txtinxd = 'dd' + label;
      inxd = inxd + 1;
      me.slider = {
        xtype: 'sliderfield',
        //id : txtinxd,
        decimalPrecision: 0,
        //value: 50,
        minvalue:0,
        maxValue: 100,
        increment:5,
        blur: function()
        {
        	 //alert('kkkk');
        }
        ,listeners: {
        	changecomplete: function(slider, newValue, thumb, eOpts) {
        		//this.destroy();
        		//alert("hide");
        		this.fireEvent('blur');
        		me.lswSlider = false;
        	},
        	beforerender : function(slider, eOpts )
        	{
        		//alert("hi blur");
        		me.lswSlider = true;
        	},
        	
          blur: function( slider, The, eOpts )
          {
          	//alert("hi blur");
          	me.lswSlider = false;
          },
          afterrender: function( slider, eOpts )
          {
          	//alert("renderered");
          	//this.setValue(50);
          	me.lswSlider = true;
          },
          focus: function(  slider, The, eOpts )
           {
        		//this.fireEvent('blur');

        	},

        }
      };
      
      
      factorColumn = {
      		  text: label
      		  //, xtype: 'gridcolumn' //ali
           , dataIndex: fName
           , width: me.defColumnWidth
           , editor: me.slider
		       , align: 'right'
		       , renderer: factorRenderer
		       
      };
      
      factorColumns.push(factorColumn);
      //end new slider

      
      ///////////

      conversionColumn = {
        text: label
      , dataIndex: fName
      , _id: id
      , width: me.defColumnWidth
      , xtype: 'checkcolumn'
      , renderer: conversionRenderer
      , listeners: {
     checkchange: function(col, rowIndex, checked, eOpts) {
     me.win.setLoading('Saving ...');
     me.dirty = true;
     me.remoteUpdate(function() {
     me.win.setLoading(false);
     });
     }
      }
      };
      conversionColumns.push(conversionColumn);
    }
    
    //////newali-hide slider
     
//    var sliderhide = {
//        xtype: 'sliderfield',
//        id : 'txtinxd',
//        decimalPrecision: 0,
//        value: 50,
//        minvalue:1,
//        maxValue: 100,
//       
//        listeners: {
//        	changecomplete: function(slider, newValue, thumb, eOpts) {
//        		//this.destroy();
//        		//alert("hide");
//        		this.fireEvent('blur');
//        		//me.lswSlider = false;
//        	},
//        	beforerender : function(slider, eOpts )
//        	{
//        		//alert("hi blur");
//        		//me.lswSlider = true;
//        	},
//        	
//          blur: function( slider, The, eOpts )
//          {
//          	//alert("hi blur");
//          	//me.lswSlider = false;
//          },
//          afterrender: function( slider, eOpts )
//          {
//          	//alert("renderered");
//          	//this.setValue(50);
//          	//me.lswSlider = true;
//          },
//
//        }
//      };
//    
//    
//      factorColumnhide = {
//  		  text: 'hideme'
//  		  , xtype: 'gridcolumn' //ali
//       //, dataIndex: fName
//       , width: me.defColumnWidth
//       , editor: sliderhide
//       , align: 'right'
//       //, renderer: factorRenderer	       
//       };
//  
//      factorColumns.push(factorColumnhide);
     //////end newali-hide slider  

    
    
    if (suitabilitySelector.length > 0) {
     //suitabilitySelector[0].checked = true;
    }
    
    this.suitabilitySelector = suitabilitySelector;
    this.factorColumns = factorColumns;
    this.conversionColumns = conversionColumns;
   
    sluSelectionNone = {boxLabel: "none", name: 'rb', inputValue: -888};
    sluSelectionNone.checked = true;
    this.suitabilitySelector.push(sluSelectionNone);
    
    /*
Factors:

"factors" : [ {
"id" : 100,
"label" : "slopes",
"featureFieldName" : "FACTOR_1",
"factorTypes" : {
"204" : ">=25%",
"201" : "6% - <12%",
"200" : "<6%",
"203" : "18% - <25%",
"202" : "12% - <18%"
}
}, {

Tree structure for ExtJS:

children: [
{ property: 'Slopes'
, type: 'factor'
, iconCls: 'property-folder'
, expanded: true
, group: 'slope'
, landUse: {
'residential': 100
, 'commercial': 50
, 'industrial': 20
}
, children: [
{ property: '<6%'
, type: 'factor type'
, group: 'slope'
, leaf: true

*/

    var factorData = []
      , scenarioVals = me.scenarioVals;

    var naturalOrdering = function(a,b) {
      return a.naturalOrder - b.naturalOrder;
    };

    for (var i in factors.sort(alphabeticalOrdering)) {
      var factor = factors[i];
      var fId = factor._id;
      var label = factor.label;
      var factorTypes = factor.factorTypes.sort(naturalOrdering);
      var factorNode = {
        property: label
      , type: 'factor'
      , iconCls: 'property-folder'
      , expanded: true
      , group: fId
      , key: fId
      , groupIdx: i
      , meta: factor
      };
      _.log(me, 'factor', factor, factorNode, sluIds);

      for (var k in sluIds) {
        sluId = sluIds[k];
        fName = 'f' + sluId;

        var val = 0;
        if (scenarioVals) {
          try {
            val = scenarioVals[sluId].factors[fId].importance;
          } catch(e) {
          }
        }
        if (val == null) val = 0;
        factorNode[fName] = val;
      }

      var children = [];
      for (var ft in factorTypes) {
        var factorType = factorTypes[ft];
        var ftId = factorType._id;
        var factorTypeNode = {
          property: factorType.label
        , type: 'factorType'
        , group: fId
        , leaf: true
        , key: ftId
        , groupIdx: i
        };

        for (var k in sluIds) {
          sluId = sluIds[k];
          fName = 'f' + sluId;
          val = 0;
          if (scenarioVals) {
            try {
              val = scenarioVals[sluId].factors[fId].factorTypes[ftId].score;
            } catch(e) {
              val = 0;
            }
          } else {
            val = 0;
          }
          if (val == null) val = 0;
          factorTypeNode[fName] = val;
        }
        children.push(factorTypeNode);
      }
      factorNode.children = children;
      factorData.push(factorNode);
    }

    var conversionData = [];

    _.log(me, 'populating conversionData');
    // XXX Sorting by id is a kludge, but at least it gives a consistent ordering.
    var aluIds = _.keys(allocationLus).sort();
    for (var i in aluIds) {
      var aluId = aluIds[i];
      var allocationLu = allocationLus[aluId];
      var conversionNode = {
        property: allocationLu.label
      , aluId: aluId
      };
      for (var k in sluIds) {
        var sluId = sluIds[k];
        var convertibles = {};
        var sluVal = null;
        var disable = false;
        var val = false;
        if (scenarioVals) {
          sluVal = scenarioVals[sluId];
          convertibles = sluVal.convertibles;
        }
        if (sluId in associatedLus && aluId in associatedLus[sluId]) {
          disable = true;
        } else if (aluId in convertibles) {
          val = true;
        } else if (allocationLu.notDevelopable || allocationLu.notDefined) {
          disable = true;
        } else {
          // All good.
        }
        conversionNode['f' + sluId+'disable'] = disable;
        conversionNode['f' + sluId] = val;
      }
      conversionData.push(conversionNode);
    }
    me.factorData = factorData;
    me.conversionData = conversionData;
   
    //ali
    console.log(conversionData);
    
  }

, prepareStore: function () {

    var me = this
      , modelName = me.project.modelName;

    // XXX Not sure why creating the model by name is failing.
    // Creating it by fields works fine, though.
    //this.factorStore = Ext.create('Wif.analysis.SuitabilityFactorStore', {
    // model: modelName,
    // data: me.factorData
    //});
    me.factorStore = Ext.create('Ext.data.TreeStore', {
      fields: me.project.modelFields
    });
    me.factorStore.setRootNode({
        text: '.',
        expanded : true,
        children : me.factorData
    });

    this.conversionStore = Ext.create('Wif.analysis.SuitabilityConversionStore', {
      model: modelName
    , data: me.conversionData
    });
    
  }

  /*
* UI-related functions
*
*/
, wmsLayerName: null

, getWmsInfo: function (callback) {

    var me = this
      , serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + this.projectId + '/suitabilityScenarios/' + this.scenarioId + '/wmsinfo'
        , method: "get"
        , params: null
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

    function serviceHandler(data) {
      me.win.setLoading(false);
      if (!data) {
        if (callback) callback({success: false});
        return;
      }
      _.log(me, 'getWmsInfo', data, this);
      me.wmsLayerName = data.workspaceName + ':' + data.layerName;

      me.serverURL = data.serverURL;
      //me.serverURL = me.serverURL.replace(/\/([A-z]+)\/$/, '/' + data.workspaceName + '/');
      me.serverURL = me.serverURL + data.workspaceName + '/';

      if (callback) callback({success: true});
    }

    me.win.setLoading('Please wait while the map information is retrieved ...');
    Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
  }

, waitingForWms: function (callback) {
    var me = this
      , serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + this.projectId + '/suitabilityScenarios/' + this.scenarioId + '/status'
        , method: "get"
        , params: null
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        }
      , checkCount = 0;

    function serviceHandler(data) {
    		console.log('WAITINGFORWMS', data);
        if (!data || !data.status || data.status === 'failed' || checkCount > 150) {
            _.log(me, 'wms failed', me);
            me.updateAnalysisState('erroneous');
            me.win.setLoading(false);
            var reason = 'I have no idea.';
            if (!data || !data.status) {
             reason = 'The server did not report the status of the operation.';
            } else if (data.status === 'failed') {
             reason = 'Creating map layer failed.';
            } else if (checkCount > 150) {
             reason = 'The operation timed out.';
            }
			     Ext.Msg.show({
			     title: 'Failed',
			     msg: 'No map information was generated. The reason is: ' + reason,
			     buttons: Ext.Msg.OK
         });
            return;
      }
      checkCount++;
      if (data.status === 'running') {
        setTimeout(polling, 15000);
        return;
      } else if (data.status === 'success') {
          me.getWmsInfo(callback);
      }
      
      //me.win.setLoading(false);
      me.updateAnalysisState(data.status);
    }

    me.win.setLoading('Please wait for analysis to complete ...');

    function polling(callback) {
      Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
      
    }

    //was 3000
    //polling(function(){return;});
    setTimeout(polling, 30000);
    
  }

,
checkWmsNew: function () {
	
	  _.log(me, 'checkWmsNew');
	  var me = this,
         serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + this.projectId + '/suitabilityScenarios/' + this.scenarioId + '/wmsinfo'
        , method: "get"
        , params: null
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

    function serviceHandler(data) 
    {
      
      if (!data) {
         return;
      }
      me.win.setLoading(false);
      _.log(me, 'getWmsInfo2XX', data, this);
      me.wmsLayerName = data.workspaceName + ':' + data.layerName;

      me.serverURL = data.serverURL;
      //me.serverURL = me.serverURL.replace(/\/([A-z]+)\/$/, '/' + data.workspaceName + '/');
      me.serverURL = me.serverURL + data.workspaceName + '/';
     
      //comment by ali new lines below
      //me.map.setWms(me.wmsLayerName, me.serverURL);      
      // _.log(me, 'wmsStyles2', data.availableStyles[0], this);
      //me.map.setStyles(data.availableStyles[0]);
      
      
      me.updateSuitabilitySelector();
      
      //me.win.setLoading(false);
      
    }//end function

    me.win.setLoading('Please wait while the map information is retrieved ...');
 
   function polling() {
	     Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    }

	setTimeout(polling, 3000);
    

}//end checkwmsnew

, checkWms: function () {
    var me = this
      , serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + this.projectId + '/suitabilityScenarios/' + this.scenarioId + '/status'
        , method: "get"
        , params: null
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        }
      , checkCount = 0;

    function serviceHandler(data) {
      _.log(me, 'checkWms', data);
      if (!data || !data.status || data.status === 'failed' || checkCount > 150) {
        _.log(me, 'wms failed', me);
        me.updateAnalysisState('erroneous');
        me.win.setLoading(false);
        return;
      }
      checkCount++;
      if (data.status === 'running') {
        setTimeout(polling, 15000);
      } else {
     me.win.setLoading(false);
      }
      me.updateAnalysisState(data.status);
    }

    me.win.setLoading('Checking for existing map information ...');

    function polling() {
      Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    }

    polling();
  }

, computeAnalysis: function (callback) {

    var me = this;
    _.log(me, 'ali1', me.suitabilityScoreRanges);
    
    me.suitabilityScoreRanges={};
    me.scenarioPostDataBuild(); // build data from the widgets
    
    _.log(me, 'ali2', me.suitabilityScoreRanges);
    
    var srcBbox = me.selectedBbox;

    var b = srcBbox
      , areaAnalyzed = sprintf("POLYGON((%f %f,%f %f,%f %f,%f %f,%f %f))", b[0], b[3], b[0], b[1], b[2], b[1], b[2], b[3], b[0], b[3])
      , analysisParam = {
          areaAnalyzed: areaAnalyzed
        , crsArea: me.project.srs
        };

    _.log(me, 'areaAnalyzed', areaAnalyzed);

    var serviceParams = {
          xdomain: "cors"
        , url: Wif.endpoint + 'projects/' + me.projectId + '/suitabilityScenarios/' + me.scenarioId + '/async/wms'
        , method: "post"
        , params: analysisParam
        , headers: {
          "X-AURIN-USER-ID": Wif.userId
          }
        };

    me.win.setLoading('Please wait for the analysis to complete ...');

    function serviceHandler(data, status) {
      _.log(me, 'analysis result in wms', data);

      me.analysisPresent = true;
      me.analysisInSync = true;
      me.analysisBroken = false;

      
      me.waitingForWms(function (result) {
        _.log(me, 'finish waiting for wms', result, me);
        me.win.setLoading(false);
        if (result.success) {
        	
        	
        	//comment below by ali 8 may 2015 //tested
          //me.updateSuitabilitySelector();
          
          if (callback) { callback(); }
        }  
      });
     
    }

    function analyse () {
      _.log(me, 'start analysis');
      Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0);
    }
    
    me.analysisStartedHere = true;
    me.dirty = false;
    me.analysisPresent = false;
    me.analysisInSync = false;
    me.analysisBroken = false;

    analyse();
    //me.remoteUpdate(analyse);
  },
  
  downloadReport: function() {

var me = this;
      var projectId = me.projectId;
      var scenarioId = me.scenarioId;
      var url = Wif.endpoint + 'projects/' + projectId
      + '/suitabilityScenarios/' + scenarioId + '/html';
    	//window.location.href = url    	
    	//window.open(url,'_blank');
      window.open(Aura.getDispatcher + 'url=' + url);
    			
    	      
//      var downloadUri = wifUiConfig['appBase'] + 'suitabilityReport';
//      _.log(me, 'download report', downloadUri);
//
//      Aura.util.ResourceDownload.download({
//          method: 'get',
//          url: downloadUri,
//          params: {
//             url: Wif.endpoint + 'projects/' + projectId
//             + '/suitabilityScenarios/' + scenarioId + '/report',
//             userId: Wif.userId,
//             fileName: scenarioId + '.csv'
//          }
//        });
  },
  
  ReportPDF: function() {
  var me = this;
       var projectId = me.projectId;
       var scenarioId = me.scenarioId;
       var url = Wif.endpoint + 'projects/' + projectId
       + '/suitabilityScenarios/' + scenarioId + '/pdf';
 
     	//window.open(url,'_blank');
      window.open(Aura.getDispatcher + 'url=' + url);
      
       //window.open('appServlet/restGet');
       //console.log('downloading');
		
      
      
   },
   
   ReportXLS: function() {
  	  var me = this;
  	       var projectId = me.projectId;
  	       var scenarioId = me.scenarioId;
  	       var url = Wif.endpoint + 'projects/' + projectId
  	       + '/suitabilityScenarios/' + scenarioId + '/xls';
  	 
  	     	//window.open(url,'_blank');
  	       
  	       console.log('Download xls path is: ' + Aura.getDispatcher + 'url=' + url);
  	       
  	       window.open(Aura.getDispatcher + 'url=' + url);
  	     	
//  	      Aura.util.ResourceDownload.download({
//  	        method: 'get',
//  	        url: url,
//  	        params: {
//  	           url: url,
//  	           userId: Wif.userId,
//  	           fileName: 'xsuin.xls'
//  	        }
//  	      }); 
  	     	
  	     	
  	   },
  	   
  	   ReportCSV: function() {
  	  	  var me = this;
  	  	       var projectId = me.projectId;
  	  	       var scenarioId = me.scenarioId;
  	  	       var url = Wif.endpoint + 'projects/' + projectId
  	  	       + '/suitabilityScenarios/' + scenarioId + '/csv';
  	  	       
  	  	       window.open(Aura.getDispatcher + 'url=' + url);
  	  	   },
  	  	   
  	   	   ReportConvert: function() {
  	  	  	  var me = this;
  	  	  	       var projectId = me.projectId;
  	  	  	       var scenarioId = me.scenarioId;
  	  	  	       var url = Wif.endpoint + 'projects/' + projectId
  	  	  	       + '/suitabilityScenarios/' + scenarioId + '/convert';
  	  	  	       
  	  	  	       window.open(Aura.getDispatcher + 'url=' + url);
  	  	  	   },

  show: function (callback) {
    var me = this
      , scenarioData = me.scenarioData;
    Ext.QuickTips.init();
    
    //new ali
    if (Ext.getCmp('dd') != undefined)
	   {	 
	      
	     Ext.getCmp('dd').destroy();
	   }
 	

    _.log(me, 'about to show', me);

    var infoPanel = Ext.create('Ext.form.Panel', {
      header: false,
      bodyPadding: 5,
      frame: false,
      border: false,
      height: 30,
      region: 'north',
      layout: 'anchor',
      defaults: {
        labelAlign: 'right',
        labelWidth: 100,
        style: { float: 'left' }
      },
      defaultType: 'displayfield',
      items: [{
        fieldLabel: 'Analysis Name',
        name: 'first',
        value: '<b>' + scenarioData.label + '</b>',
      },
//      , {
//        fieldLabel: 'Analysis Type',
//        name: 'last',
//        value: '<b>Suitability</b>',
//      }, 
      {
        fieldLabel: 'Area of Study',
        value: me.project.studyArea || '',
      }/*, {
        xtype: 'button',
        style: { float: 'right' },
        text: 'Compute Analysis',
        name: 'btn',
        handler: function () {
          me.computeAnalysis();
          //me.computeAnalysis(updateSuitabilitySelector);
          //me.checkWmsNew();
        }
      }*/
      , {
        xtype: 'button',
        style: { float: 'right' },
        text: 'PDF Report',
        handler: function () {
          me.ReportPDF();
        }
      }
      , {
        xtype: 'button',
        style: { float: 'right' },
        text: 'Excel Report',
        handler: function () {
          me.ReportXLS();
        }
      } 
     , {
        xtype: 'button',
        style: { float: 'right' },
        text: 'Factor Report',
        handler: function () {
        	 me.ReportCSV();
        }
      }
     , {
       xtype: 'button',
       style: { float: 'right' },
       text: 'Convertible Report',
       handler: function () {
       	 me.ReportConvert();
       }
     }
     
      ]
    });

    _.log(me, 'factorPanel', me);
    var factorPanel = Ext.create('Ext.tree.Panel', {
    	id: "zzz", //ali
      baseViewConfig: {
        markDirty: false
      , forceFit: true
      },
      frame: false, border: false, collapsible: false, containerScroll: true,
      useArrows: true, rootVisible: false, columnLines: true, multiSelect: true,
      singleExpand: false,
      cls: 'suit-tree',
      //ali
      listeners: {

      	 afterlayout: function(container, layout, eOpts) {
           var nd = this.getSelectionModel().getLastSelected();
           // I add a property 'initialLoad' to my treestore,
           // and set the value to true after the 'getPath(...)'
           // then the focus is made only when I 'auto' select a record ...
           if (!Ext.isEmpty(nd) && this.getStore().initialLoad) {
               this.getStore().initialLoad = false;
               // nd.store.indexOf(nd) didn't work, I want to know
               // the 'global' row id of the whole treeview ....
               this.getView().focusRow(
                   this.getView().store.indexOf(nd) // return 
               );
           }
       },
      	
      	itemclick : function(view,record,item,index,eventObj) {
      		//alert('itemclicked');
      		//var id = record.get('id');
      	},
          collapse: function() {
              alert('collapsed');
          },
          expand: function() {
              alert('expand');
          },
          
      	blur: function(tree, The, eOpts) {
			        //alert('blur');
			         
	         }
			     ,
			      cellclick: function( tree, td, cellIndex, record, tr, rowIndex, e, eOpts )
			      {
			      	this.fireEvent('blur');
			      }
      },
      
      plugins: [
        Ext.create('Ext.grid.plugin.CellEditing', {
        	id: 'treegrid',
          clicksToEdit: 1, //was 2 ali
          listeners: {
         edit: function(editor, eOpts) {
			         me.win.setLoading('Saving ...');
			         me.dirty = true;
			         me.remoteUpdate(function() {
			         me.win.setLoading(false);
		         //editor.fireEvent('blur'); //ali
		//         var myBtn = Ext.getCmp('xxx');
		//         myBtn.fireEvent('click', myBtn); //
		//         this.fireEvent('blur');
		         });

	         }

          ,cellclick: function( g, td, cellIndex, record, tr, rowIndex, e, eOpts )
          {
          	alert('click');
          }
           //grid
	        ,blur: function( g, The, eOpts )
	        {
	        	 alert('ccc');
	        }
       

          }
        })
      ],
      title: 'Suitability Factors',
      store: me.factorStore,
      columns: me.factorColumns
    });

    _.log(me, 'conversionPanel', me);
    var conversionPanel = Ext.create('Ext.grid.Panel', {
    	id:'conversionPanelId',
      baseViewConfig: {
        markDirty: false
      , forceFit: true
      },
      frame: false, border: false, columnLines: true,
      title: 'Conversion',
      store: me.conversionStore,
      columns: me.conversionColumns
    });

    this.factorPanel = factorPanel;
    this.conversionPanel = conversionPanel;

    var updateSuitabilitySelector;
    
    _.log(me, 'mapFormPanel', me);
    
    
//    var mapFormPanel = Ext.create('Ext.form.Panel', {
//      width: 180,
//      region: 'west',
//      header: false,
//      bodyPadding: 5,
//      frame: false,
//      border: true,
//      split: true,
//      layout: 'anchor',
//      defaults: {
//        labelAlign: 'left',
//        labelWidth: 0
//      },
//      items: [{
//        xtype: 'radiogroup',
//        itemId: 'sluRadioGroup',
//        columns: 1,
//        vertical: true,
//        items: me.suitabilitySelector,
//        listeners: {
//          change: function (field, nv) {
//       updateSuitabilitySelector();
//          }
//        }
//      },
//      {
//        xtype: 'panel',
//        width: 200,
//        height: 400,
//        html: '' //sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s" />', me.serverURL, me.wmsLayerName)
//        }
//      ]
//    });
    
    
    
    var mapFormPanel = Ext.create('Ext.form.Panel', {

      width: 300,
      height: 400,
      //autoScroll: true,
      region: 'west',
      header: false,
      bodyPadding: 5,
      frame: false,
      border: true,
      split: true,
      layout: 'anchor',
      defaults: {
        labelAlign: 'left',
        labelWidth: 0
      },
      items: [
  
 	      {
 	       xtype: 'panel',
 	       width: 300,
 	       height: 550,
 	       html: '' //sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s" />', me.serverURL, me.wmsLayerName)
 	       }
      ]
    });
    
    var mapRadiLabel1 = {
        xtype: 'label',
        text: "Layers",
        forId: 'mapRadioLabel1',
        margin: '9 0 0 2',
        //width: '20%'
    };
    
    var mapRadioPanel1 = Ext.create('Ext.form.Panel', {
      //width: 215,//435,
      //width: '100%',
      flex: 1,
      //height: 170,
      region: 'west',
      header: false,
      bodyPadding: 5,
      frame: false,
      border: false,
      split: true,
      layout: 'anchor',
      defaults: {
          labelAlign: 'left',
          labelWidth: 0
      },
      items: [
          mapRadiLabel1, {
          	 xtype: 'radiogroup',
             itemId: 'sluRadioGroup',
             columns: 1,
             vertical: true,
             items: me.suitabilitySelector,
             listeners: {
               change: function (field, nv) {
            updateSuitabilitySelector();
               }
             }
  
          }

      ]
  });
    

    var mapRadiLabel2 = {
        xtype: 'label',
        text: "Basemap",
        forId: 'mapRadioLabel2',
        margin: '9 0 0 2',
        //width: '20%'
    };
    
    var mapRadioPanel2 = Ext.create('Ext.form.Panel', {
      //width: 215,//435,
      //width: '100%',
      flex: 1,
      //height: 175,
      //region: 'west',
      header: false,
      bodyPadding: 5,
      frame: false,
      border: false,
      split: true,
      layout: 'anchor',
      defaults: {
          labelAlign: 'left',
          labelWidth: 0
      },
      items: [
          mapRadiLabel2, {
              xtype: 'radiogroup',
              //fieldLabel: 'Basemap',
              itemId: 'radioLayerGroup',
              //width: 220,
              //flex: 1,
              //height: 35,
              bodyPadding: 2,
              //itemCls: 'chkcss',
              // Arrange checkboxes into two columns, distributed vertically
              columns: 1,
              vertical: true,
              items: [{
                      boxLabel: 'OSM',
                      name: 'grb',
                      inputValue: '1',
                      checked: true
                  }, {
                      boxLabel: 'Google Maps',
                      name: 'grb',
                      inputValue: '2'
                  }, {
                      boxLabel: 'Google Satellite',
                      name: 'grb',
                      inputValue: '3'
                  }, {
                      boxLabel: 'Google Terrain',
                      name: 'grb',
                      inputValue: '4'
                  }, {
                      boxLabel: 'Google Hybrid',
                      name: 'grb',
                      inputValue: '5'
                  }, {
                    boxLabel: 'Stamen Toner',
                    name: 'grb',
                    inputValue: '6'
                }, {
                  boxLabel: 'Stamen Watercolor',
                  name: 'grb',
                  inputValue: '7'
              }

              ],
              listeners: {

                  change: function(field, newValue, oldValue) {


                      switch (newValue['grb']) {
                          case "1":
                              me.map.map.setBaseLayer(me.map.map.layers[0]);
                              break;
                          case "2":
                          	me.map.map.setBaseLayer(me.map.map.layers[1]);
                              break;
                          case "3":
                          	me.map.map.setBaseLayer(me.map.map.layers[2]);
                              break;
                          case "4":
                          	me.map.map.setBaseLayer(me.map.map.layers[3]);
                              break;
                          case "5":
                          	me.map.map.setBaseLayer(me.map.map.layers[4]);
                              break;
                          case "6":
                          	me.map.map.setBaseLayer(me.map.map.layers[5]);
                            break;   
                          case "7":
                          	me.map.map.setBaseLayer(me.map.map.layers[6]);
                            break;  


                      }

                  }

              } //end listener

          }

      ]
  });
    
   
    var mapCheckRadio = Ext.create('Ext.form.Panel', {
      //width: 435,
    	 width: 300,
      height: 200,
      layout: {
          type: 'hbox',
          align: 'stretch',
          autoScroll: true,
      },
      items: [


          mapRadioPanel1,
          mapRadioPanel2

      ]
  });

    
    
    
//    updateSuitabilitySelector = function () {
//     var rg = mapFormPanel.down('radiogroup');
//     var newValue = rg.getValue();
//     if (!newValue || !newValue.rb) {
//     return;
//     }
//     _.log(me, 'updateSuitabilitySelector', mapFormPanel, newValue, me.suitabilityScoreRanges);
//     var map = me.map;
//     if (!map) {
//     return;
//     }
//     
//     if (newValue.rb!='-888')
//      {
//    	  //map.setSld(1, me.suitabilityScoreRanges[newValue.rb], function(sldBody)
//         map.setSld(3, me.suitabilityScoreRanges[newValue.rb], function(sldBody) {
//            // update the legend here
//            var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(sldBody));
//            mapFormPanel.down('panel').update(legendHtml);
//         });
//         map.refresh();
//      }
//     else
//     {
//        map.removeLayer();
//      }
//     
//    };
    
    //new ali
    
    updateSuitabilitySelector = function () {
      //var rg = mapFormPanel.down('radiogroup');
      var rg = mapRadioPanel1.down('radiogroup');
      var newValue = rg.getValue();
      if (!newValue || !newValue.rb) {
      return;
      }
      _.log(me, 'updateSuitabilitySelector', mapFormPanel, newValue, me.suitabilityScoreRanges);
      var map = me.map;
      if (!map) {
      return;
      }
      
      if (newValue.rb!='-888')
       {
     	  //map.setSld(1, me.suitabilityScoreRanges[newValue.rb], function(sldBody)
      	
      	
      	  var scorename="";
      	  var minvalue=0;
      	  var maxvalue=0;
      	  for (var i = 0; i< me.minmaxData.length; i++)
      	  {
      	  	 var arrs= me.minmaxData[i].split(",");
      	  	 if (arrs[0] == newValue.rb)
      	  		 {
      	  		     scorename = arrs[1];
      	  		     minvalue = arrs[2];
      	  		     maxvalue = arrs[3];
      	  		     
      	  		     console.log(newValue.rb);
      	  		     console.log(scorename);
      	  		     console.log(minvalue);
      	  		     console.log(maxvalue);
      	  		 }
      	  }	
      	
      
          //map.setWmsNew2(true,me.wmsLayerName, me.serverURL, me.suitabilityScoreRanges[newValue.rb], function(sldBody) {
          map.setWmsNew2(true,me.wmsLayerName, me.serverURL, scorename,minvalue,maxvalue, function(sldBody) {
             // update the legend here
             var legendHtml = sprintf('<p style="margin-top:20px"><b>Legend:</b></p><img style="margin-top:5px" src="%swms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=%s&sld_body=%s" />', me.serverURL, me.wmsLayerName, _.encodeURLComponent(sldBody));
             mapFormPanel.down('panel').update(legendHtml);
          });
         map.refresh();
       }
      else
      {
        // map.removeLayer();
      	
      	  map.setWmsNew2(false,me.wmsLayerName, me.serverURL, '', function(sldBody) {
         
       });
       }
      
     };
    
    
    
    
    //end new ali
    
    me.mapFormPanel = mapFormPanel;
    me.updateSuitabilitySelector = updateSuitabilitySelector;

    _.log(me, 'mapPanel', me);
    Ext.define('Wif.mapPanel', {
      xtype: 'Wif.mapPanel',
      extend: 'Ext.panel.Panel',
      border: true,
      split: true,
      
      html: "<div id='map2-body' style='width:100%;hight:100%'></div>",
      region: 'center',
      width: '100%',
      height: 800,
      maximized: true,
      
      initComponent: function () {
        this.callParent(arguments);
      },
      afterFirstLayout : function () {
        this.callParent();
        this.createMap();
      },
      createMap: function() {
	     var bbox = eval(me.project.bbox);
	     if (bbox.length == 1) {
	     bbox = bbox[0];
	     }

        this.map = Ext.create('Wif.analysis.Map', {
          olMapId: this.body.dom.id
        , wmsLayerName: [me.wmsLayerName]
        , serverURL: me.serverURL
        , projectId: me.projectId
        , scenarioId: me.scenarioId
        , srs: me.project.srs
        , bbox: bbox
        });

        me.map = this.map;
        console.log("CREATEMAP", this.map, me.map);
      },
      afterComponentLayout : function(w, h){
        this.callParent(arguments);
        this.redraw();
      },
      redraw: function(){
        // var map = this.map;
        //setTimeout( function() { map.updateSize();}, 200);
      }
    });

    _.log(me, 'window', me);
    var win = Ext.create( "Ext.window.Window", {
      title: 'Analysis - Suitability',
      closable: true,
      closeAction: 'hide',
      width: 900,
      height: 600,
      maximized: true, //new ali
      layout: 'border',
      plain: true,
      listeners:{
      	beforeClose: function(){
      		 if(me.lswSlider == true)
          	{
//          		 alert("complete");
//          		 return false;
          	}
      	},
        close:function()
        {
        	 Ext.getCmp('map2').destroy();//
//        	 if (Ext.getCmp('dd') != undefined)
//       	   {	 
//       	     Ext.getCmp('dd').fireEvent('blur');  
//       	     //Ext.getCmp('dd').destroy();
//       	   }
//        	 
        	 
//      	   me.remoteUpdate(function() {
//    	       me.win.setLoading(false);
//    	       });
        	 
        	
        	 
//           var inxd = 0;
//      	   for (var i in me.project.suitabilityLus) {
//      	      slu = me.project.suitabilityLus[i];
//      	      
//      	      console.log('alllllllli');
//      	      
//      	      var label =  slu.label;
//      	      var txtinxd = 'dd' + label;
//      	      console.log(txtinxd);
//      	      inxd = inxd + 1;
//      	      if (Ext.getCmp(txtinxd) != undefined)
//      	      {
//      	          Ext.getCmp(txtinxd).fireEvent('blur');
//      	      }
//         	}
//      	   var inxd = 0;
//      	   for (var i in me.project.suitabilityLus) {
//      	      slu = me.project.suitabilityLus[i];
//      	      
//              console.log('alllllllli');
//      	      
//      	      var label =  slu.label;
//      	      var txtinxd = 'dd' + label;
//      	      console.log(txtinxd);
//      	      inxd = inxd + 1;
//      	      if (Ext.getCmp(txtinxd) != undefined)
//      	      {
//      	          Ext.getCmp(txtinxd).destroy();
//      	      }
//         	}
        	 
        	 for (var i = 0; i <document.getElementsByClassName('x-slider').length; i++)
    	    	{
	     	    	var id = document.getElementsByClassName('x-slider')[i].id;
	     	    	var lnx= id.length;
	     	    	var cnst='-inputel'; //slider-1159-inputEl
	     	    	var cnstln = cnst.length;
	     	    	if (id.length>cnstln)
	     	    	{
	     	    		if (id.substr(id.length-cnstln, cnstln).toLowerCase() == cnst)
	     	    			{
	     	    			    var str = id.substr(0, id.length-cnstln);
	     	    			    if (Ext.getCmp(str) != undefined)
	     	    			  	{
	     	    			       Ext.getCmp(str).fireEvent('blur');
	     	    			    }
	     	    			}
	     	    	}
    	    	
    	    	}
        	 
        	
        }
        
      },
      
      items:
        [infoPanel, {
          frame: false,
          border: false,
          region: 'center',
          xtype: 'tabpanel',
          defaults: {
            layout: 'fit'
          },
          layoutOnTabChange: true,
          layout: 'fit',
          listeners: {
           beforetabchange: function(panel, newCard, oldCard, eOpts) {
          	 
          	 
	           var allowChange = true;
	           var oldCardId = oldCard.getItemId();
	           var newCardId = newCard.getItemId();
	          
	           if (oldCardId == 'convertibleLuPanel') {
	           if (!me.verifyConvertibleLUs()) {
	           Ext.Msg.show({
	           title: 'Incomplete',
	           msg: 'One or more suitability LUs cannot be converted to. ' +
	           'Until this is fixed, it is impossible to analyse this scenario.',
	           buttons: Ext.Msg.OK
	           });
	           allowChange = false;
	           }
	           }
	           if (allowChange && newCardId == 'mapPanel') {
	           _.log(me, 'Switch to map panel requested');
	               me.analysisState();
	           var showMessage = false;
	           var message = '';
	           
	           me.needAnalysis = false;
	           if (!me.analysisPresent) {
	           showMessage = true;
	           me.needAnalysis = true;
	           message = 'You need to compute an analysis before any data can be displayed on the map. Do you want to do that now?';
	           }
	           else if (me.analysisBroken || !me.analysisInSync || me.dirty) {
	           showMessage = true;
	           me.needAnalysis = true;
	           message = 'The analysis may not reflect recent changes. Do you want to recompute it?';
	           }
	           if (showMessage) {
	           Ext.Msg.show({
	           title: 'Recompute?',
	           msg: message,
	           buttons: Ext.Msg.YESNO,
	           icon: Ext.Msg.QUESTION,
	           fn: function (btn) {
	           if (btn === 'yes'){

	          	     //commented line below ali 8may
	                 //me.computeAnalysis(updateSuitabilitySelector);
	              
			            	//newali
			              me.computeAnalysis(function() {
				              me.findminmax(function() {
				              	me.updateSuitabilitySelector();  
				              });
			              });
	              
	              }
	            }
	           });
	           }
	           else {
	              updateSuitabilitySelector();
	             }
	           }
	           return allowChange;
           },
           tabchange: function (tabPanel, newCard, oldCard, eOpts ) {
        	   var newCardId = newCard.getItemId();
        	  
        	   
        	   //ali
 
//        	   
//        	   //fireEvent('blur');
//        	   
//        	   //me.slider.fireEvent('blur');
//        	   
//        	   var hg = Ext.getCmp('zzz');
//        	   var r = hg.getChildAt(1);
//        	   Ext.getCmp('zzz').getSelectionModel().select(r);
//        	   
//        	   
//        	   el  = Ext.Element.getActiveElement(); // Currently focused element
//
//        	    var myBtn = Ext.getCmp('dummybtn');
//        			myBtn.fireEvent('click', myBtn); //
        			//         this.fireEvent('blur');
        	  // me.slider.blur(); 
        			
//        			var r1 = Ext.getCmp('zzz').getRootNode();
//        			Ext.getCmp('zzz').getSelectionModel().select(r1,true);
        			
        			
//        			var event = new MouseEvent('dblclick', {
//        		    'view': window,
//        		    'bubbles': true,
//        		    'cancelable': true
//        		  });
//        			document.getElementById('zzz').fireEvent("ondblclick");  
        			
        			
//        			r.fireEvent('click', node);
        			
//        			var r1 = Ext.getCmp('zzz');
//        			var node = r1.getNodeById('Env_Values');
        	
        	   
//        	   if (Ext.getCmp('zzz') != undefined)
//        	   {	 
//        	  	 var fff = Ext.getCmp('zzz');
//        	  	 //fff.getSelectionModel().selectFirstRow(); 
//        	  	 Ext.getCmp('zzz').fireEvent('cellclick');
//        	     //Ext.getCmp('zzz').fireEventArgs( 'cellclick',args);  
//        	   }
//
//        	   var activeComponent = Ext.get(Ext.Element.getActiveElement());
//        	   if (Ext.getCmp('dd') != undefined)
//        	   {	 
//        	  	  me.remoteUpdate(function() {
//        	       me.win.setLoading(false);
//        	       });
//        	     Ext.getCmp('dd').fireEvent('blur');  
//        	   }
        	   
//        	   
//        	   me.remoteUpdate(function() {
//      	       me.win.setLoading(false);
//      	       });
        	   
//        	   var inxd = 0;
//        	   for (var i in me.project.suitabilityLus) {
//        	      slu = me.project.suitabilityLus[i];
//        	      
//        	      console.log('alllllllli');
//        	     
//        	      var label =  slu.label;
//        	      var txtinxd = 'dd' + label;
//        	      console.log(txtinxd);
//        	      inxd = inxd + 1;
//           
//        	      if (Ext.getCmp(txtinxd) != undefined)
//        	      {
//        	          Ext.getCmp(txtinxd).fireEvent('blur');
//        	      }
//           	}
//        	   
//        	   var r1 = Ext.getCmp('zzz').getRootNode();
//    			    	.select(r1,false);
//    			    Ext.getCmp('zzz').getRootNode().expand();
//    			    
//    			    var tree = Ext.getCmp('zzz');
//    			   
//    			    
//    			    tree.getSelectionModel().select(r1, true);
//    		       tree.fireEvent('itemclick', tree.getView(), r1);
//    		       tree.collapseAll();
    			    //tree.reconfigure(me.factorStore, me.factorColumns);
    			    //var factorRecords = factorStore.getRootNode().childNodes;
    			    //Ext.getCmp('zzz').getStore().load();
    			    //me.factorStore.setRootNode(factorStore.getRootNode());
    		      // tree.getSelectionModel().selectFirstRow();
    		      // var treegrid =Ext.getCmp('treegrid');
        	   //Ext.getCmp('zzz').plugins[0].fireEvent('blur')
        	   //me.factorStore.getRootNode().childNodes[0]
        	   //Ext.getCmp('zzz').plugins[0].grid.getView().getNode(0)
        	   //Ext.getCmp('zzz').getView().focusRow()
//        	   var gridd = Ext.getCmp('zzz').plugins[0];
//        	   gridd.getSelectionModel().selectRow(1);
//        	   gridd.getView().focusRow(1);
        	   
        	   
//     	      if (Ext.getCmp('txtinxd') != undefined)
//    	      {
//     	      	  Ext.getCmp('txtinxd').focus();
//     	      	 Ext.getCmp('txtinxd').fireEvent('show');
//    	          Ext.getCmp('txtinxd').fireEvent('changecomplete');
//    	      }
//        	   
//     	     var elements = document.getElementById('zzz');
//     	    for (var i=0, im=elements.length; im>i; i++) {
//     	        console.log(elements[i]);
//     	    }
        	
        	   
        	 ////since damn extjs slider blur event handlerdoesn't work properly, the code below tries to solve that.    
     	    for (var i = 0; i <document.getElementsByClassName('x-slider').length; i++)
     	    	{
	     	    	var id = document.getElementsByClassName('x-slider')[i].id;
	     	    	var lnx= id.length;
	     	    	var cnst='-inputel'; //slider-1159-inputEl
	     	    	var cnstln = cnst.length;
	     	    	if (id.length>cnstln)
	     	    	{
	     	    		if (id.substr(id.length-cnstln, cnstln).toLowerCase() == cnst)
	     	    			{
	     	    			    var str = id.substr(0, id.length-cnstln);
	     	    			    if (Ext.getCmp(str) != undefined)
	     	    			  	{
	     	    			       Ext.getCmp(str).fireEvent('blur');
	     	    			    }
	     	    			}
	     	    	}
     	    	
     	    	}
     	    
     	   //Ext.getCmp('slider-1304').fireEvent('blur');
     	   //document.getElementsByClassName('x-slider')
     	    
        	   //////////////////////////////////////////////////
        	   
        	   if (newCardId == 'mapPanel' && me.needAnalysis == false) {
        	       me.checkWmsNew();
        	       
        	       var map = me.map;
	           	 		if (!map) {
	           	 		return;
           	 		}
        	   } 
           }
           
          },
          
          items: [
            { xtype: 'panel',
              itemId: 'convertibleLuPanel',
              title: 'Convertible LUs',
              xtype: 'panel',
              items: [conversionPanel]
            },
            { xtype: 'panel',
              itemId: 'suitabilityFactorPanel',
              title: 'Suitability Factors',
              xtype: 'panel',
              autoScroll: true,
              items: [factorPanel]
            },
           { xtype: 'panel',
              itemId: 'mapPanel',
              title: 'Map',
              layout: 'border',
              split: true,
//              items: [
//                mapFormPanel
//              , { xtype: 'Wif.mapPanel',
//                  region: 'center'
//                }
//              ]
              
	            items: [
	                    
									//{
									//region: 'north',
									//height: 45,
									//split: true,
									//items: [
									//]
									//}
									, {
									region: 'west',
									autoScroll: true,
									border: true,
									width: '22%',
									//height : 200,
									items: [
											mapCheckRadio,
										  mapFormPanel,
									
									],
									
									split: true,
									resizable: false,
									bodyPadding: 13
									},
									{
									region: 'east',
									autoScroll: true,
									xtype: 'panel',
									width: '78%',
									items: [
									
									    {
									        xtype: 'Wif.mapPanel',
									        width: '100%',
									        //height: '100%',
									        id: 'map2',
									        html: "<div id='map2' style='width:100%'></div>",
									         region: 'center'
									    }
									],
									split: true,
									resizable: false,
									bodyPadding: 13
									}	                    
									
									
									]
              
              
              
            } /*,
{ title: 'Report',
layout: 'ux.center',
items : [ {
xtype : 'button',
text : 'Download report',
handler : function() {
me.downloadReport();
}
} ]
} */
         ]
      }]
    });
    me.win = win;
    _.log(me, 'win.show', me);
    var component = win.show();
    _.log(me, 'win.show result', component);
    me.checkWms();
    if (callback) { callback(); }
  }
 
  
});

