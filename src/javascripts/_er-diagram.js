mumuki.load(function () {

  function entityID(entity) {
    return 'mu-erd-' + entity.toLowerCase().replace(/[_]/g, '-');
  }

  function columnID(entity, column) {
    return entityID(entity) + '-' + column.toLowerCase().replace(/[_]/g, '-');
  }

  function keyIconFor(column, field) {
    var bool = (column[field] instanceof Array && column[field].length > 0) || (!!column[field]);
    return bool ? '<i class="fa fa-fw fa-key mu-erd-' + field + '"></i>' : '';
  }

  function generateEntityColumns(entity) {
    var columns = entity.columns || [];
    var html = '';
    columns.forEach(function (column) {
      html += [
        '<li id="', columnID(entity.name, column.name), '" class="mu-erd-entity-column">',
        '  <span class="mu-erd-entity-column-name">',
              keyIconFor(column, 'pk'),
              keyIconFor(column, 'fks'),
              '<span>', column.name, '</span>',
        '  </span>',
        '  <span class="mu-erd-entity-column-type">', column.type, '</span>',
        '</li>'
      ].join('');
    })
    return html;
  }

  function appendEntities($diagram, entities) {
    entities.forEach(function (entity) {
      var $entity = $([
        '<div id="', entityID(entity.name), '" class="mu-erd-entity">',
        '  <div class="mu-erd-entity-name">',
              entity.name,
        '  </div>',
        '  <ul class="mu-erd-entity-columns">',
              generateEntityColumns(entity),
        '  </ul>',
        '</div>',
      ].join(''));
      $diagram.append($entity);
    });
  }

  function drawColumnFK(entity, column) {
    var fks = column.fks || [];
    return fks.map(drawFK.bind(this, entity, column)).join('');
  }

  function drawFK(entity, column, fk) {
    var $entityFrom = $('#' + entityID(entity.name));
    var $columnFrom = $('#' + columnID(entity.name, column.name));
    var $entityTo = $('#' + entityID(fk.to.entity));
    var $columnTo = $('#' + columnID(fk.to.entity, fk.to.column));
    return connectors[fk.type]($entityFrom, $columnFrom, $entityTo, $columnTo, fk);
  }

  function drawConnectorLines(entity) {
    var columns = entity.columns || [];
    return columns.map(drawColumnFK.bind(this, entity)).join('');
  }

  function getSVGFor(entity) {
    return ['<svg id="', entityID(entity.name), '-svg">', drawConnectorLines(entity), '</svg>'].join('');
  }

  function appendConnectors($diagram, entities) {
    entities.forEach(function (entity) {
      var $svg = $(getSVGFor(entity));
      $diagram.append($svg);
    });
  }

  $.fn.renderERD = function () {
    var self = this;
    self.each(function (i) {
      var $diagram = $(self[i]);
      var entities = $diagram.data('entities');
      appendEntities($diagram, entities);
      appendConnectors($diagram, entities);
    });
    return self;
  }

  var connectors = {
    one_to_one: function($entityFrom, $columnFrom, $entityTo, $columnTo, fk) {
      var fromX = $entityFrom.position().left + $entityFrom.width() + ($entityFrom.css('border-width')[0] * 2);
      var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
      var toX = $entityTo.position().left;
      var toY = $columnTo.position().top + $columnTo.height() / 2;

      var middle = (fromX + toX) / 2;

      return [
        svgLine(fromX, middle, fromY, fromY),
        svgLine(middle, middle, fromY, toY),
        svgLine(middle, toX, toY, toY),

        svgLine(fromX + 10, fromX + 10, fromY - 10, fromY + 10),

        svgLine(toX - 10, toX - 10, toY - 10, toY + 10),

      ].join('');
    },
    many_to_one: function($entityFrom, $columnFrom, $entityTo, $columnTo, fk) {
      var fromX = $entityFrom.position().left + $entityFrom.width() + ($entityFrom.css('border-width')[0] * 2);
      var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
      var toX = $entityTo.position().left;
      var toY = $columnTo.position().top + $columnTo.height() / 2;

      var middle = (fromX + toX) / 2;

      return [
        svgLine(fromX, middle, fromY, fromY),
        svgLine(middle, middle, fromY, toY),
        svgLine(middle, toX, toY, toY),

        svgLine(fromX, fromX + 10, fromY - 10, fromY),
        svgLine(fromX, fromX + 10, fromY + 10, fromY),

        svgLine(toX - 10, toX - 10, toY - 10, toY + 10),
        svgLine(toX - 10, toX - 10, toY - 10, toY + 10),

      ].join('');
    },
    one_to_many: function($entityFrom, $columnFrom, $entityTo, $columnTo, fk) {
      var fromX = $entityFrom.position().left + $entityFrom.width() +  + ($entityFrom.css('border-width')[0] * 2);
      var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
      var toX = $entityTo.position().left;
      var toY = $columnTo.position().top + $columnTo.height() / 2;

      var middle = (fromX + toX) / 2;

      return [
        svgLine(fromX, middle, fromY, fromY),
        svgLine(middle, middle, fromY, toY),
        svgLine(middle, toX, toY, toY),

        svgLine(fromX + 10, fromX + 10, fromY - 10, fromY + 10),
        svgLine(fromX + 10, fromX + 10, fromY - 10, fromY + 10),

        svgLine(toX, toX - 10, toY - 10, toY),
        svgLine(toX, toX - 10, toY + 10, toY),

      ].join('');
    },
    many_to_many: function($entityFrom, $columnFrom, $entityTo, $columnTo, fk) {
      var fromX = $entityFrom.position().left + $entityFrom.width() + ($entityFrom.css('border-width')[0] * 2);
      var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
      var toX = $entityTo.position().left;
      var toY = $columnTo.position().top + $columnTo.height() / 2;

      var middle = (fromX + toX) / 2;

      return [
        svgLine(fromX, middle, fromY, fromY),
        svgLine(middle, middle, fromY, toY),
        svgLine(middle, toX, toY, toY),

        svgLine(fromX, fromX + 10, fromY - 10, fromY),
        svgLine(fromX, fromX + 10, fromY + 10, fromY),

        svgLine(toX, toX - 10, toY - 10, toY),
        svgLine(toX, toX - 10, toY + 10, toY),

      ].join('');
    }
  }

  function svgLine(x1, x2, y1 , y2) {
    return ['<line x1="', x1, '" x2="', x2, '" y1="', y1, '" y2="', y2, '" stroke="black" stroke-width="1"/>'].join('');
  }

  window.addEventListener('resize', function () {
    $('.mu-erd').empty().renderERD();
  });

  $('.mu-erd').renderERD();

});
