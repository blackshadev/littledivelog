var ftp = require("vinyl-ftp");
var gutil = require("gulp-util");
var gulp = require("gulp");

gulp.task("deploy", function () {
  var remotePath = "/";
  var conn = ftp.create({
    host: process.env["FTP_HOST"],
    user: process.env["FTP_USER"],
    password: process.env["FTP_PASS"],
    log: gutil.log,
  });

  console.log(process.env["FTP_HOST"]);
  console.log(process.env["FTP_USER"]);

  return gulp
    .src([`${process.env["FTP_DIR"]}/**/*.*`])
    .pipe(conn.newer(remotePath))
    .pipe(conn.dest(remotePath));
});
