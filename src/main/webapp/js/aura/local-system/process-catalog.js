Ext.ns("Aura.process");
Ext.ns('aurin.form.process');

Aura.process.Catalog = {
  "description": "Registered Processes",
  "items": {
    "js://aurin.org.au/count": {
      "name": "Count by attribute"
    , "type": "process-client-js"
    , "group": "Basic Data Processing"
    , "paramDefinition": {
        "refs": "elementId"
      , "by": "attribute"
      }
    , "formDefinition": { type: "function", name: "countForm" }
    // not working, need to implement setSelectedAttrs in form
    //, "formDefinition": { type: "configurable", url: wifUiConfig['appBase'] + '/js/aura/form/process/CountCfg.js', name: 'Aura.form.process.Count'}
    }
  , 'js://aurin.org.au/join': {
      "name": "Join by feature"
    , "group": "Basic Data Processing"
    , "type": "process-client-js"
    , "paramDefinition": {
        "refs": ["elementId1", "elementId2"]
      , "mode": "auto"
      , "keys": ["key1", "key2"]
      , "keyRegexes": ["key1", "key2"]
      }
    , "formDefinition": { type: "function", name: "joinForm" }
    }
  , "js://aurin.org.au/classify": {
      "name": "Classify by attribute"
    , "type": "process-client-js"
    , "group": "Data Classification"
    , "paramDefinition": {
        "refs": ["elementId"]
      , "valueField": "attribute"
      , "classType": "jenks, quantile, or equal"
      , "classNum": "number of class"
      }
    , "formDefinition": { type: "object", name: "Aura.form.process.Classify" }
    }
  , "ws://aurin.org.au/langid": {
      "name": "Language identification"
    , "type": "process-client-js"
    , "group": "Language Processing"
    , "paramDefinition": {
        "refs": ["elementId"]
      , "valueField": "attribute"
      }
    , "formDefinition": { type: "object", name: "Aura.form.process.LangId" }
    }
  , "ws://aurin.org.au/twitterdb": {
      "name": "Twitter LiveDb"
    , "type": "process-client-js"
    , "group": "Twitter"
    , "paramDefinition": {
        "count": "number of twitter"
      }
    , "formDefinition": { type: "object", name: "Aura.form.process.TwitterDb" }
    }
  , "ws://aurin.org.au/twitter-timeline": {
      "name": "Twitter Timeline"
    , "type": "process-client-js"
    , "group": "Twitter"
    , "paramDefinition": {
        "refs": ["elementId"]
      , "userIdField": "attribute"
      , "numUsers": "number of users"
      }
    , "formDefinition": { type: "object", name: "Aura.form.process.TwitterTimeline" }
    }
  }
};
