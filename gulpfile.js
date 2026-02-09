"use strict";

// te rzeczy w obiekcie to sa funkcje z GULP
const { src, dest, series, parallel, watch, on } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
//minifikator css
const cssnano = require("gulp-cssnano");
//dodawanie wstecznej kompatybilnosci prefixow --moz --webkit
const autoprefixer = require("gulp-autoprefixer");
//wtyczka do zmieniania nazwy plików automatycznie
const rename = require("gulp-rename");
//przerabianie kodu javascrip na starszy np let na var
const babel = require("gulp-babel");
//minimalizacja js
const uglify = require("gulp-uglify");
//minimalizacja obrazów
const imagemin = require("gulp-imagemin");
//pokazuje w konsoli jak sa bledy która linijka zamiast pobierac ze zminifikowanego tylko 1 linijke
const sourcemaps = require("gulp-sourcemaps");

// browserSync - jak wtyczka liveserver tylko ze lepsza i mozna sie laczyc telefonem przez wifi z nasza strona projectowa
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;

// gulp-clean -czyszczenie plikow z dest (tych plikow stworzonych przez nasze wtyczki np zminifikowany css)
const clean = require('gulp-clean');
// zmiana rzeczy na wszystkich podstronach automatycznie
const kit = require('gulp-kit');


const paths = {
	//linki do plików z których pobieramy i np sassDest do którego ląduja przerobione

	html: "./html/**/*.kit",
	sass: "./src/sass/**/*.scss",
	js: "./src/js/**/*.js",
	img: "./src/img/**/*",

	//odwolanie się do dist dla gulp-cleana
	dist: './dist',
	sassDest: "./dist/css",
	jsDest: "./dist/js",
	minimizeImagesDest: "./dist/img",
};

function handleKits(done) {
	//wyjatkowo do kita tworzymy folder (html) i plik index z rozszerzeniem kit
	src(paths.html)
		.pipe(kit())
		//exportowanie plików do folderu głownego ze strona
		.pipe(dest("./"));

	done();
}

function sassCompiler(done) {
	// ** -przeszukaj wszystkie foldery i * - przeszukaj wszystkie pliki z rozszerzeniem scss
	//zeby ulatwic i zmniejszyc troche objętość kodu zamiast takiej sciezki podpiety jest obiekt
	// src("./src/sass/**/*.scss")
	src(paths.sass)
		.pipe(sourcemaps.init())
		//pipe to takie then w api
		.pipe(sass().on("error", sass.logError))
		//odpalanie kolejnych paczek (w tej samej funkcji bo wszystko do sasa)
		.pipe(autoprefixer())
		.pipe(cssnano())
		// z dokumentacji mozna wyczytac sufix dodaje cos po naszej nazwie pobranej wczesniej
		.pipe(rename({ suffix: "-min" }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sassDest));
	done();
}

function javascript(done) {
	src(paths.js)
		.pipe(sourcemaps.init())
		// informacja do babela co ma robic (sa inne presetsy do reacta i innych)
		.pipe(babel({ presets: ["@babel/env"] }))
		.pipe(uglify())
		.pipe(rename({ suffix: "-min" }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.jsDest));

	done();
}
function minimizeImages(done) {
	src(paths.img)
		.pipe(imagemin())
		.pipe(rename({ suffix: "-min" }))
		.pipe(dest(paths.minimizeImagesDest));

	done();
}


//kasowanie calego folderu dist 
function cleanStaff(done) {
	src(paths.dist, { read: false })
		.pipe(clean());

	done();
}



function startBrowserSync(done) {
	browserSync.init({
		server: {
			baseDir: "./",
		},
		port: 3005,
		ui: {
			port: 3006
		}
	});
	done();
}
function watchForChanges(done) {
	//obserwacja zmian 
	//sciezka z browserSync strony (Manual Reloading) parzy na zmiany w html tylko
	watch("./*.html").on("change", reload);

	//obserwacja innych plikow (sass,js -musza byc w tablicy (zeby bylo podstawione dobrze pod sciezke))
	//jak bedzie jakas zmiana to odpali nasze funkcje
	watch([paths.html, paths.sass, paths.js], parallel(handleKits, sassCompiler, javascript)).on("change", reload);

	//oddzielne reload dla obrazków zeby nie odpalala sie funkcja za kazdym razem kiedy cos sie zmieni w css tylko jak zmienia sie obrazy i img

	watch(paths.img, minimizeImages).on("change", reload);
	done();
}

// exports.sassCompiler = sassCompiler
// przed browserSynkiem - exports.default = series(sassCompiler, javascript, minimizeImages);

// po browsersyncu zeby najpierw wykonały się minifikacje itd a pozniej to pojawiło się na stronie
const mainFunctions = parallel(handleKits, sassCompiler, javascript, minimizeImages);

//oddzielne odpalanie tej funkcji zeby przypadkiem czegoś nie skasowac przez ciagłe odpalanie jej
// po tym trzeba ponownie odpalic defaultowa funkcje ktora stworzy pliki na nowo
exports.cleanStaff = cleanStaff;

exports.default = series(mainFunctions, startBrowserSync, watchForChanges);
