(function() {
    var ko = this.ko || require('../src/knockout-es5.js');

    describe("Computed properties", function () {

        describe("ko.trackComputed()", function () {

            it("adds a gettable property that notifies on change", function() {
                var model = { prop: 100 },
                    timesEvaluated = 0,
                    notifiedValues = [];
                ko.defineProperty(model, 'propPlusOne', function() { timesEvaluated++; return model.prop + 1; });
                ko.getObservable(model, 'propPlusOne').subscribe(function(notifiedValue) { notifiedValues.push(notifiedValue); });

                // Important: defineProperty can be called *before* its dependencies are tracked (because evaluation is deferred)
                ko.track(model);

                // Evaluation should be deferred until first read
                expect(timesEvaluated).toBe(0);
                expect(notifiedValues).toEqual([]);

                // First read triggers evaluation and hence a notification
                expect(model.propPlusOne).toBe(101);
                expect(timesEvaluated).toBe(1);
                expect(notifiedValues).toEqual([101]);

                // Subsequent reads don't trigger evaluation
                expect(model.propPlusOne).toBe(101);
                expect(timesEvaluated).toBe(1);
                expect(notifiedValues).toEqual([101]); // No additional notification

                // Modifying a dependency triggers re-evaluation and notification
                model.prop = 200;
                expect(timesEvaluated).toBe(2); // Evaluation happens regardless of read
                expect(notifiedValues).toEqual([101, 201]);
                expect(model.propPlusOne).toBe(201);
            });

            it("accepts an Object.defineProperty-like options object to allow further control (e.g., for a setter)", function() {
                var model = { prop: 100 },
                    timesEvaluated = 0,
                    notifiedValues = [];
                ko.defineProperty(model, 'propPlusOne', {
                    get: function() { timesEvaluated++; return model.prop + 1; },
                    set: function(value) { model.prop = value - 1; }
                });
                ko.getObservable(model, 'propPlusOne').subscribe(function(notifiedValue) { notifiedValues.push(notifiedValue); });
                ko.track(model);

                expect(model.propPlusOne).toBe(101);
                expect(timesEvaluated).toBe(1);
                expect(notifiedValues).toEqual([101]);

                // Now check the setter works
                model.propPlusOne = 200;
                expect(model.prop).toBe(199);
                expect(timesEvaluated).toBe(2);
                expect(notifiedValues).toEqual([101, 200]);
                expect(model.propPlusOne).toBe(200);
            });

            it("requires the options object, if given, to include a get property", function() {
                expect(function() {
                    ko.defineProperty({}, 'propName', {});
                }).toThrow(Error("For ko.defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called \"get\"."));
            });

            it("requires the options object, if given, not to include a value property", function() {
                expect(function() {
                    ko.defineProperty({}, 'propName', { value: 123, get: function() { return 1; } });
                }).toThrow(Error("For ko.defineProperty, you must not specify a \"value\" for the property. You must provide a \"get\" function."));
            });
        });

    });
})();