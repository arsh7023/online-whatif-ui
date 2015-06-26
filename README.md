# online-whatif-ui
Online WhatIf User Interface

Build instructions
------------------

Set aurin.dir properties in pom.xml to location where combined pom.xml will be located
Create your own system properties (user-dev and user-play) in your local aurin-properties repo. Use these instead ivo-xxx.

To build for debugging/development (first, specify servlet.hotdeploy.path in user-dev.properties):

  # sudo mvn clean package -Ddeployment=development -Dsystem=ghazal-dev -Daurin.dir=/etc/aurin

To build for production:

  # sudo mvn clean package -Ddeployment=production -Dsystem=ivo-play -Daurin.dir=/etc/aurin

To deploy to aurin maven repository:

  # sudo mvn deploy -Ddeployment=production -Dsystem=ivo-play -Daurin.dir=/etc/aurin

Build will run uglification of JavaScript.

Running Tomcat
--------------
export JAVA_OPTS="-Xms256m -Xmx512m -Daurin.dir=/etc/aurin"
before running tomcat

Properties
----------

The following properties need to be set for your system:

wif.ui.endpoint=http://base/url/of/what-if/service/
wif.ui.appBase=http://base/url/of/what-if-ui/service/

If you are developing locally, it will also help to set the
following option, which turns off checking of SSL certificates:

wif.ui.useTrustingHttpClient=true


Javascript optimization
-----------------------
`sedscript.sed` removes all debugging commands (console.* and _.log)
`uglifyjs` compresses the JavaScript files


Dependencies
------------
### Java
- yuicompressor.jar

### Ruby's gem
- compass
  To install compass:
  # sudo gem install compass

### Node modules
- uglifyjs

