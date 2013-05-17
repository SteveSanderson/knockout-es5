/*!
 * Knockout ES5 plugin - https://github.com/SteveSanderson/knockout-es5
 * Copyright (c) Steve Sanderson
 * MIT license
 */

(function(global, undefined) {
    'use strict';

    var objectToObservableMap,      // Lazily instantiated by getAllObservablesForObject
        arraySubscribablesMap,      // Lazily instantiated by getSubscribableForArray
        weakMapFactory;             // Created by prepareExports; implentation varies by module loader type

    function getAllObservablesForObject(obj, createIfNotDefined) {
        if (!objectToObservableMap) {
            objectToObservableMap = weakMapFactory();
        }

        var result = objectToObservableMap.get(obj);
        if (!result && createIfNotDefined) {
            result = {};
            objectToObservableMap.set(obj, result);
        }
        return result;
    }

    function track(obj, propertyNames) {
        if (!obj || typeof obj !== 'object') {
            throw new Error('When calling ko.track, you must pass an object as the first parameter.');
        }

        var ko = this;
        propertyNames = propertyNames || Object.getOwnPropertyNames(obj);

        propertyNames.forEach(function(propertyName) {
            var origValue = obj[propertyName],
                isArray = origValue instanceof Array,
                observable = ko.isObservable(origValue) ? origValue
                                              : isArray ? ko.observableArray(origValue)
                                                        : ko.observable(origValue);

            Object.defineProperty(obj, propertyName, {
                configurable: true,
                enumerable: true,
                get: observable,
                set: ko.isWriteableObservable(observable) ? observable : undefined
            });

            getAllObservablesForObject(obj, true)[propertyName] = observable;

            if (isArray) {
                notifyWhenPresentOrFutureArrayValuesMutate(ko, observable);
            }
        });

        return obj;
    }

    function notifyWhenPresentOrFutureArrayValuesMutate(ko, observable) {
        // Both on initialization, and after any future value change, intercept the array's mutators and trigger the observable
        var watchingArraySubscription = null;
        ko.computed(function () {
            if (watchingArraySubscription) {
                watchingArraySubscription.dispose();
                watchingArraySubscription = null;
            }

            var newArrayInstance = observable();
            if (newArrayInstance instanceof Array) {
                watchingArraySubscription = startWatchingArrayInstance(ko, observable, newArrayInstance);
            }
        });
    }

    function interceptArrayMutators(arrayInstance, subscribable) {
        var origPush = arrayInstance.push;
        arrayInstance.push = function() {
            var result = origPush.apply(this, arguments);
            subscribable.notifySubscribers(this);
            return result;
        };
    }

    function getSubscribableForArray(ko, arrayInstance) {
        if (!arraySubscribablesMap) {
            arraySubscribablesMap = weakMapFactory();
        }

        var subscribable = arraySubscribablesMap.get(arrayInstance);
        if (!subscribable) {
            subscribable = new ko.subscribable();
            arraySubscribablesMap.set(arrayInstance, subscribable);
            interceptArrayMutators(arrayInstance, subscribable);
        }

        return subscribable;
    }

    function startWatchingArrayInstance(ko, observable, arrayInstance) {
        var subscribable = getSubscribableForArray(ko, arrayInstance);
        return subscribable.subscribe(observable);
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
        if (typeof module !== 'undefined') {
            // Node.js case - load KO and WeakMap modules synchronously
            var ko = require('knockout'),
                WM = require('weakmap');
            attachToKo(ko);
            weakMapFactory = function() { return new WM(); };
            module.exports = ko;
        } else if ('ko' in global) {
            // Non-module case - attach to the global instance, and assume a global WeakMap instance
            attachToKo(global.ko);
            weakMapFactory = function() { return new global.WeakMap(); };
        }
    }

    prepareExports();

})(this);
