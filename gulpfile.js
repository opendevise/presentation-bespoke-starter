'use strict';
var pkg = require('./package.json'),
  autoprefixer = require('gulp-autoprefixer'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  connect = require('gulp-connect'),
  csso = require('gulp-csso'),
  del = require('del'),
  ghpages = require('gh-pages'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  path = require('path'),
  plumber = require('gulp-plumber'), // plumber prevents pipe breaking caused by errors thrown by plugins
  rename = require('gulp-rename'),
  source = require('vinyl-source-stream'),
  stylus = require('gulp-stylus'),
  through = require('through'),
  uglify = require('gulp-uglify'),
  isDist = process.argv.indexOf('deploy') >= 0;

gulp.task('js', ['clean:js'], function() {
  // see https://wehavefaces.net/gulp-browserify-the-gulp-y-way-bb359b3f9623
  return browserify('src/scripts/main.js').bundle()
    // NOTE this error handler fills the role of plumber() when working with browserify
    .on('error', function(e) { if (isDist) { throw e; } else { gutil.log(e.stack); this.emit('end'); } })
    .pipe(source('src/scripts/main.js'))
    .pipe(buffer())
    .pipe(isDist ? uglify() : through())
    .pipe(rename('build.js'))
    .pipe(gulp.dest('build/bespoke/build'))
    .pipe(connect.reload());
});

gulp.task('css', ['clean:css'], function() {
  return gulp.src('src/styles/main.styl')
    .pipe(isDist ? through() : plumber())
    .pipe(stylus({ 'include css': true, paths: ['./node_modules'] }))
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('build/bespoke/build'))
    .pipe(connect.reload());
});

gulp.task('clean:js', function() {
  return del('build/bespoke/build/build.js');
});

gulp.task('clean:css', function() {
  return del('build/bespoke/build/build.css');
});

gulp.task('connect', ['build'], function() {
  connect.server({ root: 'build/bespoke', port: 8000, livereload: true });
});

gulp.task('watch', function() {
  gulp.watch('src/scripts/**/*.js', ['js']);
  gulp.watch('src/styles/**/*.styl', ['css']);
});

// TODO use Gradle to handle deploy
gulp.task('deploy', ['clean', 'build'], function(done) {
  ghpages.publish(path.join(__dirname, 'build/bespoke'), { logger: gutil.log }, done);
});

gulp.task('clean', ['clean:js', 'clean:css']);
gulp.task('build', ['js', 'css']);
gulp.task('serve', ['connect', 'watch']);
gulp.task('default', ['build']);
