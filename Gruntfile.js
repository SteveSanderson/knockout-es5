'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['src/knockout-es5.js'],
      options: {
        jshintrc: true
      }
    },

    concat: {
      dist: {
        src: ['src/knockout-es5.js', 'lib/weakmap.js'],
        dest: 'dist/knockout-es5.js'
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      build: {
        src: 'dist/knockout-es5.js',
        dest: 'dist/knockout-es5.min.js'
      }
    },

    karma: {
      options: {
        configFile: 'karma.conf.js'
      },

      local: {
        browsers: [
          'Chrome'
        ],
        reporters: [
          'dots'
        ]
      },

      sauce: {
        reporters: [
          'dots',
          'saucelabs'
        ],
        browsers: [
          'sauce_chrome',
          //'sauce_chrome_linux',
          'sauce_firefox',
          //'sauce_firefox_linux',
          'sauce_safari',
          //'sauce_ie_8',
          'sauce_ie_9',
          'sauce_ie_10',
          'sauce_ie_11'
        ]
      }
    },

    watch: {
      scripts: {
        files: ['src/*.js', 'test/*.js'],
        tasks: ['default'],
        options: {
          nospawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['karma:local']);
  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('travis', ['jshint', 'build', 'karma:sauce']);
  grunt.registerTask('default', ['jshint', 'build', 'test']);

};