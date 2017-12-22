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

  function drawConnectorLines(entity) {
    var columns = entity.columns || [];
    return columns.map(function (column) {
      var fks = column.fks || [];
      return fks.map(function (fk) {
        return connectors[fk.type](entity, column, fk);
      }).join('');
    }).join('');
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
    one_to_one: function(entity, column, fk) {
      var $entityFrom = $('#' + entityID(entity.name));
      var $columnFrom = $('#' + columnID(entity.name, column.name));
      var $entityTo = $('#' + entityID(fk.to.entity));
      var $columnTo = $('#' + columnID(fk.to.entity, fk.to.column));

      var fromX = $entityFrom.position().left + $entityFrom.width() + ($entityFrom.css('border-width')[0] * 2);
      var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
      var toX = $entityTo.position().left;
      var toY = $columnTo.position().top + $columnTo.height() / 2;

      var middle = (fromX + toX) / 2;

      return [
        '<line x1="', fromX, '" x2="', middle, '" y1="', fromY, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', middle, '" x2="', middle, '" y1="', fromY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', middle, '" x2="', toX, '" y1="', toY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

        '<line x1="', fromX + 10, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY + 10, '" stroke="black" stroke-width="1"/>',

        '<line x1="', toX - 10, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY + 10, '" stroke="black" stroke-width="1"/>',

      ].join('');
    },
    many_to_one: function(entity, column, fk) {
      var $entityFrom = $('#' + entityID(entity.name));
      var $columnFrom = $('#' + columnID(entity.name, column.name));
      var $entityTo = $('#' + entityID(fk.to.entity));
      var $columnTo = $('#' + columnID(fk.to.entity, fk.to.column));

      var fromX = $entityFrom.position().left + $entityFrom.width() + ($entityFrom.css('border-width')[0] * 2);
      var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
      var toX = $entityTo.position().left;
      var toY = $columnTo.position().top + $columnTo.height() / 2;

      var middle = (fromX + toX) / 2;

      return [
        '<line x1="', fromX, '" x2="', middle, '" y1="', fromY, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', middle, '" x2="', middle, '" y1="', fromY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', middle, '" x2="', toX, '" y1="', toY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

        '<line x1="', fromX, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', fromX, '" x2="', fromX + 10, '" y1="', fromY + 10, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',

        '<line x1="', toX - 10, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY + 10, '" stroke="black" stroke-width="1"/>',
        '<line x1="', toX - 10, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY + 10, '" stroke="black" stroke-width="1"/>',

      ].join('');
    },
    one_to_many: function(entity, column, fk) {
      var $entityFrom = $('#' + entityID(entity.name));
      var $columnFrom = $('#' + columnID(entity.name, column.name));
      var $entityTo = $('#' + entityID(fk.to.entity));
      var $columnTo = $('#' + columnID(fk.to.entity, fk.to.column));

      var fromX = $entityFrom.position().left + $entityFrom.width() +  + ($entityFrom.css('border-width')[0] * 2);
      var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
      var toX = $entityTo.position().left;
      var toY = $columnTo.position().top + $columnTo.height() / 2;

      var middle = (fromX + toX) / 2;

      return [
        '<line x1="', fromX, '" x2="', middle, '" y1="', fromY, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', middle, '" x2="', middle, '" y1="', fromY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', middle, '" x2="', toX, '" y1="', toY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

        '<line x1="', fromX + 10, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY + 10, '" stroke="black" stroke-width="1"/>',
        '<line x1="', fromX + 10, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY + 10, '" stroke="black" stroke-width="1"/>',

        '<line x1="', toX, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', toX, '" x2="', toX - 10, '" y1="', toY + 10, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

      ].join('');
    },
    many_to_many: function(entity, column, fk) {
      var $entityFrom = $('#' + entityID(entity.name));
      var $columnFrom = $('#' + columnID(entity.name, column.name));
      var $entityTo = $('#' + entityID(fk.to.entity));
      var $columnTo = $('#' + columnID(fk.to.entity, fk.to.column));

      var fromX = $entityFrom.position().left + $entityFrom.width() + ($entityFrom.css('border-width')[0] * 2);
      var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
      var toX = $entityTo.position().left;
      var toY = $columnTo.position().top + $columnTo.height() / 2;

      var middle = (fromX + toX) / 2;

      return [
        '<line x1="', fromX, '" x2="', middle, '" y1="', fromY, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', middle, '" x2="', middle, '" y1="', fromY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', middle, '" x2="', toX, '" y1="', toY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

        '<line x1="', fromX, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', fromX, '" x2="', fromX + 10, '" y1="', fromY + 10, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',

        '<line x1="', toX, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
        '<line x1="', toX, '" x2="', toX - 10, '" y1="', toY + 10, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

      ].join('');
    }
  }

  window.addEventListener('resize', function () {
    $('.mu-erd').empty().renderERD();
  });

  $('.mu-erd').renderERD();

});
