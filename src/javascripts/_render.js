mumuki.load(function () {

  $.fn.renderMuComponents = function () {
    this.find('.mu-erd').renderERD();
    this.find('.mu-browser').renderWebBrowser();
    this.find('.mu-file-browser').renderFileBrowser();
  }

});
