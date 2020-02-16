'use strict';

const gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  uglify = require('gulp-uglify'),
  usemin = require('gulp-usemin'),
  rev = require('gulp-rev'),
  cleanCss = require('gulp-clean-css'),
  flatmap = require('gulp-flatmap'),
  rename = require('gulp-rename'),
  autoprefixer = require('gulp-autoprefixer'),
  htmlmin = require('gulp-htmlmin');

gulp.task('sass', function(done) {
  gulp
    .src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./css/'));
  done();
});

gulp.task('sass:watch', function(done) {
  gulp.watch('./sass/**/*.scss', gulp.series('sass'));
  done();
});

gulp.task('browser-sync', function(done) {
  const files = [
    './index.html',
    './sass/**/*.scss',
    './js/*.js',
    './img/*.{png,jpg,gif}'
  ];
  browserSync.init(files, {
    server: {
      baseDir: './'
    }
  });
  done();
});

gulp.task('default', gulp.series('browser-sync', 'sass:watch'));

gulp.task('clean', function(done) {
  del(['dist']).then(() => done());
});

gulp.task('copyfonts', function() {
  return gulp
    .src('./css/fonts/*.{ttf,woff,eof,svg}*')
    .pipe(gulp.dest('./dist/css/fonts'));
});

gulp.task('copyvideos', function() {
  return gulp.src('./img/*.{mp4,webm}*').pipe(gulp.dest('./dist/img'));
});

gulp.task('auto-prefix', function(done) {
  return gulp
    .src('./css/style.css')
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(gulp.dest('./css'));
});

gulp.task('imagemin', function(done) {
  return gulp
    .src('img/*.{png,jpg,gif}')
    .pipe(
      imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
      })
    )
    .pipe(gulp.dest('dist/img'));
});

gulp.task('usemin', function(done) {
  return gulp
    .src('./*.html')
    .pipe(
      flatmap(function(stream, file) {
        return stream.pipe(
          usemin({
            css: [cleanCss(), rev()],
            html: [
              function() {
                return htmlmin({
                  collapseWhitespace: true,
                  removeComments: true
                });
              }
            ],
            js: [uglify(), rev()],
            inlinejs: [uglify()],
            inlinecss: [cleanCss(), 'concat']
          })
        );
      })
    )
    .pipe(gulp.dest('dist/'));
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    'copyfonts',
    'copyvideos',
    'auto-prefix',
    'imagemin',
    'usemin'
  )
);
