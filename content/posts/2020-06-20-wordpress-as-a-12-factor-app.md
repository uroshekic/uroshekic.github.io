---
title: WordPress as a 12-factor app
date: 2020-06-20T22:32:14+02:00
categories: [Software Engineering]
tags: [PHP, Software Engineering]
---

PHP was the first programming (scripting, yes, I know) language that I learned. I had some experience using and managing WordPress, I also liked its features, and I knew that all my needs would already be covered by some plugin of the WordPress ecosystem.

Still, I almost didn’t use WordPress to power my blog. I wanted my blog to be versioned (in Git), packaged in a Docker container, and cloud ready. Some people might call it over-engineering, but I think it’s just good practice.

I didn’t like how WordPress is structured, how installing plugins and themes is handled. Everything in the same folder, plugins are installed by clicking, there is no way of committing your code to git, making multiple changes, and then deploying everything to production later – without breaking the site. Or so I thought!

Fortunately, WordPress’ Core supports customization of the structure of your project, which makes it work with PHP’s dependency management system – Composer. There are multiple approaches to it, but I’ve decided to use [Bedrock](https://roots.io/bedrock/), because it nicely follows the principles of the [12-factor app](https://12factor.net/).

Let’s start!

WordPress [requires](https://wordpress.org/support/article/requirements/):

- PHP 7.3+, and
- MySQL version 5.6+ or MariaDB version 10.1+. 

Additionally, it is recommended to run PHP behind an [Apache](https://httpd.apache.org/) or [nginx](https://nginx.org/) HTTP server.

We will use PHP 7.3 with Apache packaged in a Docker image, and another image for MySQL.

I was surprised to see that PHP 7.3.11 is already included in the macOS Catalina (10.15.4). I decided to run the development database in [Docker](https://docs.docker.com/) (btw: I’m a huge Docker fan).

All I had to install to begin with development was Composer by running `homebrew install composer`.

Before we begin, let’s verify that we have the right PHP version installed by running: `php -v`. And verify that Composer is installed: `composer -V`.

Let’s create a new WordPress project based on roots/bedrock in the current folder:

```
composer create-project roots/bedrock .
```

Let’s spin up a MySQL 5.6 server with Docker:

```
docker run \
   --name mysql-blog \
   -e MYSQL_ROOT_PASSWORD=my-secret-pw \
   -e MYSQL_DATABASE=wp-blog \
   -p 3306:3306 \
   -d \
   mysql:5.6
```

NOTE: For production purposes, a non-root database user should be used.

If you wish to persist data on local disk add the following flag `-v /absolute/path/to/mysql-data:/var/lib/mysql` to the command above.

Edit .env file to connect to the created database, configure URLs and generate salts:

```
DB_HOST='127.0.0.1'
DB_NAME='wp-blog'
DB_USER='root'
DB_PASSWORD='my-secret-pw'
…
WP_ENV='development'
WP_HOME='http://my.blog'
WP_SITEURL="${WP_HOME}/wp"
WP_DEBUG_LOG=../debug.log
```

NOTE: It is important to set 127.0.0.1 as database host (DB_HOST) instead of localhost, because PHP’s MySQL library would try to connect to the mysql.socket instead of making a TCP connection to localhost.

Run the project with PHP’s built-in web server. I recommend executing this command in another Terminal/tab so you can execute other commands, but note that your working directory must be the project folder:

```
php -S localhost:8000 -t web
```

Now, open [https://urosh.net](https://urosh.net) in browser.

This will redirect us to WordPress Installation process, where we select a language, and enter the desired administrator username, password and email along with the site URL. Installation is now complete.

Plugins and themes can be easily installed using the [WordPress Packagist](https://wpackagist.org/) repository. Simply run one of the following commands with the correct plugin/theme name:

```
composer require wpackagist-plugin/<plugin name>
composer require wpackagist-theme/<theme name>:*
```

We will install two plugins. [Jetpack](https://wordpress.org/plugins/jetpack/) plugin to secure the blog, and [Akismet](https://wordpress.org/plugins/akismet/) plugin to defend against spam.

```
composer require wpackagist-plugin/jetpack
composer require wpackagist-plugin/akismet
```

We still need to manually activate the plugin (or theme) in administration panel. It would be great if plugins could also be activated and configured via files, but a line has to be drawn somewhere and we have to be thankful to the WordPress community for getting us this far. 🙂

So far, we have set up WordPress with Composer locally, and installed plugins with a dependency manager. In the next part, we will build a Docker image so our blog will be ready to be deployed to the cloud.

Let’s create a file called Dockerfile:

```
FROM php:7.3-apache

EXPOSE 80

# Fix "Fatal error: Uncaught Error: Call to undefined function mysql_connect() in /var/www/wordpress/web/wp/wp-includes/wp-db.php"
RUN apt-get update && \
    apt-get install -y libzip-dev zlib1g-dev && \
    docker-php-ext-install zip mysqli pdo pdo_mysql && \
    a2enmod rewrite

ENV WP_BASE_DIR=/var/www/wordpress \
    APACHE_DOCUMENT_ROOT=/var/www/wordpress/web

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf && \
    sed -ri -e 's!/var/www/!${WP_BASE_DIR}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

ADD . $WP_BASE_DIR
```

Before building the Docker image, we need to edit the .env file to change the database hostname.

Let’s build a Docker image with the following command:

```
docker build -t my-blog .
```

Finally, let’s run the image with:

```
docker run --name my-blog -p 80:80 my-blog
```

WordPress should now be available at: http://localhost/. The created Docker image is now ready to be pushed to a repository, and then it can be deployed to the cloud.

NOTE: If you want a smaller image, take a look at [webdevops/php-apache](https://hub.docker.com/r/webdevops/php-apache/tags).

For easier testing and development, we can use Docker Compose. Create a docker-compose.yaml file:

```
version: '2'

networks:
  blog-network:
    driver: bridge

services:
  db:
    image: mysql:5.6
    networks:
      - blog-network
    ports:
      - 3306:3306
    volumes:
      - /your/path/to/blog/mysql-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=my-secret-pw
      - MYSQL_DATABASE=wp-blog
  wordpress:
    image: wordpress
    networks:
      - blog-network
    ports:
      - 80:80
    depends_on:
      - db
    environment:
      DATABASE_URL: 'mysql://root:my-secret-pw@db:3306/wp-blog'
      WP_ENV: 'development'
      WP_HOME: 'http://localhost'
      WP_SITEURL: "http://localhost/wp"
      WP_DEBUG_LOG: '../debug.log'
```

and run the project with:

```
docker-compose up -d
```

In this blog post, we have created a new WordPress project based on Bedrock WordPress and packaged it in a Docker image, which is ready to be deployed to the cloud, and conforms more to the definition of a [12-factor app](https://12factor.net/).
