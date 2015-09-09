	/**
 * @Map.js Main map enclosure (based on OpenLayers).
 *
 * @author <a href="mailto:dreamind@gmail.com">Ivo Widjaja</a>
 * @version 0.0.1
 *
 */

Proj4js.defs["EPSG:4326"]   = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
Proj4js.defs["EPSG:4283"]   = "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs";
Proj4js.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
Proj4js.defs["EPSG:102723"] = "+proj=lcc +lat_1=38.73333333333333 +lat_2=40.03333333333333 +lat_0=38 +lon_0=-82.5 +x_0=600000.0000000001 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192";
Proj4js.defs["EPSG:28348"] = "+proj=utm +zone=48 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28349"] = "+proj=utm +zone=49 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28350"] = "+proj=utm +zone=50 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28351"] = "+proj=utm +zone=51 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28352"] = "+proj=utm +zone=52 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28353"] = "+proj=utm +zone=53 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28354"] = "+proj=utm +zone=54 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28355"] = "+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28356"] = "+proj=utm +zone=56 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28357"] = "+proj=utm +zone=57 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:28358"] = "+proj=utm +zone=58 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:3735"] = "+proj=lcc +lat_1=40.03333333333333 +lat_2=38.73333333333333 +lat_0=38 +lon_0=-82.5 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs";
Proj4js.defs["EPSG:3729"] = "+proj=lcc +lat_1=40.03333333333333 +lat_2=38.73333333333333 +lat_0=38 +lon_0=-82.5 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +to_meter=0.3048006096012192 +no_defs";

Ext.define('Wif.analysis.Map', {
  statics: {
    epsg4326: new OpenLayers.Projection("EPSG:4326")
  , epsg4283: new OpenLayers.Projection("EPSG:4283")
  , epsg900913: new OpenLayers.Projection("EPSG:900913")
  , epsg102723: new OpenLayers.Projection("EPSG:102723")
  , epsg28348: new OpenLayers.Projection("EPSG:28348")
  , epsg28349: new OpenLayers.Projection("EPSG:28349")
  , epsg28350: new OpenLayers.Projection("EPSG:28350")
  , epsg28351: new OpenLayers.Projection("EPSG:28351")
  , epsg28352: new OpenLayers.Projection("EPSG:28352")
  , epsg28353: new OpenLayers.Projection("EPSG:28353")
  , epsg28354: new OpenLayers.Projection("EPSG:28354")
  , epsg28355: new OpenLayers.Projection("EPSG:28355")
  , epsg28356: new OpenLayers.Projection("EPSG:28356")
  , epsg28357: new OpenLayers.Projection("EPSG:28357")
  , epsg28358: new OpenLayers.Projection("EPSG:28358")
  , epsg3735:  new OpenLayers.Projection("EPSG:3735")
  , epsg3729:  new OpenLayers.Projection("EPSG:3729")
  }

, olMapId: null
, olMap: null, // OpenLayers' map object

  bounds: null,
  openLayersOptions: null,

  wmsLayer: null,
  wmsLayerName: null,
  serverURL: null,
  projection: null,
  projectionName: null,

  projectId: null,
  scenarioId: null,
  scoreColumn: null,

  setBase: function () {
    var layer = new OpenLayers.Layer.OSM();
    
//codes before    
//    layer.setIsBaseLayer(true);
//    this.map.addLayer(layer);
    
    //newnewnewnwew
    
	    var google_maps = new OpenLayers.Layer.Google(
	        "Google Maps", {
	            numZoomLevels: 20
	            //visibility: false
	        }
	    );
	    var google_satellite = new OpenLayers.Layer.Google(
	        "Google Satellite", {
	            type: google.maps.MapTypeId.SATELLITE,
	            numZoomLevels: 20
	            //visible: false
	        });
	
	    var google_Terrain = new OpenLayers.Layer.Google(
	        "Google Terrain", {
	            type: google.maps.MapTypeId.TERRAIN,
	             numZoomLevels: 20
	            //visibility: false
	        });
	
	    var google_hybrid = new OpenLayers.Layer.Google(
	        "Google Hybrid", {
	            type: google.maps.MapTypeId.HYBRID,
	            numZoomLevels: 20
	            //visibility: false
	        });	

	    var Stamen_terrain = new OpenLayers.Layer.Stamen("toner");
	    var Stamen_watercolor = new OpenLayers.Layer.Stamen("watercolor");
	
	    this.map.addLayers([layer, google_maps, google_satellite, google_Terrain, google_hybrid,Stamen_terrain, Stamen_watercolor ]);
    
    //ewnewewnewnewe
    
    
  },

	setStyles : function(styles) {
		if (styles) {
			this.wmsLayer.mergeNewParams({
				styles : styles
			});
		}
	},

	  setSld : function(lsw, score, callback) {
		var me = this;
		_.log(this, 'setSld1', score);
		console.log("0", this);				
		if (!this.wmsLayer)
			return;
        if (score != undefined)
        {	
        	me.wmsLayer.setVisibility(true);
        	if (lsw == 1)
        		{
							var url = wifUiConfig['appBase'] + 'sld?layerName='
							+ _.encodeURLComponent(this.wmsLayerName) + '&scoreColumn='
							+ _.encodeURLComponent(score.featureFieldName)
							+ '&choroplethRange=' + _.encodeURLComponent(score.choroplethRange);
        		}
        	else if (lsw == 2)
        		{
	        		var url = wifUiConfig['appBase'] + 'sldnew?layerName='
	      			+ _.encodeURLComponent(this.wmsLayerName) + '&scoreColumn='
	      			+ _.encodeURLComponent(score.featureFieldName)
	      			+ '&choroplethRange=' + _.encodeURLComponent(score.choroplethRange);
        		}
        	else if (lsw == 3)
      		{
        		var url = wifUiConfig['appBase'] + 'sld?layerName='
      			+ _.encodeURLComponent(this.wmsLayerName) + '&scoreColumn='
      			+ _.encodeURLComponent(score.featureFieldName)
      			+ '&choroplethRangeMin=' + _.encodeURLComponent(score.choroplethRangeMin)
      			+ '&choroplethRangeMax=' + _.encodeURLComponent(score.choroplethRangeMax);
      		}
	
	        var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.setRequestHeader("X-AURIN-USER-ID", Wif.userId);
			xhr.onreadystatechange = function(evXhr) {
				if (xhr.readyState === 4) {
					if (xhr.status === 200 || xhr.status === 201) {
						var strippedData = xhr.responseText.replace(/[\r\n\t]/g, '');
						me.wmsLayer.mergeNewParams({
							sld_body : strippedData,
							"_cchfck" : Math.random() // cache fuck
						});
						//console.log('SLD', strippedData);
						me.wmsLayer.redraw(true);
						 me.refresh();
						if (callback) { callback(strippedData); }
					}
				}
			};
			xhr.send();
        }
        else
        {
        	_.log(this, 'setSld-888', score);
            this.removeLayer();	
            this.setBase();
        }
	},
	
	

  setSldnew : function(lsw, score,fieldValues, callback) {
		var me = this;
		_.log(this, 'setSldnew fieldValues', fieldValues);
		console.log("0", this);				
		if (!this.wmsLayer)
			return;
        if (score != undefined)
        {	
        	me.wmsLayer.setVisibility(true);
        	if (lsw == 1)
        		{
							var url = wifUiConfig['appBase'] + 'sld?layerName='
							+ _.encodeURLComponent(this.wmsLayerName) + '&scoreColumn='
							+ _.encodeURLComponent(score.featureFieldName)
							+ '&choroplethRange=' + _.encodeURLComponent(score.choroplethRange);
        		}
        	else if (lsw == 2)
        		{
	        		var url = wifUiConfig['appBase'] + 'sldnew?layerName='
	      			+ _.encodeURLComponent(this.wmsLayerName) + '&scoreColumn='
	      			+ _.encodeURLComponent(score.featureFieldName)
	      			+ '&choroplethRange=' + _.encodeURLComponent(score.choroplethRange)
	        		+ '&filedValues=' + _.encodeURLComponent(fieldValues);
        		}
	
	        var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.setRequestHeader("X-AURIN-USER-ID", Wif.userId);
			xhr.onreadystatechange = function(evXhr) {
				if (xhr.readyState === 4) {
					if (xhr.status === 200 || xhr.status === 201) {
						var strippedData = xhr.responseText.replace(/[\r\n\t]/g, '');
						me.wmsLayer.mergeNewParams({
							sld_body : strippedData,
							"_cchfck" : Math.random() // cache fuck
						});
						//console.log('SLD', strippedData);
						me.wmsLayer.redraw(true);
						 me.refresh();
						if (callback) { callback(strippedData); }
					}
				}
			};
			xhr.send();
        }
        else
        {
        	_.log(this, 'setSld-888', score);
            this.removeLayer();	
            this.setBase();
        }
	},

  getExtent: function() {
    return this.map.getExtent();
  },

  removeLayer: function()
  {
	  var num = this.map.getNumLayers();
	   for (var i = num - 1; i>= 1; i--) {
		  this.map.layers[i].setVisibility(false);
	     }
	     
  },
  
  setWms: function (wmsLayerName, serverURL) {
	  
	_.log(this, 'setWms YYY 2', wmsLayerName, this);
	  
    if (!wmsLayerName) return;

    
    this.wmsLayerName = wmsLayerName;
    this.serverURL = serverURL;

    var yx = {}, map = this.map;
    yx[this.projectionName] = false;

    var longText = new Array(205).join("1234567890");
   
    var layer = new OpenLayers.Layer.WMS(
      'what-if-' + this.projectId + '-' + this.scenarioId,
      serverURL + 'wms',
      { layers: [wmsLayerName],
        format: 'image/png',
        styles: null,
        //version: '1.3.0', //add new by ali
        transparent: true,
        tiled: true
        ,tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
        ,maxGetUrlLength: 2048 
        ,makeTheUrlLong: longText
        //,strategies: [ new OpenLayers.Strategy.Fixed()]     
      
      },
      {
        unsupportedBrowsers: [], // let them empty to force POST
        buffer: 0,
        displayOutsideMaxExtent: true,
        //yx : {'EPSG:102723': false} // ohio
        //yx : {'EPSG:28356': false} // hervey bay
        yx: yx
      }
    );
    this.wmsLayer = layer;
    this.map.addLayer(layer);
    
   
    //this.map.layers[laye].setVisibility(true);
  },

  refresh: function () {
    this.wmsLayer.redraw();
  },

  constructor: function (config) {
    Ext.apply(this, config);
    this.projectionName = config.srs;

    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
    OpenLayers.DOTS_PER_INCH = 25.4 / 0.28; // make OL compute scale according to WMS spec

    this.openLayersOptions = {
      sphericalMercator: true,
      projection: Wif.analysis.Map.epsg900913, 
      //displayProjection: Wif.analysis.Map.epsg28350,
      units: "m",
      //maxResolution: 156543.0339,
      //maxExtent: new OpenLayers.Bounds(-20037497.21,-20037497.21,20037497.21,20037497.21),
      //numZoomLevels: 20
    };

    var map = new OpenLayers.Map(this.olMapId, this.openLayersOptions);
    this.map = map;

    //new ali testing
    //map.addControl(new OpenLayers.Control.LayerSwitcher());
    
    map.addControl(new OpenLayers.Control.ScaleLine());
    map.addControl(new OpenLayers.Control.MousePosition());
    this.setBase();

    var bounds = config.bbox;
    var extent = new OpenLayers.Bounds(bounds[0], bounds[1], bounds[2], bounds[3]);
    //commeneted by ali night
    extent.transform(new OpenLayers.Projection(this.projectionName), Wif.analysis.Map.epsg900913);
    map.zoomToExtent(extent);
  }
  
  //////////////
  
  
  /////////////////////////////////////
  /////ali new functions
  
  ,
  
  
  setWmsNew: function (wmsLayerName, serverURL) {
  	_.log(this, 'setWmsNew', wmsLayerName, this);
  	if (!wmsLayerName) return;
  	this.wmsLayerName = wmsLayerName;
  	this.serverURL = serverURL;
  	}
  	,
  
  
  
  //setWmsNew2: function (param,wmsLayerName, serverURL, score, callback) {
   setWmsNew2: function (param,wmsLayerName, serverURL,  scorename,minvalue,maxvalue, colorname,colorcnt,  callback) {
  	
	  
  	_.log(this, 'setWmsNew2', wmsLayerName, this);
  	
  	  
      if (!wmsLayerName) return;

      
      this.wmsLayerName = wmsLayerName;
      this.serverURL = serverURL;
      
      
    	var map = this.map;
 		 
  		var yx = {};
  		
  		yx["EPSG:28350"] = false;

  		yx["EPSG:28355"] = false;
  		
  		yx["EPSG:900913"] = false;
  		
  		var layername  =this.wmsLayerName;
  		
   		layername = layername.toLowerCase();	
 
  		var mciSld ="";
  		
  		var lsw=true;
  		
  	
  	
  		   	var l2 = 'suit_' + this.projectId + '-' + this.scenarioId;
  		   	
  		    //if (score != '')
  		    if (scorename != '')
  		    {
  		    	
  		    	console.log('setWmsNew2', scorename);
  		  		//mciSld = this.setSldSuitability(lsw, score);
  		  		mciSld = this.setSldSuitability(lsw,scorename,minvalue,maxvalue,colorname,colorcnt);
  		  		console.log ("mciSld is:" + mciSld)
  					var layer2 = new OpenLayers.Layer.WMS(l2,
  	  					this.serverURL + 'wms', {
  	  					layers: [ layername ],
  	  					format: 'image/png',
  	  					SLD_BODY: mciSld,   //
  	  					styles: "", //suit static style
  	  					transparent: true, //true //comment if  test tile caching
  	  					tiled: false, //true
  	  					tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
  	  			
  	  				}, {
  	  					unsupportedBrowsers: [], // let them empty to force POST
  	  					buffer: 0,
  	  					displayOutsideMaxExtent: true
  	  					,opacity: 0.5
  	  					,yx: yx
  	  				});
  	  				
//  	  			  this.wmsLayer = layer2;
//  	  		    this.map.addLayer(layer2);
  	  		    
  	///////////////////////////////////
  	  		    var j = 0;
  	          lsw = false;
  	          for (var i = 0; i < map.layers.length; i++) {
  	              //if (map.layers[i].name == 'mciLayer' + me.mainState + me.mainLga) {
  	              if (map.layers[i].name == l2) {
  	                  lsw = true;
  	                  j = i;
  	              }

  	          }
  	          if (param == true) {

  	              if (lsw == false) {
  	                  map.addLayer(layer2);
  	                  this.wmsLayer = layer2;
  	                  

  	              } else {

  	                  map.layers[j].mergeNewParams({
  	                      SLD_BODY: mciSld, styles: ""
  	                  });
  	                  map.layers[j].setVisibility(true);
  	                  map.layers[j].redraw(true);

  	              }
  	          } else
  	          {
  	              if (lsw == false) {
  	                  //new
  	                  map.addLayer(layer2);
  	                  for (var i = 0; i < map.layers.length; i++) {
  	                      if (map.layers[i].name == l2) {
  	                          lsw = true;
  	                          j = i;
  	                      }
  	                  }
  	                  map.layers[j].setVisibility(false);


  	              } else {
  	                  map.layers[j].mergeNewParams({
  	                      SLD_BODY: mciSld
  	                  });
  	                  map.layers[j].setVisibility(false);
  	              }
  	          }
  	  		    
  	  		
	  	  		 if (callback) { callback(mciSld); }
	  		  }
  		    else
  		    {
	  		    	 var j = 0;
	 	          lsw = false;
	 	          for (var i = 0; i < map.layers.length; i++) {
	 	              //if (map.layers[i].name == 'mciLayer' + me.mainState + me.mainLga) {
	 	              if (map.layers[i].name == l2) {
	 	                  lsw = true;
	 	                  j = i;
	 	              }
	
	 	          }
	 	          if (lsw == true)
	 	          {
	 	          	  if (param == false)
	 	          	  	{
	 	          	  	    map.layers[j].setVisibility(false);
	 	          	  	   
	 	          	  	}
	 	          }	
	 	         if (callback) { callback(mciSld); }
  		    }
  	

     }
  
  ,
  
  
  
	getLegendColorPalette : function(filedValues, strfiledColors, boxlabel)
	{
	

			
///////

		    
		   // console.log(" filedValues :" + filedValues.length);
		   // var strfiled = filedValues.split(",");
		    //var layerName = 'what-if-' + this.projectId + '-' + this.scenarioId + '_' + filedValues.featureFieldName;
		
		     console.log('inside getLegendColorPalette ');
		     var layerName  =this.wmsLayerName;
		     
		     var strfiled = strfiledColors.split(",");
		 

		    var str = filedValues.choroplethRange.split(",");
		   
		    
		    //var colors[20];
		    var colors = new Array(20); 
		    //String[] color = new String[str.length];
		    //var color[str.length];
		    var color =  new Array(str.length);
		    colors[0]="#9B8181";
		    colors[1]="#FF0080";
		    colors[2]="#81819B";
		    colors[3]="#8000FF";
		    colors[4]="#819B8E";
		    colors[5]="#0080FF";
		    colors[6]="#00FFFF"; 
		    colors[7]="#00FF80";
		    colors[8]="#00FF00";
		    colors[9]="#80FF00";
		    colors[10]="#FFFF00";
		    colors[11]="#FF8000";
		    colors[12]="#FF0000";
		    colors[13]="#E5B1B1"; 
		    colors[14]="#E5B1CB"; 
		    colors[15]="#CBB1E5"; 
		    

		    for (var k = 0; k < str.length; k++)
		    {
		      color[k] = colors[k];
		    }
		  
				var sldleg = '<?xml version="1.0" encoding="utf-8"?>';
				
				sldleg = sldleg
						+ '<StyledLayerDescriptor version="1.0.0"';
				sldleg = sldleg
						+ ' xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"';
				sldleg = sldleg
						+ ' xmlns="http://www.opengis.net/sld"';
				sldleg = sldleg
						+ ' xmlns:ogc="http://www.opengis.net/ogc"';
				sldleg = sldleg
						+ ' xmlns:xlink="http://www.w3.org/1999/xlink"';
				sldleg = sldleg
						+ ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';

				//sldleg = sldleg +'<StyledLayerDescriptor version="1.0.0">';
				sldleg = sldleg + '<NamedLayer>';
				sldleg = sldleg + '<Name>' + layerName
						+ '</Name>';
				sldleg = sldleg + '<UserStyle>';
				sldleg = sldleg
						+ '<Title>SLD Cook Book: Attribute-based polygon</Title>';
				//sldleg = sldleg +'<IsDefault>1</IsDefault>';
				sldleg = sldleg + '<FeatureTypeStyle>';
		    
		    var j = 0;
		    for (var i = 0; i < str.length; i++)
		    {
		      
		      if (str[i]=='')
		      {	
		        
		        //
		      }		      
		      else
		      { 
		        
				        if (filedValues.choroplethRange.length>0)
				        {
				           
					          for (var m = 0; m < strfiled.length; m++)
					          {
					             //System.out.println(strfiled[m]);
					             var strColor = strfiled[m].split("@");
					             
					             /*  System.out.println(strColor[0]);
					              System.out.println(strColor[1]); */
					              
					              if (strColor[0] == str[i])
					              {
		//			                strout += "<Rule>";
		//			                strout += "<Title>" + str[i] +"</Title>";
		//			                strout +="<Filter>";
		//			                strout +="<PropertyIsEqualTo>";
		//			                strout +="<PropertyName>" + scoreColumn + "</PropertyName>";
		//			                strout +="<Literal>"+ str[i] +"</Literal>";
		//			                strout +="</PropertyIsEqualTo> </Filter><PolygonSymbolizer><Fill><CssParameter name='fill'>" +strColor[1] +"</CssParameter>";
		//			                strout +="<CssParameter name='fill-opacity'>1</CssParameter></Fill></PolygonSymbolizer></Rule>";
		//			                
					                
													sldleg = sldleg + '<Rule>';
													sldleg = sldleg + '<Title>' + str[i] + '</Title>';
													sldleg = sldleg + '<Filter>';
													sldleg = sldleg + '<PropertyIsEqualTo>';
													sldleg = sldleg
															+ '<PropertyName>' + boxlabel + '</PropertyName>';
													sldleg = sldleg + '<Literal>'+ str[i] +'</Literal>';
													sldleg = sldleg + '</PropertyIsEqualTo>';
													
													sldleg = sldleg + '</Filter>';
													sldleg = sldleg + '<PolygonSymbolizer>';
													sldleg = sldleg + '<Fill>';
													sldleg = sldleg
															+ '<CssParameter name="fill">' + strColor[1] + '</CssParameter>';
													sldleg = sldleg
															+ '<CssParameter name="fill-opacity">1</CssParameter>';
													sldleg = sldleg + '</Fill>';
													sldleg = sldleg + '</PolygonSymbolizer>';
													sldleg = sldleg + '</Rule>';
					                
					                
					                
					                
					              }//end if
					          }//for m          
				        }
				        else
				        {
				          
				        	   console.log("empty filedValues");
		//			          strout += "<Rule>";
		//			  	      strout += "<Title>" + str[i] +"</Title>";
		//			  	      strout +="<Filter>";
		//			  	      strout +="<PropertyIsEqualTo>";
		//			  	      strout +="<PropertyName>" + scoreColumn + "</PropertyName>";
		//			  	      strout +="<Literal>"+ str[i] +"</Literal>";
		//			  	      strout +="</PropertyIsEqualTo> </Filter><PolygonSymbolizer><Fill><CssParameter name='fill'>" +color[j] +"</CssParameter>";
		//			  	      strout +="<CssParameter name='fill-opacity'>1</CssParameter></Fill></PolygonSymbolizer></Rule>"; 
					  	      
					  	      sldleg = sldleg + '<Rule>';
										sldleg = sldleg + '<Title>' + str[i] + '</Title>';
										sldleg = sldleg + '<Filter>';
										sldleg = sldleg + '<PropertyIsEqualTo>';
										sldleg = sldleg
												+ '<PropertyName>' + boxlabel + '</PropertyName>';
										sldleg = sldleg + '<Literal>'+ str[i] +'</Literal>';
										sldleg = sldleg + '</PropertyIsEqualTo>';
										
										sldleg = sldleg + '</Filter>';
										sldleg = sldleg + '<PolygonSymbolizer>';
										sldleg = sldleg + '<Fill>';
										sldleg = sldleg
												+ '<CssParameter name="fill">' + color[j] + '</CssParameter>';
										sldleg = sldleg
												+ '<CssParameter name="fill-opacity">1</CssParameter>';
										sldleg = sldleg + '</Fill>';
										sldleg = sldleg + '</PolygonSymbolizer>';
										sldleg = sldleg + '</Rule>';
					  	      

					  	      j = j + 1;  
				        }

		      }//else
										
		    }//end for
				sldleg = sldleg + '</FeatureTypeStyle>';
				sldleg = sldleg + '</UserStyle>';
				sldleg = sldleg + '</NamedLayer>';
				sldleg = sldleg + '</StyledLayerDescriptor>';

		   return sldleg;
	}						
  
 ,
  
  //setSldSuitability : function(lsw, score) {
  setSldSuitability : function(lsw,  scorename,minvalue,maxvalue, colorname, colorcnt) {
  	
	
	 var vopacity = Ext.getCmp('colorpaletteSliderOpacity1').getValue();
  	  
  	 
  	
  	  
	  
	 var layerName = this.wmsLayerName;
   //var scoreColumn = score.featureFieldName;
   var scoreColumn = scorename;
        

//   var choroplethRangeMin  = score.choroplethRangeMin;
//   var choroplethRangeMax  = score.choroplethRangeMax;
   
   var choroplethRangeMin  = Math.round(minvalue);
   var choroplethRangeMax  = Math.round(maxvalue);
  

   var width = Math.round((choroplethRangeMax- choroplethRangeMin) / 5);
   
   var lowLo = -100000 ;     
	 var lowHi =  -99999;  
	 var medlowLo =  -99998;   
	 var medlowHi =  -99997; 
	 var medLo = -99996; 
	 var medHi =  -99995;    
	 var medhighLo =  -99994;
	 var medhighHi =  -99993;
	 var highLo =  choroplethRangeMin;
	 var highHi =  choroplethRangeMax;
   
   if (width < 1)
  	 
  	 {
  	   	 
  	 }
   else
  	{
  	  lowLo =  choroplethRangeMin;         //   13500
  	  lowHi =  (choroplethRangeMin)+width;   // 13500 + 3400 = 16900
  	  medlowLo =  (choroplethRangeMin)+width;    //16900 
  	  medlowHi =  (choroplethRangeMin)+(2*width); //13500+(2*3400)= 20300
  	  medLo = (choroplethRangeMin)+(2*width); //  
  	  medHi =  (choroplethRangeMin)+(3*width);     // 
  	  medhighLo =  (choroplethRangeMin)+(3*width);
  	  medhighHi =  (choroplethRangeMin)+(4*width);
  	  highLo =  (choroplethRangeMin)+(4*width);
  	  highHi =  (choroplethRangeMin)+(5*width)
  	} 
  
 	
//	 var lowLo =  choroplethRangeMin;
//	 var lowHi =  (choroplethRangeMin)+width;
//	 var medlowLo =  1 + (choroplethRangeMin)+width;
//	 var medlowHi =  2 * (choroplethRangeMin)+width;
//	 var medLo =  1 + 2 * (choroplethRangeMin)+width;
//	 var medHi =  3 * (choroplethRangeMin)+width;
//	 var medhighLo =  1 + 3 * (choroplethRangeMin)+width;
//	 var medhighHi =  4 * (choroplethRangeMin)+width;
//	 var highLo =  1 + 4 * (choroplethRangeMin)+width;
//	 var highHi =  5 * (choroplethRangeMin)+width;
   
   //min = 13500  max = 30500    width= 30500 - 13500  / 5 = 3400
   
;
	 
	var title = "";
	var lowB ="";
	var highB = "";
	var color = "";
	//var vopacity = 1;
	 
	var sldp = '<?xml version="1.0" encoding="utf-8"?>';
	sldp = sldp + '<StyledLayerDescriptor version="1.0.0">';
	sldp = sldp + '<NamedLayer>';
	sldp = sldp + '<Name>' + layerName + '</Name>';
	
	sldp = sldp + '<UserStyle>';
	sldp = sldp + '<IsDefault>1</IsDefault>';
	sldp = sldp + '<FeatureTypeStyle>';

	//comment Not Developable and Not Convertible as Claudia said almost 70% of parcles are in those categories.
	
//	title = "Not Developable";
//	lowB ="-101.0";
//	highB = "-3.0";
//	color = "#787475";
//	vopacity = 1;
//	
//  sldp = sldp + '<Rule>';
//  sldp = sldp + '<Title>' + title + '</Title>';
//  sldp = sldp + '<Filter>';
//  sldp = sldp + '<PropertyIsBetween>';
//  sldp = sldp + '<PropertyName>' + scoreColumn + '</PropertyName>';
//  sldp = sldp + '<LowerBoundary>';
//  sldp = sldp + '<Literal>' + lowB + '</Literal>';
//  sldp = sldp + '</LowerBoundary>';
//  sldp = sldp + '<UpperBoundary>';
//  sldp = sldp + '<Literal>' + highB + '</Literal>';
//  sldp = sldp + '</UpperBoundary>';
//  sldp = sldp + '</PropertyIsBetween>';
//  sldp = sldp + '</Filter>';
//  sldp = sldp + '<PolygonSymbolizer>';
//  sldp = sldp + '<Fill>';
//  sldp = sldp + '<CssParameter name="fill">' + color + '</CssParameter>';
//  sldp = sldp + '<CssParameter name="fill-opacity">' + vopacity + '</CssParameter>';
//  sldp = sldp + '</Fill>';
//  sldp = sldp + '</PolygonSymbolizer>';
//  sldp = sldp + '</Rule>';
//
//	title = "Not Convertible";
//	lowB ="-2.0";
//	highB = "-0.5";
//	color = "#CCCCCC";
//	vopacity = 1;
//	
//  sldp = sldp + '<Rule>';
//  sldp = sldp + '<Title>' + title + '</Title>';
//  sldp = sldp + '<Filter>';
//  sldp = sldp + '<PropertyIsBetween>';
//  sldp = sldp + '<PropertyName>' + scoreColumn + '</PropertyName>';
//  sldp = sldp + '<LowerBoundary>';
//  sldp = sldp + '<Literal>' + lowB + '</Literal>';
//  sldp = sldp + '</LowerBoundary>';
//  sldp = sldp + '<UpperBoundary>';
//  sldp = sldp + '<Literal>' + highB + '</Literal>';
//  sldp = sldp + '</UpperBoundary>';
//  sldp = sldp + '</PropertyIsBetween>';
//  sldp = sldp + '</Filter>';
//  sldp = sldp + '<PolygonSymbolizer>';
//  sldp = sldp + '<Fill>';
//  sldp = sldp + '<CssParameter name="fill">' + color + '</CssParameter>';
//  sldp = sldp + '<CssParameter name="fill-opacity">' + vopacity + '</CssParameter>';
//  sldp = sldp + '</Fill>';
//  sldp = sldp + '</PolygonSymbolizer>';
//  sldp = sldp + '</Rule>';  
  
  
	title = "Not Suitable";
	lowB ="0.0";
	highB = "1.0";
	color = "#FFFF66"; //#C3C3C30
	color = colorbrewer[colorname][colorcnt.toString()][0];
	//vopacity = 1;
	
  sldp = sldp + '<Rule>';
  sldp = sldp + '<Title>' + title + '</Title>';
  sldp = sldp + '<Filter>';
  sldp = sldp + '<PropertyIsBetween>';
  sldp = sldp + '<PropertyName>' + scoreColumn + '</PropertyName>';
  sldp = sldp + '<LowerBoundary>';
  sldp = sldp + '<Literal>' + lowB + '</Literal>';
  sldp = sldp + '</LowerBoundary>';
  sldp = sldp + '<UpperBoundary>';
  sldp = sldp + '<Literal>' + highB + '</Literal>';
  sldp = sldp + '</UpperBoundary>';
  sldp = sldp + '</PropertyIsBetween>';
  sldp = sldp + '</Filter>';
  sldp = sldp + '<PolygonSymbolizer>';
  sldp = sldp + '<Fill>';
  sldp = sldp + '<CssParameter name="fill">' + color + '</CssParameter>';
  sldp = sldp + '<CssParameter name="fill-opacity">' + vopacity + '</CssParameter>';
  sldp = sldp + '</Fill>';
  sldp = sldp + '</PolygonSymbolizer>';
  sldp = sldp + '</Rule>';  
  
	title = "Low";
	lowB =lowLo;
	highB = lowHi;
	color = "#CCFFFF"; //#FFFF00
	color = colorbrewer[colorname][colorcnt.toString()][1];
	
	
  sldp = sldp + '<Rule>';
  sldp = sldp + '<Title>' + title + '</Title>';
  sldp = sldp + '<Filter>';
  sldp = sldp + '<PropertyIsBetween>';
  sldp = sldp + '<PropertyName>' + scoreColumn + '</PropertyName>';
  sldp = sldp + '<LowerBoundary>';
  sldp = sldp + '<Literal>' + lowB + '</Literal>';
  sldp = sldp + '</LowerBoundary>';
  sldp = sldp + '<UpperBoundary>';
  sldp = sldp + '<Literal>' + highB + '</Literal>';
  sldp = sldp + '</UpperBoundary>';
  sldp = sldp + '</PropertyIsBetween>';
  sldp = sldp + '</Filter>';
  sldp = sldp + '<PolygonSymbolizer>';
  sldp = sldp + '<Fill>';
  sldp = sldp + '<CssParameter name="fill">' + color + '</CssParameter>';
  sldp = sldp + '<CssParameter name="fill-opacity">' + vopacity + '</CssParameter>';
  sldp = sldp + '</Fill>';
  sldp = sldp + '</PolygonSymbolizer>';
  sldp = sldp + '</Rule>';   
  
	title = "Medium Low";
	lowB =medlowLo;
	highB = medlowHi;
	color = "#FF0000";//#CBDEC1
	color = colorbrewer[colorname][colorcnt.toString()][2];
	
  sldp = sldp + '<Rule>';
  sldp = sldp + '<Title>' + title + '</Title>';
  sldp = sldp + '<Filter>';
  sldp = sldp + '<PropertyIsBetween>';
  sldp = sldp + '<PropertyName>' + scoreColumn + '</PropertyName>';
  sldp = sldp + '<LowerBoundary>';
  sldp = sldp + '<Literal>' + lowB + '</Literal>';
  sldp = sldp + '</LowerBoundary>';
  sldp = sldp + '<UpperBoundary>';
  sldp = sldp + '<Literal>' + highB + '</Literal>';
  sldp = sldp + '</UpperBoundary>';
  sldp = sldp + '</PropertyIsBetween>';
  sldp = sldp + '</Filter>';
  sldp = sldp + '<PolygonSymbolizer>';
  sldp = sldp + '<Fill>';
  sldp = sldp + '<CssParameter name="fill">' + color + '</CssParameter>';
  sldp = sldp + '<CssParameter name="fill-opacity">' + vopacity + '</CssParameter>';
  sldp = sldp + '</Fill>';
  sldp = sldp + '</PolygonSymbolizer>';
  sldp = sldp + '</Rule>';
  
	title = "Medium";
	lowB =medLo;
	highB = medHi;
	color = "#993399";//#66CC00
	color = colorbrewer[colorname][colorcnt.toString()][3];
	
  sldp = sldp + '<Rule>';
  sldp = sldp + '<Title>' + title + '</Title>';
  sldp = sldp + '<Filter>';
  sldp = sldp + '<PropertyIsBetween>';
  sldp = sldp + '<PropertyName>' + scoreColumn + '</PropertyName>';
  sldp = sldp + '<LowerBoundary>';
  sldp = sldp + '<Literal>' + lowB + '</Literal>';
  sldp = sldp + '</LowerBoundary>';
  sldp = sldp + '<UpperBoundary>';
  sldp = sldp + '<Literal>' + highB + '</Literal>';
  sldp = sldp + '</UpperBoundary>';
  sldp = sldp + '</PropertyIsBetween>';
  sldp = sldp + '</Filter>';
  sldp = sldp + '<PolygonSymbolizer>';
  sldp = sldp + '<Fill>';
  sldp = sldp + '<CssParameter name="fill">' + color + '</CssParameter>';
  sldp = sldp + '<CssParameter name="fill-opacity">' + vopacity + '</CssParameter>';
  sldp = sldp + '</Fill>';
  sldp = sldp + '</PolygonSymbolizer>';
  sldp = sldp + '</Rule>';
  
 	title = "Medium High";
	lowB =medhighLo;
	highB = medhighHi;
	color = "#CC6600"; //#33CC00
	color = colorbrewer[colorname][colorcnt.toString()][4];
	
  sldp = sldp + '<Rule>';
  sldp = sldp + '<Title>' + title + '</Title>';
  sldp = sldp + '<Filter>';
  sldp = sldp + '<PropertyIsBetween>';
  sldp = sldp + '<PropertyName>' + scoreColumn + '</PropertyName>';
  sldp = sldp + '<LowerBoundary>';
  sldp = sldp + '<Literal>' + lowB + '</Literal>';
  sldp = sldp + '</LowerBoundary>';
  sldp = sldp + '<UpperBoundary>';
  sldp = sldp + '<Literal>' + highB + '</Literal>';
  sldp = sldp + '</UpperBoundary>';
  sldp = sldp + '</PropertyIsBetween>';
  sldp = sldp + '</Filter>';
  sldp = sldp + '<PolygonSymbolizer>';
  sldp = sldp + '<Fill>';
  sldp = sldp + '<CssParameter name="fill">' + color + '</CssParameter>';
  sldp = sldp + '<CssParameter name="fill-opacity">' + vopacity + '</CssParameter>';
  sldp = sldp + '</Fill>';
  sldp = sldp + '</PolygonSymbolizer>';
  sldp = sldp + '</Rule>';    
  
 	title = "High";
	lowB =highLo;
	highB = highHi;
	color = "#0000FF"; //#009900
	color = colorbrewer[colorname][colorcnt.toString()][5];
	
  sldp = sldp + '<Rule>';
  sldp = sldp + '<Title>' + title + '</Title>';
  sldp = sldp + '<Filter>';
  sldp = sldp + '<PropertyIsBetween>';
  sldp = sldp + '<PropertyName>' + scoreColumn + '</PropertyName>';
  sldp = sldp + '<LowerBoundary>';
  sldp = sldp + '<Literal>' + lowB + '</Literal>';
  sldp = sldp + '</LowerBoundary>';
  sldp = sldp + '<UpperBoundary>';
  sldp = sldp + '<Literal>' + highB + '</Literal>';
  sldp = sldp + '</UpperBoundary>';
  sldp = sldp + '</PropertyIsBetween>';
  sldp = sldp + '</Filter>';
  sldp = sldp + '<PolygonSymbolizer>';
  sldp = sldp + '<Fill>';
  sldp = sldp + '<CssParameter name="fill">' + color + '</CssParameter>';
  sldp = sldp + '<CssParameter name="fill-opacity">' + vopacity + '</CssParameter>';
  sldp = sldp + '</Fill>';
  sldp = sldp + '</PolygonSymbolizer>';
  sldp = sldp + '</Rule>';  
  
  
  
	sldp = sldp + '</FeatureTypeStyle>';
	sldp = sldp + '</UserStyle>';
	sldp = sldp + '</NamedLayer>';
	sldp = sldp + '</StyledLayerDescriptor>';
	
	
	return sldp;
}		
  
 
 ,
 
 setSldSuitabilityTest : function() {
 	
	
  
	 
	var sldp = '<?xml version="1.0" encoding="utf-8"?>';
	sldp = sldp + '<StyledLayerDescriptor version="1.0.0">';
	sldp = sldp + '<NamedLayer>';
	sldp = sldp + '<Name>whatif:wif_0f884e24a375b314f85d078aa7e18398</Name>';
	
	sldp = sldp + '<UserStyle>';
	sldp = sldp + '<IsDefault>1</IsDefault>';
	sldp = sldp + '<FeatureTypeStyle>';
	
	
 sldp = sldp + '<Rule>';
 sldp = sldp + '<Title>test</Title>';
 

 sldp = sldp + '<PolygonSymbolizer>';
 sldp = sldp + '<Fill>';
 sldp = sldp + '<CssParameter name="fill">#fb9a99</CssParameter>';
 sldp = sldp + '<CssParameter name="fill-opacity">1</CssParameter>';
 sldp = sldp + '</Fill>';
 sldp = sldp + '</PolygonSymbolizer>';
 sldp = sldp + '</Rule>';

	
 
 
 
	sldp = sldp + '</FeatureTypeStyle>';
	sldp = sldp + '</UserStyle>';
	sldp = sldp + '</NamedLayer>';
	sldp = sldp + '</StyledLayerDescriptor>';
	
	 
			
	
	return sldp;
}		
 
 
 
  ,
  
	 addLayerMCEColorPlette : function (param, filedValues, colors, boxlabel, callback)
	{
		 
			console.log('inside addLayerMCEColorPlette');
			
		map = this.map;
		 
		
		var yx = {};
		
		yx["EPSG:28350"] = false;

		yx["EPSG:28355"] = false;
		
		yx["EPSG:900913"] = false;

		//layername = 'envision:' +me.mainState + '_' + me.mainLga + '_' + name + '_' + me.project._id;
		//layername = 'what-if-' + this.projectId + '-' + this.scenarioId + '_' + filedValues.featureFieldName;
		//layername = 'what-if-' + this.projectId +  '_' + filedValues.featureFieldName;
		
		var layername  =this.wmsLayerName;
		
		//layername ='wa_canning_mce01'; 
		
		layername = layername.toLowerCase();	
		
		console.log('new wms layer name is :');
		console.log(layername);
			
		var mciSld ="";
		var lswShouldAdd = true;
		
		 var sldp = this.getLegendColorPalette(filedValues, colors,  boxlabel);
	    mciSld = sldp;
      
	    console.log(mciSld);
		
		if (lswShouldAdd == true)
		{	
		
				///////original
				
				//var l2 = 'mciLayer' + me.mainState + me.mainLga;
				//var l2 = 'mciLayer' + this.projectId + '-' + this.scenarioId + '_' + filedValues.featureFieldName;
			

			
		   	var l2 = 'mciLayer' + this.projectId  + '_' + boxlabel;
		   	
		   	
//				////teststestetste
//			  mciSld = this.setSldSuitabilityTest();
//			  layername='whatif:wif_0f884e24a375b314f85d078aa7e18398';
		   	
				var layer2 = new OpenLayers.Layer.WMS(l2,
					this.serverURL + 'wms', {
					layers: [ layername ],
					format: 'image/png',
					SLD_BODY: mciSld,   //comment it and test!
					styles: null,
					transparent: true, //comment if  test tile caching
					tiled: false, //it was true, since we using static tyle for proplayer we make it false;
					tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
					//,srs: 'EPSG:28355'	
					//,units: "degrees" //new ali
					//,tileSize: new OpenLayers.Size(256,256) //new ali 
				}, {
					unsupportedBrowsers: [], // let them empty to force POST
					buffer: 0,
					displayOutsideMaxExtent: true
					,opacity: 0.5
					,
					//yx : {'EPSG:102723': false} // ohio
					//yx : {'EPSG:28356': false} // hervey bay
					yx: yx
				});
				
						
       
				var j = 0;
				lsw = false;
				for ( var i = 0; i < map.layers.length; i++) {
					//if (map.layers[i].name == 'mciLayer' + me.mainState + me.mainLga) {
					if (map.layers[i].name == 'mciLayer' + this.projectId  + '_' + boxlabel) {
						lsw = true;
						j = i;
					}
					
				}
				if (param == true)
				{

					if (lsw == false) {
						 map.addLayer(layer2);
						
					} else {
						
						map.layers[j].mergeNewParams({SLD_BODY :mciSld }); 
						map.layers[j].setVisibility(true);
						map.layers[j].redraw(true);
									
					}
				}
				else
				{
					if (lsw == false) {
						//new
						map.addLayer(layer2);
						for ( var i = 0; i < map.layers.length; i++) {
							if (map.layers[i].name == 'mciLayer' + this.projectId  + '_' + boxlabel) {
								lsw = true;
								j = i;
							}	
						}
						map.layers[j].setVisibility(false);
						
						
					} else {
						map.layers[j].mergeNewParams({SLD_BODY :mciSld }); 
						map.layers[j].setVisibility(false);
					}
				}
				
		}//end if lswShouldAdd
		

		 //return mciSld;	
		 if (callback) { callback(mciSld); }
	}		
  
  ,
  
  
  addLayerMCEColorPlette0 : function (param, filedValues, colors, boxlabel, callback)
	{
		 
			console.log('inside addLayerMCEColorPlette0');
			
				
		var mciSld ="";

		
		 var sldp = this.getLegendColorPalette(filedValues, colors,  boxlabel);
	    mciSld = sldp;


		 //return mciSld;	
		 if (callback) { callback(mciSld); }
	}		
  
  
  
 ,
  OnOffLayerMCEColorPlette : function (param, boxlabel, callback)
	{
		 
			  console.log('inside OnOffLayerMCEColorPlette');
			
		    map = this.map;
		   	var l2 = 'mciLayer' + this.projectId  + '_' + boxlabel;
			
				var j = 0;
				lsw = false;
				for ( var i = 0; i < map.layers.length; i++) {
					if (map.layers[i].name == l2) {
						lsw = true;
						j = i;
					}
					
				}
				if (lsw == true)
				{
					if (param == true)
					{
						map.layers[j].setVisibility(true);
						//map.layers[j].redraw(true);
	
					}
					else
					{
	
							map.layers[j].setVisibility(false);
	
					}
				}

		
		 if (callback) { callback(mciSld); }
	}		
 
 ,
 OnOffLayerProperty : function (param, boxlabel, callback)
	{
		 
			  console.log('inside OnOffLayerProperty');
			
		    map = this.map;
		   
		   	var l2 = 'Proplayar_' + this.projectId;
			
				var j = 0;
				lsw = false;
				for ( var i = 0; i < map.layers.length; i++) {
					if (map.layers[i].name == l2) {
						lsw = true;
						j = i;
					}
					
				}
				if (lsw == true)
				{
					if (param == true)
					{
						map.layers[j].setVisibility(true);
						//map.layers[j].redraw(true);
	
					}
					else
					{
	
							map.layers[j].setVisibility(false);
	
					}
				}

		
		 if (callback) { callback(mciSld); }
	}		
  
 ,
 
 addLayerProperty : function (aluColumns,suitabilityLus, wmsStyleName)
	{
		
		// add layer property works
	 
	  //map.addControl(new OpenLayers.Control.Navigation());
	 
	  console.log('inside addLayerProperty');
		
    map = this.map;
    var layername  =this.wmsLayerName;
		layername = layername.toLowerCase();	
    
   	var lname = layername;
		lname = lname.toLowerCase();	
		var yx = {};
		

		
		yx["EPSG:28350"] = false;
		//envision
		yx["EPSG:28355"] = false;
		
		yx["EPSG:900913"] = false;
		
		 var defaultVectorStyle= new OpenLayers.StyleMap({
      "default": new OpenLayers.Style({
        fillColor: "transparent",
        strokeColor: "black",
        strokeOpacity: 0.8,
        strokeWidth: 1,
        graphicZIndex: 1
      })

    });
		 
		 console.log("aliii");
		 console.log(this.serverURL);
		 console.log(this.projectId);
		
		var l2 = 'Proplayar_' + this.projectId;
//		lname  = lname.substring(7, lname.length - 7);
//		console.log("zzzzzzzzzz"  + lname);
		
//		var stylename1 = lname;
//		
//		stylename1 = stylename1.replace("whatif:","");
		
		var layer22 = new OpenLayers.Layer.WMS(l2,
			this.serverURL + 'wms', { //instead of wms ->  gwc/service/wms http://example.com/geoserver/gwc/service/wms
			//'https://localhost/geoserver/wms', { //change it later before deploy
			layers: [ lname ],
			format: 'image/png',
			//SLD_BODY: sldp,
			styles: wmsStyleName, 
			//styles:null, //can change static style here.
			//styles: defaultVectorStyle,
			Srs: 'EPSG:900913',
			BBOX: map.getExtent().toBBOX(),
		  tileSize: new OpenLayers.Size(256,256),
			transparent: true,
			tiled: true,
			//tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
			//,srs: 'EPSG:28355'
		}, {
			unsupportedBrowsers: [], // let them empty to force POST
			buffer: 0,
			displayOutsideMaxExtent: true
			,opacity: 0.5 //0.1
			,
			//yx : {'EPSG:102723': false} // ohio
			//yx : {'EPSG:28356': false} // hervey bay
			yx: yx
		});
		
		
		 
		 var newstyleMap= new OpenLayers.StyleMap({
      "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
          fillColor: "red",
          strokeColor: "gray",
          graphicName: "square",
          rotation: 45,
          pointRadius: 15
      }, OpenLayers.Feature.Vector.style["default"])),
      "select": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
          graphicName: "square",
          rotation: 45,
          pointRadius: 15
      }, OpenLayers.Feature.Vector.style["select"]))
  });
		 

//vectors = new OpenLayers.Layer.Vector("Vector Layer", {styleMap: defaultVectorStyle});
    
		
		
		  var s2 = 'selectlayar_'  + this.projectId;
     var select = new OpenLayers.Layer.Vector(s2, {
     	 //styleMap:  new OpenLayers.Style(OpenLayers.Feature.Vector.style["select"])
         //styleMap: defaultVectorStyle
         styleMap: newstyleMap
     });
     //var hover = new OpenLayers.Layer.Vector("Hover");
     //map.addLayers([layer22, hover, select]);
    
    
	
   var j = 0;
	  lsw = false;
		for ( var i = 0; i < map.layers.length; i++) {
				if (map.layers[i].name == l2) {
					lsw = true;
					j = i;
				}
			}
		if (lsw == false)
			{
				  map.addLayers([layer22, select]);
				  
				  
				  var lswShift = true;

				  var saveStrategy = [new OpenLayers.Strategy.BBOX()];
          var control = new OpenLayers.Control.GetFeature({
         	   strategies: [new OpenLayers.Strategy.BBOX(), saveStrategy],
             protocol: OpenLayers.Protocol.WFS.fromWMSLayer(layer22),
             box: true,
             //hover: true,
             title : this.projectId,
             multipleKey: "shiftKey",
             toggleKey: "altKey"
         });
         
         

         control.events.register("featureselected", this, function(e) {
             //select.addFeatures([e.feature]);
             //alert(e.feature.fid);
             if (lswShift == true)
            	{ 
                 createPopup([e.feature]);
            	}
             else
            	{
            	 lswShift = true;
            	} 
         });
         control.events.register("featureunselected", this, function(e) {
        	  destroyPopup([e.feature]);
             //select.removeFeatures([e.feature]);
            
         });

         map.addControl(control);
         control.activate();
         
         map.addControl(new OpenLayers.Control.Navigation());
         
         function createPopup(feature) {
        	 
        	 var sent="";
        	 for (var i =0; i <aluColumns.length; i++)
        		 {
        		    sent = sent + aluColumns[i].boxLabel + ":" + feature[0].data[aluColumns[i].boxLabel] + ","
        		 }
        	 //'<div class="markerContent">'+feature[0].data.ALU_2011+'</div>',
        	 
        	 for (var i = 0; i<suitabilityLus.length; i++)
        		 {
        		     sent = sent + suitabilityLus[i].featureFieldName + ":" + feature[0].data[suitabilityLus[i].featureFieldName] + ","
        		 }
        	 
        	 
        	 
           feature.popup = new OpenLayers.Popup.FramedCloud("pop",
               feature[0].geometry.getBounds().getCenterLonLat(),
               null,
               '<div style="text-align: left; width:250px;height:250px;">'+sent+'</div>', //<div class="markerContent">
               null,
               true,
               function() {
          	           lswShift = false;
          	           control.unselectAll(); 
          	           this.destroy(); 
          	           }
           );
           //feature.popup.closeOnMove = true;
           map.addPopup(feature.popup);
         }

         function destroyPopup(feature) {
//           feature[0].popup.destroy();
//           feature[0].popup = null;
         }
         


			}
	}
 
// ,
//  createPopup  : function (feature) {
//   feature.popup = new OpenLayers.Popup.FramedCloud("pop",
//       feature[0].geometry.getBounds().getCenterLonLat(),
//       null,
//       '<div class="markerContent">'+feature[0].data.ALU_2011+'</div>',
//       null,
//       true,
//       function() {this.destroy(); }//this.destroy();  }//this.destroyPopup([e.feature]);}//controls['selector'].unselectAll(); 
//   );
//   //feature.popup.closeOnMove = true;
//   map.addPopup(feature.popup);
// }
//,
//  destroyPopup :   function(feature) {
//  	
//  	//select.removeFeatures([e.feature]);
//   //feature[0].popup.destroy();
//   //feature.popup = null;
// }
 
 
  
  /////END ali new functions
  
  

});