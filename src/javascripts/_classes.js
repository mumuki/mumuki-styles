mumuki.load(function () {

  Array.prototype.sum = function (callback) {
    return this.map(callback).reduce((a, e) => a + e, 0);
  }

  const OBJECT = 'Object';
  const ENTITIES_GAP = 60;
  const OFFSET = 26;
  const BORDER = 2;

  function regexMatchAll(regex, string='', callback) {
    const matches = string.match(RegExp(regex, 'g')) || [];
    matches.forEach(function (match) {
      callback(match.match(regex).groups);
    });
  }

  function mapClasses(entities, code) {
    regexMatchAll(/(?<kind>(abstract\s+)?class)\s+(?<name>[A-Z][a-zA-Z0-9_!?$]+)\s*(?:extends)?\s*(?<parent>[A-Z][a-zA-Z0-9_!?$]+)?\s*(?:implements)?\s*(?<parents>.*)?\s*\{(?<body>[\s\S]*?)\}/, code, function (classGroups) {
      const aClass = {
        type: classGroups.kind.split(/\s+/)[0],
        name: classGroups.name,
        parent: classGroups.parent || OBJECT,
        parents: [],
        methods: [] ,
        variables: [],
      }
      parseParents(aClass, classGroups.parents);
      parseVariables(aClass, classGroups.body)
      parseMethods(aClass, classGroups.body);
      entities.push(aClass);
    });
  }

  function mapInterfaces(entities, code) {
    regexMatchAll(/interface\s+(?<name>[A-Z][a-zA-Z0-9_!?$]+)\s*(?:extends)?\s*(?<parents>.*)?\s*\{(?<body>[\s\S]*?)\}/, code, function (interfaceGroups) {
      const anInterface = {
        type: 'interface',
        name: interfaceGroups.name,
        parent: OBJECT,
        parents: [],
        methods: [] ,
        variables: [],
      };
      parseParents(anInterface, interfaceGroups.parents);
      parseMethods(anInterface, interfaceGroups.body);
      entities.push(anInterface);
    });
  }

  function parseParents(obj, parents) {
    regexMatchAll(/(?<name>[A-Z][a-zA-Z0-9_?!$]*?)(?:,\s*|\s*|$)/, parents, function (parentsGroup) {
      obj.parents.push(parentsGroup.name)
    });
  }


  function parseVariables(obj, body) {
    regexMatchAll(/var\s+(?<name>[a-z][a-zA-Z0-9_!?$]+)\s*:\s*(?<type>[a-zA-Z0-9_!?$]+)/, body, function (varGroups) {
      obj.variables.push({
        name: varGroups.name,
        type: varGroups.type,
      })
    });
  }


  function parseMethods(obj, body) {
    regexMatchAll(/def\s+(?<name>[a-z][a-zA-Z0-9_!?$]+)\((?<params>.*?)\)\s*:\s*(?<return>.*)/, body, function (methodGroup) {
      const method = {
        name: methodGroup.name,
        return: methodGroup.return,
        params: [],
      }
      regexMatchAll(/(?<name>[a-zA-Z0-9_?!$]*?)\s*:\s*(?<type>[a-zA-Z0-9_?!$]*?\b)(?:,|\s|$)/, methodGroup.params, function (paramsGroup) {
        method.params.push({
          name: paramsGroup.name,
          type: paramsGroup.type,
        })
      });
      obj.methods.push(method);
    });
  }

  function mapEntities(code) {
    entities = [];
    mapClasses(entities, code);
    mapInterfaces(entities, code);
    return entities;
  }

  function lowercased(string) {
    return string.toLowerCase().replace(/[_]/g, '-')
  }

  function entityID(entity, index) {
    return 'mu-classes-' + index + '-' + lowercased(entity);
  }

  function variableID(entity, variable, index) {
    return entityID(entity, index) + '-' + lowercased(variable);
  }

  function messageID(entity, message, index) {
    return entityID(entity, index) + '-' + lowercased(message);
  }

  function paramID(entity, message, param, index, i) {
    return messageID (entity, message, index) + '-' + i + '-' + lowercased(param);
  }

  function generateEntityAttributes(entity, index) {
    let html = '';
    entity.variables.forEach(function (variable) {
      html += [
        '<li id="', variableID(entity.name, variable.name, index), '" class="mu-classes-entity-attribute">',
        '  <span class="mu-classes-entity-attribute-name">',
        '    <span class="mu-classes-type">', variable.type, '</span>',
        '    <span>', variable.name, '</span>',
        '  </span>',
        '</li>'
      ].join('');
    });
    return html;
  }

  function generateParams(entity, message, index) {
    return message.params.map(function (param, i) {
      return [
        '<span id="', paramID(entity.name, message.name, param.name, index, i), '" class="mu-classes-entity-message-param">',
        '  <span class="mu-classes-type">', param.type, '</span>',
        '  <span class="mu-classes-param">', param.name, '</span>',
        '</span>'
      ].join('');
    }).join(',');
  }

  function generateEntityMessages(entity, index) {
    let html = '';
    entity.methods.forEach(function (method) {
      html += [
        '<li id="', messageID(entity.name, method.name, index), '" class="mu-classes-entity-message">',
        '  <span class="mu-classes-entity-message-name">',
        '    <span class="mu-classes-return">', method.return, '</span>',
        '    <span>',
               method.name, '(', generateParams(entity, method, index), ')',
        '    </span>',
        '  </span>',
        '</li>'
      ].join('');
    });
    return html;
  }

  function appendEntities($diagram, entities, index) {
    entities.forEach(function (entity) {
      entity.$element = $([
        '<div id="', entityID(entity.name, index), '" class="mu-classes-entity">',
        '  <div class="mu-classes-entity-name">',
        '  <span class="mu-classes-kind ', entity.type, '">', entity.type[0].toUpperCase(), '</span>',
        '  ', entity.name,
        '  </div>',
        entity.variables.length ? '  <ul class="mu-classes-entity-attributes">' : '',
        entity.variables.length ?      generateEntityAttributes(entity, index) : '',
        entity.variables.length ? '  </ul>' : '',
        entity.methods.length ?   '  <ul class="mu-classes-entity-messages">' : '',
        entity.methods.length ?        generateEntityMessages(entity, index) : '',
        entity.methods.length ?   '  </ul>' : '',
        '</div>',
      ].join(''));
      $diagram.append(entity.$element);
    });
  }

  function generateHierarchyTree(parent, entities, grouped = {}) {
    grouped[parent] = grouped[parent] || {};
    grouped[parent].subclasses = {};
    entities.filter((ent) => parent === ent.parent && /abstract|class|interface/.test(ent.type) ).forEach((subclass) => {
      grouped[parent].subclasses[subclass.name] = subclass;
      generateHierarchyTree(subclass.name, entities, grouped[subclass.parent].subclasses);
    });
    return grouped;
  }

  function arrangeEntities($diagram, entities, index) {
    $diagram.css('transform',  'scale(1)');
    const hierarchy = generateHierarchyTree(OBJECT, entities);
    $diagram.height(0);
    const totalWidth = (entities[0].$element.width() + ENTITIES_GAP) * leafCount(hierarchy[OBJECT]);
    arrangeHierarchy($diagram, hierarchy[OBJECT], 0, $diagram.offset().left + $diagram.width() / 2 - totalWidth / 2);
    addConnectors($diagram, entities, index);
    if ($diagram.width() < totalWidth) {
      $diagram.css('transform',  `scale(${$diagram.width() / totalWidth})`);
    }
  }

  function arrangeHierarchy(container, object, rowIndex, leftStart) {
    const subclasses = Object.values(object.subclasses);
    if (subclasses.length == 0) return;
    const heighter = subclasses.reduce((a, e) => e.$element.height() > a.$element.height() ? e : a);
    const rowHeight = heighter.$element.height();
    const colWidth = heighter.$element.width() + ENTITIES_GAP;
    const oldContainerHeight = container.height();
    container.height(container.height() + rowHeight + ENTITIES_GAP);
    let accumulatedLeft = leftStart;
    subclasses.forEach((ent) => {
      const leafsSize = leafCount(ent);
      const width = colWidth * leafsSize;
      if (!ent.$element) return;
      const $el = ent.$element;
      $el.css('top',  `${ oldContainerHeight + rowHeight / 2 - $el.height() / 2 }px`);
      $el.css('left', `${ accumulatedLeft + width / 2 - $el.width()  / 2 }px`);
      arrangeHierarchy(container, ent, rowIndex + 1, accumulatedLeft);
      accumulatedLeft = accumulatedLeft + width;
    });
  }

  function addConnectors($diagram, entities, index) {
    entities.forEach((entity) => {
      const $svg = $(getSVGFor($diagram, entities, entity, index));
      $diagram.append($svg);
    });
  }

  function svgLine(x1, x2, y1, y2) {
    return ['<line x1="', x1, '" x2="', x2, '" y1="', y1, '" y2="', y2, '" stroke="black" stroke-width="1"/>'].join('');
  }

  function drawHierarchyConnector($diagram, child, entity) {
    const margin = OFFSET + BORDER * 2;
    const pa = {
      x: entity.$element.offset().left + entity.$element.width() / 2 - $diagram.offset().left - margin / 2,
      y: entity.$element.offset().top + entity.$element.height() - $diagram.offset().top + margin,
    }
    const ch = {
      x: child.$element.offset().left + child.$element.width() / 2 - $diagram.offset().left - margin / 2,
      y: child.$element.offset().top - $diagram.offset().top,
    }
    return [
      `<polygon points="${pa.x},${pa.y - OFFSET} ${pa.x - OFFSET},${pa.y} ${pa.x + OFFSET},${pa.y}" style="fill:white;stroke:black;stroke-width:1.33"></polygon>`,
      svgLine(pa.x, pa.x, pa.y, (pa.y + ch.y) / 2),
      svgLine(pa.x, ch.x, (pa.y + ch.y) / 2, (pa.y + ch.y) / 2),
      svgLine(ch.x, ch.x, (pa.y + ch.y) / 2, ch.y),
    ].join('\n');
  }

  function getSVGFor($diagram, entities, entity, index) {
    return entities.filter((ent) => ent.parent == entity.name).map((child) => {
      return ['<svg>', drawHierarchyConnector($diagram, child, entity, index), '</svg>'].join('\n');
    }).join('\n');
  }

  function leafCount(ent) {
    const subclasses = Object.values(ent.subclasses);
    return subclasses.length == 0 ? 1 : subclasses.sum((ent) => leafCount(ent));
  }

  $.fn.renderClasses = function () {
    const self = this;
    self.empty();
    self.each(function (i) {
      //Don't draw if hidden
      if ((self[i].offsetParent === null)) return;

      const $diagram = $(self[i]);

      const entities = mapEntities($diagram.data('code'));

      appendEntities($diagram, entities, i);
      arrangeEntities($diagram, entities, i);

    });
    return self;
  };

  mumuki.resize(function () {
    $('.mu-classes').renderClasses();
  });

});
