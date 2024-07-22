---
title: Solving the “PKIX path building failed” “unable to find valid certification path to requested target”
date: 2021-06-12T23:34:49+02:00
categories: [Software Engineering]
tags: [Java, Software Engineering]
---

This week I’ve come across the following stacktrace in a Java application while connecting to a web service over HTTPS. The exception was thrown due to certificate not being valid. The message says that Java is unable to find a valid certification path. But the browser marks the certificate as valid. This happened because the app was running on an older version of Java that did not recognize this root certificate authority (CA). Therefore, we need to get the certificate authority and import it into [Java KeyStore](https://en.wikipedia.org/wiki/Java_KeyStore) (JKS).

```
Caused by: javax.net.ssl.SSLHandshakeException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
        ...
Caused by: sun.security.validator.ValidatorException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
        at sun.security.validator.PKIXValidator.doBuild(PKIXValidator.java:456) ~[na:1.8.0_292]
        ...
Caused by: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
        ...
```

## How to get root certificate authority?

We can export root certificate authority from the browser. In Chrome, click on the lock icon next to the URL, look for Certificate, then Details, and export it in the DER format. If you’re using macOS, there is no export button, but you can simply click on the certificate icon and drag-and-drop it the desktop (or desired location).

## How to add certificate to Java KeyStore?

We will use `keytool` to import the root CA into JKS. We need to pass the following parameters:

- an alias (missing-root-ca),
- the path to keystore (/path/to/cacert/files), and
- certificate file (missing-root-ca.der).

```
keytool \
    -import \
    -alias missing-root-ca \
    -keystore /path/to/cacert/files \
    -file missing-root-ca.der
```

You will be prompted to enter the password for JKS. Default password is ‘`changeit`‘.

Finally, JVM needs to be restarted to apply the changes. After restart we should be ready to connect to our web service over HTTPS.
