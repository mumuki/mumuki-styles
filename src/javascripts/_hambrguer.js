mumuki.load(function () {

  var OPEN_CLASS = 'mu-hamburguer-open';

  $('header .mu-hamburguer i').click(function () {

    var $nav = $('header .mu-nav');

    $('body').toggleClass(OPEN_CLASS);
    $nav.toggleClass(OPEN_CLASS);

    if ($nav.hasClass(OPEN_CLASS)) {
      $('.mu-breadcrumb .brand').focus();
    }
  });

});
