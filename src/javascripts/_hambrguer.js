mumuki.load(function () {

  var OPEN_CLASS = 'mu-hamburguer-open';

  $('header .mu-hamburguer i').click(function () {
    $('header .mu-nav, body').toggleClass(OPEN_CLASS);
  });

});
