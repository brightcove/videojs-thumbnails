'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      gruntfile: {
        src: 'Gruntfile.js',
        options: {
          node: true
        }
      },
      src: {
        src: 'videojs.thumbnails.js'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);
};
