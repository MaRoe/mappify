'use strict';

var $ = require('gulp-stack').plugins;

var staticFiles = [
    {
        name: 'jassa',
        folder: 'dist/bower_components/jassa',
        src: 'app/bower_components/jassa/*.min.js'
    }
];

var gulp = require('gulp-stack').gulp([
    'clean',
    'test',
    'app',
    'vendor',
    'static',
    'develop',
    'html'
],
    {
        files : {
            js: 'app/**/*.js',
            css: 'app/styles/**/*.css',
            vendor: [],
            partials: 'app/**/*.tpl.html',
            test: [],
            static: staticFiles
        },
        bower: 'app/bower_components/**', // String of bower directory string
        templateCacheOptions: {root: '/', module: 'jassaUiMappify'}
    }
);

/**
 * Alias Tasks
 */

//gulp.newTask('default', ['build', 'jshint', 'test']);
gulp.newTask('default', ['build', 'jshint']);

gulp.newTask('build', ['html', 'app', 'static', 'vendor']);

