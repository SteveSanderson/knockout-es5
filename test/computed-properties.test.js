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
            assert.equal( timesEvaluated, 0);
            assert.equal( notifiedValues.length, 0);

            // First read triggers evaluation and hence a notification
            assert.equal( model.propPlusOne, 101);
            assert.equal( timesEvaluated, 1);
            assert.equal( notifiedValues.length, 1);
            assert.equal( notifiedValues[ 0 ], 101);

            // Subsequent reads don't trigger evaluation
            assert.equal( model.propPlusOne, 101);
            assert.equal( timesEvaluated, 1);
            assert.equal( notifiedValues.length, 1);
            assert.equal( notifiedValues[ 0 ], 101); // No additional notification

            // Modifying a dependency triggers re-evaluation and notification
            model.prop = 200;
            assert.equal( timesEvaluated, 2); // Evaluation happens regardless of read
            assert.equal( notifiedValues.length, 2);
            assert.equal( notifiedValues[ 0 ], 101);
            assert.equal( notifiedValues[ 1 ], 201);
            assert.equal( model.propPlusOne, 201);
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

            assert.equal( model.propPlusOne, 101);
            assert.equal( timesEvaluated, 1);
            assert.equal( notifiedValues.length, 1);
            assert.equal( notifiedValues[ 0 ], 101);

            // Now check the setter works
            model.propPlusOne = 200;
            assert.equal( model.prop, 199);
            assert.equal( timesEvaluated, 2);
            assert.equal( notifiedValues.length, 2);
            assert.equal( notifiedValues[ 0 ], 101);
            assert.equal( notifiedValues[ 1 ], 200);
            assert.equal( model.propPlusOne, 200);
        });

        it("requires the options object, if given, to include a get property", function() {
            assert.throw(function() {
                ko.defineProperty({}, 'propName', {});
            }, "For ko.defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called \"get\".");
        });

        it("requires the options object, if given, not to include a value property", function() {
            assert.throw(function() {
                ko.defineProperty({}, 'propName', { value: 123, get: function() { return 1; } });
            }, "For ko.defineProperty, you must not specify a \"value\" for the property. You must provide a \"get\" function.");
        });
    });

});