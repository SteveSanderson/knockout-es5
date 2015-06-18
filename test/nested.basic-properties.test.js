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

function toHaveObservableProperty (obj, propName) {
  if (!isPropertyObservable(obj, propName)) {
    if (propName in obj) {
      return {
        message: 'Expected property ' + propName + ' to be observable. It isn\'t.'
      };
    } else {
      return {
        message: 'No such property: ' + propName
      };
    }
  }

  return true;
}

function toHaveNonObservableProperty ( obj, propName ) {
  return toHaveObservableProperty(obj, propName) !== true;
}

function toHaveObservableProperties (obj, propNames) {
  var acceptable = true;
  propNames.forEach(function( propName ) {
    if (toHaveObservableProperty(obj, propName) === false) {
      acceptable = false;
    }
  });

  return acceptable;
}

describe('Basic properties', function () {

  describe('ko.track()', function () {

    it('returns the object you passed to it', function () {
      var obj = {};
      assert.equal(ko.track(obj, { deep: true }), obj);
    });

    it('throws if the param value isn\'t an object', function () {
      assert.throw(function() {
        ko.track(null, { deep: true });
      }, 'When calling ko.track, you must pass an object as the first parameter.');
    });

    it('`null` is valid field value', function () {
      var obj = { key: null };
      ko.track(obj, { deep: true });

      var result = toHaveObservableProperties( obj, ['key'] );
      assert.strictEqual( result, true, result.message );
    });

    it('makes all properties observable, given no args', function() {
      var child = { },
        obj = { a: 'string', b: 123, c: true, d: child };
      ko.track(obj, { deep: true });
      assert.equal(obj.a, 'string');
      assert.equal(obj.b, 123);
      assert.equal(obj.c, true);
      assert.equal(obj.d, child);

      var result = toHaveObservableProperties( obj, ['a', 'b', 'c', 'd'] );
      assert.strictEqual( result, true, result.message );
    });

    it('leaves properties enumerable and configurable', function() {
      var obj = ko.track({ a: 1 }, { deep: true }),
        enumeratedKeys = [];

      // Verify enumerable
      for (var key in obj) { enumeratedKeys.push(key); }
      assert.equal(enumeratedKeys.length, 1);
      assert.equal(enumeratedKeys[ 0 ], 'a');

      // Verify configurable
      delete obj.a;
      assert.equal(Object.getOwnPropertyNames(obj).length, 0);
    });

    it('accepts an array of property names to make observable', function() {
      var obj = ko.track({ a: 1, b: 2, c: 3 }, { deep: true, fields: ['a', 'c'] });
      var result;

      result = toHaveObservableProperty( obj, 'a' );
      assert.strictEqual( result, true, result.message );

      result = toHaveObservableProperty( obj, 'c' );
      assert.strictEqual( result, true, result.message );

      result = toHaveNonObservableProperty( obj, 'b' );
      assert.strictEqual( result, true, result.message );
    });

    it('retains existing observable properties, wrapping them in a getter/setter', function() {
      var observable = ko.observable(123),
        obj = ko.track({ prop: observable }, { deep: true });

      assert.equal( obj.prop, 123 );
      var result = toHaveObservableProperty( obj, 'prop' );
      assert.strictEqual( result, true, result.message );

      // Check that the property's value is determined by the observable value, and vice-versa
      observable(456);
      assert.equal( obj.prop, 456);
      obj.prop = 789;
      assert.equal( observable(), 789);
    });

    it('retains existing computed properties, wrapping them in a getter', function() {
      var observable = ko.observable(123),
        computed = ko.computed(function() { return observable() + 1; }),
        obj = ko.track({ prop: computed }, { deep: true });

      assert.equal( obj.prop, 124);

      // Check that the property's value is determined by the computed value
      observable(456);
      assert.equal( obj.prop, 457);

      // Also verify it's read-only
      obj.prop = 789;
      assert.equal( obj.prop, 457);
      assert.equal( computed(), 457);
    });

    it('skips properties that are already tracked', function() {
      var observable = ko.observable(123),
        obj = ko.track({ prop: observable }, { deep: true, fields: ['prop'] });

      assert.equal( ko.getObservable(obj, 'prop'), observable );

      // Now track the property again
      ko.track(obj, { deep: true, fields: ['prop'] });
      assert.equal( ko.getObservable(obj, 'prop'), observable );
    });

  });

  describe('ko.untrack()', function() {

    it('releases the internal reference to the observable', function() {
      var obj = { a: 1 };
      ko.track(obj, { deep: true });

      ko.untrack(obj);
      assert.isNull( ko.getObservable(obj, 'a') );
    });

    it('releases the internal reference to specified properties', function() {
      var obj = { a: 1 };
      ko.track(obj, { deep: true });

      ko.untrack(obj, ['a']);
      assert.isNull( ko.getObservable(obj, 'a') );
    });

    it('leaves properties tracked that aren\'t specified', function() {
      var obj = { a: 1, b: 2 };
      ko.track(obj, { deep: true });

      ko.untrack(obj, ['a']);
      assert.isNotNull( ko.getObservable(obj, 'b'), null );
    });

  });
});