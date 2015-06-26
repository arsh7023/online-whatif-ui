Ext.ns("Aura.workflow");
Ext.ns('Aura.form.workflow');

Aura.workflow.Catalog = {
  "description": "Registered Worklfow",
  "items": {
    "walkability-demo": {
      "name": "Walkability"
    , "type": "wrapped-oms-ws"
    , "group": "OMS Workflow"
    , "paramDefinition": {
      }
    , "formDefinition": { type: "configurable", url: wifUiConfig['appBase'] + '/js/aura/form/workflow/WalkabilityCfg.js', name: 'Aura.form.workflow.Walkability'}
    }
  }
};
