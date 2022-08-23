const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const inject = require("gulp-inject-string");
const rimraf = require("rimraf");
const { v4: uuidv4 } = require('uuid');

const bundleId = uuidv4();
rimraf.sync('dist/**/*.{js,css}');

const bundleJs = () => {
    return gulp
        .src([
            "node_modules/moment/min/moment.min.js",
            "node_modules/resize-sensor/ResizeSensor.js",
            "node_modules/jquery/dist/jquery.min.js",
            "node_modules/slick-carousel/slick/slick.min.js",
            "node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js",
            "node_modules/toastify-js/src/toastify.js",
            "node_modules/sticky-sidebar/dist/sticky-sidebar.min.js",
            "src/**/*.js",
        ])
        .pipe(concat("bundle.js"))
        .pipe(uglify())
        .pipe(rename(`bundle-${bundleId}.js`))
        .pipe(gulp.dest("dist/js"));
};

const copyThings = gulp.parallel(
    () => {
        return gulp
            .src(["node_modules/slick-carousel/slick/fonts/**.*"])
            .pipe(gulp.dest("dist/css/fonts"));
    },
    () => {
        return gulp
            .src(["node_modules/slick-carousel/slick/ajax-loader.gif"])
            .pipe(gulp.dest("dist/css"));
    }
);

const bundleCss = () => {
    return gulp
        .src([
            "node_modules/slick-carousel/slick/slick-theme.css",
            "node_modules/slick-carousel/slick/slick.css",
            "node_modules/toastify-js/src/toastify.css",
            "node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css",
            "src/css/base/reset.css",
            "src/css/base/base.css",
            "src/css/common/common.css",
            "src/css/home/home.css",
        ])
        .pipe(concat("bundle.css"))
        .pipe(rename(`bundle-${bundleId}.css`))
        .pipe(gulp.dest("dist/css"));
};

const copyHtml = () => {
    return gulp.src(["src/**/*.html"])
        .pipe(inject.replace('bundle.css', `bundle-${bundleId}.css`))
        .pipe(inject.replace('bundle.js', `bundle-${bundleId}.js`))
        .pipe(gulp.dest("dist"));
};

const watch = () => {
    browserSync.init({
        server: "./dist",
        injectChanges: false,
    });
    gulp.watch(["src/css/**/*"], bundleCss).on("change", browserSync.reload);
    gulp.watch(["src/js/**/*"], bundleJs).on("change", browserSync.reload);
    gulp.watch(["src/**/*.html"], copyHtml).on("change", browserSync.reload);
};

const defaultTask = gulp.parallel(bundleJs, bundleCss, copyThings, copyHtml);

module.exports = {
    bundleJs,
    bundleCss,
    copyHtml,
    copyThings,
    default: defaultTask,
    watch: gulp.series(defaultTask, watch),
};
