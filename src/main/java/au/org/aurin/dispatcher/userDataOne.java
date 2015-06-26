package au.org.aurin.dispatcher;

public class userDataOne {

  private long user_id;
  private String password;
  private String email;

  public String getEmail() {
    return email;
  }

  public void setEmail(final String email) {
    this.email = email;
  }

  public long getUser_id() {
    return user_id;
  }

  public void setUser_id(final long user_id) {
    this.user_id = user_id;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(final String password) {
    this.password = password;
  }
}
