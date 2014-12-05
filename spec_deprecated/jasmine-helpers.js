(function() {
    var ko = this.ko || require('knockout');

    jasmine.Matchers.prototype.toHaveObservableProperty = function (propName) {
        var obj = this.actual;

        if (!isPropertyObservable(obj, propName)) {
            this.message = function() {
                if (propName in obj) {
                    return 'Expected property ' + propName + ' to be observable. It isn\'t.';
                } else {
                    return 'No such property: ' + propName;
                }
            };

            return false;
        }

        return true;
    };

    jasmine.Matchers.prototype.toHaveNonObservableProperty = function (propName) {
        return !jasmine.Matchers.prototype.toHaveObservableProperty.apply(this, arguments);
    };

    jasmine.Matchers.prototype.toHaveObservableProperties = function (propNames) {
        var self = this, acceptable = true;
        propNames.forEach(function(propName) {
            if (!jasmine.Matchers.prototype.toHaveObservableProperty.call(self, propName)) {
                acceptable = false;
            }
        });

        return acceptable;
    };

    function isPropertyObservable(obj, propName) {
        if (!(propName in obj)) {
            return false;
        }

        // The most black-box way of establishing observability is to try exercising it
        var originalValue = obj[propName],
            computed = ko.computed(function() { return obj[propName]; });
        if (computed() !== originalValue) {
            return false;
        }

        // Change the value; see that our computed detected it
        var newValue = {};
        obj[propName] = newValue;
        var isSuccess = computed() === newValue;
        obj[propName] = originalValue; // Clean back to prior state

        return isSuccess;
    }

})();