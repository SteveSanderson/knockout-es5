describe('Computed properties', function () {

  describe('ko.trackComputed()', function () {

    it('adds a gettable property that notifies on change', function() {
      var model = {
        prop: 100
      };
      var timesEvaluated = 0;
      var notifiedValues = [];

      ko.defineProperty(model, 'propPlusOne', function() {
        timesEvaluated++;
        return model.prop + 1;
      });

      // Important: defineProperty can be called *before* its dependencies are tracked (because evaluation is deferred)
      // But, Since ko 3.1.0, Deferred computeds will now be evaluated on a manual subscription, if not previously evaluated
      // @see https://github.com/knockout/knockout/pull/1272
      ko.track( model, { deep: true } );

      // All subscriptions must be after ko.track()
      ko.getObservable(model, 'propPlusOne').subscribe(function( notifiedValue ) {
        notifiedValues.push( notifiedValue );
      });

      assert.equal( timesEvaluated, 1 );
      assert.equal( notifiedValues.length, 0 );

      // Since ko 3.0.0 Computed properties now notify only when their value changes
      assert.equal( model.propPlusOne, 101);
      assert.equal( timesEvaluated, 1);
      assert.equal( notifiedValues.length, 0);

      // Subsequent reads don't trigger evaluation
      assert.equal( model.propPlusOne, 101);
      assert.equal( timesEvaluated, 1);
      assert.equal( notifiedValues.length, 0); // No notification

      // Modifying a dependency triggers re-evaluation and notification
      model.prop = 200;
      assert.equal( timesEvaluated, 2); // Evaluation happens regardless of read
      assert.equal( notifiedValues.length, 1);
      assert.equal( notifiedValues[ 0 ], 201);
      assert.equal( model.propPlusOne, 201);
    });

    it('accepts an Object.defineProperty-like options object to allow further control (e.g., for a setter)', function() {
      var model = {
        prop: 100
      };
      var timesEvaluated = 0;
      var notifiedValues = [];

      ko.defineProperty(model, 'propPlusOne', {
        get: function() {
          timesEvaluated++;
          return model.prop + 1;
        },
        set: function(value) {
          model.prop = value - 1;
        }
      });

      ko.track( model, { deep: true } );

      ko.getObservable(model, 'propPlusOne').subscribe(function( notifiedValue ) {
        notifiedValues.push( notifiedValue );
      });

      assert.equal( model.propPlusOne, 101);
      assert.equal( timesEvaluated, 1);
      assert.equal( notifiedValues.length, 0);

      // Now check the setter works
      model.propPlusOne = 200;
      assert.equal( model.prop, 199);
      assert.equal( timesEvaluated, 2);
      assert.equal( notifiedValues.length, 1);
      assert.equal( notifiedValues[ 0 ], 200);
      assert.equal( model.propPlusOne, 200);
    });

    it('requires the options object, if given, to include a get property', function() {
      assert.throw(function() {
        ko.defineProperty({}, 'propName', {});
      }, 'For ko.defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called "get".');
    });

    it('requires the options object, if given, not to include a value property', function() {
      assert.throw(function() {
        ko.defineProperty({}, 'propName', { value: 123, get: function() { return 1; } });
      }, 'For ko.defineProperty, you must not specify a "value" for the property. You must provide a "get" function.');
    });
  });

});