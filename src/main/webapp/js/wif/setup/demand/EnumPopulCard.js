Ext.define('Wif.setup.demand.EnumPopulCard', {
  extend : 'Ext.form.Panel',
  requires : ['Wif.RESTObject'],
  project : null,
  title : 'Enumeration District - Population',
  animCollapse : false,
  isNew : false,
  bodyPadding : 5,
  layout : 'anchor',
  border : 0,
  autoRender : true,
  margin : 'auto',
  projectsData : null,

  unionAttrsCboxs : [],
  fieldDefaults : {
    labelAlign : 'right',
    labelWidth : 200,
    emptyText : 'Select UNION Attribute'
  },

  constructor : function(config) {
    var me = this, cbox;
    Ext.apply(this, config);
    var projectId = me.project.projectId;

    var enumDistrictHash = {
      enumerationDistrictLabel : {
        name : 'enumerationDistrictFeatureFieldName',
        label : 'Enumeration District Label'
      },
      enumerationDistrictArea : {
        name : 'enumerationDistrictAreaFeatureFieldName',
        label : 'Enumeration District Area'
      },
      clippedEnumerationDistrictArea : {
        name : 'clippedEnumerationDistrictAreaFeatureFieldName',
        label : 'Clipped Enumeration Destrict Area'
      }
    }
    var populationHash = {
      totalPopulation : {
        name : 'totalPopulationFeatureFieldName',
        label : 'Total Population'
      },
      numberOfHouseholds : {
        name : 'numberOfHouseholdsFeatureFieldName',
        label : 'Number of Housholds'
      },
      numberOfHousingUnits : {
        name : 'numberOfHousingUnitsFeatureFieldName',
        label : 'Number Of Housing Units'
      },
      groupQuartersPopulation : {
        name : 'groupQuartersPopulationFeatureFieldName',
        label : 'Group Quarters Population'
      }
    };

    /* ---------------------------------------------
     * Create fields related to Enumeration District
     ----------------------------------------------- */
    var enumDistrictFieldSet = Ext.create('Ext.form.FieldSet', {
      columnWidth : 0.5,
      title : 'Define Enumeration District Information',
      collapsible : true,
      margin : '15 5 5 0',
      defaults : {
        bodyPadding : 10,
        anchor : '90%'
      }
    });

    _.each(enumDistrictHash, function(hash, hashIndex) {
      var cbox = Ext.create('Wif.setup.UnionAttrComboBox', {
        projectId : me.project.projectId,
        fieldLabel : hash.label,
        name : hash.name,
      });
      enumDistrictFieldSet.add(cbox);
      me.unionAttrsCboxs.push(cbox);
    });

    /* ------------------------------------
     * Create fields related to Population
     ----------------------------------- */
    var populationFieldSet = Ext.create('Ext.form.FieldSet', {
      columnWidth : 0.5,
      title : 'Define Population Information',
      collapsible : true,
      margin : '15 5 5 0',
      defaults : {
        bodyPadding : 10,
        anchor : '90%'
      }
    });
    _.each(populationHash, function(hash, hashIndex) {
      cbox = Ext.create('Wif.setup.UnionAttrComboBox', {
        projectId : me.project.projectId,
        fieldLabel : hash.label,
        name : hash.name,
      });
      populationFieldSet.add(cbox);
      me.unionAttrsCboxs.push(cbox);
    });

    /* ------------------------------------------------------
     * Put all 3 fieldsets after each other in the form panel
     -------------------------------------------------------- */
    this.items = [enumDistrictFieldSet, populationFieldSet];

    this.callParent(arguments);
  },

  listeners : {
    activate : function() {
      _.log(this, 'activate');
      this.build();
      // this.build();
    }
  },

 fillcombo: function (cbox)
  {
	  var me = this;
	  var definition = this.project.getDefinition();
	  console.log("cbox", cbox.name);
	  if (cbox.name == 'enumerationDistrictFeatureFieldName')
	  {
	      cbox.setValue(definition.enumerationDistrictFeatureFieldName);
	  }
	  
	  if (cbox.name == 'enumerationDistrictAreaFeatureFieldName')
	  {
	      cbox.setValue(definition.enumerationDistrictAreaFeatureFieldName);
	  }
	  
	  if (cbox.name == 'totalPopulationFeatureFieldName')
	  {
	      cbox.setValue(definition.totalPopulationFeatureFieldName);
	  }
	  
	  if (cbox.name == 'clippedEnumerationDistrictAreaFeatureFieldName')
	  {
	      cbox.setValue(definition.clippedEnumerationDistrictAreaFeatureFieldName);
	  }
	 
	  if (cbox.name == 'numberOfHouseholdsFeatureFieldName')
	  {
	      cbox.setValue(definition.numberOfHouseholdsFeatureFieldName);
	  }
	  
	  if (cbox.name == 'numberOfHousingUnitsFeatureFieldName')
	  {
	      cbox.setValue(definition.numberOfHousingUnitsFeatureFieldName);
	  }
	  
	  if (cbox.name == 'groupQuartersPopulationFeatureFieldName')
	  {
	      cbox.setValue(definition.groupQuartersPopulationFeatureFieldName);
	  }
	  

  },
  
  
  
  
  build : function() {
    var me = this, projectId = this.project.projectId, cboxs = me.unionAttrsCboxs;

    var definition = me.project.getDefinition();
    
   
    for (var i = 0; i < cboxs.length; i++) {
      cboxs[i].serviceParams.url = Wif.endpoint + 'projects/' + projectId + '/unionAttributes/';
      //cboxs[i].load();
     
     cboxs[i].load(projectId, (function (cbox) {
      return function() { me.fillcombo(cbox); };
      })(cboxs[i]));
    }

  },

  validate : function(callback) {
    var me = this, cboxs = this.unionAttrsCboxs, definition = me.project.getDefinition();
    if (!me.form.isValid()) {
      _.log(me, 'validate', 'Form is not valid');
      Ext.Msg.alert('Status', 'Not valid values!');
      return false;
    }
    _.each(cboxs, function(cbox) {
      definition[cbox.name] = cbox.getValue();
    });

    me.project.setDefinition(definition);
    if (callback) {
      callback();
    }
    return true;
  }
});
