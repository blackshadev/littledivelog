const ftp = require("vinyl-ftp");
const gulp = require("gulp");
const gutil = require("gulp-util");
const path = require("path");

gulp.task("deploy", function () {
  const remotePath = "/";
  const srcPath = path.join(__dirname, "../divingapp/dist");
  const glob = srcPath + "/**/*.*";

  var conn = ftp.create({
    host: process.env["FTP_HOST"],
    user: process.env["FTP_USER"],
    password: process.env["FTP_PASS"],
    log: gutil.log,
  });

  gutil.log("Deploying from: " + glob);
  gutil.log("Deploying to: " + process.env["FTP_HOST"]);

  return gulp
    .src(glob, { base: ".", buffer: false })
    .pipe(conn.dest(remotePath));
});
