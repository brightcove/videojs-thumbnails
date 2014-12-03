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
    connect: {
      server: {
        options: {
          keepalive: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['jshint']);
};
