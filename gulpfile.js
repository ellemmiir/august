const { src, dest, watch, parallel, series } = require("gulp");

const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

const panini = require("panini");

const concat = require("gulp-concat");
const scss = require("gulp-sass")(require("sass"));
const autoPrefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require("gulp-strip-css-comments");

const uglify = require("gulp-uglify");

const newer = require("gulp-newer");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const svgSprite = require("gulp-svg-sprite");

const del = require("del");

const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");

const browserSync = require("browser-sync");

const srcPath = "src/";
const distPath = "docs/";

const path = {
  build: {
    html: distPath,
    css: distPath + "css",
    js: distPath + "js",
    images: distPath + "images",
    fonts: distPath + "fonts",
  },
  src: {
    html: [
      srcPath + "*.html",
      srcPath + "types/*.html",
      srcPath + "services/*.html",
      srcPath + "projects/*.html",
    ],
    css: srcPath + "scss/*.scss",
    js: srcPath + "js/*.js",
    images: srcPath + "images/**/*.{svg,jpg,jpeg,png,gif,ico,xml,json,webp}",
    svg: srcPath + "images/**/*.svg",
    fonts: srcPath + "fonts/**/*.{otf,woff,woff2,ttf,svg}",
  },
  watch: {
    html: [
      srcPath + "*.html",
      srcPath + "types/*.html",
      srcPath + "services/*.html",
      srcPath + "projects/*.html",
    ],
    css: srcPath + "scss/**/*.scss",
    js: srcPath + "js/**/*.js",
    images: srcPath + "images/**/*.{jpg,jpeg,png,gif,ico,xml,json,webp}",
    svg: srcPath + "images/**/*.svg",
    fonts: srcPath + "fonts/**/*.{otf,woff,woff2,ttf,svg}",
  },
  clean: "./" + distPath,
};

function server() {
  browserSync.init({
    server: {
      baseDir: "./" + distPath,
    },
    open: false,
  });
}

function pages() {
  panini.refresh();
  return src(path.src.html, { base: srcPath })
    .pipe(plumber())
    .pipe(
      panini({
        root: srcPath,
        layouts: srcPath + "tpl/layouts/",
        partials: srcPath + "tpl/partials",
        data: srcPath + "tpl/data",
      }),
    )
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream());
}

function styles() {
  return src(
    [
      path.src.css,
      "node_modules/locomotive-scroll/bundled/locomotive-scroll.css",
    ],
    { base: srcPath + "scss/" },
  )
    .pipe(
      plumber({
        errorHandler: function (err) {
          notify.onError({
            title: "SCSS Error",
            message: "Error <%- error.message %>",
          })(err);
          this.emit("end");
        },
      }),
    )
    .pipe(concat("style.css"))
    .pipe(scss())
    .pipe(autoPrefixer())
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(removeComments())
    .pipe(concat("style.min.css"))
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream());
}

function scripts() {
  return src(
    [
      "node_modules/jquery/dist/jquery.js",
      "node_modules/locomotive-scroll/bundled/locomotive-scroll.js",
      path.src.js,
    ],
    {
      base: srcPath + "js/",
    },
  )
    .pipe(
      plumber({
        errorHandler: function (err) {
          notify.onError({
            title: "JS Error",
            message: "Error <%- error.message %>",
          })(err);
          this.emit("end");
        },
      }),
    )
    .pipe(concat("main.js"))
    .pipe(dest(path.build.js))
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());
}

function images() {
  return src(path.src.images, { base: srcPath + "images/" })
    .pipe(newer(path.build.images))
    .pipe(webp())

    .pipe(src(path.src.images, { base: srcPath + "images/" }))
    .pipe(newer(path.build.images))
    .pipe(imagemin())

    .pipe(dest(path.build.images))
    .pipe(browserSync.stream());
}

function sprite() {
  return src(path.src.svg, { base: srcPath + "images/*.svg" })
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
            example: true,
          },
        },
      }),
    )
    .pipe(dest(path.build.images))
    .pipe(browserSync.stream());
}

function fonts() {
  return src(path.src.fonts, { base: srcPath + "fonts/" })
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      }),
    )
    .pipe(src(path.src.fonts + "*.ttf"))
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
    .pipe(browserSync.stream());
}

function clean() {
  return del(path.clean);
}

function watchFiles() {
  watch(path.watch.html, pages);
  watch(path.watch.css, styles);
  watch(path.watch.js, scripts);
  watch(path.watch.images, images);
  watch(path.watch.svg, sprite);
  watch(path.watch.fonts, fonts);
}
const build = series(
  clean,
  parallel(pages, styles, scripts, images, fonts, sprite),
);

exports.pages = pages;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.sprite = sprite;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;

exports.default = parallel(build, watchFiles, server);
