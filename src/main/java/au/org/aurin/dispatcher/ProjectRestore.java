/**
 * Secure proxy for project restore service
 */

package au.org.aurin.dispatcher;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.message.BasicHeader;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.protocol.HTTP;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import au.org.aurin.wifui.AbstractWifServlet;

@Component("projectRestore")
public class ProjectRestore extends AbstractWifServlet {

  final Logger logger = LoggerFactory.getLogger(ProjectRestore.class);

  private HttpResponse sendFile(final String user, final String url,
      final InputStream istream) throws ServletException, IOException {
    final HttpRequestBase httpMeth = new HttpPost(url);
    final Boolean entityRequest = true;

    final HttpClient httpClient = createHttpClient();
    HttpConnectionParams.setConnectionTimeout(httpClient.getParams(), 30000);

    if (istream != null && entityRequest) {
      final byte[] entityBytes = IOUtils.toByteArray(istream);
      final String entityEncoding = "application/json";

      final ByteArrayEntity entity = new ByteArrayEntity(entityBytes);
      final BasicHeader basicHeader = new BasicHeader(HTTP.CONTENT_TYPE,
          entityEncoding);
      final HttpEntityEnclosingRequestBase er = (HttpEntityEnclosingRequestBase) httpMeth;
      entity.setContentType(basicHeader);
      er.setEntity(entity);
    }
    httpMeth.getParams().setBooleanParameter("http.protocol.expect-continue",
        false);
    httpMeth.addHeader(new BasicHeader("X-AURIN-USER-ID", user));
    return httpClient.execute(httpMeth);
  }

  // ------------ Project restore through POST -----------------------------

  @Override
  public void doPost(final HttpServletRequest request,
      final HttpServletResponse response) throws ServletException, IOException {

    final ServletOutputStream out = response.getOutputStream();

    response.setContentType("text/html"); // Ext.JS expects this

    if (!isLoggedIn(request)) { // only logged in user can use this service
      responseNotOk(403, "Not logged in", response, out);
      return;
    }

    final String url = request.getParameter("url");
    if (!urlChecker.isUrlOk(url)) {
      logger.debug("Non allowable URL: {}", url);
      responseNotOk(403, "Non allowable URL", response, out);
      return;
    }

    final String userIdSession = getUserId(request);

    final HttpClient httpClient = null;
    logger.debug("Examining response");
    try {
      final ServletFileUpload upload = new ServletFileUpload();
      final FileItemIterator iter = upload.getItemIterator(request);
      while (iter.hasNext()) {
        final FileItemStream item = iter.next();
        final String name = item.getFieldName();
        final InputStream stream = item.openStream();
        if (item.isFormField()) {
          logger.debug("Form field {} with value {} detected.", name,
              Streams.asString(stream));
        } else {
          logger.debug("File field {} with file name {} detected.", name,
              item.getName());
          final InputStream istream = item.openStream();
          final HttpResponse httpRes = sendFile(userIdSession, url, istream);
          final int resStatusCode = httpRes.getStatusLine().getStatusCode();
          logger.debug("Result: {}", resStatusCode);
          if (resStatusCode < 200 || resStatusCode >= 300) {
            logger.debug("Sending error");
            responseNotOk(resStatusCode, "The restore did not succeed.",
                response, out);
            return;
          } else {
            logger.debug("Sending success");
            responseOk(response, out);
            return;
          }
        }
      }
    } catch (final IOException e) {
      logger.debug("IOException {}", e.toString());
      e.printStackTrace();
      responseNotOk(500, "IO Exception", response, out);
    } catch (final FileUploadException e) {
      logger.debug("FileUploadException {}", e.toString());
      e.printStackTrace();
      responseNotOk(500, "Request Exception", response, out);
    } finally {
      logger.debug("done");
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
    response.setContentType("text/html"); // Ext.JS expects this
    out.print("{ \"status\": \"" + message + "\", \"success\": false }");
    out.flush();
    out.close();
  }

  private void responseOk(final HttpServletResponse response,
      final ServletOutputStream out) throws IOException {
    response.setStatus(200);
    response.setContentType("text/html"); // Ext.JS expects this
    out.print("{ \"status\": \"OK\", \"success\": true }");
    out.flush();
    out.close();
  }
}
