(function() {
    'use strict';

    var objectToObservableMap; // Lazily instantiated
    function getAllObservablesForObject(obj, createIfNotDefined) {
        if (!objectToObservableMap) {
            objectToObservableMap = new getWeakMapConstructor()();
        }

        var result = objectToObservableMap.get(obj);
        if (!result && createIfNotDefined) {
            result = {};
            objectToObservableMap.set(obj, result);
        }
        return result;
    }

    function track(obj, propertyNames) {
        var ko = this;
        propertyNames = propertyNames || Object.getOwnPropertyNames(obj);

        propertyNames.forEach(function(propertyName) {
            var observable = ko.observable(obj[propertyName]);

            Object.defineProperty(obj, propertyName, {
                configurable: true,
                enumerable: true,
                get: observable,
                set: observable
            });

            getAllObservablesForObject(obj, true)[propertyName] = observable;
        });

        return obj;
    }

    function getObservable(obj, propertyName) {
        if (!obj || typeof obj !== 'object') {
            return null;
        }

        var allObservablesForObject = getAllObservablesForObject(obj, false);
        return (allObservablesForObject && allObservablesForObject[propertyName]) || null;
    }

    function valueHasMutated(obj, propertyName) {
        var observable = getObservable(obj, propertyName);

        if (observable) {
            observable.valueHasMutated();
        }
    }

    function attachToKo(ko) {
        ko.track = track;
        ko.getObservable = getObservable;
        ko.valueHasMutated = valueHasMutated;
    }

    function prepareExports() {
        // If you're using a Node-style module loader, mix in this plugin using:
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

})();
