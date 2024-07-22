---
title: Installing Composer in the official PHP Docker image
date: 2020-11-14T21:42:05+02:00
categories: [Software Engineering]
tags: [PHP, Software Engineering]
---

[Composer](https://getcomposer.org/) is a dependency management tool for PHP that has been around for almost 8 years now, but it’s still not included in the [official Docker images](https://hub.docker.com/_/php).

Composer recommends to automate the install using [their script](https://getcomposer.org/doc/faqs/how-to-install-composer-programmatically.md). It needs to be downloaded, but the `php:7.4-apache` image does not contain `wget`.

```
FROM php:7.4-apache

RUN apt update && apt-get install -y wget
RUN wget https://raw.githubusercontent.com/composer/getcomposer.org/76a7060ccb93902cd7576b67264ad91c8a2700e2/web/installer -O - -q | php -- --quiet --version=1.10.15
RUN mv composer.phar /usr/local/bin/composer

# Add your project code to Docker image here
# ENV APP_BASE_DIR=/var/www/app \
#     APACHE_DOCUMENT_ROOT=/var/www/app/web
# ADD . $APP_BASE_DIR
# And change directory to your code
# cd $APP_BASE_DIR

RUN composer install
```

We also want to use [composer globally](https://getcomposer.org/doc/00-intro.md#globally) that’s why we added `mv composer.phar /usr/local/bin/composer`. Now we can execute `composer` command from anywhere.

The dependencies are now installed successfully, but we still get the following warning:

```
As there is no 'unzip' command installed zip files are being unpacked using the PHP zip extension.
This may cause invalid reports of corrupted archives. Besides, any UNIX permissions (e.g. executable) defined in the archives will be lost.
Installing 'unzip' may remediate them.
```

To fix the possibly corrupted archives and UNIX permissions, we need to install the unzip tool. We can also optimize the image to use only one layer to install Composer, and one layer to install dependencies.

```
FROM php:7.4-apache

# Install Composer
RUN apt update && apt-get install -y wget unzip && \
    wget https://raw.githubusercontent.com/composer/getcomposer.org/76a7060ccb93902cd7576b67264ad91c8a2700e2/web/installer -O - -q | php -- --quiet --version=1.10.15 && \
    mv composer.phar /usr/local/bin/composer

# Add your project code to Docker image here
# ENV APP_BASE_DIR=/var/www/app \
#     APACHE_DOCUMENT_ROOT=/var/www/app/web
# ADD . $APP_BASE_DIR

RUN cd $APP_BASE_DIR && composer install
```

Finally, we have our Dockerfile ready to integrate the build of our app into a CI/CD pipeline.
