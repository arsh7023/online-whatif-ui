/*
 * undertow.js
 * extension of underscore.js
 *
 * Collection of various utility functions.
 *
 * Dependencies:
 * underscore.js (strict)
 *
 * dojox (optional)
 * ExtJS (optional)
 * OpenLayers (optional)
 *
 * functions end with x: generate getter/setter/valuer function with closure
 * functions end with 3: supports 'rows-like' of data in the following forms:
 *  [ {obj1}, {obj2} ] or { key1: {obj1}, key2: {obj2} }
 *
 */

(function () {// start enclosure

  // Repeated from underscore.js
  // ---------------------------
  // Save bytes in the minified (but not gzipped) version:
  // Create quick reference variables for speed access to core prototypes.

  var slice = Array.prototype.slice
    , evil = eval
    , _, u;

  if (typeof exports !== 'undefined') {
    // node js environment
    _ = require('underscore');
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = _;
    }
    exports._ = _;
  } else {
    // in browser
    _ = window._;
    if (!_) { // underscore not included
      console.log('underscore.js must be included');
      throw new Error('underscore.js is not defined');
    }    
  }

  // define internal reference
  u = _.undertow = {};
  // undertow's statics
  _.extend(u, {
    logFilters: []
  });

  _.mixin({

    /**
     * Provide high-level typeof
     * based on http://javascript.crockford.com/remedial.html
     *   
     * boolean: true | false
     * array: [1, 2, {4: 5}]
     * object: {name: john, scores: [90, 80]}
     * null: null
     * undefined:
     * number: 1 or 3.14
     * function: function () {}
     * string: 'text' or "word"
     * regexp: /abc.+/
     * iterator
     *
     */
    typeOf: function (thing) {
      var type = typeof thing;

      if (type === 'object') {
        if (thing) {
          if (thing instanceof Array) {
            return 'array';
          } else if (thing instanceof RegExp) {
            return 'regexp';
          } else if (typeof Iterator !== 'undefined' && thing instanceof Iterator) {
            return 'iterator';
          }
        } else {
          return 'null';
        }
      }
      return type;
    }

  , blankOf: function (thing) {
      var constructor = thing.constructor
        , type = _.typeOf(constructor);

      if (constructor) {
        if (type === 'object')
          return new constructor();        
      }
      return [];
    }

    /**
     * Injecting hash into a function
     *
     */
  , xf: function (f, hash) {
      var xf = function xf() { return f.apply(xf, arguments); }
        , key;
      for (key in hash) {
        // asssume hash is a plain JS object
        xf[key] = hash[key];
      }
      return xf;
    }

  , getClasses: function getClasses(thing) {
      if (_.typeOf(thing) !== 'object')
        return [];
      var classes = [], className, parent;
      className = thing['$className'];
      if (className) { // ExtJS' OOP-style
        classes[0] = className;
        if (thing.superclass) {
          classes = classes.concat(getClasses(thing.superclass));
        }
      }
      className = thing.CLASS_NAME;
      if (className) { // OpenLayers' OOP-style        
        classes[0] = className;
        try {
          parent = evil(className + '.prototype.__proto__');
          classes = classes.concat(getClasses(parent));
        } catch(err) {
          // pass
        }
      }
      return classes;
    }

  , getIdentifiers: function (thing) {
      return {
        classes: _.getClasses(thing),
        name: thing.name,
        id: thing.id
      };
    }

  , logSetFilter: function (filters) {
      u.logFilters = filters;
    }
    
  , log: function (obj) {
      // logger should be an object
      if (typeof obj !== 'object') return;

      var classes = _.getClasses(obj);
      if (u.logFilters.length === 0 || _.arrIntersect(classes, u.logFilters)) {
        arguments[0] = classes[0] || obj;
        console.log(slice.call(arguments));
      }
    }

    // https://gist.github.com/982883
  , uuid4: function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b);}

  , strxml: function (xmlString) {
      var xmlDoc, parser;

      if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlString, "text/xml");
      } else {// Internet Explorer
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlString);
      }
      return xmlDoc;
    }

  , tablize: function (obj) {
      var html = '<table>', prop;
  
      for (prop in obj) {
        html += '<tr><td>' + prop.toString() + '</td>';
        html += '<td>' + obj[prop].toString() + '</td></tr>';
      }
      html += '</table>';
      return html;
    }

  , strjoin: function (arr, getter, quote, separator) {
      var f = _.getterx(getter)
        , qtype = _.typeOf(quote)
        , q0, q1
        , result = '', i, j = arr.length;

      if (quote === null || qtype === 'undefined') {
        q0 = q1 = '"';
      } else if (qtype === 'array') {
        q0 = quote[0];
        q1 = quote[1];
      } else {
        q0 = q1 = quote;
      }
      if (typeof separator === 'undefined' || separator === null) separator = ',';
      
      for (i = 0; i < j; i++) {
        result += q0 + f(arr[i]) + q1;
        if (i < j-1) {
          result += separator;
        }
      }
      return result;
    }

    // obj is either JS hash or array
  , traverse: function (obj, arrKeys, create) {
      var i, n = obj, j = arrKeys.length, k, nn;

      for (i = 0; i < j; i++) {
        k = arrKeys[i];
        if (n[k]) {
          nn = n[k];
        } else {
          nn = null;
        }
        if (!nn) {
          if (!create) {
            return null;
          }
          n = n[k] = {};
        } else {
          n = nn;
        }
      }
      return n;
    }

  , read: function (obj, arrKeys, defaultVal) {
      var n = _.traverse(obj, arrKeys);
      if(n === null && defaultVal) {
        n = defaultVal;
      }
      return n;
    }

  , update: function (obj, arrKeys, val, create) {
      var i, n = obj, j = arrKeys.length, k, nn, k_1;
      
      for (i = 0; i < j-1; i++) {
        k = arrKeys[i];
        if (n[k]) {
          nn = n[k];
        } else {
          nn = null;
        }
        if (!nn) {
          if (!create) {
            return null;
          }
          k_1 = arrKeys[i+1];
          if (_.typeOf(k_1) === 'number') {
            n[k] = [];
          } else { // string
            n[k] = {};
          }
          n = n[k];
        } else {
          n = nn;
        }
      }
      n[arrKeys[j-1]] = val;
      return obj;
    }

  , remove: function (obj, arrKeys, val) {
      var len = arrKeys.length;
      var node = _.traverse(obj, arrKeys.slice(0, len-1));
      var key = arrKeys[arrKeys.length-1];
      if (node && key in node) {
        delete node[key];
        return true;
      }
      return false;
    }

  , add: function (obj, key, val) {
      if (!obj.key) {
        obj[key] = val || 1;
      }
      return obj;
    }

  , hashify: function (array, defaultVal) {
      var results = {};

      _.each(_.flatten(array), function (val) {
        results[val] = defaultVal || 1;
      });
      return results;
    }

  , arrayify: function (obj, keyField, valField) {
      var results = [];

      keyField = keyField || 'key';
      valField = valField || 'value';
      _.each(obj, function (val, key) {
        var row = {};
        row[keyField] = key;
        row[valField] = val;
        results[results.length] = row;
      });
      return results;
    }

  , arrIntersect: function (arr1, arr2) {
      var l1 = arr1.length, l2;

      while (l1--) {
        l2 = arr2.length;
        while (l2--) {
          if (_.isEqual(arr1[l1], arr2[l2])) {
            return true;
          }
        }
      }
      return false;
    }

  , objIntersect: function (obj1, obj2) {
      for (var key1 in obj1) {
        if (key1 in obj2) {
          if (_.isEqual(obj1[key1], obj2[key1])) {
            return true;
          }
        }
      }
      return false;
    }

  , isIntersect: function (thing1, thing2) {
      return (_.typeOf(thing1) === 'array') ? _.arrIntersect(thing1, thing2) : _.objIntersect(thing1, thing2);
    }

  , hasCommon: function (obj1, obj2) {
      for (var key1 in obj1) {
        if (key1 in obj2) {
          if (obj1[key1] === obj2[key1]) {
            return true;
          }
        }
      }
      return false;
    }

  // quick pick, with no hasOwnProperty checking
  , qpick: function (obj, arr) {
      var result = {}
        , j = arr.length, key;

      while (j--) {
        key = arr[j];
        if (obj.key) {
          result[key] = obj[key];
        }
      }
      return result;
    }

    // Enhanced version of built-in concat
    // shallow copy
  , concat: function (array) {
      return array.concat(slice.call(arguments, 1));
    }

  , concatDeep: function () {
      var results = []
        , arrays = slice.call(arguments);

      _.each(arrays, function (array) {
        _.each(array, function (obj) {
          results[results.length] = _.cloneDeep(obj);
        });
      });
      return results;
    },

    cloneDeep: function cloneDeep(obj) {
      var result = {}, type = _.typeOf(obj), key, val;

      if (type !== 'object' && type !== 'array')
        return _.clone(obj);
      for (key in obj) {
        val = obj[key];
        type = _.typeOf(val);
        if (type === 'object' || type === 'array') {
          result[key] = cloneDeep(val);
          continue;
        }
        result[key] = val;
      }
      return result;
    },

    extendDeep: function extendDeep(obj1, obj2) {
      var key, val, type;

      for (key in obj2) {
        val = obj2[key];
        type = _.typeOf(val);
        if (type === 'object' ) {
          obj1[key] = {};
        } else if (type === 'array') {
          obj1[key] = [];
        } else {
          obj1[key] = val;
          continue;
        }
        extendDeep(obj1[key], val);
      }
      return obj1;
    }

  , qfind: function (arr, key, value) {
      var i, j = arr.length;
  
      for (i = 0; i < j; i++) {
        if (arr[i][key] === value)
          return arr[i];
      }
      return {};
    }

  , qkeys: function (obj) {
      var keys = [];

      for (key in obj) {
        keys[keys.length] = key;
      }
      return keys;      
  }
  , qextend: function (obj1, obj2, noKeys, onlyKeys) {
      var hashOk = null, hashReject = null;
      
      if (noKeys) {
        hashReject = _.hashify(noKeys);
      } 
      if (onlyKeys) {
        hashOk = _.hashify(onlyKeys);
      } 

      for (key in obj2) {
        if (hashOk && !(key in hashOk)) { continue; }
        if (hashReject && key in hashReject) { continue; }        
        obj1[key] = obj2[key];
      }
      return obj1;
    }

    // shallow
  , extendOnly: function (obj1, obj2, keys) {
      return _.extend(obj1, _.pick(obj2, keys));
    },

    // shallow
    extendExcept: function (obj1, obj2, noKeys, deep) {
      var keys = _.difference(_.keys(obj2), noKeys);

      _.each(keys, function (key, index) {
        obj1[key] = (deep) ? _.cloneDeep(obj2[key]) : obj2[key];
      });
      return obj1;
    },

    /**
     * Transform getter into getter function with closure:
     * Possible values for getter:
     *
     * - 'key': a simple key obj[key]
     * - ['key1', 'key2']: key chain for accessing obj['key1']['key2']
     * - { 'dojox.json.query': '$.foo' } using dojox json query
     * - function () {}
     *
     */
    getterx: function (getter) {
      var type = _.typeOf(getter)
        , f = function (obj) {
            return obj;
          };

      if (type === 'string' || type === 'number') {
        f = function (obj) {
          return (obj[getter]) ? obj[getter] : null;
        };
      } else if (type === 'array') {
        f = function (obj) {
          return _.traverse(obj, getter);
        };
      } else if (type === 'function') {
        f = function (obj) {
          return getter(obj);
        };
      } else if (type === 'object') {
        if ('dojox.json.query' in getter) {
          f = function (obj) {
            return dojox.json.query(getter['dojox.json.query'], obj);
          };
        }
      }
      return f;
    },

    setterx: function (setter) {
      var type = _.typeOf(setter)
        , f = function (obj, value) {
            obj[setter] = value;
            return obj;
          };

      if (type === 'string'  || type === 'number') {
        f = function (obj, value) {          
          obj[setter] = value;
          return obj;
        };
      } else if (type === 'array') {
        f = function (obj, value) {
          _.update(obj, setter, value, true);
          return obj;
        };
      } else if (type === 'function') {
        f = function (obj, value, objSrc) {
          return setter(obj, value, objSrc);
        };
      }
      return f;
    },

    /**
     * Uninspiring if-else, but having closure is faster than injection
     */
    valuerx: function (value, exact) {
      var type = _.typeOf(value)
        , f = function (val) {
            // default is exact match
            return _.isEqual(value, val);
          };

      if (type === 'string' || type === 'number') {
        f = function (val) {
          return (val === value);
        };
      } else if (type === 'array') {
        f = function (val) {
          return _.isEqual(value, val);
        };
        if (!exact) { // partial match
          f = function (val) {
            if (_.typeOf(val) === 'array') {
              return _.intersects(value, val);
            } else {
              return (_.indexOf(value, val) != -1);
            }
          };
        }
      } else if (type === 'function') {
        f = function (val) {
          return value(val);
        };
      } else if (type === 'regexp') {
        f = function (val) {
          var v = (typeof val === 'string') ? val : val.toString();
          try {
            return v.match(value);
          } catch(err) {
            return false;
          }
        };
      } else if (type === 'object') {
        if (!exact) {
          f = function (val) {
            return _.isIntersect(value, val);
          };
        }
      }
      return f;
    }

  , transfunction: function (qualifiers, kinds) {
      var fs = [], q, f, k, fx, k2, l, exact;

      for (var i = 0, j = qualifiers.length; i < j; i++) {
        // applied in sequence
        q = qualifiers[i];
        l = kinds.length;
        f = {};
        while (l--) {
          k = kinds[l];
          fx = _[k+'x'];
          // e.g. if setter is not specified use getter
          k2 = (k in q) ? k : 'getter';
          exact = ('exact' in q) ? q.exact : 1;
          f[k] = fx(q[k2], exact);
        }
        fs[fs.length] = f;
      }
      return fs; // array of processed matcher functions
    }

  , matcherx: function (matchers) {
      return _.transfunction (matchers, ['getter', 'valuer']);
    }

  , extractorx: function (extractors) {
      return _.transfunction (extractors, ['getter']);
    }

  , translatorx: function (translators) {
      return _.transfunction (translators, ['getter', 'setter']);
    }

  , match1: function (obj, matcherfs, all) {
      var matcherf, i, j, matchCount = 0;

      for (i = 0, j = matcherfs.length; i < j; i++) {
        matcherf = matcherfs[i];
        if (matcherf.valuer(matcherf.getter(obj))){
          matchCount++;
          if (!all) { // either
            return true;
          }
        } else {
          if (all) { // all
            return false;
          }
        }
      }
      if (all) return (matchCount === j);
      else return (matchCount > 0);
    }

    /**
     * Return an array of values based on extractor functions
     *
     * @param {Object} object An object
     * @param {Object} extractorfs Extractor functions
     */
  , extract1: function (obj, extractorfs) { 
      var results = []
        , extractorf, i, j;

      for (i = 0, j = extractorfs.length; i < j; i++) {
        extractorf = extractorfs[i];
        results[results.length] = extractorf.getter(obj);
      }
      return results;
    }

    /**
     * Return a new object from an object translated based on translator functions
     *
     * @param {Object} object1 Source object
     * @param {Object} object2 Destination object
     * @param {Object} translatorfs Translator functions
     */
  , translate1: function (obj1, obj2, translatorfs) { 
      var translatorf, i, j;

      if (!obj2) obj2 = {};
      for (i = 0, j = translatorfs.length; i < j; i++) {
        translatorf = translatorfs[i];
        try {
          translatorf.setter(obj2, translatorf.getter(obj1), obj1);
        } catch (err) {
          console.log('TranslateError', err);
          return obj2;
        }
      }
      return obj2;
    }

  , cull: function (obj, getter) {
      return _.getterx(getter)(obj);
    }

  , match: function (obj, matchers, all) {
      return _.match1(obj, _.matcherx(matchers), all);
    }

  , extract: function (obj, extractors) {
      return _.extract1(obj, _.extractorx(extractors));
    }

  , translate: function (obj, translators) {
      return _.translate1(obj, {}, _.translatorx(translators));
    }

  , pluck3: function (rows, getter) {
      var results = _.blankOf(rows)
        , f = _.getterx(getter);
      
      _.each(rows, function (row, index) {
        results[index] = f(row);
      });
      return results;
    }

    /**
     * Return an array of values based on getter
     *
     * @param {Object} rows Array of objects
     * @param {Object} extractors Accessors
     */
  , extract3: function (rows, extractors) {
      var results = _.blankOf(rows)
        , extractorfs = _.extractorx(extractors);

      _.each(rows, function (row, index) {
        results[index] = _.extract1(row, extractorfs);
      });
      return results;
    }

  , grab3: function (rows, getters) {
      // shallow flatten
      var getterArgs = _.flatten(slice.call(arguments, 1), true)
        , extractors = [];
      
      _.each(getterArgs, function (getter) {
        extractors[extractors.length] = { 'getter': getter };
      });
      return _.extract3(rows, extractors);
    }

  , pick3: function (rows, keys) {
      var results = _.blankOf(rows)
        , keyArgs = _.flatten(slice.call(arguments, 1));
      _.each(rows, function (row, index) {
        results[index] = _.pick(row, keyArgs);
      });
      return results;
    }

    /**
     * Perform complex matching
     *
     * @param {Object} obj Object to be match
     * @param {Object} cmatcher Complex matcher
     * @param {Boolean} exact true for exact match otherwise use partial match
     *
     * Complex matcher:
     *
     * [ {"getter": "age", "valuer": 24},
     *   {"getter": ["name", "last"], "valuer": ["doe", "lee"] },
     *   {"getter": "prop", "valuer": {object} },
     *   {"getter": { 'dojox.json.query': '$.email[0]' } , "valuer": /.+@gmail.com/},
     *   {"getter": { 'dojox.json.query': '$.x.y' } , "valuer": function (value) {} },
     * ]
     */
  , match3: function (rows, matchersOrObject, exact) {
      return (_.isArray(matchersOrObject)) ?
        matchMatchers(rows, matchersOrObject, exact) :
        matchObject(rows, matchersOrObject, exact);
    }
    /**
     * Return an array of row based on matcher's object
     * The row is not cloned.
     *
     * @param {Object} rows Collection of objects
     * @param {Array} matcher Complex matcher
     * @param {Boolean} exact 1 for all
     *
     */
  , matchMatchers: function (rows, matchers, exact) {
      var isArray = _.isArray(rows)
        , results = _.blankOf(rows)
        , matcherfs = _.matcherx(matchers, exact);

      _.each(rows, function (row, index) {      
        if (_.match1(row, matcherfs, exact)) {
          results[(isArray) ? results.length : index] = row;
        }
      });
      return results;
    }

    /**
     * Return an array of values based on matcher's object
     * Shallow, but the matcher could be a nested object
     *
     * @param {Object} rows Array of objects
     * @param {Object} obj an object (key-value pairs) {"name": "john", "age": 27}
     * @param {Boolean} exact 1 for using isEqual (exact match) otherwise
     *   use isIntersect (partial match)
     *
     */
  , matchObject: function (rows, obj, exact) {
      var isArray = _.isArray(rows)
        , results = _.blankOf(rows);

      _.each(rows, function (row, index) {
        if ( (exact && _.isEqual(row, obj)) ||
              (!exact && _.isIntersect(row, obj)) ) {
          results[(isArray) ? results.length : index] = row;
        } 
      });
      return results;
    }

    /**
     * Example of translators:
     *
     * [ {"getter": "age" },
     *   {"getter": ["name", "last"], "setter": "lastname" },
     *   {"getter": { 'dojox.json.query': '$.email[0]' } , "setter": ["email", "first"] },
     *   {"getter": { 'dojox.json.query': '$.x.y' } , "setter": function (object, value) {} },
     * ]
     *
     * @param {Object} rows Collection
     * @param {Object} translators Translators
     */
  , translate3: function (rows, translators) {
      var results = _.blankOf(rows)
        , translatefs = _.translatorx(translators);
      _.each(rows, function (row, index) {
        results[index] = _.translate1(row, {}, translatefs);
      });
      return results;
    }

  , mapKey3: function (rows, keys, newKeys, filter, deep) {
      var results = _.blankOf(rows);

      _.each(rows, function (row, index) {
        var newRow = {};
        if (!filter) {
          _.extendExcept(newRow, row, keys, deep);
        } 
        _.each(keys, function (key, index) {
          if (key in row) newRow[(newKeys) ? newKeys[index] : key] = row[key];
        });
        results[index] = newRow;
      });
      return results;
    }

  , appendIf: function (rows, results, keyDict, keyf, valuef) {
      _.each(rows, function (row) { // each rows
        var key = keyf(row);
        if (key in keyDict) return;
        keyDict[key] = 1;        
        results[results.length] = valuef(row, key);
      });
    }

  , clonef: function (depth) {
      var f = function (obj) { return obj; };

      switch(depth) {
        case 0:
          return f;
        case 1:
          return _.clone;
        case 2:
          return _.cloneDeep;
      }
      return f;
    }

    /**
     * Union of two collections based on the uniqueness of getter's value
     * The data from rows1 win over rows2
     * Assume each of rows1 and rows2 hold unique values based on getter
     *
     * @param {Object} rows1 Collection 1
     * @param {Object} rows2 Collection 2
     * @param {Object} getter getter of an object
     *
     * @return {Array} result
     *
     * Example:
     *
     * rows1 = [ {"name": {"first": "john", "last": "doe"}, "age": 24}
     *           {"name": {"first": "liza", "last": "lee"}, "age": 27} ]
     * rows2 = [ {"name": {"first": "tony", "last": "doe"}, "age": 48}
     *           {"name": {"first": "tina", "last": "six"}, "age": 50} ]
     *
     * union3(rows1, rows2, ['name', 'last']) returns the first 3-rows
     * union3(rows1, rows2, 'name') returns all rows
     */
  , union3: function (rowses, getter, depth) {
      var clonef = _.clonef(depth) 
        , getterf = _.getterx(getter)
        , results = []
        , keyDict = {};

      _.each(rowses, function (rows) { // each rows
        _.appendIf(rows, results, keyDict, getterf, clonef);
      });
      return results;
    }

    /*
      option:
      - number -> depth
      - 'key' -> use the key value
      - array -> translators      
    */
  , unique3: function (rows, getter, option) {
      var getterf = _.getterx(getter), valuef, translatefs
        , keyDict = {}
        , results = []
        , type = _.typeOf(option)
        , clonef, setterf;

      if (type === 'number') { // option = 0, 1, 2
        clonef = _.clonef(option);
        valuef = function (row) { return clonef(row); };
      } else if (option === 'key') {
        setterf = _.setterx(getter);        
        valuef = function (row, key) { return setterf({}, key); }; 
      } else if (type === 'array') {
        translatefs = _.translatorx(option);
        valuef = function (row) { return _.translate1(row, {}, translatefs); };
      } else {
        valuef = function (row, key) { return key; }; 
      }      
      _.appendIf(rows, results, keyDict, getterf, valuef);
      return results;
    }

    /**
     * Splits rows into groups of rows,
     * grouped by the value of getter
     *
     * @param {Object} rows Collection
     * @param {Object} getter getter of an object
     * 
     */
  , groupBy3: function (rows, getter) {
      var f = _.getterx(getter);
      return _.groupBy(rows, function (row){ return f(row); });
    }

    /**
     * Map for rows based on a getter
     *
     * @param {Object} rows Collection 
     * @param {Object} getter
     * @param {Function} iterator
     */
  , map3: function (rows, getter, iterator) {
      var f = _.getterx(getter)
        , results = _.blankOf(rows);

      iterator = iterator || function (val) { return val; };

      _.each(rows, function (row, index) {
        var val = f(row);
        results[index] = iterator(val, index, row);
      });
      return results;
    }

    /**
     * Generate a tally for rows based on a getter
     *
     * @param {Object} rows Collection
     * @param {Object} getter Getter
     */
  , tally3: function (rows, getter) {
      var f = _.getterx(getter)
        , tally = {};

      _.each(rows, function (row) {
        var val = f(row);
        if (val in tally) {
          tally[val]++;
        } else {
          tally[val] = 1;
        }
      });
      return tally;
    }

  , hashify3: function (rows, getter, defaultVal) {
      var f = _.getterx(getter)
        , results = {};

      _.each(rows, function (row, index) {
        var val = f(row);
        results[val] = defaultVal || row;
      });
      return results;
    }


    /**
     * Deepen shallow iterator-based functions
     * (applicable to underscore's min, max, sortBy, groupBy)
     *
     * @param {Function} fn underscore's function
     * @return {Function} A new function that supports getter
     *
     * Example:
     * _.groupBy3 == _.deepen(_.groupBy)
     *
     */
  , tow: function (fn) {
      return function (rows, getter) {
        var f = _.getterx(getter);
        return fn(rows, function (row) { return f(row); });
      };
    }

  , towUnderscore: function (fs) {
      fs = fs || ['max', 'min', 'sortBy'];
      
      _.each(fs, function (fname) {
        _[fname+'3'] = _.tow(_[fname]);
      });
    }
  }); // end mixins

})();
// end enclosure
