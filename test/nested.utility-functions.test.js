describe('Utility functions', function () {

  describe('ko.getObservable()', function () {

    it('returns the observable corresponding to a given property', function () {
      var obj = ko.track({ alpha: 1, beta: 2 }, { deep: true }),
        observable = ko.getObservable(obj, 'alpha');

      // Check we can both read and write the corresponding property value
      assert.equal(observable(), 1);

      // Also see that the observable notifies when the property value changes
      var receivedValue;
      observable.subscribe(function(newVal) { receivedValue = newVal; });
      obj.alpha = 'New value';
      assert.equal(receivedValue, 'New value');
    });

    it('returns null if the given object isn\'t an object', function() {
      assert.isNull( ko.getObservable(null, 'anyProp') );
    });

    it('returns null if the given object does not have the specified property', function() {
      assert.isNull( ko.getObservable({ a: 1 }, 'anyProp') );
    });
  });

  describe('ko.valueHasMutated()', function() {

    it('triggers notification of the given property\'s observable', function() {
      var obj = ko.track({ prop: { x: 1 } }, { deep: true });
      var computed = ko.computed(function() {
        return this.prop.x;
      }, obj);
      var lastNotifiedValue = null;
      computed.subscribe(function(val) { lastNotifiedValue = val; });

      assert.equal(computed(), 1);
      assert.equal(lastNotifiedValue, null); // Because it hasn't notified since we subscribed

      // Mutating the internals of the child object directly
      obj.prop.x = 2;
      assert.equal(lastNotifiedValue, 2);

      // Check again
      ko.valueHasMutated(obj, 'prop');
      assert.equal(lastNotifiedValue, 2);
    });

    it('does nothing if the given object isn\'t an object (doesn\'t throw)', function() {
      assert.doesNotThrow(function(){
        ko.valueHasMutated(null, 'anyProp');
      });
    });

    it('does nothing if the given object does not have the specified property (doesn\'t throw)', function() {
      assert.doesNotThrow(function(){
        ko.valueHasMutated({ a: 1 }, 'anyProp');
      });
    });

  });
});