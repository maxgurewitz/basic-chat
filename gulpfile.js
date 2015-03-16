var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var del = require('del');
var rename = require('gulp-rename'); 
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');

var paths = {
  client: ['lib/client/**/*.js', 'lib/client/**/*.jsx'],
  jsDist: 'public/app.js',
  app: 'lib/app'
};
 
gulp.task('clean', function(cb) {
  del([paths.jsDist], cb);
});
 
gulp.task('client', ['clean'], function() {
  return gulp.src(paths.client, { read: false })
    .pipe(browserify({ 
      transform: ['reactify'],
      extensions: ['.jsx', '.js'],
      debug: true,
    }))
    .pipe(rename('app.js'))
    .pipe(gulp.dest('public'));
});
 
gulp.task('watch', function() {
  gulp.watch(paths.client, ['client', 'lint']);
});

gulp.task('lint', function () {
  gulp.src('lib')
    .pipe(jshint());
});

gulp.task('app', function () {
  nodemon({ script: 'scripts/server.js', ext: 'html js', watch: paths.app })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!');
    });
});
 
gulp.task('default', ['watch', 'client', 'app', 'lint']);
