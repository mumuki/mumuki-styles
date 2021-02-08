const JS = [
  'jquery/dist/jquery.js',
  '@popperjs/core/dist/umd/popper.js',
  'bootstrap/dist/js/bootstrap.js'
].map((file) => `node_modules/${file}`);

module.exports = JS;
