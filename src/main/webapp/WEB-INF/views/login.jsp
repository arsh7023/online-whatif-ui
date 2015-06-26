

<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="s" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<%@page session="true"%>
<html>
<head>
<title>Online WhatIf login Page</title>
<link rel="shortcut icon" href="resources/images/AURIN_Workbench.jpg">
<style>
.error {
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid transparent;
    border-radius: 4px;
    color: #a94442;
    background-color: #f2dede;
    border-color: #ebccd1;
}
 
.msg {
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid transparent;
    border-radius: 4px;
    color: #31708f;
    background-color: #d9edf7;
    border-color: #bce8f1;
}
 
#login-box {
    width: 400px;
    padding: 20px;
    margin: 100px auto;
    background: #fff;
    -webkit-border-radius: 2px;
    -moz-border-radius: 2px;
    border: 1px solid #000;
}
</style>


<script type="text/javascript">

  function checkPassword(str)
  {
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return re.test(str);
  }

  function checkForm()
  {
    
    window.location='/whatif';

  }

</script>

</head>
<body onload='document.loginForm.username.focus();'>
 
   <!--  <h1>Envision Login Form</h1> -->
 
    <div id="login-box">
 
        <h3 align="center" >Online WhatIf login</h3>
 
        <c:if test="${not empty error}">
            <div class="error">${error}</div>
        </c:if>
        <c:if test="${not empty msg}">
            <div class="msg">${msg}</div>
        </c:if>
       
          
   
      <form method='POST' commandName="userForm">
          
          
        <table >
            <tr> <a target='_blank' href='http://aurin.org.au/'><img src='resources/images/AURIN_Workbench.jpg' height='100' width='300' hspace='20'></a></tr>
            <tr>
                <td>Email:</td>
                <td><input type='text' name='username' size="35"></td>
            </tr>
            <tr>
                <td>Password:</td>
                <td><input type='password' name='password' size="35" /></td>
            </tr>
            <tr>
            <br/>
           <!--  <td style='text-align:center;vertical-align:middle'> -->
            <td align="center" valign="center" float:left;>
            <input name="submit" type="submit"
                  value="LOGIN" />
            </td> 
            </tr>
          </table>
      <!--     <input name="submit" type="submit" align="centre"
                  value="LOGIN" /> -->
             
 
						<P>   ${message} </P>
 
      <%--     <input type="hidden" name="${_csrf.parameterName}"
            value="${_csrf.token}" /> --%>
 
        </form>
    </div>
 
</body>
</html>