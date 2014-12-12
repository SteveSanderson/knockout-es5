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
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
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
        // coverage reporter generates the coverage
        reporters: [
          'dots'
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
  grunt.registerTask('default', ['jshint', 'build', 'test']);

};