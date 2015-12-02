package au.org.aurin.dispatcher;

import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.io.FileUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.ModelAndView;

import au.org.aurin.wifui.WifUiConfig;

@Controller
public class RestController {

  private static final Logger logger = LoggerFactory
      .getLogger(RestController.class);

  @Autowired
  private WifUiConfig mySet;

  @RequestMapping(method = RequestMethod.GET, value = "/restGet")
  @ResponseStatus(HttpStatus.OK)
  public @ResponseBody
  ByteArrayResource getJson(final HttpServletResponse response,
      @RequestParam("url") final String url,
      @RequestParam("prjname") final String prjname) throws IOException {

    logger.info("Inside RestController");

    // SslUtil.enableSSL();

    logger.info("Inside RestController SslUtil");
    final RestTemplate restTemplate = new RestTemplate();

    // this is for security ssl
    // url = url.replace("https", "http");

    final HttpHeaders headers = new HttpHeaders();
    headers.add("X-AURIN-USER-ID", "Guest3");
    headers.add("Accept", "application/zip");

    logger.info(url);

    final HttpEntity<String> entity = new HttpEntity<String>("parameters",
        headers);

    final ResponseEntity<ByteArrayResource> st = restTemplate.exchange(url,
        HttpMethod.GET, entity, ByteArrayResource.class);

    final String tempDir = System.getProperty("java.io.tmpdir");
    final File filexml = new File(tempDir + "/" + prjname + ".zip");
    logger.info(tempDir + "/" + prjname + ".zip");
    if (!filexml.exists()) {
      filexml.createNewFile();
    }

    FileUtils.writeByteArrayToFile(filexml, st.getBody().getByteArray());
    logger.info(filexml.getAbsolutePath());
    response.setHeader("Content-Disposition", "attachment; filename=\""
        + filexml.getName() + "\"");
    response.setContentLength(st.getBody().getByteArray().length);
    response.setContentType("application/zip");

    filexml.delete();

    return st.getBody();
  }

  // /////////////////////new

  /**
   * @param request
   * @return
   */
  @RequestMapping(value = "/login", method = RequestMethod.GET)
  public ModelAndView login(final HttpServletRequest request) {

    if (isLoggedIn(request)) {
      final ModelAndView model = new ModelAndView();

      model.setViewName("home");

      return model;
    } else {

      final ModelAndView model = new ModelAndView();

      model.setViewName("login");

      return model;
    }

  }

  /**
   * @param user
   * @param request
   * @return
   */
  @RequestMapping(value = "/login", method = RequestMethod.POST)
  public ModelAndView login1(@ModelAttribute("userForm") final userForm user,
      final HttpServletRequest request) {

    final ModelAndView model = new ModelAndView();

    logger.info("in login1");
    logger.info(user.getUsername());
    logger.info(user.getPassword());
    try {

      final RestTemplate restTemplate = new RestTemplate();

      final String url = mySet.getAuthURL() + "getUser";

      logger.info(url);

      final HttpHeaders headers = new HttpHeaders();
      headers.add("X-AURIN-USER-ID", "aurin");
      headers.add("user", user.getUsername());
      headers.add("password", user.getPassword());
      headers.add("Accept", "application/json");
      final HttpEntity<String> entity = new HttpEntity<String>("parameters",
          headers);

      final ResponseEntity<String> st = restTemplate.exchange(url,
          HttpMethod.GET, entity, String.class);
      // return st.getBody();
      final HttpSession session = request.getSession(true);
      session.setAttribute("userData", st.getBody());
      logger.info(st.getBody());

      String url2 = "";
      url2 = mySet.getAuthURL() + "getUserOne";

      final ResponseEntity<userDataOne> myuser = restTemplate.exchange(url2,
          HttpMethod.GET, entity, userDataOne.class);

      if (myuser != null) {

        Boolean lsw = false;
        ////new
        final JSONParser parser = new JSONParser();
        final Object obj = parser.parse(st.getBody());
        final JSONObject jsonObject = (JSONObject) obj;

        final JSONArray userApplications = (JSONArray) jsonObject.get("userApplications");
        final Iterator<JSONObject> iterator = userApplications.iterator();

        while (iterator.hasNext()) {
          final JSONObject jsonObjectApp = iterator.next();
          final String name = (String) jsonObjectApp.get("appname");
          if (name.toLowerCase().contains("whatif") || name.toLowerCase().contains("what if")){
            lsw = true;
          }
        }
        if (lsw == true)
        {
          session.setAttribute("user", myuser.getBody().getEmail());
          logger.info("session assigned: " + myuser.getBody().getEmail());
          return new ModelAndView("redirect:/");
          // return new ModelAndView("home");

        }
        else
        {
          model.addObject("message", "You dont have permission to access the tool.");
          return model;
        }

      }

    } catch (final Exception e) {
      logger.info(e.toString());
      logger.info(
          "*******>> Error in Rest-getUser for Project user ={} and pass={} ",
          user.getUsername(), user.getPassword());
      model.addObject("message", "Invalid Email or Password");
      // model.addAttribute("message", "error");
      return model;
      // return "login";

    }

    return null;

  }

  /**
   * @param locale
   * @param request
   * @return
   */
  @RequestMapping(value = { "/", "/home" }, method = RequestMethod.GET)
  public ModelAndView home(final Locale locale, final HttpServletRequest request) {

    logger.info("Welcome home! The client locale is {}.", locale);

    final Date date = new Date();
    final DateFormat dateFormat = DateFormat.getDateTimeInstance(
        DateFormat.LONG, DateFormat.LONG, locale);

    if (isLoggedIn(request)) {
      final ModelAndView model = new ModelAndView();

      model.setViewName("home");

      return model;
    } else {
      // return new ModelAndView("login");
      return new ModelAndView("redirect:/login");
      //
    }
    // return new ModelAndView("login");
  }

  @RequestMapping(value = { "/2", "/home2" }, method = RequestMethod.GET)
  public String home2(final Locale locale, final HttpServletRequest request) {
    // public ModelAndView home(final Locale locale, final Model model) {
    logger.info("Welcome home! The client locale is {}.", locale);

    final Date date = new Date();
    final DateFormat dateFormat = DateFormat.getDateTimeInstance(
        DateFormat.LONG, DateFormat.LONG, locale);

    if (isLoggedIn(request)) {
      // final ModelAndView model = new ModelAndView();
      //
      // model.setViewName("home");

      return "home";
    } else {
      // return new ModelAndView("login");
      // return new ModelAndView("redirect:/login");
      return "login";
      //
    }
    // return new ModelAndView("login");
  }

  public Boolean isLoggedIn(final HttpServletRequest request) {

    logger.info("inside isLoggedIn");
    final HttpSession session = request.getSession();
    final String userId = (String) session.getAttribute("userData");
    if (userId == null || userId.trim().length() == 0) {
      return false;
    } else {
      return true;
    }
  }

  @RequestMapping(method = RequestMethod.GET, value = "/logout")
  public ModelAndView dologout(

      final HttpServletRequest request, final HttpServletResponse response) {

    logger.info("in logout ");
    final ModelAndView model = new ModelAndView();
    try {
      request.getSession().invalidate();
    } catch (final Exception e) {
      logger.info("in logout error is:  " + e.toString());

    }
    model.setViewName("logout");
    return model;
  }

}
