var ko = this.ko;
if (!ko) {
    // If run from inside Node.js, need to load and attach to the KO module explicitly
    ko = require('../lib/knockout-latest.js');
    require('../src/knockout-es5.js').attach(ko);
}

describe("Basic properties", function () {

    describe("ko.track()", function () {

        it("returns the object you passed to it", function () {
          var obj = {};
          expect(ko.track(obj)).toBe(obj);
        });

    });

});