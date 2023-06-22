const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const plumber = require('gulp-plumber');
const sourceMaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');

// Задача для компиляции SCSS в CSS, добавления вендорных префиксов и создания sourcemaps
gulp.task('sass', function() {
    return gulp.src('scss/style.scss') // получение исходного SCSS-файла
        .pipe(plumber({ // обработка ошибок с помощью пакета plumber
            errorHandler: notify.onError({ // вывод уведомления об ошибке с помощью пакета gulp-notify
                title: 'Sass Compilation Failed', // заголовок уведомления
                message: '<%= error.message %>' // сообщение с ошибкой
            })
        }))
        .pipe(sourceMaps.init()) // создание sourcemaps
        .pipe(sass()) // компиляция SCSS в CSS
        .pipe(autoprefixer({ // добавление вендорных префиксов
            overrideBrowserslist: ['last 2 versions'], // список поддерживаемых браузеров
            cascade: false // настройка формата вывода стилей
        }))
        .pipe(sourceMaps.write()) // запись sourcemaps
        .pipe(gulp.dest('build/css')) // сохранение CSS-файла
        .pipe(browserSync.stream()); // обновление страницы браузера
});

// Минификация CSS и добавление суффикса .min к имени файла
gulp.task('css-min', function() {
    return gulp.src('scss/style.scss')
        .pipe(sass())
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('build/css'));
});

// Оптимизация изображений
gulp.task('img', function() {
    return gulp.src('img/**/*')
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/img'));
});

// Слежение за изменениями файлов и запуск задач
gulp.task('watch', function() {
    gulp.watch('scss/**/*.scss', gulp.parallel('sass'));
});

// Копирование HTML-файлов и обновление страницы браузера
gulp.task('html', function() {
    return gulp.src('*.html')
        .pipe(gulp.dest('build'))
        .pipe(browserSync.stream());
});

// Запуск локального сервера и слежение за изменениями файлов
gulp.task('serve', gulp.series('html', 'sass', function() {
    browserSync.init({
        server: 'build'
    });
    gulp.watch('scss/**/*.scss', gulp.parallel('img', 'css-min', 'sass', 'watch'));
    gulp.watch('*.html', gulp.parallel('html'));
}));