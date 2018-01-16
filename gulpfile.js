const del = require('del');
const gulp = require('gulp');
const glps = require('gulp-load-plugins');
const runs = require('run-sequence');
const wiredep = require('wiredep');

const $ = glps();

gulp.task('dist', (done) => runs('clear', ['css', 'scss', 'js', 'fonts'], done));

gulp.task('build:dev', ['css:dev', 'scss:dev', 'js:dev', 'fonts:dev']);
gulp.task('dev', (done) => runs('clear:dev', 'build:dev', 'watch', 'serve', done));


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

gulp.task('watch', () => {
  gulp.watch('src/**/*', ['build:dev']);
})


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
    .pipe($.replace('@import "../bower_components/', '@import "vendor/'))
    .pipe(gulp.dest('dist/scss'));
  });

gulp.task('scss:vendor', () => {
  return gulp.src('src/bower_components/**/*.scss')
    .pipe(gulp.dest('dist/scss/vendor'));
  });

gulp.task('js', () => {
  return gulp.src(wiredep({ devDependencies: true }).js.concat(require('./src/javascripts')))
    .pipe($.concat('mumuki-styles.js'))
    .pipe(gulp.dest('dist/javascripts'));
  });

gulp.task('fonts', () => {
  const fonts = [
    'src/bower_components/bootstrap-sass/assets/fonts/**/*',
    'src/bower_components/font-awesome/fonts/**/*',
    'src/bower_components/dev-awesome/dist/fonts/**/*',
  ];
  return gulp.src(fonts)
    .pipe(gulp.dest('dist/fonts'));
});
