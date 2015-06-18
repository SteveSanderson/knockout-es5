describe('Array handling', function () {

  it('converts arrays into properties that wrap observable arrays', function () {
    var plainArray = ['a', 'b', 'c'],
      obj = ko.track({ myArray: plainArray }),
      lastNotifiedValue = ko.computed(function() { return obj.myArray.join(','); });

    // Reading the property returns the underlying array value
    assert.equal(obj.myArray instanceof Array, true);
    assert.deepEqual(obj.myArray, plainArray);
    assert.equal(lastNotifiedValue(), 'a,b,c');

    // We can mutate the array and trigger a notification
    obj.myArray[1] = 'modified';
    assert.equal(lastNotifiedValue(), 'a,b,c'); // Unchanged, because the observable doesn't yet know its value has mutated
    ko.valueHasMutated(obj, 'myArray');
    assert.equal(lastNotifiedValue(), 'a,modified,c');

    // We can replace the array instance and trigger a notification
    obj.myArray = [100, 200];
    assert.equal(lastNotifiedValue(), '100,200');
    // Doesn't affect the previous instance
    assert.equal(plainArray[ 0 ], 'a');
    assert.equal(plainArray[ 1 ], 'modified');
    assert.equal(plainArray[ 2 ], 'c');
  });

  it('retains observable arrays, wrapping them in a getter/setter', function () {
    var obsArray = ko.observableArray(['a', 'b', 'c']),
      obj = ko.track({ myArray: obsArray }),
      lastNotifiedValue = ko.computed(function() { return obj.myArray.join(','); });

    // The original observable array is the backing field
    assert.equal(obj.myArray instanceof Array, true);
    assert.equal(obj.myArray, obsArray());
    assert.equal(ko.getObservable(obj, 'myArray'), obsArray);

    // Mutating the underlying observable array triggers notifications on things that depend on the wrapped property
    assert.equal(lastNotifiedValue(), 'a,b,c');
    obsArray.push('d');
    assert.equal(lastNotifiedValue(), 'a,b,c,d');
  });

  it('intercepts standard array mutators and triggers notifications', function() {
    var obj = ko.track({ myArray: ['a', 'b', 'c', 'd'] }),
      lastNotifiedValue = ko.computed(function() { return obj.myArray.join(','); });

    assert.equal(lastNotifiedValue(), 'a,b,c,d');

    obj.myArray.push('e');
    assert.equal(lastNotifiedValue(), 'a,b,c,d,e');
  });

  it('intercepts standard array mutators even after you assign a different array instance (and stops responding to the old one)', function() {
    var plainArray = ['a', 'b', 'c', 'd'],
      obj = ko.track({ myArray: plainArray }),
      lastNotifiedValue = ko.computed(function() { return obj.myArray.join(','); });

    assert.equal(lastNotifiedValue(), 'a,b,c,d');

    // Replace the array instance with a different one so we can check its mutators get intercepted
    obj.myArray = [1, 2, 3];
    assert.equal(lastNotifiedValue(), '1,2,3');

    // Check standard mutators
    obj.myArray.push(4);
    assert.equal(lastNotifiedValue(), '1,2,3,4');

    assert.equal(obj.myArray.pop(), 4);
    assert.equal(lastNotifiedValue(), '1,2,3');

    obj.myArray.unshift('X');
    assert.equal(lastNotifiedValue(), 'X,1,2,3');

    assert.equal(obj.myArray.shift(), 'X');
    assert.equal(lastNotifiedValue(), '1,2,3');

    obj.myArray.reverse();
    assert.equal(obj.myArray[ 0 ], 3);
    assert.equal(obj.myArray[ 1 ], 2);
    assert.equal(obj.myArray[ 2 ], 1);
    assert.equal(lastNotifiedValue(), '3,2,1');

    obj.myArray.sort();
    assert.equal(obj.myArray[ 0 ], 1);
    assert.equal(obj.myArray[ 1 ], 2);
    assert.equal(obj.myArray[ 2 ], 3);
    assert.equal(lastNotifiedValue(), '1,2,3');

    var subArr = obj.myArray.splice(1, 1);
    assert.equal( subArr.length, 1 );
    assert.equal( subArr[ 0 ], 2 );
    assert.equal(lastNotifiedValue(), '1,3');

    // Mutating the original no longer triggers anything
    plainArray.push('X');
    assert.equal(lastNotifiedValue(), '1,3');
  });

  it('adds Knockout\'s additional array mutators and issues notifications', function() {
    var plainArray = [{ name: 'a' }, { name: 'b' }, { name: 'c'} ],
      obj = ko.track({ myArray: plainArray }),
      stringify = function(array) { return array.map(function(v) { return v.name; }).join(','); },
      lastNotifiedValue = ko.computed(function() { return stringify(obj.myArray); }),
      destroyedValues = ko.computed(function() { return stringify(obj.myArray.filter(function(v) { return v._destroy; })); });

    assert.equal(lastNotifiedValue(), 'a,b,c');
    assert.equal(destroyedValues(), '');

    obj.myArray.replace(plainArray[1], { name: 'b2' });
    assert.equal(lastNotifiedValue(), 'a,b2,c');

    obj.myArray.destroy(plainArray[1]);
    assert.equal(destroyedValues(), 'b2');

    obj.myArray.destroyAll();
    assert.equal(destroyedValues(), 'a,b2,c');

    obj.myArray.remove(plainArray[1]);
    assert.equal(lastNotifiedValue(), 'a,c');

    obj.myArray.removeAll();
    assert.equal(lastNotifiedValue(), '');
  });

  it('only triggers one notification at the end of a Knockout mutator function', function() {
    var plainArray = [1, 2, 3, 4, 5],
      obj = ko.track({ myArray: plainArray }),
      allNotifiedValues = [];
    ko.getObservable(obj, 'myArray').subscribe(function(val) { allNotifiedValues.push(val.join(',')); });

    assert.equal(allNotifiedValues.length, 0);

    // Even though the following call removes each of 1,2,3 as a separate splice, we get
    // only one notification
    obj.myArray.remove(function(v) { return v < 4; });
    assert.equal(allNotifiedValues.length, 1);
    assert.equal(allNotifiedValues[ 0 ], '4,5');
  });

  it('if a property is already an observable array, it still gets wrapped with mutator functions', function () {
    var plainArray = ['a', 'b', 'c'],
      obj = ko.track({ myArray: ko.observableArray(plainArray) }),
      lastNotifiedValue = ko.computed(function() { return obj.myArray.join(','); });

    // Reading the property returns the underlying array value
    assert.equal(obj.myArray instanceof Array, true);
    assert.deepEqual(obj.myArray, plainArray);
    assert.equal(lastNotifiedValue(), 'a,b,c');

    obj.myArray.push('d');
    assert.equal(lastNotifiedValue(), 'a,b,c,d');
  });
});