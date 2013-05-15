(function() {
    var ko = this.ko || require('./ko-loader');

    describe("Basic properties", function () {

        describe("ko.track()", function () {

            it("returns the object you passed to it", function () {
                var obj = {};
                expect(ko.track(obj)).toBe(obj);
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

        });

    });
})();