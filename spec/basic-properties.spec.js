(function() {
    var ko = this.ko || require('../src/knockout-es5.js');

    describe("Basic properties", function () {

        describe("ko.track()", function () {

            it("returns the object you passed to it", function () {
                var obj = {};
                expect(ko.track(obj)).toBe(obj);
            });

            it("throws if the param value isn't an object", function () {
                expect(function() {
                    ko.track(null);
                }).toThrow("When calling ko.track, you must pass an object as the first parameter.");
            });

            it("makes all properties observable, given no args", function() {
                var child = { },
                    obj = { a: 'string', b: 123, c: true, d: child };
                ko.track(obj);
                expect(obj.a).toBe('string');
                expect(obj.b).toBe(123);
                expect(obj.c).toBe(true);
                expect(obj.d).toBe(child);

                expect(obj).toHaveObservableProperties(['a', 'b', 'c', 'd']);
            });

            it("leaves properties enumerable and configurable", function() {
                var obj = ko.track({ a: 1 }),
                    enumeratedKeys = [];

                // Verify enumerable
                for (var key in obj) { enumeratedKeys.push(key); }
                expect(enumeratedKeys).toEqual(['a']);

                // Verify configurable
                delete obj.a;
                expect(Object.getOwnPropertyNames(obj)).toEqual([]);
            });

            it("accepts an array of property names to make observable", function() {
                var obj = ko.track({ a: 1, b: 2, c: 3 }, ['a', 'c']);
                expect(obj).toHaveObservableProperty('a');
                expect(obj).toHaveObservableProperty('c');
                expect(obj).toHaveNonObservableProperty('b');
            });

            it("retains existing observable properties, wrapping them in a getter/setter", function() {
                var observable = ko.observable(123),
                    obj = ko.track({ prop: observable });

                expect(obj.prop).toBe(123);
                expect(obj).toHaveObservableProperty('prop');

                // Check that the property's value is determined by the observable value, and vice-versa
                observable(456);
                expect(obj.prop).toBe(456);
                obj.prop = 789;
                expect(observable()).toBe(789);
            });

            it("retains existing computed properties, wrapping them in a getter", function() {
                var observable = ko.observable(123),
                    computed = ko.computed(function() { return observable() + 1; }),
                    obj = ko.track({ prop: computed });

                expect(obj.prop).toBe(124);

                // Check that the property's value is determined by the computed value
                observable(456);
                expect(obj.prop).toBe(457);

                // Also verify it's read-only
                obj.prop = 789;
                expect(obj.prop).toBe(457);
                expect(computed()).toBe(457);
            });

            it("skips properties that are already tracked", function() {
                var observable = ko.observable(123),
                    obj = ko.track({ prop: observable }, ['prop']);
                expect(ko.getObservable(obj, 'prop')).toBe(observable);

                // Now track the property again
                ko.track(obj, ['prop']);
                expect(ko.getObservable(obj, 'prop')).toBe(observable);
            });

        });

    });
})();