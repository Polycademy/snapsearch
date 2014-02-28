<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie10 lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie10 lt-ie9 lt-ie8 ie7"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie10 lt-ie9 ie8"> <![endif]-->
<!--[if IE 9]>         <html class="no-js lt-ie10 ie9"> <![endif]-->
<!--[if gt IE 9]><!--> <html class="no-js"> <!--<![endif]-->
    <head>

        <base href="<?= base_url() ?>" />

        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <title>SnapSearch - Search Engine Optimisation for Javascript, HTML 5 and Single Page Applications</title>
        <meta name="description" content="SnapSearch is Search Engine Optimisation for Javascript, HTML 5 and Single Page Applications. Make your sites crawlable with SnapSearch. AngularJS SEO, BackboneJS SEO, Ember SEO, jQuery SEO Knockout SEO, Meteor SEO and Sails SEO.">

        <meta name="fragment" content="!" />
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="shortcut icon" href="assets/img/favicon.ico">
        <link rel="apple-touch-icon-precomposed" href="assets/img/apple-touch-icon-precomposed.png">
        
        <link rel="stylesheet" href="assets/css/Main.css">

        <!-- TODO: Modernizr should be built in production -->
        <script src="components/modernizr/modernizr.js"></script>
        <script src="components/respond/dest/respond.min.js"></script>

        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
            ga("create", "UA-48252325-1", "<?= (ENVIRONMENT == 'development') ? 'none' : 'snapsearch.io' ?>");
        </script>

        <!-- Here we go! Weee! -->
        <script src="js/compiled/App.js" async></script>

    </head>
    <body class="ng-cloak" ng-cloak>

        <header class="navbar navbar-default navbar-static-top panel_white panel_transition_white_dark" ng-controller="HeaderCtrl">
            <div class="container">
                <div class="navbar-header">
                    <a class="logo" href="/" title="Home">
                        <img src="assets/img/snapsearch_logo.png" />
                    </a>
                    <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#header-navbar">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                </div>
                <nav class="collapse navbar-collapse" id="header-navbar">
                    <ul class="nav navbar-nav">
                        <li ng-class="{'active': $state.includes('home')}"><a ng-href="home">HOME</a></li>
                        <li ng-class="{'active': $state.includes('documentation')}"><a ng-href="documentation">DOCUMENTATION</a></li>
                        <li ng-class="{'active': $state.includes('pricing')}"><a ng-href="pricing">PRICING</a></li>
                        <li ng-class="{'active': $state.includes('about')}"><a ng-href="about">ABOUT</a></li>
                        <li><a ng-href="http://polycademy.com/blog" title="SnapSearch's blog is at Polycademy">BLOG</a></li>
                        <li><button class="btn navbar-btn" type="button" ng-click="">SIGN UP</button></li>
                        <li><button class="btn navbar-btn" type="button" ng-click="">LOG IN</button></li>
                    </ul>
                </nav>
            </div>
        </header>

        <!-- The side bar will be contained inside the container and ui-view to allow Angularjs to handle it -->
        <div class="main" ui-view autoscroll="false"></div>

        <footer class="panel panel_yellow">
            <div class="container">
                <div class="panel-body">
                    <div class="contact-information">
                        <p>Contact us via email at <a href="http://www.google.com/recaptcha/mailhide/d?k=01KxkEAwiT1nfx-BhMp7WKWg==&amp;c=iaojzr8kgOuD5gSlcb7Tdexe9yVtnztvwDbDcomRY24=" onclick="window.open('http://www.google.com/recaptcha/mailhide/d?k\07501KxkEAwiT1nfx-BhMp7WKWg\75\75\46c\75iaojzr8kgOuD5gSlcb7Tdexe9yVtnztvwDbDcomRY24\075', '', 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=500,height=300'); return false;" title="Reveal this e-mail address">enqu...@snapsearch.io</a></p>
                        <p>We’re happy to hear feedback and discuss partnerships!</p>
                        <ul class="social-list">
                            <li>FB</li>
                            <li>Twitter</li>
                            <li>Github</li>
                        </ul>
                    </div>
                    <div class="founder-information">
                        <div class="profile-object">
                            <img class="profile-image" src="assets/img/rogerqiu.png" />
                            <p class="profile-name">Roger Qiu</p>
                            <p class="profile-title">Co-Founder</p>
                            <ul class="profile-social">
                                <li>Github</li>
                                <li>Twitter</li>
                            </ul>
                        </div>
                        <div class="profile-object">
                            <img class="profile-image" src="assets/img/mustafasharara.png" />
                            <p class="profile-name">Mustafa Sharara</p>
                            <p class="profile-title">Co-Founder</p>
                        </div>
                    </div>
                    <div class="polycademy-block">
                        <p>SnapSearch is a product from</p>
                        <img src="assets/img/polycademy_logo.png" />
                        <p class="polycademy-details">Visit <a href="http://polycademy.com/">http://polycademy.com/</a> and check out our <a href="http://polycademy.com/blog">blog.</a></p>
                    </div>
                    <div class="attributions">
                        <p><em>Attributions:</em> Browser by Fernando Vasconcelos from The Noun Project | Browser by Konstantin Velichko from The Noun Project | Spider Bot by Siwat Vatatiyaporn from The Noun Project | Thought Bubble by Irene Hoffman from The Noun Project | User by Wilson Joseph from The Noun Project | Globe by Gustav Salomonsson from The Noun Project | Settings by Stefan Parnarov from The Noun Project | Cloud Database by Roman Kovbasyuk from The Noun Project | Arrows by Alex Fuller from The Noun Project | Layers by Oriol Carbonell from The Noun Project | Happy by Simple Icons from The Noun Project | Network by Nicholas Menghini from The Noun Project | Statistics by Calvin Ng from The Noun Project | Arrows by Juan Pablo Bravo from The Noun Project | Tiger by Christy Presler from The Noun Project | Tiger by Allison Dominguez from The Noun Project</p>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Client Side Templates -->
        <?
            Template::asset('application/views', 'php', array(
                'application/views/index.html', //CI stuff
                'application/views/layouts/**',  //for server side
                'application/views/errors/**', //this is for CI
                'application/views/invoices/**', //these are for pdf invoices, not HTML
                'application/views/email/**'
            ));
        ?>

        <!-- Pass in PHP variables to Javascript -->
        <script>
            var serverVars = {
                csrfCookieName: "<?= $this->config->item('cookie_prefix') . $this->config->item('csrf_cookie_name') ?>",
                sessCookieName: "<?= $this->config->item('cookie_prefix') . $this->config->item('sess_cookie_name') ?>"
            };
        </script>

    </body>
</html>