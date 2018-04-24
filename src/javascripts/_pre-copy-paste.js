mumuki.load(function () {

  var language = {
    es: {
      copy: 'Copiar',
      copied: 'Copiado'
    },
    en: {
      copy: 'Copy',
      copied: 'Copied'
    },
    pt: {
      copy: 'Copiar',
      copied: 'Copiado'
    },
  }

  function getCopiedText() {
    var lang = (mumuki.locale || navigator.language || navigator.userLanguage || 'en').split('-')[0];
    return language[lang];
  }

  function copyToClipboard(text) {
    var $temp = $("<textarea>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
  }

  function pasteInEditor(text) {
    var $editor = $('.mu-paste-target');
    var cursorPosStart = $editor.prop('selectionStart');
    var cursorPosEnd = $editor.prop('selectionEnd');
    var v = $editor.val() || '';
    var textBefore = v.substring(0,  cursorPosStart);
    var textAfter  = v.substring(cursorPosEnd, v.length);
    $editor.val(textBefore + text + textAfter);
  }

  function changeTextAndColor($clipboard) {
    var $span = $clipboard.find('span');
    $clipboard.addClass('clicked');
    $span.text(getCopiedText().copied);
    setTimeout(function () {
      $span.text(getCopiedText().copy);
      $clipboard.removeClass('clicked')
    }, 2.5 * 1000);
  }

  $.fn.renderCopyPaste = function () {
    var self = this;
    self.each(function (i) {
      var $pre = $(self[i]);
      var $code = $pre.children('code');
      if ($code.length > 0) {
        $pre.children('span').remove();
        var $clipboard = $('<span>', {
          class: 'mu-clipboard',
          html: '<i class="fa fa-fw fa-clipboard"></i> <span>' + getCopiedText().copy + '</span>',
          click: function () {
            copyToClipboard($code.text());
            pasteInEditor($code.text());
            changeTextAndColor($clipboard);
          }
        });
        $pre.append($clipboard);
      }
    });

    return self;
  }

  mumuki.resize(function () {
    $('pre').renderCopyPaste();
  });

});
