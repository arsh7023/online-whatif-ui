/**
 *
 * Dependencies:
 * <script type="text/javascript" src="${urlEndpoint}/js/janky.post/janky.post.js"></script>
 */

Ext.define('Aura.data.Consumer', {
  requires: ["Aura.Cfg"]
, singleton: true

  /**
   * xdomain = "cors" is default value for talking to proxy in different domain
   * xdomain = "janky" will be used if xdomain is not enabled
   */
  /** Usage:

      var serviceParams = {
        "xdomain": "cors"
      , "url": "http://115.146.90.140:8080/aurin-datasource-client/getDatasetAttributes"
      , "method": "post"
      , "params": {
          "dataSourceURI": "http://aurin-1.rc.melbourne.nectar.org.au:4567/datasources/Landgate/LandgateWfsABS"
        , "name": "slip:ABS-073"
        }
      , "headers": {
          "X-AURIN-USER-ID": "Guest"
        }
      };
      function myHandler(result) {
        console.log(result, typeof result);
      }
      getProxiedService(serviceParams, myHandler, 0)
  */

, getBridgedService: function (serviceParams, handler, noXhr, raw) {
    if (Aura.useDispatcher) { // use same host dispatcher
      return Aura.data.Consumer.dispatcherService(serviceParams, handler, noXhr, raw);
    } else {
      return Aura.data.Consumer.xdomainService(serviceParams, handler, noXhr, raw);
    }
    
  }

, dispatcherService: function (serviceParams, handler, noXhr, raw) {
    // dispatcher is in the same domain with the HTML container
    var strParams = JSON.stringify(serviceParams);

    if (XMLHttpRequest) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', Aura.postDispatcher, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function (evXhr) {
        if (xhr.readyState === 4) {
        	if (xhr.status === 204) {
        		handler((raw) ? '' : {}, 204);
        		return;
        	}
        	 else if ( xhr.status === 200 || xhr.status === 201) {
            if (raw) {
              handler(xhr.responseText, xhr.status);
            } else {
              try {
                var result = JSON.parse(xhr.responseText);
                xhr.handled = true;
                handler(result, 200);
              } catch (err) {
                if (xhr.handled) return;
                //result = xhr.responseText;
                handler({}, 444); // json parse error
              }
            }
          } else {
            //handler( null, xhr.status);
          	
          	/////ali
            //alert(xhr.status);
          	if (xhr.status == '403')
          		{
          	 var ctx1 = location.pathname;
             ctx = ctx1.replace("login","");
             ctx =  ctx+ "logout/";
             window.location.replace(ctx);
          	}
          	
          }
        }
      };
      xhr.send(strParams);
      
      return xhr;
    } else {
      _.log(this, 'use XMLHttpRequest-enabled browser');
      throw new Error("XMLHttpRequest not supported on this client");
    }
  } // end of dispatcherService

, xdomainService: function (serviceParams, handler, noXhr, raw) {
    // noXhr = true: force to use xdomain POST
    var strParams = JSON.stringify(serviceParams)
      , xDomainEnabled = false, xhr, result;

    if (!noXhr && XMLHttpRequest) {
      xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
        // CORS is supported in XMLHttpRequest
        xhr.open('POST', Aura.Cfg.endpoints.xdomainBridge, true);
        //Send the proper header information along with the xhr
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function (evXhr) {
          if (xhr.status === 204) { // service with no response
            handler((raw) ? '' : {}, 204);
            return;
          }
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
              if (raw) {
                handler(xhr.responseText, xhr.status);
              } else {
                try {
                  result = JSON.parse(xhr.responseText);
                  xhr.handled = true;
                  handler(result, 200);
                } catch (err) {
                  if (xhr.handled) return;
                  //result = xhr.responseText;
                  handler({}, 444); // json parse error
                }
              }
            } else {
              //handler( null, xhr.status);
            }
          }
        };
        xhr.send(strParams);
        xDomainEnabled = true;
      } else if (window.XDomainRequest) {
        // IE8
        var xdr = new window.XDomainRequest();
        xdr.open("POST", Aura.Cfg.endpoints.xdomainBridge);
        xdr.onload = function () {
          if (raw) {
            handler(xdr.responseText, 200);
          } else {
            try {
              result = JSON.parse(xdr.responseText);
              handler(result, 200);
            } catch (err) {
              //result = xhr.responseText;
              handler({}, 444); // json parse error
            }
          }
        };
        xdr.send(strParams);
        xDomainEnabled = true;
      }
    }
    if (!xDomainEnabled) {
      // Browser's XHR does not support CORS
      // Handled accordingly using janky

      // serviceParams.xdomain = 'janky';
      janky({
        url: Aura.Cfg.endpoints.xdomainBridge
      , data: serviceParams
      , method: "post"
      , success: function (response) {
          // need to parse janky output
          handler(JSON.parse(response), 200);
        }
      , error: function () {
          handler({}, 666);
        }
      });
    }
    return xhr;
  } // end of xdomainService

});
