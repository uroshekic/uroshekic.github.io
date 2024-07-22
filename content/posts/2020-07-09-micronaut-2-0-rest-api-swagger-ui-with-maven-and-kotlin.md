---
title: Micronaut 2.0 REST API Swagger UI with Maven and Kotlin
date: 2020-07-09T20:11:56+02:00
categories: [Software Engineering]
tags: [Java, Software Engineering]
---

I was playing around with Micronaut framework 2.0 which was released a couple of days ago (June 26th) for a personal project, a web service with a REST API. I wanted to use Swagger UI, but Micronaut’s documentation does not cover how to set it up with Maven and Kotlin. It went something like this.

- [Generate](https://micronaut.io/launch/) a new Micronaut 2.0 project.
- Add some REST endpoints.
- Follow the Micronaut [OpenAPI/Swagger docs](https://micronaut-projects.github.io/micronaut-openapi/1.5.1/guide/index.html) (1.5.1).

Run the server, and the OpenAPI definition file should be available at: http://localhost:8080/swagger-ui. But it’s not.

The documentation only works for Maven and Java, but does not work with Kotlin (due to kapt).

The solution is rather simple. We need to add the following line to `<annotationProcessorArgs>` of the `kotlin-maven-plugin` section of `pom.xml`:

```
<annotationProcessorArg>micronaut.openapi.views.spec=rapidoc.enabled=true,swagger-ui.enabled=true,swagger-ui.theme=flattop</annotationProcessorArg>
```

And now re-run the server with:

```
JAVA_HOME=$(/usr/libexec/java_home -v 11)
./mvnw clean mn:run
```

Finally, Swagger UI is available at: http://localhost:8080/swagger-ui. If you have any issues, you can check this [demo repository](https://github.com/uroshekic/micronaut-openapi-example/commits/master) on GitHub.
