const del = require('del');
const gulp = require('gulp');
const glps = require('gulp-load-plugins');
const runs = require('run-sequence');
const merge = require('merge-stream');

const $ = glps();

gulp.task('dist', (done) => runs('clear', ['css', 'scss', 'js', 'fonts'], done));
gulp.task('dev', (done) => runs('watch', 'serve', done));

gulp.task('serve', () => {
  gulp
    .src('.')
    .pipe($.webserver({
      open: true,
      port: 8000,
      host: 'localhost',
      livereload: 34567
    }));
});

gulp.task('watch', () => {
  gulp.watch('src/**/*', ['dist']);
});


gulp.task('clear', () => {
  return del(['dist'], {force: true});
});

gulp.task('css', () => {
  return gulp.src('src/stylesheets/mumuki-styles.scss')
    .pipe($.sass())
    .pipe($.concat('mumuki-styles.css'))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scss', ['scss:vendor'], () => {
  return gulp.src('src/stylesheets/**/*.scss')
    .pipe($.replace('@import "../../node_modules/bootstrap-sass/', '@import "vendor/bootstrap-sass/'))
    .pipe($.replace('@import "../../node_modules/dev-awesome/', '@import "vendor/dev-awesome/'))
    .pipe($.replace('@import "../../node_modules/@fortawesome/', '@import "vendor/'))
    .pipe(gulp.dest('dist/scss'));
});

gulp.task('scss:vendor', () => {
  const fontawesome = gulp.src('node_modules/@fortawesome/**/*.scss')
    .pipe(gulp.dest('dist/scss/vendor'));

  const bootstrap = gulp.src('node_modules/bootstrap-sass/**/*.scss')
    .pipe(gulp.dest('dist/scss/vendor/bootstrap-sass'));

  const devawesome = gulp.src('node_modules/dev-awesome/**/*.scss')
    .pipe(gulp.dest('dist/scss/vendor/dev-awesome'));

  return merge(fontawesome, bootstrap, devawesome);
});

gulp.task('js', () => {
  return gulp.src(require('./src/assets.js').concat(require('./src/javascripts')))
    .pipe($.concat('mumuki-styles.js'))
    .pipe(gulp.dest('dist/javascripts'));
});

gulp.task('fonts', () => {
  const fonts = [
    'node_modules/bootstrap-sass/assets/fonts/**/*',
    'node_modules/@fortawesome/fontawesome-free/webfonts/*',
    'node_modules/dev-awesome/dist/fonts/**/*',
  ];
  return gulp.src(fonts)
    .pipe(gulp.dest('dist/fonts'));
});
