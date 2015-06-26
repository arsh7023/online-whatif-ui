<%--
/**
* Copyright (c) 2000-2011 Liferay, Inc. All rights reserved.
*
* This library is free software; you can redistribute it and/or modify it under
* the terms of the GNU Lesser General Public License as published by the Free
* Software Foundation; either version 2.1 of the License, or (at your option)
* any later version.
*
* This library is distributed in the hope that it will be useful, but WITHOUT
* ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
* FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
* details.
*/



--%>




<%--@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" --%>

<!-- portlet:defineObjects /-->


<script type="text/javascript" src="http://localhost:8080/html/js/extjs/extjs-4.1.0/ext-all-debug.js"></script>
<link type="text/css" href="http://localhost:8080/html/js/extjs/extjs-4.1.0/resources/css/ext-all.css" />
<script type="text/javascript" src="http://maps.google.com/maps/api/js?v=3.2&sensor=false"></script>
<%--
                java.util.Enumeration names = request.getHeaderNames();
                while (names.hasMoreElements()) {
                        String hname = (String) names.nextElement();
        --%>
        <dl>
                <dt><%--=hname--%></dt>
                <dd><%--=request.getHeader(hname)--%></dd>
        </dl>
        <%--
                }
        --%>
        
        
        
Hello World!
<%-- <% if( request.getUserPrincipal() != null ){ %>
Hi, <%= request.getUserPrincipal() %>!
<% if(request.getAuthType().equals(au.org.aurin.shib.filter.ShibbolethServletRequest.SHIBBOLETH_AUTH)){ %> You logged in via Shibboleth. <% } else { %> You logged in via <%= request.getAuthType() %>. <% } %>
<% } else { %> You havn't logged in. <% } %>
Auth Type
<%= request.getAuthType() %>
Principal
<%= request.getUserPrincipal() %>
<% java.util.Enumeration names = request.getHeaderNames(); while (names.hasMoreElements()) { String hname = (String)names.nextElement(); %>
<%= hname %>
<%= request.getHeader(hname) %>
<% } %> --%>





<script type="text/javascript">





Ext.onReady(function(){

Aura.init({portalOn: false});

});

</script>

<div id="rootContainer"></div>
<!-- <div id="gxmap">
</div> -->