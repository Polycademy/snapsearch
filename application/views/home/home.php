<script type="text/ng-template" id="home.html">
    <div class="introduction panel panel_lego panel_transition_white_dark">
        <div class="container">
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="page-header">
                            <h1>SnapSearch is Search Engine Optimisation for Javascript, HTML 5 and Single Page Applications</h1>
                            <h3>Make your sites crawlable with SnapSearch!</h3>
                            <button class="call-to-action btn btn-primary" type="button">
                                <h4 class="call-to-action-text">Get Started for Free<br /><small>No Credit Card Required</small></h4>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="code-group clearfix" ng-controller="CodeGroupCtrl">
                            <ul class="nav nav-tabs">
                                <li class="tab" ng-class="{'active': activeCode == 'php'}">
                                    <button class="btn" ng-click="changeCode('php')">PHP</button>
                                </li>
                                <li class="tab" ng-class="{'active': activeCode == 'ruby'}">
                                    <button class="btn" ng-click="changeCode('ruby')">Ruby</button>
                                </li>
                                <li class="tab" ng-class="{'active': activeCode == 'node.js'}">
                                    <button class="btn" ng-click="changeCode('node.js')">Node.js</button>
                                </li>
                                <li class="tab" ng-class="{'active': activeCode == 'python'}">
                                    <button class="btn" ng-click="changeCode('python')">Python</button>
                                </li>
                            </ul>
                            <div class="tab-content clearfix" ng-switch="activeCode">
                                <div class="tab-panel" ng-switch-when="php">
                                    <p>Installation:</p>
                                    <syntax syntax-language="bash">composer require snapsearch/snapsearch-client-php:1.0.0</syntax>
                                    <p>Usage:</p>
                                    <syntax class="code-usage" syntax-language="php">//add content here, it needs to be encoded</syntax>
                                    <a class="btn btn-primary btn-fork pull-right" href="https://github.com/SnapSearch/SnapSearch-Client-PHP" target="_blank">
                                        <img src="assets/img/github_mark.png" />
                                        Fork me on Github
                                    </a>                                </div>
                                <div class="tab-panel" ng-switch-when="ruby">
                                    <p>Installation:</p>
                                    <syntax syntax-language="bash">gem install snapsearch-client-ruby</syntax>
                                    <p>Usage:</p>
                                    <syntax class="code-usage" syntax-language="ruby">#add content here, it needs to be encoded</syntax>
                                    <a class="btn btn-primary btn-fork pull-right" href="https://github.com/SnapSearch/SnapSearch-Client-Ruby" target="_blank">
                                        <img src="assets/img/github_mark.png" />
                                        Fork me on Github
                                    </a>
                                </div>
                                <div class="tab-panel" ng-switch-when="node.js">
                                    <p>Installation:</p>
                                    <syntax syntax-language="bash">npm install snapsearch-client-node:1.0.0</syntax>
                                    <p>Usage:</p>
                                    <syntax class="code-usage" syntax-language="javascript">//add content here, it needs to be encoded</syntax>
                                    <a class="btn btn-primary btn-fork pull-right" href="https://github.com/SnapSearch/SnapSearch-Client-Node" target="_blank">
                                        <img src="assets/img/github_mark.png" />
                                        Fork me on Github
                                    </a>
                                </div>
                                <div class="tab-panel" ng-switch-when="python">
                                    <p>Installation:</p>
                                    <syntax syntax-language="bash">pip install snapsearch-client-python</syntax>
                                    <p>Usage:</p>
                                    <syntax class="code-usage" syntax-language="python">#comment</syntax>
                                    <a class="btn btn-primary btn-fork pull-right" href="https://github.com/SnapSearch/SnapSearch-Client-Python" target="_blank">
                                        <img src="assets/img/github_mark.png" />
                                        Fork me on Github
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="framework-support panel panel_white panel_transition_white_dark">
        <div class="container">
            <div class="panel-heading">
                <h2 class="panel-title">SnapSearch works with...</h2>
            </div>
            <div class="panel-body">
                <div class="row">
                    <div class="col-xs-6 col-sm-4 col-md-3">
                        <img class="framework-logo" src="assets/img/sails_logo.png" />
                    </div>
                    <div class="col-xs-6 col-sm-4 col-md-3">
                        <img class="framework-logo" src="assets/img/angular_logo.png" />
                    </div>
                    <div class="col-xs-6 col-sm-4 col-md-3">
                        <img class="framework-logo" src="assets/img/js_logo.png" />
                    </div>
                    <div class="col-xs-6 col-sm-4 col-md-3">
                        <img class="framework-logo" src="assets/img/jquery_logo.png" />
                    </div>
                    <div class="col-xs-6 col-sm-4 col-md-3">
                        <img class="framework-logo" src="assets/img/backbone_logo.png" />
                    </div>
                    <div class="col-xs-6 col-sm-4 col-md-3">
                        <img class="framework-logo" src="assets/img/ember_logo.png" />
                    </div>
                    <div class="col-xs-6 col-sm-4 col-md-3">
                        <img class="framework-logo" src="assets/img/knockout_logo.png" />
                    </div>
                    <div class="col-xs-6 col-sm-4 col-md-3">
                        <img class="framework-logo" src="assets/img/meteor_logo.png" />
                    </div>
                </div>
            </div>
            <div class="panel-footer">
                <h2 class="panel-title">We’re 100% framework agnostic!</h2>
            </div>
        </div>
    </div>
    <div class="problem-solution panel panel_lego panel_transition_yellow_dark">
        <div class="container">
            <div class="panel-heading">
                <h2 class="panel-title">Why use SnapSearch?</h2>
            </div>
            <div class="panel-body">
                <h3 class="problem-title">The Problem</h3>
                <div class="problem row">
                    <div class="col-md-6">
                        <img src="assets/img/user_coding.png" />
                        <div class="problem-explanation">
                            <p>You’ve coded up a javascript enhanced or single page application using the latest HTML5 technologies. Using a modern browser, you can see all the asynchronous or animated content appear.</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <img src="assets/img/spider_reading.png" />
                        <div class="problem-explanation">
                            <p>Search engines however see nothing. This is because search engine robots are simple HTTP clients that cannot execute advanced javascript. They do not execute AJAX, and thus cannot load asynchronous resources, nor can they activate javascript events that make your application dynamic and user friendly.</p>
                        </div>
                    </div>
                </div>
                <h3 class="solution-title">Our Solution</h3>
                <div class="solution row">
                    <div class="col-md-3">
                        <img src="assets/img/globe.png" />
                        <div class="solution-explanation">
                            <p class="request-pipe">Client initiates an HTTP Request. This client can be search engine robot or a social network crawler such as Facebook or Twitter.</p>
                            <p class="response-pipe">The client will now receive the true full representation of your site’s content even though it cannot execute javascript.</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <img src="assets/img/application.png" />
                        <div class="solution-explanation">
                            <p class="request-pipe">Your application using our supplied middleware detects whether the client cannot execute javascript. The middleware then initiates a snapshot request to SnapSearch. The request contains the client request URL, authentication credentials and custom API parameters.</p>
                            <p class="response-pipe">Once the response is received, it outputs your page’s status code, HTML content and any HTTP response headers.</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <img src="assets/img/cloud_service.png" />
                        <div class="solution-explanation">
                            <p class="request-pipe">SnapSearch receives the request and commands our load balanced browser workers to scrape your site based on the client request URL while executing your javascript. Your content will be cached for future requests.</p>
                            <p class="response-pipe">A response is constructed containing the resulting status code, HTML content, headers and optionally a screenshot of your resource. This is returned to your application’s middleware.</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <img src="assets/img/cache.png" />
                        <div class="solution-explanation">
                            <p class="request-pipe">A cache of the content is securely and safely stored on Amazon S3. All cached content are distinguished by a parameter checksum, so the same URL with different API parameters will be stored independently.</p>
                            <p class="response-pipe">If a resource has been cached before, SnapSearch will return the cached content. All cached content have adjustable cache lifetime.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="features panel panel_yellow panel_transition_white_yellow">
        <div class="container">
            <div class="panel-heading">
                <h2 class="panel-title">Features</h2>
            </div>
            <div class="panel-body">
                <div class="row" equalise-heights=".features .feature-object">
                    <div class="feature-object col-sm-6 col-md-4 col-lg-3">
                        <h3 class="feature-title">On Demand</h3>
                        <img class="feature-image" src="assets/img/snapsearch_bolt.png" />
                        <p class="feature-explanation">Snapshots are created on the fly as you request it from the API. Resources are cached for a default time of 24 hrs.</p>
                    </div>
                    <div class="feature-object col-sm-6 col-md-4 col-lg-3">
                        <h3 class="feature-title">Real Browser Workers</h3>
                        <img class="feature-image" src="assets/img/firefox.png" />
                        <p class="feature-explanation">Our scrapers are powered by nightly versions of Mozilla Firefox. We’re able to run cutting edge HTML5 techniques. Our scrapers evolve as the web evolves.</p>
                    </div>
                    <div class="feature-object col-sm-6 col-md-4 col-lg-3">
                        <h3 class="feature-title">Google Approved</h3>
                        <img class="feature-image" src="assets/img/google.png" />
                        <p class="feature-explanation">SnapSearch complies with the AJAX Crawling Specification by Google. SnapSearch responds with the same content as a normal user would see, so you’re not in violation of cloaking rules.</p>
                    </div>
                    <div class="feature-object col-sm-6 col-md-4 col-lg-3">
                        <h3 class="feature-title">Powerful Middleware</h3>
                        <img class="feature-image" src="assets/img/middleware.png" />
                        <p class="feature-explanation">Our middleware supports a variety of server setups and detection algorithms in order to determine search engine clients. Currently they can detect 196 robots. They can be configured to support custom clients.</p>
                    </div>
                    <div class="feature-object col-sm-6 col-md-4 col-lg-3">
                        <h3 class="feature-title">Flexibility</h3>
                        <img class="feature-image" src="assets/img/flexibility.png" />
                        <p class="feature-explanation">The API supports image snapshots, soft 404s, following redirects, custom headers and status code, cache time settings, width and height of the scraper (useful for infinite scrolling), and custom javascript callbacks that are evaled on the page.</p>
                    </div>
                    <div class="feature-object col-sm-6 col-md-4 col-lg-3">
                        <h3 class="feature-title">Pay for What You Use</h3>
                        <img class="feature-image" src="assets/img/tiger_face.png" />
                        <p class="feature-explanation">You only pay for each usage of the API that initiates a fresh snapshot. There is no minimum monthly fee. Requests hitting the cache is free, and storage of the cache is free.</p>
                    </div>
                    <div class="feature-object col-sm-6 col-md-4 col-lg-3">
                        <h3 class="feature-title">Load Balanced</h3>
                        <img class="feature-image" src="assets/img/load_balanced.png" />
                        <p class="feature-explanation">SnapSearch was built as a fault-tolerant load balanced service. We can handle small and big sites. Scrapers are horizontally scaled according to the number of users.</p>
                    </div>
                    <div class="feature-object col-sm-6 col-md-4 col-lg-3">
                        <h3 class="feature-title">Analytics</h3>
                        <img class="feature-image" src="assets/img/analytics.png" />
                        <p class="feature-explanation">Analytics shows how many requests come from your API key, and what their request parameters are. You can quickly understand your monthly usage, and proximity to the monthly limit. All cached content can be manually refreshed or deleted.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="demo panel panel_white panel_transition_white_yellow">
        <div class="container">
            <div class="panel-heading">
                <h2 class="panel-title">Try our demo here</h2>
            </div>
            <div class="panel-body">
                <form class="demo-form" ng-controller="DemoCtrl" name="demoForm">
                    <div 
                        class="form-group" 
                        ng-class="{
                            'has-error': !!demoForm.url.$error.invalidUrl && demoForm.url.$dirty
                        }"
                    >
                        <div class="input-group input-group-lg">
                            <input 
                                class="form-control" 
                                type="url" 
                                name="url" 
                                ng-model="demo.url" 
                                required 
                                ui-validate="{invalidUrl: 'validateUrl($value)'}" 
                                placeholder="http://your-site.com/" 
                            />
                            <span class="input-group-btn">
                                <button 
                                    class="btn btn-primary" 
                                    type="submit" 
                                    ng-disabled="demoForm.$invalid" 
                                    ng-click="submit(demo)" 
                                >
                                    Scrape
                                </button>
                            </span>
                        </div>
                    </div>
                    <div class="demo-output" ng-switch="requestingDemoService">
                        <p class="demo-explanation" ng-switch-when="never">For best results, try it on a single page application! Make sure to add (http(s)://) to the URL.</p>
                        <img class="demo-loading" ng-switch-when="started" src="assets/img/loading.gif" />
                        <pre class="demo-response" ng-switch-when="finished"><code>{{demoServiceResponse}}</code></pre>
                    </div>
                </form>
            </div>
        </div>
    </div>
</script>