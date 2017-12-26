mumuki.load(function () {

  function getBrowserHeader($browser) {
    var title = $browser.data('title') || 'Mumuki';
    var favicon = $browser.data('favicon') || 'https://mumuki.io/logo-alt-png';
    var url = $browser.data('url') || 'https://mumuki.io';
    return $([
      '<header>',
      '  <ul class="mu-browser-tabs">',
      '    <li class="mu-browser-tab active">',
      '      <img src="', favicon, '">',
      '      <span>', title, '<span>',
      '    </li>',
      '    <li class="mu-browser-tab mu-browser-new-tab">',
      '      <i class="fa fa-fw fa-plus"></i>',
      '    </li>',
      '  </ul>',
      '  <div class="mu-browser-bar">',
      '    <i class="mu-arrow-left"></i>',
      '    <i class="mu-arrow-right"></i>',
      '    <i class="mu-refresh"></i>',
      '    <input class="mu-web-browser-path" type="text" readonly value="', url, '">',
      '  </header>',
      '</header>'
    ].join(''))
  }

  function getBrowserMain($browser) {
    return $([
      '<main>',
      '  <iframe srcdoc="', $browser.data('srcdoc'), '" frameborder="0"></iframe>',
      '</main>'
    ].join(''));
  }

  $.fn.renderWebBrowser = function () {
    var self = this;
    self.empty();
    self.each(function (i) {
      var $browser = $(self[i]);

      var $header = getBrowserHeader($browser);
      var $main = getBrowserMain($browser);

      $browser.empty();

      $browser.append($header);
      $browser.append($main);
    });

    return self;
  }

  $('.mu-browser').renderWebBrowser();

});
