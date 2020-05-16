// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

const configuration = {
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter'),
        require('karma-coverage-istanbul-reporter'),
        require('@angular-devkit/build-angular/plugins/karma'),
        require('karma-jquery'),
    ],
    client: {
        clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    files: [],
    preprocessors: {},
    mime: {
        'text/x-typescript': ['ts', 'tsx'],
    },
    coverageIstanbulReporter: {
        dir: require('path').join(__dirname, 'coverage'),
        reports: ['html', 'lcovonly'],
        fixWebpackSourcePaths: true,
    },
    customLaunchers: {
        chromeTravisCi: {
            base: 'ChromeHeadless',
            flags: ['--no-sandbox'],
        },
    },
    reporters:
        config.angularCli && config.angularCli.codeCoverage
            ? ['progress', 'coverage-istanbul']
            : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
};
if (process.env.TRAVIS) {
    configuration.browsers = ['chromeTravisCi'];
    configuration.singleRun = true;
    configuration.autoWatch = false;
}

module.exports = function (config) {
    config.set(configuration);
};
