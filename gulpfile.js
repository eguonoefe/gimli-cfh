const bower = require('gulp-bower');
const browserSync = require('browser-sync');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const nodemon = require('gulp-nodemon');
const sass = require('gulp-sass');
const coveralls = require('gulp-coveralls');

gulp.task('coveralls', () => {
  gulp.src('./coverage/lcov.info')
  .pipe(coveralls());
});

gulp.task('watch', () => {
  gulp.watch('app/views/**', browserSync.reload());
  gulp.watch('public/js/**', browserSync.reload());
  gulp.watch('app/**/*js', browserSync.reload());
  gulp.watch('public/views/**', browserSync.reload());
  gulp.watch('public/css/common.scss', ['sass']);
  gulp.watch('public/css/views/articles.scss', ['sass']);
  gulp.watch('public/css/**', browserSync.reload());
});

gulp.task('lint', () => {
  gulp.src(['gulpfile.js',
    'public/js/**/*.js',
    'app/**/*.js',
    'test/**/*.js'])
    .pipe(eslint());
});

gulp.task('nodemon', () => {
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['app', 'config'],
    env: {
      PORT: 3000,
    }
  });
});

gulp.task('sass', () => {
  gulp.src('public/css/common/scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css/'));
});

gulp.task('copyBootstrap', () => {
  gulp.src('bower_components/bootstrap/dist/**/*')
  .pipe(gulp.dest('public/lib/bootstrap'));
});

gulp.task('copyAngularUtilsRoute', () => {
  gulp.src('bower_components/angular-ui-utils/modules/route/route.js')
  .pipe(gulp.dest('public/lib/angular-ui-utils/modules/'));
});

gulp.task('copyAngular', () => {
  gulp.src('bower_components/angular/**/*')
  .pipe(gulp.dest('public/lib/angular'));
});

gulp.task('copyAngularBootstrap', () => {
  gulp.src('bower_components/angular-bootstrap/**/*')
  .pipe(gulp.dest('public/lib/angular-bootstrap'));
});

gulp.task('copyJquery', () => {
  gulp.src('bower_components/jquery/**/*')
  .pipe(gulp.dest('public/lib/jquery'));
});

gulp.task('copyUnderscore', () => {
  gulp.src('bower_components/underscore/**/*')
  .pipe(gulp.dest('public/lib/underscore'));
});

gulp.task('bower', () => {
  bower().pipe(gulp.dest('./bower_components'));
});

gulp.task('copyMaterializeCss', () => {
  gulp.src('bower_components/materialize/dist/css/materialize.min.css')
  .pipe(gulp.dest('public/lib/materialize/css/'));
});

gulp.task('copyMaterializeJs', () => {
  gulp.src('bower_components/materialize/dist/js/materialize.min.js')
  .pipe(gulp.dest('public/lib/materialize/js/'));
});

gulp.task('mochaTest', () => {
  gulp.src(['test/**/*.js'])
    .pipe(mocha({
      reporter: 'spec',
    }));
});

gulp.task('test', ['mochaTest']);
gulp.task('install', ['bower']);
gulp.task('default', ['nodemon', 'watch', 'sass',
  'copyBootstrap', 'copyAngularUtilsRoute', 'copyAngular',
  'copyJquery', 'copyUnderscore', 'copyAngularBootstrap',
  'copyMaterializeCss', 'copyMaterializeJs']);
