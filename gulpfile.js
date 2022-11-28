const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const webpack = require('webpack-stream');

const PATHS = {
  styles: 'src/css/**/*.scss',
  scipts: 'src/scripts/common.js',
};

function stylesTask() {
  return gulp
    .src(PATHS.styles)
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano]))
    .pipe(gulp.dest('_site/css'));
}

function scriptsTask() {
  return gulp
    .src(PATHS.scipts)
    .pipe(webpack({ mode: 'production', output: { filename: 'common.js' } }))
    .pipe(gulp.dest('_site/scripts/'));
}

module.exports.styles = stylesTask;

module.exports.scripts = scriptsTask;

module.exports.default = function () {
  gulp.watch([PATHS.styles], stylesTask);
  gulp.watch([PATHS.scipts], scriptsTask);
};
