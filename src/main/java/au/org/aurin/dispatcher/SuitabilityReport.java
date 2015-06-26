package au.org.aurin.dispatcher;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.Iterator;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.CSVWriter;
import au.org.aurin.wifui.AbstractWifServlet;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class SuitabilityReport extends AbstractWifServlet {
	private static final long serialVersionUID = 1L;

	final Logger logger = LoggerFactory.getLogger(SuitabilityReport.class);

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

	    logger.debug("Dispatching GET request");

	    ServletOutputStream out = response.getOutputStream();

	    // only logged in user can use this service
	    if (!isLoggedIn(request)) {
	      logger.debug("Not logged in");
	      responseNotOk(403, "Not logged in", response, out);
	      return;
	    }

	    // can only access its own data
	    String userIdSession = getUserId(request);
	    String userIdReq = request.getParameter("userId");
	    if (userIdReq == null) {
	    	userIdReq = userIdSession;
	    }
	    else if (!userIdSession.equals(userIdReq)) {
	      logger.debug("User mismatch: {} {}", userIdSession, userIdReq);
	      responseNotOk(403, "User mismatch", response, out);
	      return;
	    }

	    // can only access valid host and paths
	    String fileName = request.getParameter("fileName");
	    if (fileName == null) {
	      logger.debug("No file name supplied");
	      responseNotOk(403, "No file name supplied", response, out);
	      return;
	    }

	    // can only access valid host and paths
	    String url = request.getParameter("url");
	    if (!urlChecker.isUrlOk(url)) {
	      logger.debug("Non allowable URL: {}", url);
	      responseNotOk(403, "Non allowable URL", response, out);
	      return;
	    }
	    logger.debug("  Dispatching to URL: {}", url);

	    // now accessing the actual resource through GET request
	    HttpClient httpClient = createHttpClient();
	    try {
	      HttpGet httpGet = new HttpGet(url);
	      httpGet.addHeader("X-AURIN-USER-ID", userIdReq);
	      HttpResponse httpRes = httpClient.execute(httpGet);
	      int statusCode = httpRes.getStatusLine().getStatusCode();

	      // pass back the status code
	      response.setStatus(statusCode);
	      // pass back some headers
	      Header[] headers = httpRes.getAllHeaders();
	      for (int i = 0; i < headers.length; i++) {
	        Header h = headers[i];
	        String name = h.getName();
	        if (name.equalsIgnoreCase("X-AURIN-USER-ID")) {
	          response.setHeader(name, h.getValue());
	        }
	      }
	      response.setContentType("text/csv");
	      response.setHeader("Content-Disposition",  "attachment; filename=\""
	    		  + StringEscapeUtils.escapeJavaScript(fileName) + "\"");

	      jsonToCsv(httpRes.getEntity().getContent(), out);
	      logger.debug("  Done");
	      out.flush();
	      out.close();
	    }
	    catch (JsonParseException e) {
	    	logger.debug("Exception: {} ", e.toString());
	    	throw new ServletException(e);
	    }
	    catch (Exception e) {
	    	logger.debug("Exception: {} ", e.toString());
	    	throw new ServletException(e);
	    }
	    finally {
	      logger.debug("  Finally...");
	      if (httpClient != null)
	        httpClient.getConnectionManager().shutdown();
	    }
	}

	public String getUserId(HttpServletRequest request) {
		HttpSession session = request.getSession();
		String userId = (String) session.getAttribute("userId");
		return userId;
	}

	public Boolean isLoggedIn(HttpServletRequest request) {
		HttpSession session = request.getSession();
		String userId = (String) session.getAttribute("userId");
		if (userId == null || userId.trim().length() == 0) {
			return false;
		} else {
			return true;
		}
	}

	private void responseNotOk(int httpStatusCode, String message,
			HttpServletResponse response, ServletOutputStream out)
			throws IOException {
		response.setStatus(httpStatusCode);
		response.setContentType("application/json");
		out.print("{ \"status\": \"" + message + "\"}");
		out.flush();
		out.close();
	}

	private void jsonToCsv(InputStream in, OutputStream out)
			throws JsonParseException, JsonMappingException, IOException {
		ObjectMapper mapper = new ObjectMapper();
		JsonNode rootNode = mapper.readValue(in, JsonNode.class);
		logger.debug("  Got JSON: {}", rootNode.asText());

		CSVWriter writer = new CSVWriter(new OutputStreamWriter(out));

		writer.writeNext(new String[] { "What-If Suitability Report" });
		writer.writeNext(new String[] { });
		writer.writeNext(new String[] { "Scenario:", rootNode.findValue("scenarioLabel").asText() });
		writer.writeNext(new String[] { "Project:", rootNode.findValue("label").asText() });
		writer.writeNext(new String[] { });
		writer.writeNext(new String[] { "Suitability Land Use", "Suitability Category", "Suitability Scores", "Area" });

		Iterator<JsonNode> items = rootNode.findValue("items").elements();


		while (items.hasNext()) {
			JsonNode item = items.next();
			writer.writeNext(new String[] { });
			writer.writeNext(new String[] { item.findValue("suitabilityLULabel").asText() });
			Iterator<JsonNode> cats = item.findValue("suitabilityCategories").elements();


		   String[] st1 = null;
		   String[] st2= null;
		   String[] st3= null;
		   String[] st4= null;
		   String[] st5= null;
		   String[] st6= null;
		   String[] st7= null;
		   String[] st8= null;
		   String[] st9= null;


			while (cats.hasNext()) {
				JsonNode cat = cats.next();

				/*
 				writer.writeNext(new String[] {
						"",
						cat.findValue("category").asText(),
						cat.findValue("scoreRange").asText(),
						cat.findValue("area").asText()
				});
 				*/
        if (cat.findValue("category").asText().equals("Undefined"))
        {
            st1= new String[]{"",cat.findValue("category").asText(),cat.findValue("scoreRange").asText(),cat.findValue("area").asText()};
        }
        if (cat.findValue("category").asText().equals("Not Developable"))
        {
            st2= new String[]{"",cat.findValue("category").asText(),cat.findValue("scoreRange").asText(),cat.findValue("area").asText()};
        }
        if (cat.findValue("category").asText().equals("Not Convertible"))
        {
            st3= new String[]{"",cat.findValue("category").asText(),cat.findValue("scoreRange").asText(),cat.findValue("area").asText()};
        }
        if (cat.findValue("category").asText().equals("Not Suitable"))
        {
            st4= new String[]{"",cat.findValue("category").asText(),cat.findValue("scoreRange").asText(),cat.findValue("area").asText()};
        }
				if (cat.findValue("category").asText().equals("LOW"))
				{
				    st5= new String[]{"",cat.findValue("category").asText(),cat.findValue("scoreRange").asText(),cat.findValue("area").asText()};
				}
        if (cat.findValue("category").asText().equals("MEDIUM_LOW"))
        {
            st6= new String[]{"",cat.findValue("category").asText(),cat.findValue("scoreRange").asText(),cat.findValue("area").asText()};
        }
        if (cat.findValue("category").asText().equals("MEDIUM"))
        {
            st7= new String[]{"",cat.findValue("category").asText(),cat.findValue("scoreRange").asText(),cat.findValue("area").asText()};
        }
        if (cat.findValue("category").asText().equals("MEDIUM_HIGH"))
        {
            st8= new String[]{"",cat.findValue("category").asText(),cat.findValue("scoreRange").asText(),cat.findValue("area").asText()};
        }
        if (cat.findValue("category").asText().equals("HIGH"))
        {
            st9= new String[]{"",cat.findValue("category").asText(),cat.findValue("scoreRange").asText(),cat.findValue("area").asText()};
        }
			}
			writer.writeNext(st1);
			writer.writeNext(st2);
			writer.writeNext(st3);
			writer.writeNext(st4);
			writer.writeNext(st5);
			writer.writeNext(st6);
			writer.writeNext(st7);
			writer.writeNext(st8);
			writer.writeNext(st9);
			writer.writeNext(new String[] {
					"Total",
					"",
					"",
					item.findValue("totalArea").asText()
			});
		}
		writer.close();
	}
}
