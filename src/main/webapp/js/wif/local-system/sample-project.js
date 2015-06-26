
var projectIn = {
  "id" : 1,
  "name" : "Demonstration",
  "suitabilityScenarios" : {
    "20" : "Suburbanization"
  },
  "demandScenarios" : {
    "1" : "High Growth"
  },
  "allocationScenarios" : {
    "103" : "Suburbanization-High Growth-No Controls"
  },
  "creationDate" : 1360045208360,
  "modifiedDate" : 1360045208360,
  "originalUnits" : "mks",
  "uazDataStoreURI" : "https://dev-api.aurin.org.au/datastore-new/files/c7d254c0d98839b7fcc14325f72b83f5658a9f857e2be0123c0042a67f487830",
  "existingLUAttributeName" : "ELU",
  "analysisOption" : "Land Use/Population/Employment Analysis",
  "allocationLandUses" : [ {
    "id" : 33,
    "label" : "Local Retail",
    "featureFieldName" : "11.0",
    "allocationLabel" : "211.0",
    "totalArea" : 255.03,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  }, {
    "id" : 38,
    "label" : "Public/Semi-pub.",
    "featureFieldName" : "51.0",
    "allocationLabel" : "251.0",
    "totalArea" : 710.2,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  }, {
    "id" : 40,
    "label" : "Agriculture",
    "featureFieldName" : "82.0",
    "notDevelopable" : false,
    "notDefined" : false
  }, {
    "id" : 39,
    "label" : "Undeveloped",
    "featureFieldName" : "81.0",
    "notDevelopable" : false,
    "notDefined" : false
  }, {
    "id" : 34,
    "label" : "Office",
    "featureFieldName" : "12.0",
    "allocationLabel" : "212.0",
    "totalArea" : 442.33,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  }, {
    "id" : 41,
    "label" : "Conservation",
    "featureFieldName" : "83.0",
    "allocationLabel" : "283.0",
    "totalArea" : 0.0,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : true
  }, {
    "id" : 36,
    "label" : "Industrial",
    "featureFieldName" : "21.0",
    "allocationLabel" : "221.0",
    "totalArea" : 532.76,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  }, {
    "id" : 44,
    "label" : "Nursing Home",
    "featureFieldName" : "4.0",
    "allocationLabel" : "204.0",
    "totalArea" : 7.73,
    "groupQuarters" : true,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  }, {
    "id" : 30,
    "label" : "Low Density Res.",
    "featureFieldName" : "1.0",
    "allocationLabel" : "201.0",
    "totalArea" : 5520.86,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  }, {
    "id" : 31,
    "label" : "Med Density Res.",
    "featureFieldName" : "2.0",
    "allocationLabel" : "202.0",
    "totalArea" : 705.9,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  }, {
    "id" : 42,
    "label" : "Right of Way",
    "featureFieldName" : "91.0",
    "notDevelopable" : true,
    "notDefined" : false
  }, {
    "id" : 43,
    "label" : "Water",
    "featureFieldName" : "92.0",
    "notDevelopable" : true,
    "notDefined" : false
  }, {
    "id" : 32,
    "label" : "Mixed Use",
    "featureFieldName" : "3.0",
    "allocationLabel" : "203.0",
    "totalArea" : 3.57,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  }, {
    "id" : 37,
    "label" : "Parks & Rec.",
    "featureFieldName" : "41.0",
    "allocationLabel" : "241.0",
    "totalArea" : 943.1,
    "local" : true,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  }, {
    "id" : 35,
    "label" : "Regional Retail",
    "featureFieldName" : "13.0",
    "allocationLabel" : "213.0",
    "totalArea" : 330.99,
    "notDevelopable" : false,
    "notDefined" : false,
    "newPreservation" : false
  } ],



  "suitabilityLUs" : [ {
    "id" : 81,
    "scoreLabel" : "SCORE_2",
    "label" : "Mixed Use",
    "featureFieldName" : "SCORE_2",
    "associatedALUs" : { }
  }, {
    "id" : 82,
    "scoreLabel" : "SCORE_3",
    "label" : "Retail",
    "featureFieldName" : "SCORE_3",
    "associatedALUs" : {
      "35" : "Regional Retail",
      "33" : "Local Retail"
    }
  }, {
    "id" : 80,
    "scoreLabel" : "SCORE_1",
    "label" : "Residential",
    "featureFieldName" : "SCORE_1",
    "associatedALUs" : {
      "32" : "Mixed Use",
      "31" : "Med Density Res.",
      "44" : "Nursing Home",
      "30" : "Low Density Res."
    }
  }, {
    "id" : 84,
    "scoreLabel" : "SCORE_5",
    "label" : "Industrial",
    "featureFieldName" : "SCORE_5",
    "associatedALUs" : {
      "36" : "Industrial"
    }
  }, {
    "id" : 83,
    "scoreLabel" : "SCORE_4",
    "label" : "Office",
    "featureFieldName" : "SCORE_4",
    "associatedALUs" : {
      "34" : "Office",
      "38" : "Public/Semi-pub."
    }
  }, {
    "id" : 85,
    "scoreLabel" : "SCORE_6",
    "label" : "Conservation",
    "featureFieldName" : "SCORE_6",
    "associatedALUs" : {
      "37" : "Parks & Rec.",
      "41" : "Conservation"
    }
  } ],
  "projections" : [ {
    "id" : 7,
    "year" : 2010,
    "label" : "2010",
    "allocationLabel" : "ALU_1"
  }, {
    "id" : 5,
    "year" : 2005,
    "label" : "2005",
    "allocationLabel" : "ALU_0"
  }, {
    "id" : 3,
    "year" : 2015,
    "label" : "2015",
    "allocationLabel" : "ALU_2"
  } ],
  "factors" : [ {
    "id" : 103,
    "label" : "Prime Ag. Soils",
    "featureFieldName" : "FACTOR_2",
    "factorTypes" : {
      "212" : "Not Prime Ag.",
      "211" : "Prime Ag."
    }
  }, {
    "id" : 101,
    "label" : "100-year flood",
    "featureFieldName" : "FACTOR_4",
    "factorTypes" : {
      "205" : "Outside Flood",
      "206" : "Inside Flood"
    }
  }, {
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
    "id" : 102,
    "label" : "access",
    "featureFieldName" : "FACTOR_7",
    "factorTypes" : {
      "207" : "High",
      "208" : "Medium High",
      "209" : "Medium",
      "210" : "Low"
    }
  } ]
};

var scenarioIn = {
  "id" : 20,
  "label" : "Suburbanization",
  "featureFieldName" : "SCORE_1",
  "suitabilityRules" : [ {
    "id" : 302,
    "suitabilityLU" : {
      "82" : "Retail"
    },
    "convertibleLUs" : {
      "39" : "Undeveloped",
      "40" : "Agriculture",
      "41" : "Conservation",
      "31" : "Med Density Res.",
      "30" : "Low Density Res."
    },
    "factorImportances" : [ {
      "id" : 406,
      "factor" : {
        "100" : "slopes"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 522,
        "factorType" : {
          "200" : "<6%"
        },
        "score" : 100.0
      }, {
        "id" : 523,
        "factorType" : {
          "201" : "6% - <12%"
        },
        "score" : 25.0
      }, {
        "id" : 524,
        "factorType" : {
          "202" : "12% - <18%"
        },
        "score" : 0.0
      }, {
        "id" : 525,
        "factorType" : {
          "203" : "18% - <25%"
        },
        "score" : 0.0
      }, {
        "id" : 526,
        "factorType" : {
          "204" : ">=25%"
        },
        "score" : 0.0
      } ]
    }, {
      "id" : 408,
      "factor" : {
        "102" : "access"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 532,
        "factorType" : {
          "210" : "Low"
        },
        "score" : 0.0
      }, {
        "id" : 531,
        "factorType" : {
          "209" : "Medium"
        },
        "score" : 33.0
      }, {
        "id" : 530,
        "factorType" : {
          "208" : "Medium High"
        },
        "score" : 67.0
      }, {
        "id" : 529,
        "factorType" : {
          "207" : "High"
        },
        "score" : 100.0
      } ]
    }, {
      "id" : 407,
      "factor" : {
        "101" : "100-year flood"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 527,
        "factorType" : {
          "205" : "Outside Flood"
        },
        "score" : 100.0
      }, {
        "id" : 528,
        "factorType" : {
          "206" : "Inside Flood"
        },
        "score" : 0.0
      } ]
    } ]
  }, {
    "id" : 304,
    "suitabilityLU" : {
      "84" : "Industrial"
    },
    "convertibleLUs" : {
      "39" : "Undeveloped",
      "40" : "Agriculture",
      "41" : "Conservation",
      "31" : "Med Density Res.",
      "30" : "Low Density Res."
    },
    "factorImportances" : [ {
      "id" : 413,
      "factor" : {
        "101" : "100-year flood"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 549,
        "factorType" : {
          "205" : "Outside Flood"
        },
        "score" : 100.0
      }, {
        "id" : 550,
        "factorType" : {
          "206" : "Inside Flood"
        },
        "score" : 0.0
      } ]
    }, {
      "id" : 414,
      "factor" : {
        "102" : "access"
      },
      "importance" : 50.0,
      "factorTypeRatings" : [ {
        "id" : 554,
        "factorType" : {
          "210" : "Low"
        },
        "score" : 0.0
      }, {
        "id" : 553,
        "factorType" : {
          "209" : "Medium"
        },
        "score" : 50.0
      }, {
        "id" : 552,
        "factorType" : {
          "208" : "Medium High"
        },
        "score" : 50.0
      }, {
        "id" : 551,
        "factorType" : {
          "207" : "High"
        },
        "score" : 50.0
      } ]
    }, {
      "id" : 412,
      "factor" : {
        "100" : "slopes"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 544,
        "factorType" : {
          "200" : "<6%"
        },
        "score" : 100.0
      }, {
        "id" : 545,
        "factorType" : {
          "201" : "6% - <12%"
        },
        "score" : 0.0
      }, {
        "id" : 546,
        "factorType" : {
          "202" : "12% - <18%"
        },
        "score" : 0.0
      }, {
        "id" : 547,
        "factorType" : {
          "203" : "18% - <25%"
        },
        "score" : 0.0
      }, {
        "id" : 548,
        "factorType" : {
          "204" : ">=25%"
        },
        "score" : 0.0
      } ]
    } ]
  }, {
    "id" : 301,
    "suitabilityLU" : {
      "81" : "Mixed Use"
    },
    "convertibleLUs" : {
      "39" : "Undeveloped",
      "40" : "Agriculture",
      "41" : "Conservation",
      "30" : "Low Density Res."
    },
    "factorImportances" : [ {
      "id" : 403,
      "factor" : {
        "100" : "slopes"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 511,
        "factorType" : {
          "200" : "<6%"
        },
        "score" : 100.0
      }, {
        "id" : 512,
        "factorType" : {
          "201" : "6% - <12%"
        },
        "score" : 25.0
      }, {
        "id" : 513,
        "factorType" : {
          "202" : "12% - <18%"
        },
        "score" : 0.0
      }, {
        "id" : 514,
        "factorType" : {
          "203" : "18% - <25%"
        },
        "score" : 0.0
      }, {
        "id" : 515,
        "factorType" : {
          "204" : ">=25%"
        },
        "score" : 0.0
      } ]
    }, {
      "id" : 404,
      "factor" : {
        "101" : "100-year flood"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 516,
        "factorType" : {
          "205" : "Outside Flood"
        },
        "score" : 100.0
      }, {
        "id" : 517,
        "factorType" : {
          "206" : "Inside Flood"
        },
        "score" : 0.0
      } ]
    }, {
      "id" : 405,
      "factor" : {
        "102" : "access"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 521,
        "factorType" : {
          "210" : "Low"
        },
        "score" : 0.0
      }, {
        "id" : 520,
        "factorType" : {
          "209" : "Medium"
        },
        "score" : 33.0
      }, {
        "id" : 519,
        "factorType" : {
          "208" : "Medium High"
        },
        "score" : 67.0
      }, {
        "id" : 518,
        "factorType" : {
          "207" : "High"
        },
        "score" : 100.0
      } ]
    } ]
  }, {
    "id" : 300,
    "suitabilityLU" : {
      "80" : "Residential"
    },
    "convertibleLUs" : {
      "39" : "Undeveloped",
      "40" : "Agriculture"
    },
    "factorImportances" : [ {
      "id" : 400,
      "factor" : {
        "100" : "slopes"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 500,
        "factorType" : {
          "200" : "<6%"
        },
        "score" : 100.0
      }, {
        "id" : 501,
        "factorType" : {
          "201" : "6% - <12%"
        },
        "score" : 50.0
      }, {
        "id" : 502,
        "factorType" : {
          "202" : "12% - <18%"
        },
        "score" : 0.0
      }, {
        "id" : 503,
        "factorType" : {
          "203" : "18% - <25%"
        },
        "score" : 0.0
      }, {
        "id" : 504,
        "factorType" : {
          "204" : ">=25%"
        },
        "score" : 0.0
      } ]
    }, {
      "id" : 401,
      "factor" : {
        "101" : "100-year flood"
      },
      "importance" : 25.0,
      "factorTypeRatings" : [ {
        "id" : 505,
        "factorType" : {
          "205" : "Outside Flood"
        },
        "score" : 100.0
      }, {
        "id" : 506,
        "factorType" : {
          "206" : "Inside Flood"
        },
        "score" : 0.0
      } ]
    }, {
      "id" : 402,
      "factor" : {
        "102" : "access"
      },
      "importance" : 25.0,
      "factorTypeRatings" : [ {
        "id" : 510,
        "factorType" : {
          "210" : "Low"
        },
        "score" : 25.0
      }, {
        "id" : 509,
        "factorType" : {
          "209" : "Medium"
        },
        "score" : 50.0
      }, {
        "id" : 508,
        "factorType" : {
          "208" : "Medium High"
        },
        "score" : 75.0
      }, {
        "id" : 507,
        "factorType" : {
          "207" : "High"
        },
        "score" : 100.0
      } ]
    } ]
  }, {
    "id" : 305,
    "suitabilityLU" : {
      "85" : "Conservation"
    },
    "convertibleLUs" : {
      "39" : "Undeveloped",
      "40" : "Agriculture"
    },
    "factorImportances" : [ {
      "id" : 416,
      "factor" : {
        "101" : "100-year flood"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 560,
        "factorType" : {
          "205" : "Outside Flood"
        },
        "score" : 50.0
      }, {
        "id" : 561,
        "factorType" : {
          "206" : "Inside Flood"
        },
        "score" : 100.0
      } ]
    }, {
      "id" : 415,
      "factor" : {
        "100" : "slopes"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 555,
        "factorType" : {
          "200" : "<6%"
        },
        "score" : 50.0
      }, {
        "id" : 556,
        "factorType" : {
          "201" : "6% - <12%"
        },
        "score" : 50.0
      }, {
        "id" : 557,
        "factorType" : {
          "202" : "12% - <18%"
        },
        "score" : 100.0
      }, {
        "id" : 558,
        "factorType" : {
          "203" : "18% - <25%"
        },
        "score" : 100.0
      }, {
        "id" : 559,
        "factorType" : {
          "204" : ">=25%"
        },
        "score" : 100.0
      } ]
    } ]
  }, {
    "id" : 303,
    "suitabilityLU" : {
      "83" : "Office"
    },
    "convertibleLUs" : {
      "39" : "Undeveloped",
      "40" : "Agriculture",
      "41" : "Conservation",
      "31" : "Med Density Res.",
      "30" : "Low Density Res."
    },
    "factorImportances" : [ {
      "id" : 411,
      "factor" : {
        "102" : "access"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 543,
        "factorType" : {
          "210" : "Low"
        },
        "score" : 0.0
      }, {
        "id" : 542,
        "factorType" : {
          "209" : "Medium"
        },
        "score" : 33.0
      }, {
        "id" : 541,
        "factorType" : {
          "208" : "Medium High"
        },
        "score" : 67.0
      }, {
        "id" : 540,
        "factorType" : {
          "207" : "High"
        },
        "score" : 100.0
      } ]
    }, {
      "id" : 410,
      "factor" : {
        "101" : "100-year flood"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 538,
        "factorType" : {
          "205" : "Outside Flood"
        },
        "score" : 100.0
      }, {
        "id" : 539,
        "factorType" : {
          "206" : "Inside Flood"
        },
        "score" : 0.0
      } ]
    }, {
      "id" : 409,
      "factor" : {
        "100" : "slopes"
      },
      "importance" : 100.0,
      "factorTypeRatings" : [ {
        "id" : 533,
        "factorType" : {
          "200" : "<6%"
        },
        "score" : 100.0
      }, {
        "id" : 534,
        "factorType" : {
          "201" : "6% - <12%"
        },
        "score" : 25.0
      }, {
        "id" : 535,
        "factorType" : {
          "202" : "12% - <18%"
        },
        "score" : 0.0
      }, {
        "id" : 536,
        "factorType" : {
          "203" : "18% - <25%"
        },
        "score" : 0.0
      }, {
        "id" : 537,
        "factorType" : {
          "204" : ">=25%"
        },
        "score" : 0.0
      } ]
    } ]
  } ]
};
