mumuki.load(function () {

  $.fn.renderSqlTable = function () {
    var self = this;
    self.empty();
    self.each(function (i) {
      var $table = $(self[i]);
    });
    return self;
  }

  mumuki.resize(function () {
    $('.mu-sql-table').renderSqlTable();
  });

});
