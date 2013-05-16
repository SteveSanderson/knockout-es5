module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['src/knockout-es5.js'],
      options: {
        globals: {
          module: true,
          require: true
        },

        // Restrictions
        curly: true,
        eqeqeq: true,
        indent: 4,
        latedef: true,
        newcap: true,
        noempty: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        strict: true,
        trailing: true,

        // Allowances
        validthis: true,

        // Environments
        browser: true,
      }
    },
    concat: {
      dist: {
        src: ['src/knockout-es5.js', 'lib/weakmap.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      // For the minified bundled build, we have to use the "official" WeakMap minified file
      // and *not* re-minify its source, because UglifyJS2 doesn't appear to have a way of
      // preserving inline function names (except by disabling the mangler entirely).
      distMin: {
        src: ['tmp/knockout-es5.min.js', 'lib/weakmap.min.js'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'tmp/<%= pkg.name %>.min.js'
      }
    },
    jasmine_node: {
      specNameMatcher: "spec",
      projectRoot: ".",
      requirejs: false,
      useHelpers: true,
      forceExit: true
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'spec/*.js'],
        tasks: ['default'],
        options: {
          nospawn: false,
        }
      },
    },
    clean: ['tmp']
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('test', ['jasmine_node']);
  grunt.registerTask('build', ['uglify', 'concat', 'clean']);
  grunt.registerTask('default', ['jshint', 'test', 'build']);

};