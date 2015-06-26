package au.org.aurin.wifui;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

@Component
public class WifUiConfig implements InitializingBean {
  final Logger logger = LoggerFactory.getLogger(WifUiConfig.class);

  private String endpointUrl;
  private String appBaseUrl;
  private String mservicesUrl;
  private String trustedHosts;
  private String trustedPaths;
  private boolean useTrustingHttpClient;

  private Set<String> trustedHostSet;
  private List<String> trustedPathList;

  private String authURL;
  private String authpub_URL;
  private String mapprintURL;

  public String getAuthURL() {
    return authURL;
  }

  public void setAuthURL(final String authURL) {
    this.authURL = authURL;
  }

  public String getAuthpub_URL() {
    return authpub_URL;
  }

  public void setAuthpub_URL(final String authpub_URL) {
    this.authpub_URL = authpub_URL;
  }

  public String getMapprintURL() {
    return mapprintURL;
  }

  public void setMapprintURL(final String mapprintURL) {
    this.mapprintURL = mapprintURL;
  }

  /**
   * A getter for the endpoint URL.
   * 
   * @return the endpoint URL
   */
  public String getEndpointUrl() {
    return endpointUrl;
  }

  public void setEndpointUrl(final String endpointUrl) {
    this.endpointUrl = endpointUrl;
  }

  public boolean useTrustingHttpClient() {
    return useTrustingHttpClient;
  }

  public void setUseTrustingHttpClient(final boolean useTrustingHttpClient) {
    this.useTrustingHttpClient = useTrustingHttpClient;
  }

  public boolean isTrustedHost(final String host) {
    return trustedHostSet.contains(host.toLowerCase());
  }

  public Iterable<String> trustedPaths() {
    return trustedPathList;
  }

  public void afterPropertiesSet() throws Exception {
    trustedHostSet = new HashSet<String>();
    for (final String h : trustedHosts.split(",")) {
      trustedHostSet.add(h.replace("\"", "").trim().toLowerCase());
    }

    trustedPathList = new ArrayList<String>();
    for (final String p : trustedPaths.split(",")) {
      trustedPathList.add(p.replace("\"", "").trim());
    }
  }

  /**
   * @param trustedHosts
   *          the trustedHosts to set
   */
  public void setTrustedHosts(final String trustedHosts) {
    this.trustedHosts = trustedHosts;
  }

  /**
   * @param trustedPaths
   *          the trustedPaths to set
   */
  public void setTrustedPaths(final String trustedPaths) {
    this.trustedPaths = trustedPaths;
  }

  /**
   * @return the appBaseUrl
   */
  public String getAppBaseUrl() {
    return appBaseUrl;
  }

  /**
   * @param appBaseUrl
   *          the appBaseUrl to set
   */
  public void setAppBaseUrl(final String appBaseUrl) {
    this.appBaseUrl = appBaseUrl;
  }

  public String getMservicesUrl() {
    return mservicesUrl;
  }

  public void setMservicesUrl(final String mservicesUrl) {
    this.mservicesUrl = mservicesUrl;
  }
}
