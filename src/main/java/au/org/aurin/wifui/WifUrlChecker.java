package au.org.aurin.wifui;

import java.net.MalformedURLException;
import java.net.URL;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class WifUrlChecker implements UrlChecker {

  @Autowired
  WifUiConfig configuration;
  
  public boolean isUrlOk(String url) {
    if (url != null && !url.isEmpty()) {
      try {
        URL parseUrl = new URL(url);
        String urlHost = parseUrl.getHost();
        if (!configuration.isTrustedHost(urlHost)) {
          return false;
        }
        String urlPath = parseUrl.getPath();
        for (String p : configuration.trustedPaths()) {
          if (urlPath.startsWith(p)) {
            return true;
          }
        }
      } catch (MalformedURLException e) {
        return false;
      }
    }
    return false;
  }

  /**
   * @param configuration the configuration to set
   */
  public void setConfiguration(WifUiConfig configuration) {
    this.configuration = configuration;
  }
}
