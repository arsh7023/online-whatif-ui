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

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;

import org.apache.http.Header;

import org.apache.commons.io.IOUtils;

import java.util.*;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import au.org.aurin.wifui.AbstractWifServlet;

import com.fasterxml.jackson.databind.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GetResource extends AbstractWifServlet {

  /**
	 * 
	 */
	private static final long serialVersionUID = -3191190574192368172L;
final Logger logger = LoggerFactory.getLogger(Dispatcher.class);

  public void init(ServletConfig config) throws ServletException
  {
    super.init(config);
  }

  //------------ Proxy through GET ----------------------------

  public void doGet( HttpServletRequest request,
                     HttpServletResponse response)
    throws ServletException, IOException {

    ObjectMapper mapper = new ObjectMapper(); // create once and reus
    ServletOutputStream out = response.getOutputStream();

    // only logged in user can use this service
    if (!isLoggedIn(request)) {
      responseNotOk(403, "Not logged in", response, out);
      return;
    }

    // can only access its own data
    String userIdSession = getUserId(request);
    String userIdReq = request.getParameter("userId");
    if (userIdReq != null && !userIdSession.equals(userIdReq)) {
      responseNotOk(403, "User mismatch", response, out);
      return;
    }

    // can only access valid host and paths
    String url = request.getParameter("url");
    if (!urlChecker.isUrlOk(url)) {
      responseNotOk(403, "Non allowable URL", response, out);
      return;
    }

    // parsing the request params and reattach them to the param URL
    Enumeration qenum = request.getParameterNames();
    String qs = "";
    while (qenum.hasMoreElements()) {
      String name = (String) qenum.nextElement();
      if (name.equalsIgnoreCase("url")) continue;
      if (name.equalsIgnoreCase("callback")) continue;
      String value = request.getParameter(name);
      qs += name + "=" + URLEncoder.encode(value, "utf-8"); // reencode
      if (qenum.hasMoreElements()) {
        qs += "&";
      }
    }
    if (url.contains("?")) {
      url += "&"+qs;
    } else {
      url += "?"+qs;
    }
    logger.debug("URL from params", url);

    // is it JSONP request?
    String callback = request.getParameter("callback");
    Boolean isCallback = (callback != null && !callback.isEmpty());

    // are headers injected?
    String headerString = request.getParameter("headers");
    logger.debug("headerString", headerString);

    Map<String, String> reqHeaders = null;
    if (headerString != null && !headerString.isEmpty()) {
      reqHeaders = mapper.readValue(headerString, Map.class);
    }

    // now accessing the actual resource through GET request
    HttpClient httpClient = createHttpClient();
    try {
      HttpGet httpGet = new HttpGet(url);
      if (reqHeaders != null && reqHeaders.size() != 0) {
        for (Map.Entry<String, String> entry : reqHeaders.entrySet()) {
          String key = entry.getKey();
          String value = entry.getValue();

          if (key.equalsIgnoreCase("X-AURIN-USER-ID")) {
            if (!userIdSession.equals(value)) {
              logger.debug("User IDs", userIdSession, value);
              responseNotOk(403, "User mismatch", response, out);
              return;
            }
          }
          httpGet.setHeader(key, value);
        }
      }

      HttpResponse httpRes = httpClient.execute(httpGet);
      int statusCode = httpRes.getStatusLine().getStatusCode();

      // pass back the status code
      response.setStatus(statusCode);
      // pass back some headers
      Header[] headers = httpRes.getAllHeaders();
      for (int i = 0; i < headers.length; i++) {
        Header h = headers[i];
        String name = h.getName();
        if (name.equalsIgnoreCase("Content-Type") ||
            name.equalsIgnoreCase("Content-Disposition") ) {
          response.setHeader(name, h.getValue());
        }
        // Note: Right now avoid passing Content-Length since there is incorrect
        // Content-Length in one of the services
      }

      if (isCallback) { out.print(callback + "("); } // wrap with callback if necessary
      byte[] resContent = httpResRead(httpRes);
      if (resContent != null)
        out.write(resContent);
      if (isCallback) { out.print(");"); }
      out.flush();
      out.close();
    } catch (IOException e) {
      e.printStackTrace();
      responseNotOk(500, "IO Exception", response, out);
    } finally {
      if (httpClient != null) httpClient.getConnectionManager().shutdown();
    }
  }

  public String getUserId(HttpServletRequest request) {

    HttpSession session = request.getSession();
    String userId = (String)session.getAttribute("userId");
    return userId;
  }

  public Boolean isLoggedIn(HttpServletRequest request) {

    HttpSession session = request.getSession();
    String userId = (String)session.getAttribute("userId");
    if (   userId  == null
        || userId.trim().length() == 0
       ) {
      return false;
    } else {
      return true;
    }
  }

  private void responseNotOk( int httpStatusCode,
                              String message,
                              HttpServletResponse response,
                              ServletOutputStream out)
      throws IOException {

    response.setStatus(httpStatusCode);
    response.setContentType("application/json");
    out.print("{ \"status\": \"" + message + "\"}");
    out.flush();
    out.close();
  }

  private byte[] httpResRead(HttpResponse response) throws IOException {

    HttpEntity entity = response.getEntity();
    if (entity == null) return null;

    InputStream inputStream = entity.getContent();
    byte[] bytes = IOUtils.toByteArray(inputStream);
    inputStream.close();
    return bytes;

    /*
    StringBuilder sb = new StringBuilder();
    BufferedReader rd = new BufferedReader(new InputStreamReader(inputStream));
    for (String line = rd.readLine(); line != null; line = rd.readLine()) {
      sb.append(line);
      sb.append("\n");
    }
    return sb.toString();
    */
  }
}