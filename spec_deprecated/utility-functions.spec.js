(function() {
    var ko = this.ko || require('../src/knockout-es5.js');

    describe("Utility functions", function () {

        describe("ko.getObservable()", function () {

            it("returns the observable corresponding to a given property", function () {
                var obj = ko.track({ alpha: 1, beta: 2 }),
                    observable = ko.getObservable(obj, 'alpha');

                // Check we can both read and write the corresponding property value
                expect(observable()).toBe(1);

                // Also see that the observable notifies when the property value changes
                var receivedValue;
                observable.subscribe(function(newVal) { receivedValue = newVal; });
                obj.alpha = 'New value';
                expect(receivedValue).toBe('New value');
            });

            it("returns null if the given object isn't an object", function() {
                expect(ko.getObservable(null, 'anyProp')).toBe(null);
            });

            it("returns null if the given object does not have the specified property", function() {
                expect(ko.getObservable({ a: 1 }, 'anyProp')).toBe(null);
            });
        });

        describe("ko.valueHasMutated()", function() {

            it("triggers notification of the given property's observable", function() {
                var obj = ko.track({ prop: { x: 1 } }),
                    computed = ko.computed(function() {
                        return this.prop.x;
                    }, obj),
                    lastNotifiedValue = null;
                computed.subscribe(function(val) { lastNotifiedValue = val; });

                expect(computed()).toBe(1);
                expect(lastNotifiedValue).toBe(null); // Because it hasn't notified since we subscribed

                // Mutating the internals of the child object directly doesn't cause notification,
                // because the internal property isn't observable
                obj.prop.x = 2;
                expect(lastNotifiedValue).toBe(null);

                // But calling valueHasMutated does trigger notifications
                ko.valueHasMutated(obj, 'prop');
                expect(lastNotifiedValue).toBe(2);
            });

            it("does nothing if the given object isn't an object (doesn't throw)", function() {
                ko.valueHasMutated(null, 'anyProp');
            });

            it("does nothing if the given object does not have the specified property (doesn't throw)", function() {
                ko.valueHasMutated({ a: 1 }, 'anyProp');
            });

        });
    });
})();