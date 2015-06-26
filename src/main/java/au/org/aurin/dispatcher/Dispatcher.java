/**
 * Secure proxy for all API services
 * - Avoid cross domain issue
 * - Make sure userId in request = userId in Tomcat's container session
 * - Only to allowable servers & paths
 *
 *  References:
 *  - http://dyutiman.wordpress.com/2011/04/13/rest-template-using-apache-httpclient/
 */

package au.org.aurin.dispatcher;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.util.Enumeration;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.StringEntity;
import org.apache.http.message.BasicHeader;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.protocol.HTTP;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import au.org.aurin.wifui.AbstractWifServlet;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component("dispatcher")
public class Dispatcher extends AbstractWifServlet {
  final Logger logger = LoggerFactory.getLogger(Dispatcher.class);

  public Dispatcher() throws Exception {
    // Make a ClientConnectionManager which trusts everything.

  }

  @Override
  public void init(final ServletConfig config) throws ServletException {
    super.init(config);
  }

  // ------------ Proxy through GET ----------------------------

  @Override
  public void doGet(final HttpServletRequest request,
      final HttpServletResponse response) throws ServletException, IOException {

    logger.debug("Dispatching GET request");

    final ServletOutputStream out = response.getOutputStream();

    // only logged in user can use this service

    if (!isLoggedIn(request)) {
      logger.debug("Not logged in");
      responseNotOk(403, "Not logged in", response, out);
      // // newali
      // response.sendRedirect("/logout");

      return;
    }

    // can only access its own data
    final String userIdSession = getUserId(request);
    final String userIdReq = request.getParameter("userId");
    if (userIdReq != null && !userIdSession.equals(userIdReq)) {
      logger.debug("User mismatch: {} {}", userIdSession, userIdReq);
      responseNotOk(403, "User mismatch", response, out);
      return;
    }

    // can only access valid host and paths
    String url = request.getParameter("url");
    if (!urlChecker.isUrlOk(url)) {
      logger.debug("Non allowable URL: {}", url);
      responseNotOk(403, "Non allowable URL", response, out);
      return;
    }
    // logger.debug(" Dispatching to URL: {}", url);

    // parsing the request params and reattach them to the param URL
    final Enumeration qenum = request.getParameterNames();
    String qs = "";
    while (qenum.hasMoreElements()) {
      final String name = (String) qenum.nextElement();
      if (name.equalsIgnoreCase("url")) {
        continue;
      }
      if (name.equalsIgnoreCase("callback")) {
        continue;
      }
      final String value = request.getParameter(name);
      logger.debug("  Parameter: {} {}", name, value);
      qs += name + "=" + URLEncoder.encode(value, "utf-8"); // reencode
      if (qenum.hasMoreElements()) {
        qs += "&";
      }
    }
    if (url.contains("?")) {
      url += "&" + qs;
    } else {
      url += "?" + qs;
    }
    logger.debug("URL from params", url);

    // is it JSONP request?
    final String callback = request.getParameter("callback");
    final Boolean isCallback = callback != null && !callback.isEmpty();

    // now accessing the actual resource through GET request
    final HttpClient httpClient = createHttpClient();
    try {
      final HttpGet httpGet = new HttpGet(url);
      final HttpResponse httpRes = httpClient.execute(httpGet);
      final int statusCode = httpRes.getStatusLine().getStatusCode();

      // pass back the status code
      response.setStatus(statusCode);
      // pass back some headers
      final Header[] headers = httpRes.getAllHeaders();
      for (final Header h : headers) {
        final String name = h.getName();
        if (name.equalsIgnoreCase("Content-Type")
            || name.equalsIgnoreCase("Content-Disposition")) {
          response.setHeader(name, h.getValue());
        }
        // Note: Right now avoid passing Content-Length since there is incorrect
        // Content-Length in one of the services
      }

      if (isCallback) {
        out.print(callback + "(");
      } // wrap with callback if necessary
      final byte[] resContent = httpResRead(httpRes);
      if (resContent != null) {
        out.write(resContent);
      }
      if (isCallback) {
        out.print(");");
      }
      // logger.debug("  Done");
      out.flush();
      out.close();
    } catch (final IOException e) {
      logger.debug("  IO Exception: {}", e.toString());

      e.printStackTrace();
      responseNotOk(500, "IO Exception", response, out);
    } finally {
      logger.debug("  Finally...");
      if (httpClient != null) {
        httpClient.getConnectionManager().shutdown();
      }
    }
  }

  // ------------ Proxy through POST -----------------------------

  @Override
  public void doPost(final HttpServletRequest request,
      final HttpServletResponse response) throws ServletException, IOException {

    // logger.debug("Dispatching POST request");

    // crazy test! delete later!
    // if (1 == 1) {
    // logger.info("crazy");
    // logger.info(request.getContextPath() + "/logout/");
    // response.sendRedirect(request.getContextPath() + "/logout/");
    // return;
    // }

    final ServletOutputStream out = response.getOutputStream();
    response.setContentType("text/plain"); // let's go generic here

    if (!isLoggedIn(request)) { // only logged in user can use this service
      logger.debug("Not logged in");

      responseNotOk(403, "Not logged in", response, out);

      return;
    }

    final String userIdSession = getUserId(request);
    final String userIdReq = null;

    final ObjectMapper mapper = new ObjectMapper(); // create once and reuse
    HttpClient httpClient = null;

    try {
      /*
       * Request body is converted to jsonData using Jackson { "url": API
       * service endpoint, "method": "get" or "post" or "put" or "delete",
       * "params": {params to be sent to API}, "headers": {additional request
       * headers} }
       */
      final Map<String, Object> jsonData = mapper.readValue(
          request.getInputStream(), Map.class);
      final String url = (String) jsonData.get("url");
      logger.info("  Dispatching to URL: {}", url);

      if (!urlChecker.isUrlOk(url)) {
        logger.debug("Non allowable URL {}", url);
        responseNotOk(403, "Non allowable URL", response, out);
        return;
      }
      final String method = ((String) jsonData.get("method")).toLowerCase();
      final String params = mapper.writeValueAsString(jsonData.get("params"));
      String paramsContentType = "application/json";

      HttpRequestBase httpMeth;
      Boolean entityRequest = false;

      if (method.equalsIgnoreCase("post")) {
        httpMeth = new HttpPost(url);
        entityRequest = true;
      } else if (method.equalsIgnoreCase("put")) {
        httpMeth = new HttpPut(url);
        entityRequest = true;
      } else if (method.equalsIgnoreCase("delete")) {
        httpMeth = new HttpDelete(url);
      } else {
        httpMeth = new HttpGet(url);
      }

      httpClient = createHttpClient();
      HttpConnectionParams.setConnectionTimeout(httpClient.getParams(), 10000);

      final Map<String, String> headers = (Map<String, String>) jsonData
          .get("headers");
      if (headers != null && headers.size() != 0) {
        for (final Map.Entry<String, String> entry : headers.entrySet()) {
          final String key = entry.getKey();
          final String value = entry.getValue();
          // logger.debug("  Header: {} {}", key, value);

          if (key.equalsIgnoreCase("X-AURIN-USER-ID")) {
            if (!userIdSession.equals(value)) {
              logger.debug("User IDs", userIdSession, value);
              responseNotOk(403, "User mismatch", response, out);
              return;
            }
          } else if (key.equalsIgnoreCase("Content-Type")) {
            paramsContentType = value;
          }
          httpMeth.setHeader(key, value);
        }
      }

      if (params != null && params.length() != 0 && !params.equals("{}")
          && entityRequest) {

        String entityString;
        String entityEncoding;

        if (paramsContentType.equals("application/x-www-form-urlencoded")) {
          String strUrlEncoded = "";
          final Map<String, String> vars = (Map<String, String>) jsonData
              .get("params");
          for (final Map.Entry<String, String> entry : vars.entrySet()) {
            final String var = entry.getKey();
            final String val = entry.getValue();
            logger.debug("  Param: {} {}", var, val);

            strUrlEncoded += var + "=";
            strUrlEncoded += URLEncoder.encode(val, "utf-8") + "&";
          }
          entityString = strUrlEncoded;
          entityEncoding = "application/x-www-form-urlencoded";
        } else if (paramsContentType.equals("multipart/form-data")) {
          entityString = params;
          entityEncoding = "multipart/form-data";
        } else {
          entityString = params;
          entityEncoding = "application/json";
        }
        final StringEntity entity = new StringEntity(entityString, "UTF-8");
        final BasicHeader basicHeader = new BasicHeader(HTTP.CONTENT_TYPE,
            entityEncoding);
        final HttpEntityEnclosingRequestBase er = (HttpEntityEnclosingRequestBase) httpMeth;
        entity.setContentType(basicHeader);
        er.setEntity(entity);
      }

      httpMeth.getParams().setBooleanParameter("http.protocol.expect-continue",
          false);
      final HttpResponse httpRes = httpClient.execute(httpMeth);
      final byte[] resContent = httpResRead(httpRes);
      if (resContent != null) {
        out.write(resContent);
      }
      // logger.debug("Done");
      out.flush();
      out.close();
    } catch (final IOException e) {
      e.printStackTrace();
      responseNotOk(500, "IO Exception", response, out);
    } finally {
      if (httpClient != null) {
        httpClient.getConnectionManager().shutdown();
      }

    }
  }

  public String getUserId(final HttpServletRequest request) {

    final HttpSession session = request.getSession();
    final String userId = (String) session.getAttribute("user");
    return userId;
  }

  public Boolean isLoggedIn(final HttpServletRequest request) {

    final HttpSession session = request.getSession();
    final String userId = (String) session.getAttribute("user");
    if (userId == null || userId.trim().length() == 0) {
      return false;
    } else {
      return true;
    }
  }

  private void responseNotOk(final int httpStatusCode, final String message,
      final HttpServletResponse response, final ServletOutputStream out)
      throws IOException {

    response.setStatus(httpStatusCode);
    response.setContentType("application/json");
    out.print("{ \"status\": \"" + message + "\"}");
    out.flush();
    out.close();
  }

  private byte[] httpResRead(final HttpResponse response) throws IOException {

    final HttpEntity entity = response.getEntity();
    if (entity == null) {
      return null;
    }

    final InputStream inputStream = entity.getContent();
    final byte[] bytes = IOUtils.toByteArray(inputStream);
    inputStream.close();
    return bytes;

    /*
     * StringBuilder sb = new StringBuilder(); BufferedReader rd = new
     * BufferedReader(new InputStreamReader(inputStream)); for (String line =
     * rd.readLine(); line != null; line = rd.readLine()) { sb.append(line);
     * sb.append("\n"); } return sb.toString();
     */
  }

  // @RequestMapping(method = RequestMethod.GET, value = "/restGet")
  // @ResponseStatus(HttpStatus.OK)
  // public @ResponseBody
  // String getJson(@RequestHeader("X-AURIN-USER-ID") final String roleId) {
  // logger.info("Inside RestController");
  //
  // // return "home";
  // // return new RestTemplate().get
  //
  // final RestTemplate restTemplate = new RestTemplate();
  // // final String[] st =
  // //
  // restTemplate.getForObject("https://dev-api.aurin.org.au/what-if/projects/",
  // // String[].class);
  // // return st.toString();
  //
  // // final String url =
  // "http://localhost:8080/envision/projects/roleProject";
  // final String url =
  // "https://staging-api.aurin.org.au/what-if/projects/262e1a9cb83d590ecb188da72dab59ee";
  //
  // // url =
  // //
  // "https://dev-api.aurin.org.au/what-if/projects/eab3734e66939331a14d5762571998be";
  //
  // final HttpHeaders headers = new HttpHeaders();
  // headers.add("X-AURIN-USER-ID", roleId);
  // headers.add("Accept", "application/json");
  // final org.springframework.http.HttpEntity<String> entity = new
  // org.springframework.http.HttpEntity<String>("parameters",
  // headers);
  //
  // final ResponseEntity<String> st = restTemplate.exchange(url,
  // HttpMethod.GET, entity, String.class);
  // return st.getBody();
  // }

}
