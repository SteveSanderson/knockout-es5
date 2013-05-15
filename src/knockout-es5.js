/*!
    Knockout.js ES5 plugin
    (c) Steven Sanderson - MIT license
*/

(function(global) {
    'use strict';

    function track(obj) {
        return obj;
    }

    function attachToKo(ko) {
        ko.track = track;
    }

    function prepareExports() {
        // If you're using a module loader, mix in this plugin using:
        //     require('knockout-es5').attach(ko);
        // ... where ko is the instance you've already loaded.
        // Or in a non-module case in a browser, just be sure to reference the knockout.js script file
        // before you reference knockout.es5.js, and we will attach to the global instance.
        if (typeof module !== 'undefined') {
            module.exports = { attach: attachToKo };
        } else if (typeof exports !== 'undefined') {
            exports.attach = attachToKo;
        } else if ('ko' in global) {
            // Non-module case - attach to the global instance
            attachToKo(global.ko);
        }
    }

    prepareExports();

})(this);