var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var del = require('del');
var rename = require('gulp-rename'); 
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');

var paths = {
  client: ['lib/client/**/*.js'],
};
 
gulp.task('clean', function(cb) {
  del(['build'], cb);
});
 
gulp.task('client', ['clean'], function() {
  return gulp.src(paths.client, { read: false })
    .pipe(browserify())
    .pipe(rename('app.js'))
    .pipe(gulp.dest('public'));
});
 
gulp.task('watch', function() {
  gulp.watch(paths.client, ['client']);
});

gulp.task('lint', function () {
  gulp.src('./lib')
    .pipe(jshint());
});

gulp.task('develop', function () {
  nodemon({ script: 'scripts/server.js', ext: 'html js', watch: 'lib/app' })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!')
    });
});
 
gulp.task('default', ['watch', 'client', 'develop', 'lint']);
