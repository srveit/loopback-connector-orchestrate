'use strict';

var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  SpecReporter = require('jasmine-spec-reporter'),
  config = {};

config.paths = {
  coverage: 'reports',
  doc: 'docs'
};

config.lint = {
  js: {
    indent: 2,
    node: true,
    errorsOnly: true,
    predef: [
      'afterEach',
      'beforeEach',
      'describe',
      'expect',
      'fit',
      'it',
      'jasmine',
      'spyOn',
      'xdescribe',
      'xit'
    ]
  },
  json: {}
};

config.jasmine = {
  verbose: true,
  includeStackTrace: true,
  reporter: new SpecReporter()
};

config.files = {
  doc: 'lib/orchestrate.js',
  js: ['index.js', 'lib/orchestrate.js'],
  tests: ['test/**/*.spec.js'],
  lint: {
    js: [
      '**/*.js',
      '!docs/**/*',
      '!node_modules/**/*',
      '!reports/**/*'
    ],
    json: [
      '**/*.json',
      '!node_modules/**/*'
    ]
  }
};

config.istanbul = {
  base: {
    includeUntested: true
  },
  reports: {
    dir: config.paths.coverage,
    reporters: [ 'lcov' ],
    reportOpts: { dir: config.paths.coverage}
  },
  thresholds: {
    thresholds: {
      global: 70
    }
  }
};

gulp.task('lint:js', function () {
  return gulp.src(config.files.lint.js)
    .pipe(plugins.jslint(config.lint.js));
});

gulp.task('lint:json', function () {
  return gulp.src(config.files.lint.json)
    .pipe(plugins.jsonlint(config.lint.json))
    .pipe(plugins.jsonlint.reporter());
});

gulp.task('lint', gulp.parallel(
  'lint:js',
  'lint:json'
));

gulp.task('pre-test', function () {
  return gulp.src(config.files.js)
    .pipe(plugins.istanbul(config.istanbul.base))
    .pipe(plugins.istanbul.hookRequire());
});

gulp.task('post-test', function () {
  config.jasmine.reporter = new SpecReporter();
  return gulp.src(config.files.tests)
    .pipe(plugins.jasmine(config.jasmine))
    .pipe(plugins.istanbul.writeReports(config.istanbul.reports))
    .pipe(plugins.istanbul.enforceThresholds(config.istanbul.thresholds));
});

gulp.task('test', gulp.series(
  'pre-test',
  'post-test'
));

gulp.task('test:watch', function () {
  gulp.watch(config.files.tests.concat([config.files.js]),
             gulp.series('lint', 'test', 'jsdoc'));
});

gulp.task('jsdoc', function () {
  return gulp.src(config.files.doc, {read: false})
    .pipe(plugins.shell([
      'jsdoc -d <%= config.paths.doc %> <%= file.path %>'
    ], {
      templateData: {
        config: config
      }
    }));
});

gulp.task('default', gulp.series(
  'lint',
  'test',
  'jsdoc',
  'test:watch'
));
