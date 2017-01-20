const del = require('del');
const gulp = require('gulp');
const glps = require('gulp-load-plugins');
const runs = require('run-sequence');
const wiredep = require('wiredep');

const $ = glps();

gulp.task('dist', (done) => runs('clear', ['css', 'scss', 'js', 'fonts'], done));

gulp.task('clear', () => {
  return del('dist', {force: true});
});

gulp.task('css', () => {
  return gulp.src('src/stylesheets/mumuki-styles.scss')
    .pipe($.sass())
    .pipe($.concat('mumuki-styles.css'))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scss', ['scss:vendor'], () => {
  return gulp.src('src/stylesheets/**/*.scss')
    .pipe($.replace('@import "../bower_components/', '@import "vendor/'))
    .pipe(gulp.dest('dist/scss'));
});

gulp.task('scss:vendor', () => {
  return gulp.src('src/bower_components/**/*.scss')
    .pipe(gulp.dest('dist/scss/vendor'));
});

gulp.task('js', () => {
  return gulp.src(wiredep({devDependencies: true}).js.concat(['src/javascripts/**/*.js']))
    .pipe($.concat('mumuki-styles.js'))
    .pipe(gulp.dest('dist/javascripts'));
});

gulp.task('fonts', () => {
  const fonts = [
    'src/bower_components/bootstrap-sass/assets/fonts/**/*',
    'src/bower_components/font-awesome/fonts/**/*',
    'src/bower_components/dev-awesome/dist/fonts/**/*',
  ];
  return gulp.src(fonts).pipe(gulp.dest('dist/fonts'));
});
