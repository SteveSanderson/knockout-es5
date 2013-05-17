(function() {
    var ko = this.ko || require('../src/knockout-es5.js');

    describe("Array handling", function () {

        it("converts arrays into properties that wrap observable arrays", function () {
            var plainArray = ['a', 'b', 'c'],
                obj = ko.track({ myArray: plainArray }),
                lastNotifiedValue = ko.computed(function() { return obj.myArray.join(','); });

            // Reading the property returns the underlying array value
            expect(obj.myArray instanceof Array).toBe(true);
            expect(obj.myArray).toBe(plainArray);
            expect(lastNotifiedValue()).toEqual('a,b,c');

            // We can mutate the array and trigger a notification
            obj.myArray[1] = 'modified';
            expect(lastNotifiedValue()).toEqual('a,b,c'); // Unchanged, because the observable doesn't yet know its value has mutated
            ko.valueHasMutated(obj, 'myArray');
            expect(lastNotifiedValue()).toEqual('a,modified,c');

            // We can replace the array instance and trigger a notification
            obj.myArray = [100, 200];
            expect(lastNotifiedValue()).toEqual('100,200');
            expect(plainArray).toEqual(['a', 'modified', 'c']); // Doesn't affect the previous instance
        });

        it("retains observable arrays, wrapping them in a getter/setter", function () {
            var obsArray = ko.observableArray(['a', 'b', 'c']),
                obj = ko.track({ myArray: obsArray }),
                lastNotifiedValue = ko.computed(function() { return obj.myArray.join(','); });

            // The original observable array is the backing field
            expect(obj.myArray instanceof Array).toBe(true);
            expect(obj.myArray).toBe(obsArray());
            expect(ko.getObservable(obj, 'myArray')).toBe(obsArray);

            // Mutating the underlying observable array triggers notifications on things that depend on the wrapped property
            expect(lastNotifiedValue()).toBe('a,b,c');
            obsArray.push('d');
            expect(lastNotifiedValue()).toBe('a,b,c,d');
        });

        it("intercepts standard array mutators and triggers notifications", function() {
            var obj = ko.track({ myArray: ['a', 'b', 'c', 'd'] }),
                lastNotifiedValue = ko.computed(function() { return obj.myArray.join(','); });

            expect(lastNotifiedValue()).toBe('a,b,c,d');

            obj.myArray.push('e');
            expect(lastNotifiedValue()).toBe('a,b,c,d,e');
        });

        it("intercepts standard array mutators even after you assign a different array instance (and stops responding to the old one)", function() {
            var plainArray = ['a', 'b', 'c', 'd'],
                obj = ko.track({ myArray: plainArray }),
                lastNotifiedValue = ko.computed(function() { return obj.myArray.join(','); });

            expect(lastNotifiedValue()).toBe('a,b,c,d');

            // Replace the array instance with a different one so we can check its mutators get intercepted
            obj.myArray = [1, 2, 3];
            expect(lastNotifiedValue()).toBe('1,2,3');

            // Check standard mutators
            obj.myArray.push(4);
            expect(lastNotifiedValue()).toBe('1,2,3,4');

            expect(obj.myArray.pop()).toBe(4);
            expect(lastNotifiedValue()).toBe('1,2,3');

            obj.myArray.unshift('X');
            expect(lastNotifiedValue()).toBe('X,1,2,3');

            expect(obj.myArray.shift()).toBe('X');
            expect(lastNotifiedValue()).toBe('1,2,3');

            expect(obj.myArray.reverse()).toEqual([3,2,1]);
            expect(lastNotifiedValue()).toBe('3,2,1');

            expect(obj.myArray.sort()).toEqual([1,2,3]);
            expect(lastNotifiedValue()).toBe('1,2,3');

            expect(obj.myArray.splice(1, 1)).toEqual([2]);
            expect(lastNotifiedValue()).toBe('1,3');

            // Mutating the original no longer triggers anything
            plainArray.push('X');
            expect(lastNotifiedValue()).toBe('1,3');
        });

        it("adds Knockout's additional array mutators and issues notifications", function() {
            var plainArray = [{ name: 'a' }, { name: 'b' }, { name: 'c'} ],
                obj = ko.track({ myArray: plainArray }),
                stringify = function(array) { return array.map(function(v) { return v.name }).join(','); },
                lastNotifiedValue = ko.computed(function() { return stringify(obj.myArray); }),
                destroyedValues = ko.computed(function() { return stringify(obj.myArray.filter(function(v) { return v._destroy; })); });

            expect(lastNotifiedValue()).toBe('a,b,c');
            expect(destroyedValues()).toBe('');

            obj.myArray.replace(plainArray[1], { name: 'b2' });
            expect(lastNotifiedValue()).toBe('a,b2,c');

            obj.myArray.destroy(plainArray[1]);
            expect(destroyedValues()).toBe('b2');

            obj.myArray.destroyAll();
            expect(destroyedValues()).toBe('a,b2,c');

            obj.myArray.remove(plainArray[1]);
            expect(lastNotifiedValue()).toBe('a,c');

            obj.myArray.removeAll();
            expect(lastNotifiedValue()).toBe('');
        });

        it("only triggers one notification at the end of a Knockout mutator function", function() {
            var plainArray = [1, 2, 3, 4, 5],
                obj = ko.track({ myArray: plainArray }),
                allNotifiedValues = [];
            ko.getObservable(obj, 'myArray').subscribe(function(val) { allNotifiedValues.push(val.join(',')); });

            expect(allNotifiedValues).toEqual([]);

            // Even though the following call removes each of 1,2,3 as a separate splice, we get
            // only one notification
            obj.myArray.remove(function(v) { return v < 4; });
            expect(allNotifiedValues.length).toBe(1);
            expect(allNotifiedValues).toEqual(['4,5']);
        });
    });
})();