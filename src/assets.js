const JS = [
  'jquery/dist/jquery.js',
  'bootstrap-sass/assets/javascripts/bootstrap.js',
  ''
].map((file) => `node_modules/@bower_components/${file}`);

module.exports = JS.concat([
  'node_modules/gojs/release/go.js'
]);
