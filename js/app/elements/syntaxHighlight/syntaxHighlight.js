'use strict';

var fs = require('fs');
var insertCss = require('insert-css');
var hljs = require('./lib/hljs/index');
var css = fs.readFileSync(__dirname + '/lib/hljs/styles/default.css', 'utf8');
var codeBlockTemplate = fs.readFileSync(__dirname + '/templates/code_block.html', 'utf8');

insertCss(css);

/**
 * Syntax Highlight Element
 *
 * Assuming the directive is named "syntax":
 * 
 * Element Name Usage
 *     <syntax syntax-language="language">{{code}}</syntax>
 *     =>
 *     <pre syntax-language="language"><code>{{highlightedCode}}</code></pre>
 * Attribute Usage
 *     <e syntax syntax-language="language">{{code}}</syntax>
 *     =>
 *     <pre syntax syntax-language="language"><code>{{highlightedCode}}</code></pre>
 *
 * @param {string} syntaxLanguage Determines the language to highlight
 */
module.exports = ['$sce', function ($sce) {

    return {
        scope: {
            'syntaxLanguage': '@',
            'syntaxCode': '@'
        }, 
        restrict: 'AE',
        template: codeBlockTemplate, 
        transclude: true, 
        replace: true, 
        link: function (scope, element, attributes, controller, transclude) {

            //if the DOM attribute was defined, this takes precedence over transclusion
            if (typeof attributes.syntaxCode !== 'undefined') {

                attributes.$observe('syntaxCode', function (syntaxCode) {

                    if (typeof syntaxCode === 'string' && syntaxCode.length > 0) {

                        var highlightedCode = hljs.highlight(scope.syntaxLanguage, syntaxCode, true);

                        scope.highlightedCode = $sce.trustAsHtml(highlightedCode.value);

                    }

                });

            } else {

                //transclude's clone is the child elements of the directive element, it will wrap any unwrapped text nodes with the span tag
                transclude(scope, function (clone) {

                    //get the directive element's content as text, this will be the {{code}}
                    var code = angular.element(clone).text();

                    //convert the code string into a highlighted code string
                    var highlightedCode = hljs.highlight(scope.syntaxLanguage, code, true);

                    //bind to the scope as trusted HTML
                    //new lines need to be converted to <br /> since this transclusion method doesn't seem to be able to keep the newlines from the source text
                    scope.highlightedCode = $sce.trustAsHtml(highlightedCode.value.replace(/\n/g, '<br />'));

                });

            }

        }
    };

}];