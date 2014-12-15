module.exports = function (config) {
  'use strict';

  config.set({
    // list of files / patterns to load in the browser
    files: [
      'node_modules/knockout/build/output/knockout-latest.js',
      'dist/knockout-es5.min.js',
      'test/*.js'
    ],

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'mocha',
      'chai'
    ],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'PhantomJS',
      'Chrome',
      'Firefox',
      'Safari',
      'IE'
    ],
    /*'karma-opera-launcher',*/

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
      'progress'
    ],

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    sauceLabs: {
      testName: 'knockout-es5',
      build: process.env.TRAVIS_JOB_ID,
      recordScreenshots: false
    },

    customLaunchers: {
      sauce_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 7'
      },
      sauce_chrome_linux: {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      sauce_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        platform: 'Windows 7'
      },
      sauce_firefox_linux: {
        base: 'SauceLabs',
        browserName: 'firefox'
      },
      sauce_safari: {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'OS X 10.9'
      },
      sauce_ie_8: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows XP',
        version: '8'
      },
      sauce_ie_9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '9'
      },
      sauce_ie_10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '10'
      },
      sauce_ie_11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
      }
    }
  });
};