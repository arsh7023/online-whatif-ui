package au.org.aurin.dispatcher;

import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class SslUtil {
  private static final Logger LOGGER = LoggerFactory.getLogger(SslUtil.class);

  private SslUtil() {
  }

  public static void trustSelfSignedSSL() {
    try {
      final SSLContext ctx = SSLContext.getInstance("TLS");
      final X509TrustManager tm = new X509TrustManager() {

        public X509Certificate[] getAcceptedIssuers() {
          return new X509Certificate[] {};
        }

        public void checkServerTrusted(final X509Certificate[] arg0,
            final String arg1) throws CertificateException {
        }

        public void checkClientTrusted(final X509Certificate[] arg0,
            final String arg1) throws CertificateException {
        }
      };
      ctx.init(null, new TrustManager[] { tm }, null);
      SSLContext.setDefault(ctx);
    } catch (final Exception ex) {
      LOGGER.error("Error while setting default ssl context", ex);
    }
  }

  public static void trustJavaTrustStore() {
    try {
      final SSLContext ctx = SSLContext.getInstance("TLS");
      final X509TrustManager tm = new SunX509TrustManager();
      ctx.init(null, new TrustManager[] { tm }, null);
      SSLContext.setDefault(ctx);
    } catch (final Exception ex) {
      LOGGER.error("Error while trusting local keystore", ex);
    }
  }

  public static void enableSSL() {
    final TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
      public java.security.cert.X509Certificate[] getAcceptedIssuers() {
        return null;
      }

      public void checkClientTrusted(
          final java.security.cert.X509Certificate[] certs,
          final String authType) {
      }

      public void checkServerTrusted(
          final java.security.cert.X509Certificate[] certs,
          final String authType) {
      }
    } };

    try {
      final SSLContext sc = SSLContext.getInstance("SSL");
      sc.init(null, trustAllCerts, new java.security.SecureRandom());
      HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
    } catch (final Exception e) {
    }
  }
}

class SunX509TrustManager implements X509TrustManager {
  private static final Logger LOGGER = LoggerFactory
      .getLogger(SunX509TrustManager.class);
  /*
   * The default X509TrustManager returned by SunX509. We'll delegate decisions
   * to it, and fall back to the logic in this class if the default
   * X509TrustManager doesn't trust it.
   */
  X509TrustManager sunJSSEX509TrustManager;

  SunX509TrustManager() throws Exception {
    // create a "default" JSSE X509TrustManager.
    final KeyStore ks = KeyStore.getInstance("JKS");
    ks.load(ClassLoader
        .getSystemResourceAsStream("au/org/aurin/security/sun-cacerts.jks"),
        "changeit".toCharArray());
    final TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509",
        "SunJSSE");
    tmf.init(ks);
    final TrustManager tms[] = tmf.getTrustManagers();
    /*
     * Iterate over the returned trustmanagers, look for an instance of
     * X509TrustManager. If found, use that as our "default" trust manager.
     */
    for (final TrustManager tm : tms) {
      if (tm instanceof X509TrustManager) {
        sunJSSEX509TrustManager = (X509TrustManager) tm;
        return;
      }
    }
    /*
     * Find some other way to initialize, or else we have to fail the
     * constructor.
     */
    throw new Exception("Couldn't initialize");
  }

  /*
   * Delegate to the default trust manager.
   */
  public void checkClientTrusted(final X509Certificate[] chain,
      final String authType) throws CertificateException {
    try {
      sunJSSEX509TrustManager.checkClientTrusted(chain, authType);
    } catch (final CertificateException excep) {
      // do any special handling here, or rethrow exception.
      LOGGER.error("Error while checking client certificate chain", excep);
    }
  }

  /*
   * Delegate to the default trust manager.
   */
  public void checkServerTrusted(final X509Certificate[] chain,
      final String authType) throws CertificateException {
    try {
      sunJSSEX509TrustManager.checkServerTrusted(chain, authType);
    } catch (final CertificateException excep) {
      // do any special handling here, or rethrow exception
      LOGGER.error("Error while checking server certificate chain", excep);
    }
  }

  /*
   * Merely pass this through.
   */
  public X509Certificate[] getAcceptedIssuers() {
    return sunJSSEX509TrustManager.getAcceptedIssuers();
  }

}
