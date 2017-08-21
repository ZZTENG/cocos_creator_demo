var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("default", function () {
    return gulp.src("assets/scripts/manager/OwnDefine.js")
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest("lib_es5"));
});