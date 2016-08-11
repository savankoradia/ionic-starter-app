var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var changed = require('gulp-changed');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var obfuscate = require('gulp-obfuscate');
var args = require("yargs").argv;
var ngAnnotate = require('gulp-ng-annotate');


var env = args.env || "development";

var paths = {
      sass: ['./code/scss/**/*.scss'],
      js: [
        './app/env/' + env + '.js',
        './app/env/debug.js',
        './app/js/app.js',
        './app/js/controllers/*.js'
      ]
    },
    dests = {
      css : './www/css/',
      js: './www/js'
    },
    options = {
      jshint: '',
      jshint_reporter: 'default',
      uglify: { mangle: false },
      clean: { read: false }
    };

// Clean
gulp.task('clean', function() {
  return gulp.src([
        dests.css, dests.js
      ], options.clean )
      .pipe( clean() )
      .pipe( notify( { message: 'Clean task complete.' } ) )
});


// JS
gulp.task('js', function () {
  return gulp.src( paths.js )
      .pipe( jshint( options.jshint ) )
      .pipe( jshint.reporter( options.jshint_reporter ) )
      .pipe( concat('app.js'))
      .pipe(ngAnnotate())
      //.pipe(obfuscate())
      .pipe( gulp.dest( dests.js ) )
      .pipe( uglify( options.uglify ) )
      .pipe( concat( 'all.min.js' ) )
      .pipe( gulp.dest( dests.js ) )
      .pipe( notify( { message: 'Scripts task complete.' } ) )
});

// css
gulp.task('sass', function(done) {
  gulp.src('./app/scss/ionic.app.scss')
      .pipe(sass())
      .on('error', sass.logError)
      .pipe(gulp.dest(dests.css))
      .pipe(minifyCss({
        keepSpecialComments: 0
      }))
      .pipe(rename({ extname: '.min.css' }))
      .pipe(gulp.dest(dests.css))
      .pipe(notify( { message: 'CSS task complete.' } ))
      .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch( paths.js, ['js'] );
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
      .on('log', function(data) {
        gutil.log('bower', gutil.colors.cyan(data.id), data.message);
      });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
        '  ' + gutil.colors.red('Git is not installed.'),
        '\n  Git, the version control system, is required to download Ionic.',
        '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
        '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('default', ['clean', 'sass', 'js']);
