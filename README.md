Required:

sudo apt-get install -y python-software-properties python g++
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y make libc6 libstdc++6 libgcc1 xvfb git python-setuptools python-pip curl nginx php5-fpm mysql-server php5-mysql php5-json php5-mcrypt php5-cli php5-curl nodejs cron

(MySQL config: https://www.digitalocean.com/community/articles/how-to-install-linux-nginx-mysql-php-lemp-stack-on-ubuntu-12-04)
(PHP FPM config: http://arstechnica.com/information-technology/2012/12/web-served-part-3-bolting-on-php-with-php-fpm/)
(PHP-FPM Mcrypt Fix http://askubuntu.com/a/360657 | sudo ln -s /etc/php5/conf.d/mcrypt.ini /etc/php5/mods-available/mcrypt.ini | sudo php5enmod mcrypt | sudo service php5-fpm restart)
Make sure the `session_save_path()` is writable!

If SlimerJS doesn't start, make sure firefox is installed

easy_install supervisor
easy_install httpie

npm install -g bower
npm install -g grunt-cli

COMPOSER:
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

Robot Service (can be modified inside supervisord.conf in robot_scripts, but make sure to update the NGINX configuration to load balance more than 4 robot services):

Change index.php development to production if necessary.

FOR PHP:
Setup firewall once server is up!

apt-get install ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow www
ufw allow https
ufw allow imap
ufw allow imaps
ufw allow smtp
ufw allow ftp
ufw allow sftp
ufw allow git
echo "y" | ufw enable

SSH tunnelling, then you can access the database!

ssh -L LOCALPORT:127.0.0.1:REMOTEPORT USER@IP


Improvements
------------

Load Balancer: Use http://zef.me/4502/message-queue-based-load-balancing and https://developer.mozilla.org/en-US/docs/WebAPI/TCP_Socket
Server Admin: Use Dokku and Vagrant
Process Management: Test out memmon.py, write a corresponding one for HTTPok in PHP
SlimerJS: Modularise and cleanup the code. Also need some core improvements for some bugs (navigationLocked)
Validation: Remote filesize and mimetype (technology not available)
Framework: Transition to Slim and custom framework
Logging: Federate the logging systems, actually a PHP binary that accepts logging details would be good
Statuspage: Similar to the logging, but testing the API aswell. Specifically it shows the limits.
Mobilise: Something to set the number of robot servers to setup AND set index.php to production/development, integrate with Grunt build
Tests: API tests functional tests using Codeception

Combine onCallback with the custom callback to allow users to call back to SlimerJS. Perhaps a wait timer is good too! This needs to be resolved automatically if the user forgot to do so. So if no custom callback, this will not be set. If there is a custom callback, they need to window.callPhantom(). Which would resolve to true, so this just delays the async further if need be. https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#wiki-webpage-onCallback On SlimerJS is it window.callSlimer()?

How to deal with 404s:

1. 404s for random URLs:

Server side routing needs to copy the rules of client side routing. So that when a URL that doesn't match the client and server side routing, it's treated as a 404 page from the server side. This can be done like this. The server side returns a 404 status code, but leaves the routing to the client side. The client side has a other routing rule, and in this case it will return a 404 page from the client side.
This problem is a problem for machine and human clients. So this solves it for the machine and human clients.
This is easy to keep synchronised.

2. 404s for missing objects

This is a problem for mainly machine clients.
When an object is missing based on a dynamic page that uses ids. The server side cannot know if the object is missing unless it implements object checking logic. This becomes harder to synchronise.
On the client side, your object checking logic will check if the object exists, and if it doesn't it'll show a dynamic 404 state on the page. However by this time, a 200 status code has already been returned from the server side.
In this case, a human client will see a 404 page easily and not be bothered by the 200 status code. However for machine clients such as search engines, this is a big problem. The solution to this, is to implement the object checking logic, OR use snapsearch's meta tag commands.

Snapsearch needs to check for SnapSearch specific meta tags. These meta tags can specify specific headers or status codes to return instead of the normal ones.
If the meta tags are empty, SnapSearch won't use them. Only if they are filled and fit the HTTP spec.
Just like the google meta tags!
These meta tags can be modified by the client side javascript during runtime and changed just after the object asynchronous requests is finished.

Could mix with onCallback.

Now synchronising routes is fairly easy, could even use a independent configuration file.
How about synchronising object checking logic?
Is there an easy way?

Currently returning status code of the first page. However it's also following redirects.
We need to send the status code for the last redirected page.
This can be done with the client side redirects easily.
But header redirects needs to be checked with the onResourceReceived...
Perhaps it can be checked with a 301/302 status code.
Basically when there is a unbroken sequence of 301/302 in the onResourceReceived, we need to get the last
one's http status code! This will resolve header redirects. This is the last code that is not a 302 or 301.
Imagine: First Request -> 301 -> 302 -> 301 -> 200 
The 200 is what we want.
This would work for header redirects and any early synchronous client side redirects.
It will not work for late client side redirects. 

onNavigationRequested won't tell us what the status code is of the resource being received.

We will need some way bridging the id between onNavigationRequested and onResourceReceived...
Perhaps based on the URl...

Test Cron + HTTP Basic Auth for the library + Build process for the front end