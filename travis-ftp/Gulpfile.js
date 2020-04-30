var ftp = require("vinyl-ftp");
var gulp = require("gulp");
var path = require("path");

gulp.task("deploy", function () {
  const remotePath = "/";
  const srcPath = path.join(__dirname, "../divingapp/dist");
  var conn = ftp.create({
    host: process.env["FTP_HOST"],
    user: process.env["FTP_USER"],
    password: process.env["FTP_PASS"],
  });

  return gulp
    .src([srcPath + "/**/*.*"], { base: ".", buffer: false })
    .pipe(conn.dest(remotePath));
});
