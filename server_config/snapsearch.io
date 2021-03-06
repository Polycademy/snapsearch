# robot_slimer servers, mark which ones are running
upstream robot_slimer {

  least_conn;
  # change this to the robot ips
  server ROBOT_IP:8500;
  server ROBOT_IP:8501;
  #server ROBOT_IP:8502;
  #server ROBOT_IP:8503;
  
}

# localhost:8499 will load balance between all the robot_slimer servers
# make sure to firewall 8499 and only allow local requests
server {
  
  listen 8499;

  # No need for gzip compression, this is to be reused by PHP
  gzip off;

  # No need for tracking access to the load balancer
  access_log off;

  location / {
    proxy_pass http://robot_slimer;
  }

}

# Convert www to non-www redirect 
server {

  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;

  # listen on the www host
  server_name www.snapsearch.io;

  # SSL Settings
  keepalive_timeout 70;
  ssl_certificate      ssl/snapsearch.io.pem;
  ssl_certificate_key  ssl/snapsearch.io.key;

  # and redirect to the non-www host (declared below)
  return 301 $scheme://snapsearch.io$request_uri;

}

# Production Environment
server {

  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;

  # The host name to respond to
  server_name snapsearch.io;

  # Path for static files
  root /www/snapsearch;

  # Index search file to serve if in a directory
  index index.php index.html index.htm;

  # Force SSL
  if ($ssl_protocol = "") {
    return 301 https://$server_name$request_uri;
  }

  # SSL Settings
  keepalive_timeout 70;
  ssl_certificate      ssl/snapsearch.io.pem;
  ssl_certificate_key  ssl/snapsearch.io.key;

  #Specify a charset
  charset utf-8;

  # Include the recommended base config
  include conf.d/expires.conf;
  include conf.d/cache-busting.conf;
  include conf.d/x-ua-compatible.conf;
  include conf.d/protect-system-files.conf;
  include conf.d/cache-file-descriptors.conf;
  include conf.d/cross-domain-fonts.conf;
  include conf.d/cross-domain-ajax.conf;
  include conf.d/buffers.conf;

  # Removes the initial index or index.php
  # Changes example.com/index.php to example.com/
  # Changes example.com/index to example.com/
  if ($request_uri ~* ^(/index(.php)?)/?$) {
    rewrite ^(.*)$ / permanent;
  }

  # We need a rule to redirect the index.php back to / even when it's between example.com/index.php/controller, so it can go have 301 example.com/controller

  # Removes the index method of every controller
  # Changes example.com/controller/index to example.com/lol
  # Changes example.com/controller/index/ to example.com/lol
  if ($request_uri ~* index/?$) {
    rewrite ^/(.*)/index/?$ /$1 permanent;
  }

  # Removes any trailing slashes from uris that are not directories
  # Changes example.com/controller/ to example.com/controller
  # Thus normalising the uris
  if (!-d $request_filename) {
    rewrite ^/(.+)/$ /$1 permanent;
  }

  # Send all requests that are not going to a file, directory or symlink to front controllers
  if (!-e $request_filename) {
    rewrite ^/(.*)$ /index.php?/$1 last;
  }

  # prevent access to special directories
  location ~* ^/(?:secrets|application|robot_scripts|server_config|startup_scripts|system|vendor|components|node_modules|bin|Vagrantfile) {
    deny all;
  }

  # Fallback on front controller pattern if it cannot find files or directories matching the uri
  location / {
    try_files $uri $uri/ /index.php;
  }

  # Fast cgi to the PHP run time
  location ~* \.php$ {
    try_files $uri =404;
    include fastcgi_params;
    fastcgi_pass unix:/var/run/php5-fpm.sock;
    fastcgi_index index.php;
    fastcgi_intercept_errors on;
    fastcgi_hide_header x-powered-by;
  }

}

# Development environment
server {

  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;

  # The host name to respond to, this will require mapping hostname to ip address on dev server
  server_name dev.snapsearch.io;

  # Path for static files
  root /;

  # Index search file to serve if in a directory
  index index.php index.html index.htm;

  # Force SSL, supporting tunnelled ports
  if ($ssl_protocol = "") {
    return 301 https://$http_host$request_uri;
  }

  # SSL Settings
  keepalive_timeout 70;
  ssl_certificate      ssl/dev.snapsearch.io.crt;
  ssl_certificate_key  ssl/dev.snapsearch.io.key;

  #Specify a charset
  charset utf-8;

  # Include the recommended base config
  include conf.d/expires.conf;
  include conf.d/cache-busting.conf;
  include conf.d/x-ua-compatible.conf;
  include conf.d/protect-system-files.conf;
  # Cache file descriptors has to be disabled in development to allow for immediate changes
  # include conf.d/cache-file-descriptors.conf;
  include conf.d/cross-domain-fonts.conf;
  include conf.d/cross-domain-ajax.conf;
  include conf.d/buffers.conf;

  # Removes the initial index or index.php
  # Changes example.com/index.php to example.com/
  # Changes example.com/index to example.com/
  if ($request_uri ~* ^(/index(.php)?)/?$) {
    rewrite ^(.*)$ / permanent;
  }

  # We need a rule to redirect the index.php back to / even when it's between example.com/index.php/controller, so it can go have 301 example.com/controller

  # Removes the index method of every controller
  # Changes example.com/controller/index to example.com/lol
  # Changes example.com/controller/index/ to example.com/lol
  if ($request_uri ~* index/?$) {
    rewrite ^/(.*)/index/?$ /$1 permanent;
  }

  # Removes any trailing slashes from uris that are not directories
  # Changes example.com/controller/ to example.com/controller
  # Thus normalising the uris
  if (!-d $request_filename) {
    rewrite ^/(.+)/$ /$1 permanent;
  }

  # Send all requests that are not going to a file, directory or symlink to front controllers
  if (!-e $request_filename) {
    rewrite ^/(.*)$ /index.php?/$1 last;
  }

  # prevent access to special directories
  location ~* ^/(?:secrets|application|robot_scripts|server_config|startup_scripts|system|vendor|components|node_modules|bin|Vagrantfile) {
    deny all;
  }

  # Fallback on front controller pattern if it cannot find files or directories matching the uri
  location / {
    try_files $uri $uri/ /index.php;
  }

  # Fast cgi to the PHP run time
  location ~* \.php$ {
    try_files $uri =404;
    include fastcgi_params;
    fastcgi_pass unix:/var/run/php5-fpm.sock;
    fastcgi_index index.php;
    fastcgi_intercept_errors on;
    fastcgi_hide_header x-powered-by;

    # overwrite the default 32 32K set by buffers.conf
    # double the possible response size to 2MB
    fastcgi_buffers 64 32k;
    # reading timeout at 60s, this is useless if the max_execution_time isn't at least 60s
    fastcgi_read_timeout 80s;
    fastcgi_connect_timeout 75s;
    fastcgi_send_timeout 80s;
    # note that http clients are usually 30s max timeout
    # but it's better to allow the server to finish processing

  }
  
}