mumuki.load(function () {

  function getHeader(name) {
    return '<header>' + name + '</header>';
  }

  function getMain(columns, rows) {
    return [
      '<table>',
      '  <thead>', getTableHead(columns), '</thead>',
      '  <tbody>', getTableBody(rows), '</tbody>',
      '</table>',
    ].join('');
  }

  function getTableHead(columns) {
    var cols = '';
    cols += '<tr>';
    columns.forEach(function (col) {
      cols += '<th style="width: calc(100% / ' + columns.length + ')">' + getColumnName(col) + '</th>';
    });
    cols += '</tr>';
    return cols;
  }

  function getTableBody(rows) {
    var rowstr = '';
    rows.forEach(function (row) {
      rowstr += '<tr>';
      row.forEach(function (data) {
        rowstr += '<td style="width: calc(100% / ' + row.length + ')">' + (data === null ? 'NULL' : data) + '</td>';
      });
      rowstr += '</tr>';
    });
    return rowstr;
  }

  function getColumnName(column) {
    var obj = typeof column === 'string' ? {name: column} : column;
    return [
      keyIconFor(obj, 'pk'),
      keyIconFor(obj, 'fk'),
      '<span>', obj.name, '</span>',
    ].join('');
  }

  function keyIconFor(column, field) {
    return !!column[field] ? '<i class="fa fa-fw fa-key mu-sql-table-' + field + '"></i>' : '';
  }

  $.fn.renderSqlTable = function () {
    var self = this;
    self.empty();
    self.each(function (i) {
      var $table = $(self[i]);
      var name = $table.data('name');
      var rows = $table.data('rows');
      var columns = $table.data('columns');

      var $header = getHeader(name);
      var $main = getMain(columns, rows);

      $table.append($header);
      $table.append($main);
    });
    return self;
  }

  mumuki.resize(function () {
    $('.mu-sql-table').renderSqlTable();
  });

});
