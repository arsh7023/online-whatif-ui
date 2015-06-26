aura.dataCatalog = 
{ 'description': 'Registered Data Sources and Process',
  'sources': {
    // Twitter test
    'json://aurin.org.au/data/twit_au': {
      'name': 'Twitter Australia',
      'group': ['Twitter'],
      'tags': ['twitter'],
      'resolution': {
        'spatial': 'point', // abs:suburb
        'temporal': 'second' // seconds
      },
      'coverage': {
        'spatial': {
          'type': 'feature', // geometry (bounding box, polygon, point/radius), 
          'level': 'country', // abs:state, abs:lga, postcode, fer
          'features': ['au'],
          'snapshot': false // True means spatial coverage =  
        },
        'temporal': {
          'type': 'realtime' // range or set
          // level: HH, MM, YYYY, mm:ss 
          // range: [1990,2000]
          // set: [1991, 1992] 
        }
      },      
      'service': {
        'type': 'json',
        'endpoint': 'http://students.informatics.unimelb.edu.au/~ivow/stuff/aurin/twitter2.py',
        'root': 'results',
        'params': [
          {'id': 'latitude', 'name': 'Latitude', 'type': 'float'},
          {'id': 'longitude', 'name': 'Longitude', 'type': 'float'},
          {'id': 'radius', 'name': 'Radius', 'type': 'float'}
        ],
      },
      'fields': [
        {'id': 'latitude', 'name': 'Latitude', 'type': 'float'},
        {'id': 'longitude', 'name': 'Longitude', 'type': 'float'},
        {'id': 'language', 'name': 'Language', 'type': 'string'}
      ]
    },
    // Twitter Vic    
    'json://aurin.org.au/data/twit_vic': {
      'name': 'Twitter Victoria',
      'groups': ['Twitter'],
      'tags': ['twitter'],
      'coverage': {
        'spatial': {
          'type': 'feature', 
          'level': 'abs:state', 
          'features': [2] // Victoria
        }, 
        'temporal': {
          'type': 'range', 
          'level': 'second', 
          'ranges': [[new Date(2011, 1, 1, 0, 0, 0), Infinity]]
        }
      },      
      'service': {
        'type': 'json',
        'endpoint': 'http://students.informatics.unimelb.edu.au/~ivow/stuff/aurin/twitter2.py',
        'params': [],
      },
      'fields': [ // to be served by describeData
        {'id': 'latitude', 'name': 'Latitude', 'type': 'float'},
        {'id': 'longitude', 'name': 'Longitude', 'type': 'float'},
        {'id': 'language', 'name': 'Language', 'type': 'string'}
      ]
    },
    // Landgate ABS-076
    'wfs://www.landgate.wa.gov.au/wfsabs_4283/abs-076': { 
      'name': 'Population By LGA - Census 2006 (ABS-076)',
      'groups': ['ABS - Demoraphics'],
      'tags': ['population', 'abs', 'census'],
      'coverage': {
        'spatial': {
          'type': 'feature', 
          'level': 'country', 
          'features': ['au']
        },
        'temporal': {
          'type': 'snapshot', 
          'level': 'year', // year 
          'item': 2006
        }
      },      
      'service': {
        'type': 'wfs',
        'endpoint': 'https://www2.landgate.wa.gov.au/ows/wfsabs_4283/wfs',
        'username': 'username',
        'password': 'password',        
        'params': [
          {'id': 'ste_code', 'name': 'State Code', 'type': 'string'}
        ],
      },
      'fields': []
    },
    // ABS Historical Population    
    'postgres://aurin-2/4283/population-by-state': { 
      'name': 'Historical Population State',
      'groups': ['ABS - Demographics'],
      'tags': ['population', 'abs', 'census'],
      'coverage': {
        'spatial': {
          'type': 'feature', 
          'level': 'country', 
          'features': ['au']
        },
        'temporal': {
          'type': 'range', 
          'level': 'year', 
          'ranges': [[1911, 2006]]
        }
      },      
      'service': {
        'type': 'json',
        'endpoint': 'http://192.168.57.41:8080/au/abs/demographics/history',        
        'params': [
          {'id': 'sex', 'name': 'Sex', 'type': 'string'},
          {'id': 'age', 'name': 'Age Group', 'type': 'string'},      
        ],
      },
      'fields': []
    },    
    // Local JS Process
    'js://aurin.org.au/count': { 
      'name': 'JS Group Count',
      'groups': ['JS Process'],
      'tags': ['process', 'local'],
      'service': {
        'type': 'js-local',  
        'params': [
          {'id': 'ref', 'name': 'Data Source', 'type': 'source'},
          {'id': 'by', 'name': 'Group Attribute', 'type': 'string'}  
        ]
      },
      'fields': []
    }        
  } // end sources
};
