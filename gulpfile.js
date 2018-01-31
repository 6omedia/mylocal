'use strict';

var gulp = require('gulp'),
	concat = require('gulp-concat');

gulp.task("concatScripts", function(){
	gulp.src([ 
		'./public/lib/yeahcomplete/yeahcomplete.js',
		'./public/js/home.js'])
	.pipe(concat('app.js'))
	.pipe(gulp.dest('./public/js'));
});

gulp.task("default", ["hello"], function(){
	console.log('default...');
});