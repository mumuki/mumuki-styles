mumuki.load(function () {

  $.fn.renderMuComponents = function () {
    this.find('.mu-erd').renderERD();
    this.find('pre').renderCopyPaste();
    this.find('.mu-browser').renderWebBrowser();
    this.find('.mu-sql-table').renderSqlTable();
    this.find('.mu-file-browser').renderFileBrowser();
    this.find('.mu-sql-table-rendered').renderPrerenderedSqlTable();
  }

});
