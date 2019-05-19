mumuki.load(function () {

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
        parent: classGroups.parent || 'Object',
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
        parent: 'Object',
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

  function generateTreeLevel(parent, entities, grouped) {
    grouped[parent] = {};
    entities.filter((ent) => parent === ent.parent).forEach((subclass) => {
      grouped[parent][subclass.name] = subclass;
      generateTreeLevel(subclass.name, entities, grouped[subclass.parent]);
    });
  }

  function groupEntities(entities) {
    const grouped = {};
    generateTreeLevel('Object', entities, grouped);
    console.log('GROUPED:', grouped);
    return grouped;
  }

  function arrangeEntities($diagram, entities, index) {
    const ENTITIES_GAP = 60;
    const $entities = entities.map((it) => it.$element);
    const $highter = $entities.reduce(($he, $en) => $he.height() >= $en.height() ? $he : $en);
    const colsCount = Math.min(Math.max(parseInt($diagram.width() / ($highter.width() + ENTITIES_GAP)), 1), entities.length);
    const rowsCount = Math.ceil(entities.length / colsCount);
    const cellWidth = $diagram.width() / colsCount;
    const cellHeigth = $diagram.height() / rowsCount;
    $diagram.height(($highter.height() + ENTITIES_GAP) * rowsCount);

    groupEntities(entities);

    let a = 0;
    for(let row = 0; row < rowsCount; row++ ) {
      for(let col = 0; col < colsCount; col++ ) {
        const $el = $entities[a++];
        if (!$el) break;
        $el.css('top',  (cellHeigth * row + cellHeigth / 2 - $el.height() / 2).toString() + 'px');
        $el.css('left', (cellWidth  * col + cellWidth  / 2 - $el.width()  / 2).toString() + 'px');
      }
    }
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
