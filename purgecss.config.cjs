module.exports = {
  content: [
    './src/main/webapp/**/*.html',
    './src/main/webapp/**/*.jsp',
    './src/main/webapp/**/*.js'
  ],
  css: ['./src/main/webapp/css/etc/_main.css'],
  output: './purged-css',
  safelist: [/^ng-/, /^ui-/, /^fa-/, 'active']
};