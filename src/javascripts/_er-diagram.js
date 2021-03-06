mumuki.load(function () {

  let C = 10;
  const BORDER = 4;

  const availableDirections = {
    up: function ($entity, $column) {
      const x1 = $entity.from.position().left + $entity.from.width() + BORDER;
      const y1 = $column.from.position().top + $column.from.height() / 2 + 5;
      const x2 = $entity.to.position().left + $entity.to.width() + BORDER;
      const y2 = $column.to.position().top + $column.to.height() / 2 + 5;
      return { x1: x1, x2: x2, y1: y1, y2: y2, mi: Math.max(x1, x2) + C * 2, dx1: C, dx2: C };
    },
    down: function ($entity, $column) {
      const x1 = $entity.from.position().left + $entity.from.width() + BORDER;
      const y1 = $column.from.position().top + $column.from.height() / 2 + 5;
      const x2 = $entity.to.position().left + $entity.to.width() + BORDER;
      const y2 = $column.to.position().top + $column.to.height() / 2 + 5;
      return { x1: x1, x2: x2, y1: y1, y2: y2, mi: Math.max(x1, x2) + C * 2, dx1: C, dx2: C };
    },
    left: function ($entity, $column) {
      const x1 = $entity.from.position().left;
      const y1 = $column.from.position().top + $column.from.height() / 2 + 5;
      const x2 = $entity.to.position().left + $entity.to.width() + BORDER;
      const y2 = $column.to.position().top + $column.to.height() / 2 + 5;
      return { x1: x1, x2: x2, y1: y1, y2: y2, mi: (x1 + x2) / 2, dx1: -C, dx2: C };
    },
    right: function ($entity, $column) {
      const x1 = $entity.from.position().left + $entity.from.width() + BORDER;
      const y1 = $column.from.position().top + $column.from.height() / 2 + 5;
      const x2 = $entity.to.position().left;
      const y2 = $column.to.position().top + $column.to.height() / 2 + 5;
      return { x1: x1, x2: x2, y1: y1, y2: y2, mi: (x1 + x2) / 2, dx1: C, dx2: -C };
    },
    up_left: function ($entity, $column) {
      const x1 = $entity.from.position().left;
      const y1 = $column.from.position().top + $column.from.height() / 2 + 5;
      const x2 = $entity.to.position().left + $entity.to.width() + BORDER;
      const y2 = $column.to.position().top + $column.to.height() / 2 + 5;
      return { x1: x1, x2: x2, y1: y1, y2: y2, mi: (x1 + x2) / 2, dx1: -C, dx2: C };
    },
    up_right: function ($entity, $column) {
      const x1 = $entity.from.position().left + $entity.from.width() + BORDER;
      const y1 = $column.from.position().top + $column.from.height() / 2 + 5;
      const x2 = $entity.to.position().left;
      const y2 = $column.to.position().top + $column.to.height() / 2 + 5;
      return { x1: x1, x2: x2, y1: y1, y2: y2, mi: (x1 + x2) / 2, dx1: C, dx2: -C };
    },
    down_left: function ($entity, $column) {
      const x1 = $entity.from.position().left;
      const y1 = $column.from.position().top + $column.from.height() / 2 + 5;
      const x2 = $entity.to.position().left + $entity.to.width() + BORDER;
      const y2 = $column.to.position().top + $column.to.height() / 2 + 5;
      return { x1: x1, x2: x2, y1: y1, y2: y2, mi: (x1 + x2) / 2, dx1: -C, dx2: C };
    },
    down_right: function ($entity, $column) {
      const x1 = $entity.from.position().left + $entity.from.width() + BORDER;
      const y1 = $column.from.position().top + $column.from.height() / 2 + 5;
      const x2 = $entity.to.position().left;
      const y2 = $column.to.position().top + $column.to.height() / 2 + 5;
      return { x1: x1, x2: x2, y1: y1, y2: y2, mi: (x1 + x2) / 2, dx1: C, dx2: -C };
    },
  };

  const connectors = {
    one_to_one: function (points) {
      return [
        svgLine(points.x1 + points.dx1, points.x1 + points.dx1, points.y1 - C, points.y1 + C), // | from
        svgLine(points.x2 + points.dx2, points.x2 + points.dx2, points.y2 - C, points.y2 + C), // | to
      ].join('');
    },
    many_to_one: function (points) {
      return [
        svgLine(points.x1, points.x1 + points.dx1, points.y1 - C, points.y1),  //                 \ from  many
        svgLine(points.x1, points.x1 + points.dx1, points.y1 + C, points.y1),  //                 / from  many
        svgLine(points.x2 + points.dx2, points.x2 + points.dx2, points.y2 - C, points.y2 + C), // | to one
      ].join('');
    },
    one_to_many: function (points) {
      return [
        svgLine(points.x1 + points.dx1, points.x1 + points.dx1, points.y1 - C, points.y1 + C),  // | from one
        svgLine(points.x2, points.x2 + points.dx2, points.y2 - C, points.y2),  //                  \ to  many
        svgLine(points.x2, points.x2 + points.dx2, points.y2 + C, points.y2),  //                  / to  many
      ].join('');
    },
    many_to_many: function (points) {
      return [
        svgLine(points.x1, points.x1 + points.dx1, points.y1 - C, points.y1),  //                  \ from  many
        svgLine(points.x1, points.x1 + points.dx1, points.y1 + C, points.y1),  //                  / from  many
        svgLine(points.x2, points.x2 + points.dx2, points.y2 - C, points.y2),  //                  \ to  many
        svgLine(points.x2, points.x2 + points.dx2, points.y2 + C, points.y2),  //                  / to  many
      ].join('');
    }
  };

  function entityID(entity, index) {
    return 'mu-erd-' + index + '-' + entity.toLowerCase().replace(/[_]/g, '-');
  }

  function columnID(entity, column, index) {
    return entityID(entity, index) + '-' + column.toLowerCase().replace(/[_]/g, '-');
  }

  function keyIconFor(column, field) {
    return !!column[field] ? '<i class="fas fa-fw fa-key mu-erd-' + field + '"></i>' : '';
  }

  function generateEntityColumns(entity, index) {
    const columns = entity.columns || [];
    let html = '';
    columns.forEach(function (column) {
      html += [
        '<li id="', columnID(entity.name, column.name, index), '" class="mu-erd-entity-column">',
        '  <span class="mu-erd-entity-column-name">',
              keyIconFor(column, 'pk'),
              keyIconFor(column, 'fk'),
              '<span>', column.name, '</span>',
        '  </span>',
        '  <span class="mu-erd-entity-column-type">', column.type, '</span>',
        '</li>'
      ].join('');
    });
    return html;
  }

  function appendEntities($diagram, entities, index) {
    entities.forEach(function (entity) {
      const $entity = $([
        '<div id="', entityID(entity.name, index), '" class="mu-erd-entity">',
        '  <div class="mu-erd-entity-name">',
        entity.name,
        '  </div>',
        '  <ul class="mu-erd-entity-columns">',
        generateEntityColumns(entity, index),
        '  </ul>',
        '</div>',
      ].join(''));
      $diagram.append($entity);
    });
  }

  function drawColumnFK(entity, index, column) {
    try {
      return drawFK(entity, column, column.fk, index);
    } catch (e) {
      console.warn("An error occurred when drawing foreign keys for entity", entity, column, column.fk)
    }
  }

  function getDirection($entityFrom, $entityTo) {
    let direction = '';
    direction += $entityFrom.position().top > ($entityTo.position().top + $entityTo.height()) ? 'down' : '';
    direction += $entityTo.position().top > ($entityFrom.position().top + $entityFrom.height()) ? 'up' : '';
    direction += ' ';
    direction += $entityFrom.position().left > ($entityTo.position().left + $entityTo.width()) ? 'left' : '';
    direction += $entityTo.position().left > ($entityFrom.position().left + $entityFrom.width()) ? 'right' : '';
    direction = direction.trim();
    return direction.replace(' ', '_');
  }

  function drawFK(entity, column, fk, index) {
    if (!fk) return '';
    const $entity = {
      from: $('#' + entityID(entity.name, index)),
      to: $('#' + entityID(fk.to.entity, index))
    };
    const $column = {
      from: $('#' + columnID(entity.name, column.name, index)),
      to: $('#' + columnID(fk.to.entity, fk.to.column, index))
    };
    const direction = getDirection($entity.from, $entity.to);
    const points = getPointsFrom(direction, $entity, $column);
    return [
      svgLine(points.x1, points.mi, points.y1, points.y1),
      svgLine(points.mi, points.mi, points.y1, points.y2),
      svgLine(points.mi, points.x2, points.y2, points.y2),
    ].join('') + connectors[fk.type](points);
  }

  function getPointsFrom(direction, $entity, $column) {
    return availableDirections[direction]($entity, $column);
  }

  function drawConnectorLines(entity, index) {
    const columns = entity.columns || [];
    return columns.map(drawColumnFK.bind(this, entity, index)).join('');
  }

  function getSVGFor(entity, index) {
    return ['<svg>', drawConnectorLines(entity, index), '</svg>'].join('');
  }

  function appendConnectors($diagram, entities, index) {
    entities.forEach(function (entity) {
      const $svg = $(getSVGFor(entity, index));
      $diagram.append($svg);
    });
  }

  function svgLine(x1, x2, y1, y2) {
    return ['<line x1="', x1, '" x2="', x2, '" y1="', y1, '" y2="', y2, '" stroke="black" stroke-width="1"/>'].join('');
  }

  function mapEntityColumns(columnsObject) {
    const columns = [];
    for (let key in columnsObject) {
      const column = columnsObject[key];
      column.name = key;
      columns.push(column);
    }
    return columns;
  }

  function mapEntities(entitiesObject) {
    const entities = [];
    for (let key in entitiesObject) {
      const entity = {};
      entity.name = key;
      entity.columns = mapEntityColumns(entitiesObject[key]);
      entities.push(entity);
    }
    return entities;
  }

  $.fn.renderERD = function () {
    const self = this;
    self.empty();
    self.each(function (i) {
      //Don't draw if hidden
      if ((self[i].offsetParent === null)) return;
      const $diagram = $(self[i]);

      const entities = mapEntities($diagram.data('entities'));
      appendEntities($diagram, entities, i);
      appendConnectors($diagram, entities, i);
    });
    return self;
  };

  mumuki.resize(function () {
    $('.mu-erd').renderERD();
  });

  //Redraw on bootstrap tab change event
  $('a[data-toggle="tab"]').on('shown.bs.tab', function () {
    $('.mu-erd').renderERD()
  });
});
