const del = require('del');
const gulp = require('gulp');
const glps = require('gulp-load-plugins');
const runs = require('run-sequence');
const wiredep = require('wiredep');

const $ = glps();

var out = 'dist';

gulp.task('dist', (done) => runs('clear', ['scss', 'js', 'fonts'], 'css', done));

gulp.task('clear', () => {
  return del(out, {force: true});
});

gulp.task('css', () => {
  return gulp.src('src/stylesheets/mumuki-styles.scss')
    .pipe($.sass())
    .pipe($.concat('mumuki-styles.css'))
    .pipe(gulp.dest(`${out}/css`));
});

gulp.task('scss', ['scss:vendor'], () => {
  return gulp.src('src/stylesheets/**/*.scss')
    .pipe($.replace('@import "../bower_components/', '@import "vendor/'))
    .pipe(gulp.dest(`${out}/scss`));
});

gulp.task('scss:vendor', () => {
  return gulp.src('src/bower_components/**/*.scss')
    .pipe(gulp.dest(`${out}/scss/vendor`));
});

gulp.task('js', () => {
  return gulp.src(wiredep({devDependencies: true}).js.concat(['src/javascripts/**/*.js']))
    .pipe($.concat('mumuki-styles.js'))
    .pipe(gulp.dest(`${out}/javascripts`));
});

gulp.task('fonts', () => {
  const fonts = [
    'src/bower_components/bootstrap-sass/assets/fonts/**/*',
    'src/bower_components/font-awesome/fonts/**/*',
    'src/bower_components/dev-awesome/dist/fonts/**/*',
  ];
  return gulp.src(fonts).pipe(gulp.dest(`${out}/fonts`));
});

gulp.task('watch', () => {
  gulp.watch('src/stylesheets/**/*.scss', ['css']);
  gulp.watch('src/javascripts/**/*.js', ['js']);
});

gulp.task('dev', (done) => {
  out = 'build';
  runs('dist', 'watch', 'serve', done);
});

gulp.task('serve', () => {
  return gulp.src('.')
    .pipe($.webserver({
      host: '0.0.0.0',
      open: true,
      port: 4000,
      livereload: {
        port: 12345
      }
    }));
});
