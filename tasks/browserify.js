'use strict';


module.exports = function browserify(grunt) {
  // Load task
  grunt.loadNpmTasks('grunt-browserify');

  var files = {
    'public/js/build.js': ['public/js/lib/index.js']
  };
  var browserifyOptions = {
    debug : true, // include source maps
    standalone : 'CIMIS'
  };

  // Options
  return {
    build: {
      files: files,
      options: {
        browserifyOptions : browserifyOptions
      }
    },
    watch : {
      files: files,
      options: {
        browserifyOptions : browserifyOptions,
        keepAlive : true,
        watch : true
      }
    }
  };
};
