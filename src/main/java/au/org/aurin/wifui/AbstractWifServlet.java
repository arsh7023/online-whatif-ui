package au.org.aurin.wifui;

import java.io.IOException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.client.HttpClient;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.impl.client.DefaultHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.HttpRequestHandler;

public abstract class AbstractWifServlet extends HttpServlet implements
		HttpRequestHandler {
	final Logger logger = LoggerFactory.getLogger(AbstractWifServlet.class);
	  
	/**
	 * Glue the HttpRequestHandler interface to the HttpServlet interface. (We
	 * need the interface to let servlets be Spring components.)
	 */
	public void handleRequest(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		service(req, resp);
	}

	public static HttpClient wrapClient(HttpClient base)
			throws ServletException {
		try {
			SSLContext ctx = SSLContext.getInstance("TLS");

			X509TrustManager tm = new X509TrustManager() {
				public X509Certificate[] getAcceptedIssuers() {
					return null;
				}

				public void checkClientTrusted(X509Certificate[] xcs,
						String string) throws CertificateException {
				}

				public void checkServerTrusted(X509Certificate[] xcs,
						String string) throws CertificateException {
				}
			};

			ctx.init(null, new TrustManager[] { tm }, null);
			SSLSocketFactory ssf = new SSLSocketFactory(ctx);
			ClientConnectionManager ccm = base.getConnectionManager();

			SchemeRegistry sr = ccm.getSchemeRegistry();
			sr.register(new Scheme("https", 443, ssf));

			return new DefaultHttpClient(ccm, base.getParams());
		} catch (NoSuchAlgorithmException ex) {
			throw new ServletException(ex);
		} catch (KeyManagementException ex) {
			throw new ServletException(ex);
		}
	}

	protected HttpClient createHttpClient() throws ServletException {
		HttpClient client = new DefaultHttpClient();
		return configuration.useTrustingHttpClient() ? wrapClient(client)
				: client;
	}

	@Autowired
	protected WifUiConfig configuration;

	@Autowired
	protected UrlChecker urlChecker;

	/**
	 * @return the configuration
	 */
	public WifUiConfig getConfiguration() {
		return configuration;
	}

	/**
	 * @param configuration
	 *            the configuration to set
	 */
	public void setConfiguration(WifUiConfig configuration) {
		this.configuration = configuration;
	}

	/**
	 * @return the urlChecker
	 */
	public UrlChecker getUrlChecker() {
		return urlChecker;
	}

	/**
	 * @param urlChecker
	 *            the urlChecker to set
	 */
	public void setUrlChecker(UrlChecker urlChecker) {
		this.urlChecker = urlChecker;
	}
}
