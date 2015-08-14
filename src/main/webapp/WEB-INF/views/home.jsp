<!DOCTYPE html>
<%@page language="java" %>
<%@page import="java.security.MessageDigest" %>
<%@page import="java.security.Principal" %>
<%@page import="java.net.URLEncoder" %>
<%@page import="au.org.aurin.wifui.JspStub" %>
<%@page import="au.org.aurin.wifui.WifUiConfig" %>
<%@page import="org.springframework.beans.factory.annotation.Autowired" %>
<%@page import="org.springframework.web.context.WebApplicationContext" %> 
<%@page import="org.springframework.web.context.support.WebApplicationContextUtils" %>
<%@page import="org.slf4j.Logger" %>
<%@page import="org.slf4j.LoggerFactory" %>
<%@page import="java.util.Properties" %>
<%@page import="java.io.FileInputStream" %>

<%!
  final Logger logger = LoggerFactory.getLogger(JspStub.class);
%>
<%

     String userId = (String)request.getSession().getAttribute("userData");
    

    /* if (userId != null) {
      userId = URLEncoder.encode(userId, "UTF-8");
    }  */
  
  //userId = "aurin";
  //userId example= "Alireza+Shamakhy"Phil+Delaney;
 // userId = "Alireza+Shamakhy";
  System.out.println("final userId: " + userId);
  
  %>
  
  <%
  if (userId == null || userId.isEmpty()) {
    
     //response.sendRedirect(request.getContextPath() + "/login");
  }

  
  WebApplicationContext ctx = WebApplicationContextUtils.getRequiredWebApplicationContext(getServletContext());
  WifUiConfig wifUiConfig = (WifUiConfig)ctx.getBean("wifUiConfig");
  String appBaseUrl = wifUiConfig.getAppBaseUrl();
  String endpointUrl = wifUiConfig.getEndpointUrl();
  String mservicesUrl = wifUiConfig.getMservicesUrl();
%>
<html>
<head>
<title>Online WhatIf</title>
<script type="text/javascript">
	var wifUiConfig = {
		'appBase': '<%= appBaseUrl %>',
		'mservices': '<%= mservicesUrl %>',
		'endpoint': '<%= endpointUrl %>'
	};
</script>
<link rel="shortcut icon" href="resources/images/AURIN_Workbench.jpg">
<link href='//fonts.googleapis.com/css?family=Droid+Sans:400,700' rel='stylesheet' type='text/css'>

<link rel="stylesheet" type="text/css" href="resources/css/aura-all.min.css" />
<link rel="stylesheet" type="text/css" href="resources/css/aura-extra.css" />
<link rel="stylesheet" type="text/css" href="resources/css/wif-extra.css" />
<link rel="stylesheet" type="text/css" href="resources/css/desktop.css" />

<script src="js/tile.stamen.js"></script>

<link rel="stylesheet" type="text/css" href="js/aura/geosilk.css" /> <!-- https://apps.aurin.org.au/assets/js/ole/theme/geosilk/geosilk.css -->
<script src="js/aura/geostats-jenks.js"></script>  <!-- https://apps.aurin.org.au/assets/js/geostats/geostats-jenks.js -->
<script src="js/aura/sprintf-0.6.js"></script> <!-- https://apps.aurin.org.au/assets/js/sprintf/sprintf-0.6.js -->
<script src="js/aura/dojo.js" data-dojo-config="async: true, gfxRenderer: 'svg,silverlight,vml,canvas'"></script> <!-- https://ajax.googleapis.com/ajax/libs/dojo/1.7.2/dojo/dojo.js -->

<script src="js/aura/async.min.js"></script> <!--https://apps.aurin.org.au/assets/js/async/async.min.js-->
<script src="js/aura/processing-1.3.6.min.js"></script> <!-- https://apps.aurin.org.au/assets/js/processing/1.3.6/processing-1.3.6.min.js -->
<!-- <script src="js/aura/cloudmade.js"></script> --><!-- https://apps.aurin.org.au/assets/js/cloudmade/cloudmade.js -->
<!-- <script src="js/aura/loader.js"></script>  --><!-- https://apps.aurin.org.au/assets/js/ole/loader.js -->
<script src="js/aura/janky.post.js"></script>  <!-- https://apps.aurin.org.au/assets/js/janky.post/janky.post.js -->


<script src="js/aura/d3.v3.min.js"></script> <!-- https://apps.aurin.org.au/assets/js/d3/v3/d3.v3.min.js -->
<script src="js/aura/sugar-1.2.5.min.js"></script> <!-- https://apps.aurin.org.au/assets/js/sugar/1.2.5/sugar-1.2.5.min.js -->
<!-- <script src="js/aura/ext-all-dev.js"></script> -->
<script src="js/ext-all.js"></script>  


<script src="js/OpenLayers-2.12/OpenLayers.js"></script> <!-- https://apps.aurin.org.au/assets/js/openlayers/OpenLayers-2.12/OpenLayers.js -->
<script src="js/aura/ResourceDownload.js"></script> <!-- https://apps.aurin.org.au/assets/js/aura/util/ResourceDownload.js -->
<script src="js/aura/underscore-min.js"></script> <!--  https://apps.aurin.org.au/assets/js/underscore/1.3.3/underscore-min.js-->
<script src="js/tile.stamen.js"></script> <!--  https://stamen-maps.a.ssl.fastly.net/js/tile.stamen.js-->
<script src="js/proj4js-compressed.js"></script><!-- https://apps.aurin.org.au/assets/js/proj4js/1.1.0/proj4js-compressed.js -->

<!-- <script src="js/aura/bootstrap.js"></script> --> <!-- https://apps.aurin.org.au/assets/js/extjs-4.1.0/bootstrap.js -->

<script src="https://maps.google.com/maps/api/js?sensor=false"></script>


<script src="js/wif/Wif.js"></script>
<script src="js/aura/Aura.js"></script>
<script src="js/aura/Util.js"></script>
<script src="js/aura/local-system/visual-catalog.js"></script>
<script src="js/aura/local-system/process-catalog.js"></script>
<script src="js/aura/local-system/workflow-catalog.js"></script>
<script src="js/common/OpenLayers/patch.js"></script>
<script src="js/common/OpenLayers/Aura/Control/Legend.js"></script>
<script src="js/common/undertow/undertow.js"></script>
<script src="js/wif/color/ColorPicker.js"></script>
<script src="js/wif/color/ColorPickerField.js"></script>
<link rel="stylesheet" type="text/css" href="js/wif/color/resources/css/colorpicker.css">





<script type="text/javascript">
Ext.onReady(function (){
  Ext.Loader.setPath('Ext', 'js/extjs-4.1.0-src'); //https://apps.aurin.org.au/assets/js/extjs-4.1.0/src

	var jresp = <%= userId %>;
  
	console.log('NewResponse' + jresp);
	
  
  Aura.launch({
    userId: jresp.email
  , noPlayground: true
  , callback: function () {
      Wif.launch();
    }
  });
});

</script>
</head>
<body>
<a href="https://whatif.aurin.org.au" target="_blank" alt="Online WhatIf"
id="poweredby"><div></div></a>
<iframe id="dummyIframe" src='<%= appBaseUrl %>'/app/blank.html" style="display:none" width="0" height="0"></iframe>
</body>
</html>
