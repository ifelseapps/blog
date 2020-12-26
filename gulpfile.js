const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const PATHS = {
  styles: 'src/css/**/*.scss'
};

function stylesTask() {
  return gulp.src(PATHS.styles)
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano]))
    .pipe(gulp.dest('src/css'));
}

module.exports.styles = stylesTask;

module.exports.default = function () {
  gulp.watch([PATHS.styles], stylesTask);
};
