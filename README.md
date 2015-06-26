# online-whatif-ui
Online WhatIf User Interface.  A web-based user interface for [Online WhatIf](https://github.com/AURIN/online-whatif).

## Build instructions

To build for debugging/development (first, specify servlet.hotdeploy.path in user-dev.properties):

	mvn clean package -Ddeployment=development -Dsystem=ali-dev -Daurin.dir=/etc/aurin

To build for production:

	mvn clean package -Ddeployment=production -Dsystem=ali-dev -Daurin.dir=/etc/aurin

## Running Tomcat

Before running tomcat, check that the JAVA\_OPTS provide enough memory.  It's best to set -Xms to a minimum of 256m and -Xmx to a minimum of 512m.  You'll also need to set the aurin.dir variable.  For example:

        JAVA_OPTS="-Djava.awt.headless=true -XX:+UseConcMarkSweepGC -Dfile.encoding=UTF-8 -Xmx2G -XX:PermSize=512M -Daurin.dir=/etc/aurin"

On Ubuntu, the JAVA\_OPTS variable can be set in the /etc/defaults/tomcat7 file.

## Properties

The following properties need to be set in the whatif-combined.properties file for your system:

	wif.ui.endpoint=http://base/url/of/what-if/service/
	wif.ui.appBase=http://base/url/of/what-if-ui/service/

If you are developing locally, it will also help to set the following option,
which turns off checking of SSL certificates:

	wif.ui.useTrustingHttpClient=true
