'use strict';

var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	maps = require('gulp-sourcemaps');

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
// 	gulp.src('./public/scss/styles.scss')
// 		.pipe(maps.init())
// 		.pipe(sass())
// 		.pipe(gulp.dest('./public/css/styles.css'));
// });

gulp.task("default", ["hello"], function(){
	console.log('default...');
});