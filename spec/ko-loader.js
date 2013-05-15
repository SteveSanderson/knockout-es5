// This is only used in the Node test environment. It returns an instance of ko that's got the ES5 behaviors mixed in.
module.exports = require('./lib/knockout-latest.js');
require('../dist/knockout-es5.js').attach(module.exports);