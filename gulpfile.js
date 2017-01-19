const del = require('del');
const gulp = require('gulp');
const glps = require('gulp-load-plugins');
const runs = require('run-sequence');
const wiredep = require('wiredep');

const $ = glps();

const mumukiName = (extension) => $.concat(`mumuki-styles.min.${extension}`);

gulp.task('dist', (done) => runs('clear', ['css', 'scss', 'js', 'fonts'], done));

gulp.task('clear', () => {
  return del('dist', {force: true});
});


gulp.task('css', () => {
  return gulp.src('src/styles/**/*.scss')
    .pipe($.sass.sync())
    .pipe($.minifyCss())
    .pipe(mumukiName('css'))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scss', ['scss:lib'], () => {
  return gulp.src('src/styles/**/*.scss')
    .pipe(gulp.dest('dist/scss'));
});

gulp.task('scss:lib', () => {
  return gulp.src('src/lib/**/*.scss')
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('fonts', () => {
  const fonts = [
    'src/lib/font-awesome/fonts/**/*',
    'src/lib/dev-awesome/dist/fonts/**/*',
    'src/lib/bootstrap-sass/assets/fonts/**/*'
  ];
  return gulp.src(fonts).pipe(gulp.dest('dist/fonts'));
});

gulp.task('js', () => {
  return gulp.src(wiredep().js)
    .pipe(mumukiName('js'))
    .pipe($.uglify())
    .pipe(gulp.dest('dist/js'));
});
