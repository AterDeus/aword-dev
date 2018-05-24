var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    jpegtran = require('imagemin-jpegtran'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    svgSprite = require("gulp-svg-sprites");

gulp.task('sprites', function () {
    return gulp.src('app/images/icons/*.svg')
        .pipe(svgSprite({mode: "symbols"}))
        .pipe(gulp.dest("app/images"));
});

gulp.task('sass', function() {
  gulp.src(['app/sass/**/*.scss'])
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8'], {cascade: true}))
    .pipe(gulp.dest('app/css/'))
    .pipe(browserSync.stream({match: "**/*.css"}))
});
gulp.task('scripts', function(){
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',
        'app/libs/popper/dist/umd/popper.min.js',
        'app/libs/bootstrap/dist/js/bootstrap.min.js',
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'));
});
gulp.task('css-libs', ['sass'], function(){
    return gulp.src('app/css/libs.css')
    .pipe(cssnano())
    .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest('app/css'))
})
gulp.task('browser-sync', function() {
    browserSync.init({
        injectChanges: true,
        server: {
            baseDir: "app"
        }
    });
});
gulp.task('clean', function(){
    return del.sync('dist');
})
gulp.task('clearCache', function(){
    return cache.clearAll();
})
gulp.task('img', function(){
    return gulp.src('app/images/**/*')
    .pipe(cache(imagemin({
        interlaced: true,
        progressive: true,
        svgoPlugins:[{removeViewBox: false}],
        plugins: [
            jpegtran(),
            pngquant({quality: '65-80'})
        ]
    })))
    .pipe(gulp.dest('dist/images'))
});
gulp.task('watch',['browser-sync', 'scripts', 'css-libs'], function () {
    gulp.watch('app/sass/**/*.scss', ['sass']);
    gulp.watch('app/**/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});


gulp.task('build',['clean', 'img', 'sass', 'scripts'], function(){
    var buildCSS = gulp.src([
            'app/css/styles.css',
            'app/css/libs.min.css',
        ])
        .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));

    var buildJS = gulp.src('app/js/**/*')
        .pipe(gulp.dest('dist/js'));

    var buildHTML = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});