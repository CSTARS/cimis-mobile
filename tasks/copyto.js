'use strict';


module.exports = function copyto(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-copy-to');

    // Options
    return {
        build: {
            files: [{
                cwd: 'public',
                src: ['index.html','favicon.ico','manifest.json','manifest.webapp', 'eto_zones.json', 'dauco.json'],
                dest: 'dist/'
            },
            {
                cwd: 'public/bower_components/font-awesome',
                src: ['fonts/**/*'],
                dest: 'dist/'
            },{
                cwd: 'public',
                src: ['icons/**/*'],
                dest: 'dist/'
            }],
            options: {
                ignore: []
            }
        }
    };
};
