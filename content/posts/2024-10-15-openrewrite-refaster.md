+++
title = 'OpenRewrite and Refaster'
date = 2024-10-15T19:43:26+02:00
+++

In the world of software development, maintaining clean, efficient, and error-free code is a constant challenge. Tools like Refaster and OpenRewrite are designed to help developers automate refactoring and eliminate technical debt. Here, we explore how these tools function, their integrations with Error Prone, and their unique strengths.

## Error Prone

### Google Error Prone
[Error Prone](https://errorprone.info/) (from Google) is a static analysis tool for Java that identifies common programming mistakes during compile-time. With over 500 built-in bug checks, it’s a robust resource for developers aiming to write more reliable and maintainable Java code. Although it supports Refaster templates, it does not come with any Refaster rules.
While Error Prone's support of Refaster rules is limited to statements and expressions, it is still very powerful.

### Picnic's Error Prone Support
[Error Prone Support](https://error-prone.picnic.tech/) is an extension of Google’s Error Prone made (and opinionated) by [Picnic](https://picnic.tech/).

> "It aims to improve code quality, focussing on maintainability, consistency and avoidance of common pitfalls."

It comes with 900+ Refaster rules and 40+ Error Prone bug checks.

## Refaster

Refaster is a powerful tool for automating refactoring in Java codebases. It works by defining patterns of code to find and replace using Refaster templates, which act as blueprints for these transformations.

### Refaster Templates

Refaster template is any class with multiple methods with the same return type and list of arguments with the same name.
One of the methods should be annotated `@AfterTemplate`, and every other method should be annotated with `@BeforeTemplate`.
Annotation `@BeforeTemplate` identifies the code pattern to replace, while `@AfterTemplate` defines the desired code transformation - what the code should look like after transformation.

There are also more advanced options, e.g.:

* `@AlsoNegation` handles transformations involving negated expressions, 
* you may use multiple `@BeforeTemplate` annotations, 
* define complex patterns using constructs like `Refaster.anyOf(<expr1>, <expr2>, ...)`, and 
* `@UseImportPolicy` specifies how imports should be managed during refactoring.

#### Anatomy of Refaster rule

```java
import com.google.errorprone.refaster.annotation.AfterTemplate;
import com.google.errorprone.refaster.annotation.AlsoNegation;

class Utf8Length {     // A name for the refactoring
  @BeforeTemplate      // This is what the code looks like before the refactoring
  int toUtf8Length(    // the method name is unimportant
      String string /* the string parameter stands in for any expression of type String */) {
    return /* this is here just to make the compiler happy */
        string.getBytes(StandardCharsets.UTF_8).length;
        // this is what the code looks like before the refactoring
  }

  @AfterTemplate    // replace code with this pattern
  int optimizedMethod(
      String string /* substitute in the original String expression */) {
    return Utf8.encodedLength(string);
  }
}
```

This results in the following code change:

```diff
int testUtf8EncodedLength() {
-  return "foo".getBytes(UTF_8).length;
+  return Utf8.encodedLength("foo");
}
```

#### Refaster rule example

```java
import com.google.errorprone.refaster.annotation.AfterTemplate;
import com.google.errorprone.refaster.annotation.AlsoNegation;
import com.google.errorprone.refaster.annotation.BeforeTemplate;

public class StringIsEmpty {
  @BeforeTemplate
  boolean equalsEmptyString(String string) {
    return string.equals("");
  }

  @BeforeTemplate
  boolean lengthEquals0(String string) {
    return string.length() == 0;
  }

  @AfterTemplate
  @AlsoNegation
  boolean optimizedMethod(String string) {
    return string.isEmpty();
  }
}
```

This results in the following code change:

```diff
Set<Boolean> testStringIsEmpty() {
   return ImmutableSet.of(
-      "foo".length() == 0,
-      "bar".length() <= 0,
-      "baz".length() < 1,
-      "foo".length() != 0,
-      "bar".length() > 0,
-      "baz".length() >= 1);
+      "foo".isEmpty(),
+      "bar".isEmpty(),
+      "baz".isEmpty(),
+      !"foo".isEmpty(),
+      !"bar".isEmpty(),
+      !"baz".isEmpty());
}
```


## OpenRewrite

OpenRewrite, developed by Moderne, offers an advanced automated refactoring ecosystem. It supports multiple programming languages and technologies, making it a versatile tool for eliminating technical debt across diverse codebases.

OpenRewrite supports three types of recipes:

* Declarative recipes: Simplify transformations with declarative logic.
* Refaster template recipes: Adapt Refaster’s capabilities to OpenRewrite’s ecosystem.
* Imperative recipes: Allow complex, programmatic refactoring for advanced use cases.

OpenRewrite’s recipes can analyze and refactor across multiple files, ensuring consistency and thoroughness. It maintains the original style of the code, reducing the cognitive load for developers reviewing changes.


## Error Prone vs OpenRewrite

Error Prone and OpenRewrite have some key differences presented in the table below.

| Feature                | Error Prone                       | OpenRewrite                                         |
|------------------------|-----------------------------------|-----------------------------------------------------|
| Build Integration      | Integrated into the build process | Can be integrated into the build, complex and slow  |
| Language Support       | Java (17+) only                   | Multiple languages & technologies                   |
| Refaster Features      | Full support                      | Partial support                                     |
| Advanced Refactoring   | Limited                           | Supports advanced techniques                        |
| Performance            | Fast                              | Thorough but slow                                   |
| Cross-File Refactoring | No                                | Yes                                                 |
| Style Preservation     | No                                | Yes                                                 |

It is difficult to say which tool, Error Prone or OpenRewrite, is better. They both have some advantages and disadvantages.
Setting up Error Prone with Refaster rules is more simple, it can be directly integrated into the build, it is fast, but the refactoring is limited to Refaster templates and it only supports Java 17+. Hopefully, you or your team are using Java 21+.
OpenRewrite supports advanced refactoring techniques, but its learning curve is much steeper. It can be integrated into the build process but is complex and slow. It supports multiple languages and technologies and offers cross-file refactoring and preserves style, which might be important during code review.

When selecting the tool to help you with refactoring, it would be best to weigh pros and cons of both tools and consider your company's needs and use the right tool for the job.
