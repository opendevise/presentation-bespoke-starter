'use strict';
var pkg = require('./package.json'),
  autoprefixer = require('gulp-autoprefixer'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  connect = require('gulp-connect'),
  csso = require('gulp-csso'),
  del = require('del'),
  exec = require('gulp-exec'),
  ghpages = require('gh-pages'),
  gulp = require('gulp'),
  log = require('fancy-log'),
  pug = require('gulp-pug'),
  path = require('path'),
  plumber = require('gulp-plumber'), // plumber prevents pipe breaking caused by errors thrown by plugins
  rename = require('gulp-rename'),
  source = require('vinyl-source-stream'),
  stylus = require('gulp-stylus'),
  through = require('through'),
  uglify = require('gulp-uglify'),
  isDist = process.argv.indexOf('deploy') >= 0,
  MAX_HTML_FILE_SIZE = 100 * 1024 * 1024;

gulp.task('clean', function() {
  return del('public');
});

gulp.task('clean:html', function() {
  return del('public/index.html');
});

gulp.task('clean:js', function() {
  return del('public/build/build.js');
});

gulp.task('clean:css', function() {
  return del('public/build/build.css');
});

gulp.task('clean:fonts', function() {
  return del('public/fonts');
});

gulp.task('clean:images', function() {
  return del('public/images');
});

gulp.task('js', gulp.series('clean:js', function() {
  // see https://wehavefaces.net/gulp-browserify-the-gulp-y-way-bb359b3f9623
  return browserify('src/scripts/main.js').bundle()
    // NOTE this error handler fills the role of plumber() when working with browserify
    .on('error', function(e) { if (isDist) { throw e; } else { log(e.stack); this.emit('end'); } })
    .pipe(source('src/scripts/main.js'))
    .pipe(buffer())
    .pipe(isDist ? uglify() : through())
    .pipe(rename('build.js'))
    .pipe(gulp.dest('public/build'))
    .pipe(connect.reload());
}));

gulp.task('html', gulp.series('clean:html', function() {
  return gulp.src('src/index.adoc')
    .pipe(isDist ? through() : plumber())
    .pipe(exec('bundle exec asciidoctor-bespoke -o - src/index.adoc', { pipeStdout: true, maxBuffer: MAX_HTML_FILE_SIZE }))
    .pipe(exec.reporter({ stdout: false }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('public'))
    .pipe(connect.reload());
}));

gulp.task('css', gulp.series('clean:css', function() {
  return gulp.src('src/styles/main.styl')
    .pipe(isDist ? through() : plumber())
    .pipe(stylus({ 'include css': true, paths: ['./node_modules'] }))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('public/build'))
    .pipe(connect.reload());
}));

gulp.task('fonts', gulp.series('clean:fonts', function() {
  return gulp.src('src/fonts/*')
    .pipe(gulp.dest('public/fonts'))
    .pipe(connect.reload());
}));

gulp.task('images', gulp.series('clean:images', function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('public/images'))
    .pipe(connect.reload());
}));

gulp.task('build', gulp.series('js', 'html', 'css', 'fonts', 'images'));

gulp.task('connect', gulp.series('build', function(done) {
  connect.server({ root: 'public', port: 8000, livereload: true });
  done();
}));

gulp.task('watch', function(done) {
  gulp.watch('src/**/*.adoc', gulp.series('html'));
  gulp.watch('src/scripts/**/*.js', gulp.series('js'));
  gulp.watch('src/styles/**/*.styl', gulp.series('css'));
  gulp.watch('src/images/**/*', gulp.series('images'));
  gulp.watch('src/fonts/*', gulp.series('fonts'));
  done();
});

gulp.task('deploy', gulp.series('clean', 'build', function(done) {
  ghpages.publish(path.join(__dirname, 'public'), { logger: log }, done);
}));

gulp.task('serve', gulp.series('connect', 'watch'));
gulp.task('default', gulp.series('build'));
