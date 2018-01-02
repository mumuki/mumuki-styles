const del = require('del');
const gulp = require('gulp');
const glps = require('gulp-load-plugins');
const runs = require('run-sequence');
const wiredep = require('wiredep');

const $ = glps();

gulp.task('dist', (done) => runs('clear', ['css', 'scss', 'js', 'fonts'], done));

gulp.task('dev', (done) => runs('clear:dev', ['css:dev', 'scss:dev', 'js:dev', 'fonts:dev'], 'serve', done));



gulp.task('clear:dev', () => {
  return del(['build'], {force: true});
});

gulp.task('css:dev', () => {
  return gulp.src('src/stylesheets/mumuki-styles.scss')
    .pipe($.sass())
    .pipe($.concat('mumuki-styles.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('scss:dev', ['scss:vendor:dev'], () => {
  return gulp.src('src/stylesheets/**/*.scss')
    .pipe($.replace('@import "../bower_components/', '@import "vendor/'))
    .pipe(gulp.dest('build/scss'));
});

gulp.task('scss:vendor:dev', () => {
  return gulp.src('src/bower_components/**/*.scss')
    .pipe(gulp.dest('build/scss/vendor'));
});

gulp.task('js:dev', () => {
  return gulp.src(wiredep({ devDependencies: true }).js.concat(require('./src/javascripts')))
    .pipe($.concat('mumuki-styles.js'))
    .pipe(gulp.dest('build/javascripts'));
});

gulp.task('fonts:dev', () => {
  const fonts = [
    'src/bower_components/bootstrap-sass/assets/fonts/**/*',
    'src/bower_components/font-awesome/fonts/**/*',
    'src/bower_components/dev-awesome/dist/fonts/**/*',
  ];
  return gulp.src(fonts)
    .pipe(gulp.dest('build/fonts'));
});

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



gulp.task('clear', () => {
  return del(['dist', 'app'], {force: true});
});

gulp.task('css', () => {
  return gulp.src('src/stylesheets/mumuki-styles.scss')
    .pipe($.sass())
    .pipe($.concat('mumuki-styles.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulp.dest('app/assets/stylesheets'));
  });

gulp.task('scss', ['scss:vendor'], () => {
  return gulp.src('src/stylesheets/**/*.scss')
    .pipe($.replace('@import "../bower_components/', '@import "vendor/'))
    .pipe(gulp.dest('dist/scss'))
    .pipe(gulp.dest('app/assets/stylesheets'));
  });

gulp.task('scss:vendor', () => {
  return gulp.src('src/bower_components/**/*.scss')
    .pipe(gulp.dest('dist/scss/vendor'))
    .pipe(gulp.dest('app/assets/stylesheets/vendor'));
  });

gulp.task('js', () => {
  return gulp.src(wiredep({ devDependencies: true }).js.concat(require('./src/javascripts')))
    .pipe($.concat('mumuki-styles.js'))
    .pipe(gulp.dest('dist/javascripts'))
    .pipe(gulp.dest('app/assets/javascripts'));
  });

gulp.task('fonts', () => {
  const fonts = [
    'src/bower_components/bootstrap-sass/assets/fonts/**/*',
    'src/bower_components/font-awesome/fonts/**/*',
    'src/bower_components/dev-awesome/dist/fonts/**/*',
  ];
  return gulp.src(fonts)
    .pipe(gulp.dest('dist/fonts'))
    .pipe(gulp.dest('app/assets/fonts'));
});
