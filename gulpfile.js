'use strict';

var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('uglify'),
	sass = require('gulp-sass');

gulp.task("concatScripts", function(){
	gulp.src([ 
		'./public/lib/yeahcomplete/yeahcomplete.js',
		'./public/js/home.js'])
	.pipe(concat('app.js'))
	.pipe(gulp.dest('./public/js'));
});

gulp.task("minifyScripts", function(){
	gulp.src("./public/js/app.js")
		.pipe(uglify())
		.pipe(gulp.dest('./public/js'));
});

// gulp.task("compileSass", function(){
// 	gulp.src('./public/scss/');
// });

gulp.task("default", ["hello"], function(){
	console.log('default...');
});