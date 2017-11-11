mumuki.load(function () {

  var OPEN_CLASS = 'mu-hamburguer-open';

  $('header .mu-hamburguer').click(function () {
    $('header .mu-nav').toggleClass(OPEN_CLASS);
    $('body').toggleClass(OPEN_CLASS);
  });

});
