module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['src/<%= pkg.name %>.js'],
      options: {
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

        // Environments
        browser: true,
      }
    },
    concat: {
      dist: {
        src: ['src/<%= pkg.name %>.js', 'lib/weakmap.js'],
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
    watch: {
      scripts: {
        files: ['src/*.js'],
        tasks: ['jshint'],
        options: {
          nospawn: true,
        }
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};