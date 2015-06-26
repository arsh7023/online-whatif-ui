/**
 * @class Aura.util.ResourceDownload
 * A singleton class for invoking download dialog (via form's post/get)
 *
 * Example:
 *   var params = {
 *    "width":1000, "height":700,
 *    "x":[1,2,3], "y":[6,7,5],
 *    "xlabel":["one","two","three"], "ylabel":["22","88","55"],
 *    "xinfo":"x_axis","yinfo":"y_axis",
 *    "cinfo":"Barcharts",
 *    "rcolor":[49,0,200],"gcolor":[130,128,200],"bcolor":[189,100,100]
 *   }
 *
 *  Aura.util.ResourceDownload.download({
 *    method: 'post'
 *  , params: {
 *    , url: 'http://115.146.93.97/Visualisation/GetBarCharts'
 *    , data: JSON.stringify(params)
 *    , contentType: 'application/json'
 *    , fileName: 'x.png'
 *    }
 *  , url: '../downloader' // downloader proxy service
 *  });
 *
 * Dependencies: ExtJS and undertow.js
 *
 */

Ext.define('Aura.util.ResourceDownload', {
  singleton: true

, iframeCullDelay: 1000 * 60 * 10

, setIframeCullDelay: function (delay) {
    this.iframeCullDelay = delay;
  }

, removeNode: function(node) {
    node.onload = null;
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

, paramsToFormData: function (params) {
    var formData = [];

    if (!params) {
      return formData;
    }

    _.each(params, function(value, key) {
      formData.push({
        tag: 'input'
      , type: 'hidden'
      , name: Ext.htmlEncode(key)
      , value: Ext.htmlEncode(value)
      });
    });

    return formData;
  }

, onLoad: function() {
    // Triggered on failure, custom error handling
    // 'this' points to iframe object
    var response = this.contentDocument.body.innerHTML;
  }

, download: function(config) {
    var me = this
      , removeNode = me.removeNode
      , frameId = Math.random().toString()
      , formData = me.paramsToFormData(config.params);

    // dummy iframe
    var iframe = Ext.core.DomHelper.append(document.body, {
      id: frameId
    , name: frameId
    , style: 'display:none'
    , tag: 'iframe'
    , onload: config.onload || me.onLoad
    });

    // dummy form
    var form = Ext.DomHelper.append(document.body, {
      action: config.url
    , cn: formData
    , method: config.method || 'post'
    , tag: 'form'
    , target: frameId
    });

    form.submit();

    // remove form immediately
    removeNode(form);
    // remove the iframe after 10 minutes
    Ext.defer(removeNode, me.iframeCullDelay, null, [iframe]);
  }

});
