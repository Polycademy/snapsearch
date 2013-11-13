# robot_slimer servers, mark which ones are running
upstream robot_slimer {

  least_conn;
  server 127.0.0.1:8500;
  server 127.0.0.1:8501;
  server 127.0.0.1:8502;
  server 127.0.0.1:8503;
  
}

# convert www to non-www redirect 
server {

  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;

  # listen on the www host
  server_name www.snapsearch.io;

  # and redirect to the non-www host (declared below)
  return 301 $scheme://snapsearch.io$request_uri;

}

# php application
server {

  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;

  # The host name to respond to, this will require mapping hostname to ip address on dev server
  server_name snapsearch.io;

  # Path for static files
  root /www/snapsearch;

  # Index search file to serve if in a directory
  index index.php index.html index.htm;

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
  # Uncomment this to prevent mobile network providers from modifying your site 
  # include conf.d/no-transform.conf;

  # Force ssl
  # if ($ssl_protocol = "") {
  #   return 301 https://snapsearch.io$request_uri;
  # }

  # Removes the initial index or index.php
  # Changes example.com/index.php to example.com/
  # Changes example.com/index to example.com/
  if ($request_uri ~* ^(/index(.php)?)/?$) {
    rewrite ^(.*)$ / permanent;
  }

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

  # Deny requests to the snapshots cache directory
  location /snapshots/ {
    deny all;
    return 403;
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
  }

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