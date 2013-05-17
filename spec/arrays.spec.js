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
    });
})();