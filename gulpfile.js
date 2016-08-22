var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    tsProj = ts.createProject('tsconfig.json'),
    jasmine = require('gulp-jasmine'),
    plumber = require('gulp-plumber'),
    tsconfig = require('./tsconfig.json'),
    tslint = require('gulp-tslint'),
    outDir = tsconfig.compilerOptions.outDir || 'dist',
    compiledTestsPattern = 'dist/tests/**/*.js',
    srcPattern = ['src/**/*.ts', 'tests/**/*.ts'];

gulp.task('build', ['lint'], () => {
    return tsProj.src()
        .pipe(ts(tsProj))
        .pipe(gulp.dest(outDir));
});

gulp.task('lint', () => {
  return gulp.src(srcPattern)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('test', ['build'], () => {
    gulp.src(compiledTestsPattern)
        .pipe(jasmine());
});

gulp.task('test:watch', ['build'], () => {
    gulp.src(compiledTestsPattern)
        .pipe(plumber({ errorHandler: (e) => { console.log(e); }}))
        .pipe(jasmine());
});

gulp.task('watch', () => {
    gulp.start('test:watch');
    gulp.watch(srcPattern, ['test:watch']);
});
