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
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.message.BasicHeader;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.protocol.HTTP;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import au.org.aurin.wifui.AbstractWifServlet;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component("downloader")
public class Downloader2 extends AbstractWifServlet {

  final Logger logger = LoggerFactory.getLogger(Uploader.class);

  // ------------ Uploader through POST -----------------------------

  @Override
  public void doPost(final HttpServletRequest request,
      final HttpServletResponse response) throws ServletException, IOException {

    final ObjectMapper mapper = new ObjectMapper(); // create once and reus
    final ServletOutputStream out = response.getOutputStream();

    response.setContentType("text/html");
    // ExtJS expect text/html although we send Json

    if (!isLoggedIn(request)) { // only logged in user can use this service
      responseNotOk(403, "Not logged in", response, out);
      return;
    }

    final String userIdSession = getUserId(request);
    final String userIdReq = null;

    HttpClient httpClient = null;

    try {
      /*
       * Request body is converted to jsonData using Jackson { "url": API
       * service endpoint, "method": "get" or "post" or "put" or "delete",
       * "params": {params to be sent to API}, "headers": {additional request
       * headers} }
       */

      final InputStream inputStream = request.getInputStream();

      final String url = request.getParameter("url");

      if (!urlChecker.isUrlOk(url)) {
        responseNotOk(403, "Non allowable URL", response, out);
        return;
      }

      final String dataContentType = request.getParameter("contentType");
      final String data = request.getParameter("data");
      final String fileName = request.getParameter("fileName");
      final String accept = request.getParameter("accept");
      final String method = request.getParameter("method");
      final String headerString = request.getParameter("headers");

      Map<String, String> reqHeaders = null;
      if (headerString != null && !headerString.isEmpty()) {
        reqHeaders = mapper.readValue(headerString, Map.class);
      }

      HttpRequestBase httpMeth;
      httpClient = createHttpClient();

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

      if (reqHeaders != null && reqHeaders.size() != 0) {
        for (final Map.Entry<String, String> entry : reqHeaders.entrySet()) {
          final String key = entry.getKey();
          final String value = entry.getValue();

          if (key.equalsIgnoreCase("X-AURIN-USER-ID")) {
            if (!userIdSession.equals(value)) {
              logger.debug("User IDs", userIdSession, value);
              responseNotOk(403, "User mismatch", response, out);
              return;
            }
          }
          httpMeth.setHeader(key, value);
        }
      }

      HttpConnectionParams.setConnectionTimeout(httpClient.getParams(), 30000);

      if (entityRequest) {

        final byte[] entityBytes = data.getBytes();
        final String entityEncoding = dataContentType;
        final ByteArrayEntity entity = new ByteArrayEntity(entityBytes);
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
        // Header contentType = httpRes.getFirstHeader("Content-Type");
        // response.setContentType(contentType.getValue());
        response.setContentType(accept);
        response.setContentLength(resContent.length);
        response.setHeader("Content-Disposition", "attachment; filename="
            + fileName);
        out.write(resContent);
      }
      out.flush();
      out.close();

    } catch (final IOException e) {
      e.printStackTrace();
      responseNotOk(500, "IO Exception", response, out);
    } finally {
      if (httpClient != null) {
        httpClient.getConnectionManager().shutdown();
      }
      out.close();
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
}
